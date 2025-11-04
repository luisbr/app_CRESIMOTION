import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import CText from '../../components/common/CText';
import { useSelector } from 'react-redux';
import { styles } from '../../theme';
import CButton from '../../components/common/CButton';
import { getEncuestaById } from '../../api/encuestas';
import { migrate } from '../../db';
import { startOrGetProgress, saveSelectedReasons, listSelectedReasons, listUnansweredMotivoIds } from '../../repositories/formsRepo';
import { getSession } from '../../api/auth';
import { moderateScale } from '../../common/constants';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import RenderHTML from 'react-native-render-html';

export default function ReasonsListScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const encuestaId = String(route?.params?.encuestaId || '1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encuesta, setEncuesta] = useState<any>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<any>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    migrate();
    (async () => {
      try {
        console.log('[QUIZ] ReasonsList mount. encuestaId=', encuestaId);
        const data = await getEncuestaById(encuestaId);
        setEncuesta(data);
        const s = await getSession();
        const p = startOrGetProgress(String(s?.id || 'anon'), encuestaId);
        setProgress(p);
        const selected = listSelectedReasons(p.id);
        setChecked(Object.fromEntries(selected.map(id => [id, true])));
        console.log('[QUIZ] ReasonsList loaded:', {
          encuestaId,
          title: data?.encuesta,
          motivos: (data?.motivos || []).length,
          progressId: p?.id,
          selectedPrev: selected.length,
        });
      } catch (e: any) {
        setError(e?.message || 'Error al cargar encuesta');
      } finally {
        setLoading(false);
      }
    })();
  }, [encuestaId]);

  const motivos = useMemo(() => encuesta?.motivos || [], [encuesta]);
  const noneOptionId = useMemo(() => {
    const found = motivos.find((m: any) => /ning[uú]n problema/i.test(m.motivo));
    return found?.id || null;
  }, [motivos]);

  const toggle = (id: string) => {
    console.log('[QUIZ] toggle motivo', id);
    setChecked(prev => {
      const next = { ...prev };
      const newVal = !prev[id];
      // Regla exclusión: "No tengo ningún problema"
      if (noneOptionId && id === noneOptionId && newVal) {
        // solo ese
        return { [id]: true } as any;
      }
      if (noneOptionId && id !== noneOptionId && prev[noneOptionId]) {
        next[noneOptionId] = false;
      }
      next[id] = newVal;
      return next;
    });
  };

  const onContinue = () => {
    const selectedIds = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);
    if (!progress || selectedIds.length === 0) return;
    console.log('[DB] saveSelectedReasons', { progressId: progress.id, selectedIds });
    saveSelectedReasons(progress.id, selectedIds);
    const unanswered = listUnansweredMotivoIds(progress.id, selectedIds);
    console.log('[QUIZ] continue to IntensityWizard', {
      encuestaId,
      progressId: progress.id,
      motivosTotal: motivos.length,
      selected: selectedIds.length,
      unanswered: unanswered.length,
    });
    navigation.navigate('IntensityWizard', {
      encuestaId,
      encuestaTitle: encuesta?.encuesta || '',
      progressId: progress.id,
      motivos: motivos.filter((m: any) => (unanswered.length ? unanswered : selectedIds).includes(m.id)),
    });
  };

  if (loading) return <View style={[styles.flex, styles.center]}><CText>Cargando…</CText></View>;
  if (error) return <View style={[styles.flex, styles.center, styles.ph20]}><CText>{error}</CText></View>;

  return (
    <CSafeAreaView>
      <CHeader title={encuesta?.encuesta || 'Encuesta'} />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }] }>
        {!!encuesta?.introduccion && (
          <View style={styles.mt10}>
            <RenderHTML
              contentWidth={width - 40}
              source={{ html: encuesta.introduccion }}
              baseStyle={{ color: colors.labelColor, fontSize: 14, lineHeight: 20 }}
              tagsStyles={{ p: { marginTop: 0, marginBottom: 8 } }}
            />
          </View>
        )}
      <FlatList
        data={motivos}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => {
          const isOn = !!checked[item.id];
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.rowSpaceBetween, styles.pv15]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <CText type={'S16'}>{item.motivo}</CText>
              </View>
              <View
                style={{
                  width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11),
                  borderWidth: 2, borderColor: isOn ? colors.primary : colors.grayScale2,
                  backgroundColor: isOn ? colors.primary : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.grayScale2 }} />}
        style={[styles.mt20]}
        contentContainerStyle={{ paddingBottom: moderateScale(96) }}
      />
      {motivos.length === 0 && (
        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>No hay motivos para mostrar.</CText>
      )}
      </View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: colors.grayScale2,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <CButton
          title={'Continuar'}
          onPress={onContinue}
          disabled={Object.values(checked).filter(Boolean).length === 0}
        />
      </View>
    </CSafeAreaView>
  );
}
