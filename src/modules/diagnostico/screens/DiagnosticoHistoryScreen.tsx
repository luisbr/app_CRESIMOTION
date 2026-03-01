import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import type {ModuleKey} from '../types';
import {getHistory, getResults} from '../api/sessionsApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';

const MODULES: ModuleKey[] = ['motivos', 'sintomas_fisicos', 'sintomas_emocionales'];

export default function DiagnosticoHistoryScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const drawer = useDrawer();
  const [moduleKey] = useState<ModuleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [emotionStatus, setEmotionStatus] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resultsCache, setResultsCache] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHistory(moduleKey, 20, 0);
        if (!mounted) return;
        const list = data?.items || data?.data || data || [];
        const status = data?.emotion_status || [];
        const rawItems = Array.isArray(list) ? list : [];
        const grouped = new Map<string, any>();
        rawItems.forEach((item: any) => {
          const groupId = String(item?.group_id ?? item?.session_id ?? item?.id ?? '');
          if (!grouped.has(groupId)) {
            grouped.set(groupId, {
              group_id: item?.group_id ?? null,
              items: [item],
            });
          } else {
            grouped.get(groupId).items.push(item);
          }
        });
        const groupedList = Array.from(grouped.values()).map(group => {
          const sorted = [...group.items].sort((a: any, b: any) => {
            return String(b?.completed_at || '').localeCompare(String(a?.completed_at || ''));
          });
          return {
            group_id: group.group_id,
            items: sorted,
            latest: sorted[0],
          };
        });
        setItems(groupedList);
        setEmotionStatus(Array.isArray(status) ? status : []);
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

  const formatLocalDate = (value: string) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const getStatusColor = (hours: number) => {
    if (hours <= 0) return '#EF4444';
    if (hours < 24) return '#F97316';
    return '#22C55E';
  };

  const getIntensityColor = (value: number) => {
    if (value >= 4) return '#EF4444';
    if (value >= 3) return '#F97316';
    if (value >= 2) return '#FDE047';
    return '#22C55E';
  };

  const extractSessionItems = (results: any) => {
    const groups = results?.groups || [];
    const flat = groups.flatMap((g: any) =>
      (g?.items || []).map((it: any) => ({
        ...it,
        __groupKey: g?.key,
      }))
    );
    return flat
      .map((it: any) => {
        const label = it?.label || it?.titulo || it?.name || it?.item_label || '';
        const rawValue = it?.value ?? it?.valor ?? it?.intensity_value ?? it?.severity ?? null;
        const value = Number(rawValue);
        if (!label || Number.isNaN(value)) return null;
        const intensityLabel =
          it?.intensity_label ||
          it?.value_label ||
          it?.intensidad_label ||
          it?.intensity_key ||
          it?.key ||
          '';
        return {
          label,
          value,
          intensityLabel,
          groupKey: it?.__groupKey || '',
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.value - a.value);
  };

  const onToggleDetails = async (sessionId: number | string) => {
    const key = String(sessionId);
    if (expandedId === key) {
      setExpandedId(null);
      return;
    }
    setExpandedId(key);
    if (resultsCache[key] || loadingDetails[key]) return;
    setLoadingDetails(prev => ({...prev, [key]: true}));
    try {
      const data = await getResults(Number(sessionId));
      setResultsCache(prev => ({...prev, [key]: data}));
    } catch (e: any) {
      setError(e?.body?.message || e?.message || 'No se pudieron cargar los resultados.');
    } finally {
      setLoadingDetails(prev => ({...prev, [key]: false}));
    }
  };

  return (
    <CSafeAreaView>
      <CHeader
        isHideBack
        centerAccessory={
          <Image
            source={require('../../../../assets/logo.png')}
            style={{width: moderateScale(110), height: moderateScale(50)}}
            resizeMode="contain"
          />
        }
        isLeftIcon={
          <TouchableOpacity onPress={drawer.open} style={{padding: 6, marginLeft: -8}}>
            <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
          </TouchableOpacity>
        }
        rightAccessory={
          <View style={[styles.rowStart, styles.g10]}>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.flex} contentContainerStyle={styles.p20}>
        <CText type={'S24'} style={styles.mb10}>
          Mis autoevaluaciones
        </CText>
        {!!emotionStatus.length && (
          <View style={[styles.mb10, {backgroundColor: colors.inputBg, borderRadius: 12, padding: 12}]}>
            <CText type={'S16'} style={styles.mb10}>
              Seguimiento de emociones
            </CText>
            {emotionStatus.map((item: any, idx: number) => {
              const hours = Number(item?.next_recommendation_hours ?? 0);
              const color = getStatusColor(hours);
              return (
                <View
                  key={`emotion-${item?.emocion_id ?? idx}`}
                  style={[styles.mb10, {borderRadius: 10, borderWidth: 1, borderColor: colors.grayScale2, padding: 10}]}
                >
                  <View style={[styles.rowSpaceBetween, styles.mb5]}>
                    <CText type={'S14'}>
                      {item?.label || 'Emoción'}
                      {!!item?.level_label && ` · ${item.level_label}`}
                    </CText>
                    <View style={{backgroundColor: color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10}}>
                      <CText type={'S12'} color={colors.white}>
                        {item?.next_recommendation_label || 'Evaluación'}
                      </CText>
                    </View>
                  </View>
                  {!!item?.motivo && (
                    <CText type={'S12'} color={colors.labelColor}>
                      Motivo: {item.motivo}
                    </CText>
                  )}
                  {!!item?.evaluated_at && (
                    <CText type={'S12'} color={colors.labelColor}>
                      Evaluado: {formatLocalDate(item.evaluated_at)}
                    </CText>
                  )}
                  <View style={[styles.mt10]}>
                    <TouchableOpacity
                      disabled
                      style={{
                        backgroundColor: colors.primary,
                        opacity: 0.5,
                        paddingVertical: 8,
                        borderRadius: 10,
                        alignItems: 'center',
                      }}
                    >
                      <CText type={'S14'} color={colors.white}>
                        Iniciar sesión terapéutica
                      </CText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
                Aun no tienes evaluaciones.
              </CText>
            )}
            {items.map((item: any, idx: number) => {
              const latest = item?.latest || {};
              const sessionId = latest?.session_id ?? latest?.id;
              const groupId = item?.group_id ?? latest?.group_id;
              const sessionKey = String(sessionId || groupId || idx);
              const isExpanded = expandedId === String(sessionId);
              const results = resultsCache[String(sessionId)];
              const detailItems = results ? extractSessionItems(results) : [];
              return (
                <TouchableOpacity
                  key={String(groupId ?? sessionId ?? idx)}
                  style={[styles.p15, styles.mb10, {backgroundColor: colors.inputBg, borderRadius: 12}]}
                  onPress={() => onToggleDetails(sessionId)}
                >
                  <CText type={'S16'}>
                    {latest?.completed_at ? `Sesión ${formatLocalDate(latest.completed_at)}` : 'Sesión'}
                  </CText>
                  {!!latest?.module_key && (
                    <CText type={'S12'} color={colors.labelColor}>
                      {latest.module_key}
                    </CText>
                  )}
                  {loadingDetails[sessionKey] && (
                    <View style={[styles.mt10]}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  )}
                  {isExpanded && !loadingDetails[sessionKey] && (
                    <View style={[styles.mt10]}>
                      {!!detailItems.length ? (
                        detailItems.map((d: any, i: number) => (
                          <View key={`${sessionKey}-d-${i}`} style={[styles.rowSpaceBetween, styles.mb5]}>
                            <CText type={'S12'} style={{flex: 1, marginRight: 8}}>
                              {d.label}
                            </CText>
                            <View style={{backgroundColor: getIntensityColor(d.value), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10}}>
                              <CText type={'S12'} color={colors.white}>
                                {d.intensityLabel || d.value}
                              </CText>
                            </View>
                          </View>
                        ))
                      ) : (
                        <CText type={'S12'} color={colors.labelColor}>
                          Sin datos para mostrar.
                        </CText>
                      )}
                      <View style={[styles.rowSpaceBetween, styles.mt10]}>
                        <TouchableOpacity
                          style={{paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.primary}}
                          onPress={() => navigation.navigate('DiagnosticoHistoryDetail', {groupItems: item?.items || []})}
                        >
                          <CText type={'S12'} color={colors.white}>Ver resultados</CText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          disabled
                          style={{paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.primary, opacity: 0.5}}
                        >
                          <CText type={'S12'} color={colors.white}>Iniciar terapia</CText>
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
