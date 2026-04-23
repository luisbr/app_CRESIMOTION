import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import type {ModuleKey} from '../types';
import {getHistory, getPostWork} from '../api/sessionsApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import CMainAppBar from '../../../components/common/CMainAppBar';
import {StackNav, TabNav} from '../../../navigation/NavigationKey';

const MODULES: ModuleKey[] = ['motivos', 'sintomas_fisicos', 'sintomas_emocionales'];

export default function DiagnosticoHistoryScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const dispatch = useDispatch();
  const drawer = useDrawer();
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const [moduleKey] = useState<ModuleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHistory(moduleKey, 20, 0);
        if (!mounted) return;
        const list = data?.items || data?.data || data || [];
        const rawItems = Array.isArray(list) ? list : [];
        setItems(rawItems);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.body?.message || e?.message || 'No se pudo cargar el historial.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);

  const formatLocalDate = (value: string) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const formatLocalDateShort = (value: string) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getIntensityColor = (value: number) => {
    if (value >= 4) return '#EF4444';
    if (value >= 3) return '#F97316';
    if (value >= 2) return '#FDE047';
    return '#22C55E';
  };

  const getIntensityTint = (value: number) => {
    if (value >= 4) return 'rgba(239, 68, 68, 0.12)';
    if (value >= 3) return 'rgba(249, 115, 22, 0.12)';
    if (value >= 2) return 'rgba(253, 224, 71, 0.18)';
    return 'rgba(34, 197, 94, 0.12)';
  };

  const onToggleDetails = (sessionId: number | string) => {
    const key = String(sessionId);
    if (expandedId === key) {
      setExpandedId(null);
      return;
    }
    setExpandedId(key);
  };

  const onStartTherapy = async (groupId: number) => {
    const key = String(groupId);
    try {
      setStartingId(key);
      const data = await getPostWork(groupId);
      navigation.navigate(StackNav.TabNavigation, {
        screen: TabNav.HomeTab,
        params: {
          screen: 'TherapyFocusSelect',
          params: {
            postWork: true,
            groupId,
            motivos: data?.motivos || [],
            emotions: data?.emotions || [],
            entrypoint: 'history',
          },
        },
      });
    } catch (e: any) {
      setError(e?.body?.message || e?.message || 'No se pudo iniciar la terapia.');
    } finally {
      setStartingId(null);
    }
  };

  const getLatestEvalValue = (item: any) => {
    const evals = Array.isArray(item?.evaluations) ? item.evaluations : [];
    if (!evals.length) return null;
    const sorted = [...evals].sort((a: any, b: any) =>
      String(b?.created_at || '').localeCompare(String(a?.created_at || ''))
    );
    const latest = sorted[0];
    const val = Number(latest?.value);
    return Number.isNaN(val) ? null : val;
  };

  const getSummaryMax = (summary: any) => {
    const motivos = Array.isArray(summary?.motivos) ? summary.motivos : [];
    const emotions = Array.isArray(summary?.emotions) ? summary.emotions : [];
    const values = [...motivos, ...emotions].map((t: any) => {
      const latestEval = getLatestEvalValue(t);
      if (latestEval != null) return latestEval;
      return Number(t?.intensity_value || 0);
    });
    return values.length ? Math.max(0, ...values) : 0;
  };

  const sortByIntensity = (list: any[]) =>
    [...list].sort((a: any, b: any) => Number(b?.intensity_value || 0) - Number(a?.intensity_value || 0));

  const valueToLabel = (value: number) => {
    if (value >= 4) return 'Muy alto';
    if (value >= 3) return 'Alto';
    if (value >= 2) return 'Medio';
    if (value >= 1) return 'Bajo';
    return 'Nulo';
  };

  const toCapitalized = (value?: string) => {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const getEvalStats = (evaluations: any[], fallbackValue: number) => {
    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return { initialValue: fallbackValue, currentValue: fallbackValue };
    }
    const sorted = [...evaluations].sort((a: any, b: any) =>
      String(b?.created_at || '').localeCompare(String(a?.created_at || ''))
    );
    const current = sorted[0];
    const initial = sorted[sorted.length - 1];
    const currentValue = Number(current?.value ?? fallbackValue);
    const initialValue = Number(current?.baseline_value ?? initial?.baseline_value ?? fallbackValue);
    return { initialValue, currentValue };
  };

  return (
    <CSafeAreaView>
      <CMainAppBar mode="sub" title="Mis autoevaluaciones" />
      <ScrollView showsVerticalScrollIndicator={true} style={styles.flex} contentContainerStyle={[styles.p20, {paddingTop: moderateScale(10)}]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        ) : (
          <>
            {!items.length && (
              <CText type={'S14'} align={'center'} color={colors.labelColor}>
                Aún no tienes autoevaluaciones.
              </CText>
            )}
            {items.map((item: any, idx: number) => {
              const groupId = item?.group_id ?? item?.id ?? idx;
              const sessionKey = String(groupId);
              const isExpanded = expandedId === sessionKey;
              const summary = item?.summary || {};
              const motivos = Array.isArray(summary?.motivos) ? summary.motivos : [];
              const emotions = Array.isArray(summary?.emotions) ? summary.emotions : [];
              const topMax = getSummaryMax(summary);
              const sessions = item?.sessions || {};
              const groupItems = [
                sessions?.motivos ? { session_id: sessions.motivos, module_key: 'motivos' } : null,
                sessions?.emotions ? { session_id: sessions.emotions, module_key: 'sintomas_emocionales' } : null,
              ].filter(Boolean);
              return (
                <TouchableOpacity
                  key={String(groupId ?? idx)}
                  style={[
                    styles.p15,
                    styles.mb10,
                    {
                      backgroundColor: topMax ? getIntensityTint(topMax) : colors.inputBg,
                      borderRadius: 12,
                    },
                  ]}
                  onPress={() => onToggleDetails(sessionKey)}
                >
                  <CText type={'S16'}>
                    {item?.completed_at ? `Sesión ${formatLocalDate(item.completed_at)}` : 'Sesión'}
                  </CText>
                  <CText type={'S12'} color={colors.labelColor}>
                    {`Motivos: ${motivos.length} · Emociones: ${emotions.length}`}
                  </CText>
                  {isExpanded && (
                    <View style={[styles.mt10]}>
                      {!!motivos.length && (
                        <View style={styles.mb10}>
                          <CText type={'S14'} style={styles.mb5}>
                            Motivos
                          </CText>
                          {sortByIntensity(motivos).map((m: any, i: number) => (
                            <View key={`${sessionKey}-m-${i}`} style={[styles.mb10, {padding: 10, borderRadius: 10, backgroundColor: colors.inputBg}]}>
                              <View style={[styles.rowSpaceBetween, styles.mb5]}>
                                <CText type={'S12'} style={{flex: 1, marginRight: 8}}>
                                  {m?.titulo || m?.label || m?.name || 'Motivo'}
                                </CText>
                                {(() => {
                                  const {initialValue, currentValue} = getEvalStats(m?.evaluations || [], Number(m?.intensity_value || 0));
                                  return (
                                    <View style={[styles.rowEnd, styles.g5]}>
                                      <View style={{backgroundColor: getIntensityColor(initialValue), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10}}>
                                        <CText type={'S12'} color={colors.white}>
                                          {valueToLabel(initialValue)}
                                        </CText>
                                      </View>
                                      <CText type={'S12'} color={colors.labelColor}>
                                        →
                                      </CText>
                                      <View style={{backgroundColor: getIntensityColor(currentValue), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10}}>
                                        <CText type={'S12'} color={colors.white}>
                                          {valueToLabel(currentValue)}
                                        </CText>
                                      </View>
                                    </View>
                                  );
                                })()}
                              </View>
                              {!!m?.next_recommendation_label && (
                                <CText type={'R12'} color={colors.labelColor}>
                                  {`Siguiente recomendación: ${m.next_recommendation_label}`}
                                </CText>
                              )}
                              {!!Array.isArray(m?.evaluations) && m.evaluations.length > 0 && (
                                <View style={[styles.mt5]}>
                                  <View style={[styles.rowSpaceBetween, styles.mb5, {backgroundColor: 'rgba(0,0,0,0.1)', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6}]}>
                                    <CText type={'B12'} color={colors.textColor} style={{flex: 1, marginRight: 8}}>
                                      Fecha
                                    </CText>
                                    <CText type={'B12'} color={colors.textColor} style={{minWidth: 80, textAlign: 'right'}}>
                                      Valor
                                    </CText>
                                    <CText type={'B12'} color={colors.textColor} style={{minWidth: 70, textAlign: 'right', marginLeft: 8}}>
                                      Resultado
                                    </CText>
                                  </View>
                                  {m.evaluations.map((ev: any, evIdx: number) => (
                                    <View key={`${sessionKey}-m-${i}-ev-${evIdx}`} style={[styles.rowSpaceBetween, styles.mb5]}>
                                      <CText type={'R12'} color={colors.textColor} style={{flex: 1, marginRight: 8}}>
                                        {formatLocalDateShort(ev?.created_at)}
                                      </CText>
                                      <CText type={'R12'} color={colors.textColor} style={{minWidth: 80, textAlign: 'right'}}>
                                        {valueToLabel(Number(ev?.value ?? 0))}
                                      </CText>
                                      <CText type={'R12'} color={colors.textColor} style={{minWidth: 70, textAlign: 'right', marginLeft: 8}}>
                                        {toCapitalized(ev?.resultado)}
                                      </CText>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      {!!emotions.length && (
                        <View style={styles.mb10}>
                          <CText type={'S14'} style={styles.mb5}>
                            Emociones
                          </CText>
                          {sortByIntensity(emotions).map((e: any, i: number) => (
                            <View key={`${sessionKey}-e-${i}`} style={[styles.mb10, {padding: 10, borderRadius: 10, backgroundColor: colors.inputBg}]}>
                              <View style={[styles.rowSpaceBetween, styles.mb5]}>
                                <CText type={'S12'} style={{flex: 1, marginRight: 8}}>
                                  {e?.titulo || e?.label || e?.name || 'Emoción'}
                                </CText>
                                {(() => {
                                  const {initialValue, currentValue} = getEvalStats(e?.evaluations || [], Number(e?.intensity_value || 0));
                                  return (
                                    <View style={[styles.rowEnd, styles.g5]}>
                                      <View style={{backgroundColor: getIntensityColor(initialValue), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10}}>
                                        <CText type={'S12'} color={colors.white}>
                                          {valueToLabel(initialValue)}
                                        </CText>
                                      </View>
                                      <CText type={'S12'} color={colors.labelColor}>
                                        →
                                      </CText>
                                      <View style={{backgroundColor: getIntensityColor(currentValue), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10}}>
                                        <CText type={'S12'} color={colors.white}>
                                          {valueToLabel(currentValue)}
                                        </CText>
                                      </View>
                                    </View>
                                  );
                                })()}
                              </View>
                              {!!e?.next_recommendation_label && (
                                <CText type={'R12'} color={colors.labelColor}>
                                  {`Siguiente recomendación: ${e.next_recommendation_label}`}
                                </CText>
                              )}
                              {!!Array.isArray(e?.evaluations) && e.evaluations.length > 0 && (
                                <View style={[styles.mt5]}>
                                  <View style={[styles.rowSpaceBetween, styles.mb5, {backgroundColor: 'rgba(0,0,0,0.1)', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6}]}>
                                    <CText type={'B12'} color={colors.textColor} style={{flex: 1, marginRight: 8}}>
                                      Fecha
                                    </CText>
                                    <CText type={'B12'} color={colors.textColor} style={{minWidth: 80, textAlign: 'right'}}>
                                      Valor
                                    </CText>
                                    <CText type={'B12'} color={colors.textColor} style={{minWidth: 70, textAlign: 'right', marginLeft: 8}}>
                                      Resultado
                                    </CText>
                                  </View>
                                  {e.evaluations.map((ev: any, evIdx: number) => (
                                    <View key={`${sessionKey}-e-${i}-ev-${evIdx}`} style={[styles.rowSpaceBetween, styles.mb5]}>
                                      <CText type={'R12'} color={colors.textColor} style={{flex: 1, marginRight: 8}}>
                                        {formatLocalDateShort(ev?.created_at)}
                                      </CText>
                                      <CText type={'R12'} color={colors.textColor} style={{minWidth: 80, textAlign: 'right'}}>
                                        {valueToLabel(Number(ev?.value ?? 0))}
                                      </CText>
                                      <CText type={'R12'} color={colors.textColor} style={{minWidth: 70, textAlign: 'right', marginLeft: 8}}>
                                        {toCapitalized(ev?.resultado)}
                                      </CText>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      {!motivos.length && !emotions.length && (
                        <CText type={'S12'} color={colors.labelColor}>
                          Sin datos para mostrar.
                        </CText>
                      )}
                      <View style={[styles.rowSpaceBetween, styles.mt10]}>
                        <TouchableOpacity
                          style={{paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.primary}}
                          onPress={() => {
                            dispatch({type: 'SET_PENDING_NAVIGATION', payload: {screen: 'DiagnosticoHistoryDetail', params: {groupItems}}});
                            navigation.navigate('HomeTab');
                          }}
                        >
                          <CText type={'S12'} color={colors.white}>Ver resultados</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          disabled={!groupId || startingId === String(groupId)}
                          onPress={() => groupId && onStartTherapy(Number(groupId))}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 8,
                            backgroundColor: colors.primary,
                            opacity: !groupId || startingId === String(groupId) ? 0.5 : 1,
                          }}
                        >
                          <CText type={'S12'} color={colors.white}>
                            {startingId === String(groupId) ? 'Cargando...' : 'Sesión Terapeutica'}
                          </CText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            DiagnosticoHistoryScreen
          </CText>
        </View>
      )}
    </CSafeAreaView>
  );
}

const localStyles = {
  screenTooltip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
};
