import React, {useEffect, useMemo, useState} from 'react';
import {Alert, ActivityIndicator, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import type {ModuleKey, SessionResults} from '../types';
import {clearGroupId, clearLastRoute, getChartView, saveChartView} from '../utils';
import {getResults} from '../api/sessionsApi';
import {getTherapyNext} from '../../../api/sesionTerapeutica';
import Svg, {G, Text as SvgText, Rect, Path, Polygon, Circle} from 'react-native-svg';
import {moderateScale} from '../../../common/constants';

export default function DiagnosticoResultsScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const sessionId: number = Number(route?.params?.sessionId);
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'bar' | 'pie' | 'radar'>('bar');
  const intensityValueMap: Record<string, number> = {
    grave: 4,
    alto: 3,
    moderado: 2,
    bajo: 1,
  };
  const intensityColorMap: Record<string, string> = {
    grave: '#EF4444',
    alto: '#F97316',
    moderado: '#FACC15',
    bajo: '#22C55E',
  };
  const chartData = useMemo(() => {
    const groups = results?.groups || [];
    const items = groups.flatMap((g: any) => g?.items || []);
    return items
      .map((it: any) => {
        const label = it?.label || it?.titulo || it?.name || it?.item_label || '';
        const rawIntensityLabel =
          it?.intensity_label ||
          it?.value_label ||
          it?.intensidad_label ||
          it?.intensity_key ||
          it?.key ||
          '';
        const intensityKey = String(rawIntensityLabel || '').toLowerCase().trim();
        const intensityLabel =
          intensityKey && /^[a-z_]+$/i.test(intensityKey)
            ? intensityKey
                .split('_')
                .map(word =>
                  word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ')
            : String(rawIntensityLabel || '');
        const rawValue =
          it?.value ?? it?.valor ?? it?.intensity_value ?? it?.severity ?? null;
        const numericValue = Number(rawValue);
        const value = Number.isNaN(numericValue)
          ? intensityValueMap[intensityKey]
          : numericValue;
        if (!label || !value) return null;
        return {label, intensityLabel, value, intensityKey};
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.value - a.value);
  }, [results]);
  const legendColors = useMemo(() => {
    const map: Record<string, string> = {};
    chartData.forEach((d: any) => {
      if (d?.intensityKey && intensityColorMap[d.intensityKey]) {
        map[d.label] = intensityColorMap[d.intensityKey];
        return;
      }
      if (d?.value >= 4) map[d.label] = intensityColorMap.grave;
      else if (d?.value >= 3) map[d.label] = intensityColorMap.alto;
      else if (d?.value >= 2) map[d.label] = intensityColorMap.moderado;
      else map[d.label] = intensityColorMap.bajo;
    });
    return map;
  }, [chartData]);
  const levelRows = useMemo(() => {
    const unique = new Map<number, string>();
    chartData.forEach(d => {
      if (!Number.isNaN(d.value)) {
        unique.set(d.value, d.intensityLabel || String(d.value));
      }
    });
    const arr = Array.from(unique.entries())
      .map(([value, label]) => ({value, label}))
      .sort((a, b) => b.value - a.value);
    return arr.length ? arr : [{value: 0, label: ''}];
  }, [chartData]);
  const allowRadar = chartData.length >= 3;
  const availableViews = allowRadar ? (['bar', 'pie', 'radar'] as const) : (['bar', 'pie'] as const);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getResults(sessionId);
        if (!mounted) return;
        setResults(data);
        if (data?.risk?.is_triggered) {
          Alert.alert(
            'Atencion',
            data?.risk?.message || 'Se detectaron respuestas sensibles.',
            [
              {
                text: 'Ver vias de apoyo',
                onPress: () => navigation.navigate('SupportResources'),
              },
              {text: 'Cerrar', style: 'cancel'},
            ]
          );
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.body?.message || e?.message || 'No se pudieron cargar los resultados.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigation, sessionId]);

  useEffect(() => {
    let mounted = true;
    const loadView = async () => {
      const stored = await getChartView();
      if (!mounted) return;
      if (stored === 'radar' && !allowRadar) {
        setView('bar');
        return;
      }
      setView(stored);
    };
    loadView();
    return () => {
      mounted = false;
    };
  }, [allowRadar]);

  useEffect(() => {
    if (view === 'radar' && !allowRadar) {
      setView('bar');
    }
  }, [allowRadar, view]);

  const onSelectView = async (next: 'bar' | 'pie' | 'radar') => {
    if (next === 'radar' && !allowRadar) return;
    setView(next);
    await saveChartView(next);
  };

  const onPressNextModule = async () => {
    if (moduleKey === 'motivos') {
      navigation.replace('DiagnosticoSelection', {module_key: 'sintomas_fisicos'});
      return;
    }
    if (moduleKey === 'sintomas_fisicos') {
      navigation.replace('DiagnosticoSelection', {module_key: 'sintomas_emocionales'});
      return;
    }
    if (moduleKey === 'sintomas_emocionales') {
      try {
        const s = await (await import('../../../api/auth')).getSession();
        const userId = s?.id ? String(s.id) : null;
        if (!userId) throw new Error('No se encontró una sesión activa.');
        const next = await getTherapyNext(userId);
        navigation.replace('TherapyFlowRouter', {initialNext: next, entrypoint: 'results'});
        return;
      } catch (e: any) {
        Alert.alert(
          'Error',
          e?.message || 'No se pudo iniciar la sesión terapéutica.'
        );
      }
    }
    await clearLastRoute();
    await clearGroupId();
    navigation.popToTop();
  };

  return (
    <CSafeAreaView>
      <CHeader />
      <View style={styles.p20}>
        <CText type={'S24'} align={'center'} style={styles.mb10}>
          Resultados
        </CText>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {chartData.length ? (
              <View
                style={[
                  styles.mb10,
                  {
                    backgroundColor: 'rgba(10, 166, 147, 0.4)',
                    borderRadius: 12,
                    padding: 12,
                  },
                ]}
              >
                <View style={[styles.rowCenter, styles.mb10]}>
                  {availableViews.map(key => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => onSelectView(key)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        marginHorizontal: 6,
                        backgroundColor: view === key ? colors.primary : colors.inputBg,
                      }}
                    >
                      <CText type={'S12'} color={view === key ? colors.white : colors.textColor}>
                        {key === 'bar' ? 'Barras' : key === 'pie' ? 'Pie' : 'Radar'}
                      </CText>
                    </TouchableOpacity>
                  ))}
                </View>
                {view === 'bar' ? (
                  <BarChartSVG
                    data={chartData.map(d => ({
                      x: d.label,
                      y: d.value,
                      color: legendColors[d.label],
                    }))}
                    levels={levelRows}
                    textColor={colors.textColor}
                    axisColor={colors.grayScale3}
                  />
                ) : view === 'pie' ? (
                  <PieChartSVG
                    data={chartData.map(d => ({x: d.label, y: d.value}))}
                    colors={Object.values(legendColors)}
                    textColor={colors.textColor}
                  />
                ) : (
                  <RadarChart
                    data={chartData.map(d => ({
                      x: d.label,
                      y: d.value,
                      color: legendColors[d.label],
                    }))}
                    maxValue={Math.max(1, ...chartData.map(d => d.value))}
                    color={colors.primary}
                    textColor={colors.textColor}
                  />
                )}
                <View style={[styles.rowStart, styles.wrap, styles.mt10]}>
                  {chartData.map((d, idx) => (
                    <View key={String(idx)} style={[styles.rowStart, styles.mr10, styles.mb5]}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: legendColors[d.label],
                          marginRight: 6,
                        }}
                      />
                      <CText type={'S12'} color={colors.labelColor}>
                        {d.label}
                      </CText>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <CText type={'S14'} color={colors.labelColor}>
                Sin datos para graficar.
              </CText>
            )}
          </ScrollView>
        )}
        <CButton
          title={
            moduleKey === 'sintomas_emocionales'
              ? 'Finalizar'
              : 'Continuar'
          }
          onPress={onPressNextModule}
        />
      </View>
    </CSafeAreaView>
  );
}

function BarChartSVG({data, levels, textColor, axisColor}: any) {
  const width = moderateScale(320);
  const height = moderateScale(240);
  const padding = 54;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxY = Math.max(1, ...data.map((d: any) => d.y));
  const barW = (chartW / Math.max(1, data.length)) * 0.5;
  return (
    <Svg width={width} height={height}>
      <G transform={`translate(${padding},${padding})`}>
        <Path d={`M0,0 L0,${chartH} L${chartW},${chartH}`} stroke={axisColor} strokeWidth={1} fill="none" />
        {levels.map((lvl: any, idx: number) => {
          const y = chartH - (lvl.value / maxY) * (chartH - 10);
          return (
            <G key={`lvl-${idx}`}>
              <Path d={`M0,${y} L${chartW},${y}`} stroke={axisColor} strokeWidth={0.5} fill="none" />
              <SvgText x={-6} y={y + 3} fontSize={10} fill={textColor} textAnchor="end">
                {String(lvl.label).length > 6 ? String(lvl.label).replace(' ', '\n') : lvl.label}
              </SvgText>
            </G>
          );
        })}
        {data.map((d: any, i: number) => {
          const x = (chartW / data.length) * i + (chartW / data.length - barW) / 2;
          const h = (d.y / maxY) * (chartH - 10);
          const y = chartH - h;
          return (
            <Rect
              key={`b-${i}`}
              x={x}
              y={y}
              width={barW}
              height={h}
              fill={d.color}
              rx={4}
            />
          );
        })}
        {data.map((d: any, i: number) => (
          <SvgText key={`lx-${i}`} x={(chartW / data.length) * i + (chartW / data.length) / 2} y={chartH + 12} fontSize={10} fill={textColor} textAnchor="middle">
            {String(d.x).length > 10 ? String(d.x).slice(0, 10) + '…' : String(d.x)}
          </SvgText>
        ))}
      </G>
    </Svg>
  );
}

function PieChartSVG({data, colors, textColor}: any) {
  const size = moderateScale(260);
  const radius = size * 0.35;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((a: number, b: any) => a + (b.y || 0), 0) || 1;
  if (data.length === 1) {
    const label = total > 0 ? '100%' : '0%';
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} fill={colors[0]} />
        <SvgText x={cx} y={cy} fontSize={12} fill={textColor} textAnchor="middle">
          {label}
        </SvgText>
      </Svg>
    );
  }
  let startAngle = -Math.PI / 2;
  const slices = data.map((d: any, i: number) => {
    const angle = (d.y / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (radius + 14) * Math.cos(midAngle);
    const ly = cy + (radius + 14) * Math.sin(midAngle);
    const label = `${(d.y && total ? Math.round((d.y / total) * 100) : 0)}%`;
    startAngle = endAngle;
    return {path, color: colors[i % colors.length], label, lx, ly};
  });
  return (
    <Svg width={size} height={size}>
      {slices.map((s, i) => (
        <G key={`slice-${i}`}>
          <Path d={s.path} fill={s.color} stroke={textColor} strokeWidth={0.5} />
          <SvgText x={s.lx} y={s.ly} fontSize={10} fill={textColor} textAnchor="middle">
            {s.label}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function RadarChart({data, maxValue, color, textColor}: any) {
  const size = moderateScale(260);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  if (data.length === 1) {
    const angle = -Math.PI / 2;
    const r = ((data[0]?.y || 0) / maxValue) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} stroke={textColor} strokeOpacity={0.2} fill="none" />
        <Circle cx={x} cy={y} r={6} fill={data[0]?.color || color} />
      </Svg>
    );
  }
  const points = data.map((d: any, i: number) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    const r = ((d.y || 0) / maxValue) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (radius + 18) * Math.cos(angle),
      labelY: cy + (radius + 18) * Math.sin(angle),
      label: d.x,
      color: d.color || color,
    };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={radius} stroke={textColor} strokeOpacity={0.2} fill="none" />
      <Polygon points={polygon} fill={color} opacity={0.35} />
      {points.map((p, i) => (
        <Circle key={`rl-${i}`} cx={p.labelX} cy={p.labelY} r={4} fill={p.color} />
      ))}
    </Svg>
  );
}
