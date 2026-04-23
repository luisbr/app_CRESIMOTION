import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CMainAppBar from '../../../components/common/CMainAppBar';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import {getResults} from '../api/sessionsApi';
import {getChartView, saveChartView, getModuleLabel} from '../utils';
import Svg, {G, Text as SvgText, Rect, Path, Polygon, Circle, TSpan} from 'react-native-svg';
import {moderateScale} from '../../../common/constants';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';

export default function DiagnosticoHistoryDetailScreen({route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const groupItems: any[] = route?.params?.groupItems || [];
  const initialIndex = Number(route?.params?.startIndex || 0);
  const [index, setIndex] = useState(initialIndex);
  const currentSession = groupItems.length ? groupItems[index] : null;
  const currentSessionId: number = groupItems.length
    ? Number(groupItems[index]?.session_id || groupItems[index]?.id)
    : Number(route?.params?.sessionId);
  const moduleKey = currentSession?.module_key || null;
  const moduleLabel = moduleKey ? getModuleLabel(moduleKey) : '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
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
    const items = groups.flatMap((g: any) =>
      (g?.items || []).map((it: any) => ({...it, __groupKey: g?.key}))
    );
    return items
      .map((it: any) => {
        const label = it?.label || it?.titulo || it?.name || it?.item_label || '';
        const groupKey = String(it?.__groupKey || '').toLowerCase();
        const rawIntensityLabel =
          it?.intensity_label ||
          it?.value_label ||
          it?.intensidad_label ||
          it?.intensity_key ||
          it?.titulo ||
          '***';
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
        const isExtreme = groupKey === 'pensamiento_extremo';
        const evaluations = Array.isArray(it?.evaluations) ? it.evaluations : [];
        return {label, intensityLabel, value, intensityKey, isExtreme, groupKey, evaluations};
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.value - a.value);
  }, [results]);
  const extremeItems = chartData.filter(d => d.isExtreme);
  const mainItems = chartData.filter(d => !d.isExtreme);
  const legendColors = useMemo(() => {
    const map: Record<string, string> = {};
    chartData.forEach((d: any) => {
      if (d?.value >= 5) map[d.label] = '#EF4444';
      else if (d?.value >= 4) map[d.label] = '#F97316';
      else if (d?.value >= 3) map[d.label] = '#FDE047';
      else if (d?.value >= 2) map[d.label] = '#22C55E';
      else map[d.label] = '#FFFFFF';
    });
    return map;
  }, [chartData]);
  const levelRows = useMemo(() => {
    const unique = new Map<number, string>();
    mainItems.forEach(d => {
      if (!Number.isNaN(d.value)) {
        unique.set(d.value, d.intensityLabel || String(d.value));
      }
    });
    const arr = Array.from(unique.entries())
      .map(([value, label]) => ({value, label}))
      .sort((a, b) => b.value - a.value);
    return arr.length ? arr : [{value: 0, label: ''}];
  }, [mainItems]);
  const extremeLevelRows = useMemo(() => {
    const unique = new Map<number, string>();
    extremeItems.forEach(d => {
      if (!Number.isNaN(d.value)) {
        unique.set(d.value, d.intensityLabel || String(d.value));
      }
    });
    const arr = Array.from(unique.entries())
      .map(([value, label]) => ({value, label}))
      .sort((a, b) => b.value - a.value);
    return arr.length ? arr : [{value: 0, label: ''}];
  }, [extremeItems]);
  const allowRadar = chartData.length >= 3;
  const availableViews = allowRadar ? (['bar', 'pie', 'radar'] as const) : (['bar', 'pie'] as const);
  const moduleTitleMap: Record<string, string> = {
    motivos: 'Motivos de tu estado emocional',
    sintomas_fisicos: 'Sintomatología física.',
    sintomas_emocionales: 'Sintomatología emocional',
  };
  const moduleTitle = (moduleKey && moduleTitleMap[moduleKey]) || moduleLabel || 'Resultados';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getResults(currentSessionId);
        if (!mounted) return;
        setResults(data);
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
  }, [currentSessionId]);

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);

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

  return (
    <CSafeAreaView>
      <CMainAppBar mode="sub" title={moduleTitle} />
      <View style={[styles.p20, styles.flex]}>

        <CText type={'S12'} align={'center'}>
          Aquí te presentamos un resumen gráfico de la información que nos proporcionaste.
        </CText>
        <CText type={'S12'} align={'center'}>
          
        </CText>
        <View style={styles.flex}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        ) : (
          <ScrollView showsVerticalScrollIndicator={true} style={styles.flex} contentContainerStyle={{paddingBottom: 24}}>
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
                        {key === 'bar' ? 'Barras' : key === 'pie' ? 'Pastel' : 'Radar'}
                      </CText>
                    </TouchableOpacity>
                  ))}
                </View>
                {view === 'bar' ? (
                  <BarChartSVG
                    data={mainItems.map((d, idx) => ({
                      x: String(idx + 1),
                      y: d.value,
                      color: legendColors[d.label],
                    }))}
                    levels={levelRows}
                    textColor={colors.textColor}
                    axisColor={colors.grayScale3}
                    showLevels
                  />
                ) : view === 'pie' ? (
                  <PieChartSVG
                    data={mainItems.map((d, idx) => ({x: d.label, y: d.value, index: idx + 1, intensityLabel: d.intensityLabel}))}
                    colors={mainItems.map(d => legendColors[d.label])}
                    textColor={colors.textColor}
                  />
                ) : (
                  <RadarChart
                    data={mainItems.map((d, idx) => ({
                      x: d.label,
                      y: d.value,
                      color: legendColors[d.label],
                      index: idx + 1,
                      intensityLabel: d.intensityLabel,
                    }))}
                    maxValue={5}
                    color={colors.primary}
                    textColor={colors.textColor}
                  />
                )}
                <View style={[styles.mt10]}>
                  {mainItems.map((d, idx) => (
                    <View key={String(idx)} style={[styles.rowSpaceBetween, styles.mb8]}>
                      <View style={[styles.rowStart, styles.flex]}>
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: legendColors[d.label],
                            marginRight: 6,
                          }}
                        />
                        <CText type={'S12'} color={colors.labelColor} style={{flex: 1}}>
                          {`${idx + 1}. ${d.label}`}
                        </CText>
                      </View>
                      {!!d.evaluations?.length && (
                        <MiniSparkline
                          values={d.evaluations.map((ev: any) => Number(ev?.value ?? ev?.intensity_value ?? 0))}
                          color={legendColors[d.label]}
                        />
                      )}
                    </View>
                  ))}
                </View>
                {!!extremeItems.length && (
                  <View style={[styles.mt15, styles.pt10, {borderTopWidth: 1, borderTopColor: colors.grayScale2}]}>
                    <CText type={'S16'} align={'center'} style={styles.mb10}>
                      Pensamientos extremos
                    </CText>
                    {view === 'bar' ? (
                      <BarChartSVG
                        data={extremeItems.map((d, idx) => ({
                          x: String(idx + 1),
                          y: d.value,
                          color: legendColors[d.label],
                        }))}
                        levels={extremeLevelRows}
                        textColor={colors.textColor}
                        axisColor={colors.grayScale3}
                        showLevels
                        labelX={-12}
                        labelFontSize={11}
                      />
                    ) : view === 'pie' ? (
                      <PieChartSVG
                        data={extremeItems.map((d, idx) => ({x: d.label, y: d.value, index: idx + 1, intensityLabel: d.intensityLabel}))}
                        colors={extremeItems.map(d => legendColors[d.label])}
                        textColor={colors.textColor}
                      />
                    ) : (
                      <RadarChart
                        data={extremeItems.map((d, idx) => ({
                          x: d.label,
                          y: d.value,
                          color: legendColors[d.label],
                          index: idx + 1,
                          intensityLabel: d.intensityLabel,
                        }))}
                        maxValue={5}
                        color={colors.primary}
                        textColor={colors.textColor}
                      />
                    )}
                    <View style={[styles.mt10]}>
                      {extremeItems.map((d, idx) => (
                        <View key={`ext-${idx}`} style={[styles.rowSpaceBetween, styles.mb8]}>
                          <View style={[styles.rowStart, styles.flex]}>
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: legendColors[d.label],
                                marginRight: 6,
                              }}
                            />
                            <CText type={'S12'} color={colors.labelColor} style={{flex: 1}}>
                              {`${idx + 1}. ${d.label}`}
                            </CText>
                          </View>
                          {!!d.evaluations?.length && (
                            <MiniSparkline
                              values={d.evaluations.map((ev: any) => Number(ev?.value ?? ev?.intensity_value ?? 0))}
                              color={legendColors[d.label]}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <CText type={'S14'} color={colors.labelColor}>
                Sin datos para graficar.
              </CText>
            )}
          </ScrollView>
        )}
        </View>
      {groupItems.length > 1 && (
        <View style={[styles.rowSpaceBetween, styles.mt10]}>
            <TouchableOpacity
              onPress={() => setIndex(prev => Math.max(0, prev - 1))}
              disabled={index === 0}
            >
              <CText type={'S14'} color={index === 0 ? colors.grayScale3 : colors.primary}>
                Anterior
              </CText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIndex(prev => Math.min(groupItems.length - 1, prev + 1))}
              disabled={index >= groupItems.length - 1}
            >
              <CText
                type={'S14'}
                color={index >= groupItems.length - 1 ? colors.grayScale3 : colors.primary}
              >
                Siguiente
              </CText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            DiagnosticoHistoryDetailScreen
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

function BarChartSVG({
  data,
  levels,
  textColor,
  axisColor,
  showLevels = true,
  labelX = -6,
  labelFontSize = 10,
}: any) {
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
        {showLevels &&
          levels.map((lvl: any, idx: number) => {
            const y = chartH - (lvl.value / maxY) * (chartH - 10);
            const lines = wrapLabel(String(lvl.label || ''), 8, 2);
            return (
              <G key={`lvl-${idx}`}>
                <Path d={`M0,${y} L${chartW},${y}`} stroke={axisColor} strokeWidth={0.5} fill="none" />
                <SvgText x={labelX} y={y + 3} fontSize={labelFontSize} fill={textColor} textAnchor="end">
                  {lines.map((line, i) => (
                    <TSpan key={`lvl-${idx}-l-${i}`} x={labelX} dy={i === 0 ? 0 : labelFontSize + 2}>
                      {line}
                    </TSpan>
                  ))}
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

function wrapLabel(text: string, maxChars = 8, maxLines = 2) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  const trimmed = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    trimmed[maxLines - 1] = `${trimmed[maxLines - 1]}…`;
  }
  return trimmed;
}

function MiniSparkline({
  values,
  width = 90,
  height = 24,
  color = '#10B981',
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const padding = 2;
  const points = values.map((v, i) => {
    const x = padding + (i / Math.max(1, values.length - 1)) * (width - padding * 2);
    const y = padding + ((max - v) / range) * (height - padding * 2);
    return {x, y};
  });
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" />
      {points.map((p, i) => (
        <Circle key={`pt-${i}`} cx={p.x} cy={p.y} r={2} fill={color} />
      ))}
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
    const lx = cx + (radius + 22) * Math.cos(midAngle);
    const ly = cy + (radius + 22) * Math.sin(midAngle);
    const pct = (d.y && total ? Math.round((d.y / total) * 100) : 0);
    const intensity = d.intensityLabel ? ` — ${d.intensityLabel}` : '';
    const label = d.index ? `${d.index} · ${pct}%${intensity}` : `${pct}%${intensity}`;
    startAngle = endAngle;
    return {path, color: colors[i % colors.length], label, lx, ly};
  });
  return (
    <Svg width={size} height={size}>
      {slices.map((s, i) => (
        <G key={`slice-${i}`}>
          <Path d={s.path} fill={s.color} stroke={textColor} strokeWidth={0.5} />
          <SvgText x={s.lx} y={s.ly} fontSize={9} fill={textColor} textAnchor="middle">
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
    const intensityLabel = d.intensityLabel ? ` — ${d.intensityLabel}` : '';
    const label = d.index ? `${d.index}${intensityLabel}` : `${intensityLabel}`.trim();
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (radius + 18) * Math.cos(angle),
      labelY: cy + (radius + 18) * Math.sin(angle),
      label,
      color: d.color || color,
      index: d.index,
    };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  const levels = 5;
  const rings = Array.from({length: levels}, (_, i) => {
    const ratio = (i + 1) / levels;
    return radius * ratio;
  });
  return (
    <Svg width={size} height={size}>
      {rings.map((r, i) => (
        <Circle
          key={`ring-${i}`}
          cx={cx}
          cy={cy}
          r={r}
          stroke={textColor}
          strokeOpacity={0.2}
          fill="none"
        />
      ))}
      <Polygon points={polygon} fill={color} opacity={0.35} />
      {points.map((p, i) => (
        <G key={`rl-${i}`}>
          <Circle cx={p.labelX} cy={p.labelY} r={4} fill={p.color} />
          {p.index ? (
            <SvgText
              x={p.labelX}
              y={p.labelY - 8}
              fontSize={9}
              fill={textColor}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ) : null}
        </G>
      ))}
    </Svg>
  );
}
