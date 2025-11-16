import React, { useMemo, useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import CText from '../../components/common/CText';
import { styles } from '../../theme';
import { useSelector } from 'react-redux';
import CButton from '../../components/common/CButton';
import {getWidth, moderateScale} from '../../common/constants';
import { saveIntensity, getSummary, completeProgress, debugLogFlow, listIntensitiesForProgress } from '../../repositories/formsRepo';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';

export default function IntensityWizardScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const encuestaId = String(route?.params?.encuestaId || '1');
  const encuestaTitle = String(route?.params?.encuestaTitle || '');
  const progressId = Number(route?.params?.progressId);
  const motivos = route?.params?.motivos || [];
  const [index, setIndex] = useState(0);
  const motivo = motivos[index];

  const intensidades = useMemo(() => motivo?.intensidades || [], [motivo]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answersByMotivo, setAnswersByMotivo] = useState<Record<string, string>>({});

  useEffect(() => {
    // cuando entras con motivos filtrados (solo pendientes) ya parte de 0
    setIndex(0);
    setSelected(null);
    console.log('[QUIZ] IntensityWizard mount', {
      encuestaId,
      encuestaTitle,
      progressId,
      motivosCount: motivos?.length || 0,
    });
    const stored = listIntensitiesForProgress(progressId);
    const map: Record<string, string> = {};
    stored.forEach((row: any) => {
      if (row?.motivo_id && row?.intensidad_id) {
        map[String(row.motivo_id)] = String(row.intensidad_id);
      }
    });
    setAnswersByMotivo(map);
  }, [motivos, progressId]);

  useEffect(() => {
    const m = motivos[index];
    if (m) {
      console.log('[QUIZ] Motivo actual', { index: index + 1, total: motivos.length, motivoId: m.id, motivo: m.motivo });
      const prev = answersByMotivo[String(m.id)];
      setSelected(prev || null);
    }
  }, [index, motivos, answersByMotivo]);

  const onNext = async () => {
    if (!motivo || !selected) return;
    const sel = intensidades.find((i: any) => String(i.id) === String(selected));
    const peso = Number(sel?.peso || 0);
    console.log('[DB] saveIntensity ->', { progressId, motivoId: String(motivo.id), intensidadId: String(selected), peso });
    saveIntensity(progressId, String(motivo.id), String(selected), peso);
    setAnswersByMotivo(prev => ({ ...prev, [String(motivo.id)]: String(selected) }));
    if (index < motivos.length - 1) {
      setSelected(null);
      console.log('[QUIZ] next motivo', { fromIndex: index + 1, toIndex: index + 2 });
      setIndex(index + 1);
    } else {
      console.log('[QUIZ] completed encuesta', { encuestaId, progressId });
      completeProgress(progressId);
      try {
        const { getSession } = require('../../api/auth');
        const { closeOtherInProgressForSameSurvey } = require('../../repositories/formsRepo');
        const s = await getSession();
        const uid = String(s?.id || 'anon');
        closeOtherInProgressForSameSurvey(uid, encuestaId, progressId);
        debugLogFlow(uid, `IntensityWizard:complete-${encuestaId}`);
      } catch (e) {
        console.log('[DB][WARN] closeOtherInProgressForSameSurvey failed', e);
      }
      const summary = getSummary(progressId);
      console.log('[NAV] to Summary', { encuestaId, progressId, motivos: motivos.length });
      navigation.replace('Summary', { encuestaId, progressId, summary, motivos });
    }
  };

  const onPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <CSafeAreaView>
      <CHeader title={'Intensidad'} />
      <View style={[styles.ph20, styles.pv20]}>
      <CText type={'B18'}>Ahora cuéntanos cuál es la intensidad de tu {encuestaTitle || encuestaId}</CText>
      <CText type={'S14'} style={styles.mt5}>{`${index + 1}/${motivos.length}`}</CText>
      <CText type={'B16'} style={styles.mt10}>{motivo?.motivo}</CText>
      <View style={styles.mt20}>
        {intensidades.map((opt: any) => {
          const isOn = String(selected) === String(opt.id);
          return (
            <TouchableOpacity key={String(opt.id)} onPress={() => setSelected(String(opt.id))} style={[styles.rowSpaceBetween, styles.pv15]}>
              <CText type={'S16'}>{opt.intensidad}</CText>
              <View
                style={{
                  width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11),
                  borderWidth: 2, borderColor: isOn ? colors.primary : colors.grayScale2,
                  backgroundColor: isOn ? colors.primary : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.rowSpaceBetween, styles.mt20]}>
        <CButton title={'Anterior'} onPress={onPrev} disabled={index === 0} containerStyle={localStyles.btnStyle}
        bgColor={colors.inputBg}
              color={colors.primary}
        />
        <CButton title={index === motivos.length - 1 ? 'Finalizar' : 'Siguiente'} onPress={onNext} disabled={!selected} containerStyle={localStyles.btnStyle}
        bgColor={colors.inputBg}
              color={colors.primary}
        />
      </View>
      </View>
    </CSafeAreaView>
  );
}
const localStyles = StyleSheet.create({
  
  btnStyle: {
    width: getWidth(99),
    height: moderateScale(30),
  },
});
