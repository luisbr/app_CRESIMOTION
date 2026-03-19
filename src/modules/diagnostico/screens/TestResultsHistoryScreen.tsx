import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import {getCustomTestResults} from '../../../api/customTests';
import {moderateScale} from '../../../common/constants';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import CMainAppBar from '../../../components/common/CMainAppBar';

export default function TestResultsHistoryScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomTestResults();
        if (!mounted) return;
        const list = data || [];
        setItems(list);
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
  }, []);

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

  const onToggleDetails = (resultId: number | string) => {
    const key = String(resultId);
    if (expandedId === key) {
      setExpandedId(null);
      return;
    }
    setExpandedId(key);
  };

  return (
    <CSafeAreaView>
      <CMainAppBar mode="sub" title="Mis resultados de tests" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.flex} contentContainerStyle={[styles.p20, {paddingTop: moderateScale(10)}]}>
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
                Aun no tienes resultados de tests.
              </CText>
            )}
            {items.map((item: any, idx: number) => {
              const resultId = item?.id ?? idx;
              const sessionKey = String(resultId);
              const isExpanded = expandedId === sessionKey;
              const puntuacion = Number(item?.puntuacion_total ?? 0);
              const titulo = item?.test_titulo || item?.titulo || 'Test personalizado';
              const resultadoTexto = item?.resultado_texto || '';
              const fecha = item?.creado_en || '';
              
              return (
                <TouchableOpacity
                  key={String(resultId ?? idx)}
                  style={[
                    styles.p15,
                    styles.mb10,
                    {
                      backgroundColor: puntuacion ? getIntensityTint(puntuacion) : colors.inputBg,
                      borderRadius: 12,
                    },
                  ]}
                  onPress={() => onToggleDetails(resultId)}
                >
                  <CText type={'S16'}>
                    {titulo}
                  </CText>
                  <CText type={'S12'} color={colors.labelColor}>
                    {`Puntuación: ${puntuacion} puntos`}
                  </CText>
                  {isExpanded && (
                    <View style={[styles.mt10]}>
                      <View style={[styles.mb10, {padding: 10, borderRadius: 10, backgroundColor: colors.inputBg}]}>
                        <View style={[styles.rowSpaceBetween, styles.mb5]}>
                          <CText type={'S12'} style={{flex: 1, marginRight: 8}}>
                            Puntuación total
                          </CText>
                          <View style={{backgroundColor: getIntensityColor(puntuacion), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10}}>
                            <CText type={'S12'} color={colors.white}>
                              {puntuacion}
                            </CText>
                          </View>
                        </View>
                        {resultadoTexto ? (
                          <View style={[styles.mt5]}>
                            <CText type={'B12'} color={colors.textColor} style={styles.mb5}>
                              Resultado
                            </CText>
                            <CText type={'R12'} color={colors.textColor}>
                              {resultadoTexto}
                            </CText>
                          </View>
                        ) : null}
                        <View style={[styles.mt5]}>
                          <CText type={'B12'} color={colors.textColor} style={styles.mb5}>
                            Fecha
                          </CText>
                          <CText type={'R12'} color={colors.textColor}>
                            {formatLocalDate(fecha)}
                          </CText>
                        </View>
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
            TestResultsHistoryScreen
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
