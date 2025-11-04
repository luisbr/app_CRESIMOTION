import React, { useMemo, useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import CText from '../../components/common/CText';
import { styles } from '../../theme';
import { useSelector } from 'react-redux';
import CButton from '../../components/common/CButton';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
// Removed victory-native usage to avoid reanimated/skia deps; use pure SVG instead
import Svg, { Polygon, Circle, G, Text as SvgText, Rect, Path } from 'react-native-svg';
import { moderateScale } from '../../common/constants';

export default function SummaryScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const summary = route?.params?.summary || [];
  const motivos = route?.params?.motivos || [];
  const encuestaId = String(route?.params?.encuestaId || '1');
  useEffect(() => {
    console.log('[QUIZ] Summary mount', { encuestaId, motivos: motivos.length, summaryCount: summary.length });
  }, [encuestaId, summary, motivos]);

  const byMotivo = new Map<string, number>();
  summary.forEach((r: any) => {
    const k = String(r.motivo_id);
    byMotivo.set(k, (byMotivo.get(k) || 0) + Number(r.peso || 0));
  });
  const data = motivos.map((m: any) => ({ x: String(m.motivo), y: byMotivo.get(String(m.id)) ?? 0 }));
  const [view, setView] = useState<'bar' | 'pie' | 'radar'>('bar');

  const maxValue = useMemo(() => (data.length ? Math.max(...data.map(d => d.y)) : 0), [data]);

  return (
    <CSafeAreaView>
      <CHeader title={'Resumen'} />
      <View style={[styles.ph20, styles.pv20]}>
      <CText type={'B18'}>Resumen de intensidades</CText>
      <View style={[styles.rowSpaceBetween, styles.mt15]}>
        {['bar','pie','radar'].map(key => (
          <TouchableOpacity key={key} onPress={() => setView(key as any)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: view===key ? colors.primary : colors.inputBg }}>
            <CText color={view===key ? colors.white : colors.textColor}>{key === 'bar' ? 'Barras' : key === 'pie' ? 'Pie' : 'Radar'}</CText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.mt20]}>
        {data.length === 0 ? (
          <CText type={'S14'} color={colors.labelColor}>Sin datos para graficar.</CText>
        ) : view === 'bar' ? (
          <BarChartSVG data={data} color={colors.primary} textColor={colors.textColor} axisColor={colors.grayScale2} />
        ) : view === 'pie' ? (
          <PieChartSVG data={data} colors={[colors.primary, colors.checkMark, '#FDBA74', '#60A5FA', '#34D399', '#F472B6', '#F59E0B']} textColor={colors.textColor} />
        ) : (
          <RadarChart data={data} maxValue={maxValue || 40} color={colors.primary} textColor={colors.textColor} />
        )}
      </View>
      <CButton title={'Finalizar'} onPress={() => navigation.popToTop()} style={styles.mt20} />
      <View style={styles.mt10}>
        {encuestaId === '3' ? (
          <CButton
            title={'Iniciar Sanación'}
            onPress={async () => {
              try {
                const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                await AsyncStorage.setItem('HEALING_START_FLAG', '1');
              } catch (e) {}
              console.log('[NAV] iniciar sanacion');
              navigation.navigate('HealingStart');
            }}
          />
        ) : (
          <CButton
            title={`Continuar a encuesta ${encuestaId === '1' ? '2' : encuestaId === '2' ? '3' : '-'}`}
            onPress={() => {
              const nextMap: any = { '1': '2', '2': '3' };
              const nextId = nextMap[encuestaId];
              console.log('[NAV] continue to next encuesta', { from: encuestaId, to: nextId });
              if (nextId) navigation.replace('ReasonsList', { encuestaId: nextId });
            }}
          />
        )}
      </View>
      <View style={styles.mt10}>
        <ResetDebugButton navigation={navigation} />
      </View>
      </View>
    </CSafeAreaView>
  );
}

function RadarChart({ data, maxValue, color, textColor }: any) {
  const size = moderateScale(260);
  const center = size / 2;
  const radius = size * 0.38;
  const steps = 4;
  const angleStep = (2 * Math.PI) / Math.max(1, data.length);
  const points = (vals: number[]) =>
    vals.map((v, i) => {
      const r = (v / maxValue) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

  const grid = Array.from({ length: steps }, (_, s) => (s + 1) * (radius / steps));

  const values = data.map((d: any) => d.y);
  return (
    <Svg width={size} height={size}>
      <G>
        {grid.map((r, idx) => (
          <Circle key={`g-${idx}`} cx={center} cy={center} r={r} stroke={"#D1D5DB"} strokeWidth={1} fill="none" />
        ))}
        {data.map((d: any, i: number) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (radius + 12) * Math.cos(angle);
          const y = center + (radius + 12) * Math.sin(angle);
          return <SvgText key={`t-${i}`} x={x} y={y} fontSize={10} fill={textColor} textAnchor={x < center ? 'end' : x > center ? 'start' : 'middle'}>{d.x}</SvgText>;
        })}
        {data.length > 2 && (
          <Polygon points={points(values)} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} />
        )}
      </G>
    </Svg>
  );
}

function ResetDebugButton({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const onReset = async () => {
    try {
      const { getSession } = require('../../api/auth');
      const { clearAllProgressForUser } = require('../../repositories/formsRepo');
      const s = await getSession();
      clearAllProgressForUser(String(s?.id || 'anon'));
      navigation.popToTop();
    } catch (e) {}
  };
  return (
    <CButton title={'Reset encuestas (debug)'} onPress={onReset} bgColor={colors.inputBg} color={colors.primary} />
  );
}

function BarChartSVG({ data, color, textColor, axisColor }: any) {
  const width = moderateScale(320);
  const height = moderateScale(220);
  const padding = 30;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxY = Math.max(1, ...data.map((d: any) => d.y));
  const barW = (chartW / Math.max(1, data.length)) * 0.6;
  return (
    <Svg width={width} height={height}>
      <G transform={`translate(${padding},${padding})`}>
        <Path d={`M0,0 L0,${chartH} L${chartW},${chartH}`} stroke={axisColor} strokeWidth={1} />
        {data.map((d: any, i: number) => {
          const x = (chartW / data.length) * i + (chartW / data.length - barW) / 2;
          const h = (d.y / maxY) * (chartH - 10);
          const y = chartH - h;
          return <Rect key={`b-${i}`} x={x} y={y} width={barW} height={h} fill={color} rx={4} />
        })}
        {data.map((d: any, i: number) => (
          <SvgText key={`lx-${i}`} x={(chartW / data.length) * i + (chartW / data.length) / 2} y={chartH + 12} fontSize={10} fill={textColor} textAnchor="middle">
            {String(d.x).length > 10 ? String(d.x).slice(0, 10) + '…' : String(d.x)}
          </SvgText>
        ))}
        {data.map((d: any, i: number) => (
          <SvgText key={`ly-${i}`} x={(chartW / data.length) * i + (chartW / data.length) / 2} y={((chartH - (d.y / maxY) * (chartH - 10)) - 6)} fontSize={10} fill={textColor} textAnchor="middle">
            {d.y}
          </SvgText>
        ))}
      </G>
    </Svg>
  );
}

function PieChartSVG({ data, colors, textColor }: any) {
  const size = moderateScale(260);
  const radius = size * 0.35;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((a: number, b: any) => a + (b.y || 0), 0) || 1;
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
    return { path, color: colors[i % colors.length], label, lx, ly, name: d.x };
  });
  return (
    <Svg width={size} height={size}>
      {slices.map((s, i) => (
        <>
          <Path key={`p-${i}`} d={s.path} fill={s.color} />
          <SvgText key={`t-${i}`} x={s.lx} y={s.ly} fontSize={10} fill={textColor} textAnchor="middle">{s.label}</SvgText>
        </>
      ))}
      {slices.map((s, i) => (
        <SvgText key={`n-${i}`} x={10} y={size - (slices.length - i) * 14} fontSize={10} fill={textColor}>{`• ${s.name}`}</SvgText>
      ))}
    </Svg>
  );
}
