import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { postMotivoEval } from '../../api/sesionTerapeutica';
import { postPostWorkEval } from '../../modules/diagnostico/api/sessionsApi';
import { getMotivoId, getMotivoLabel, normalizeTherapyNext } from './therapyUtils';

export default function FocusMotivoEvalScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const sessionId = route?.params?.sessionId || null;
  const postWork = route?.params?.postWork || false;
  const postWorkGroupId = route?.params?.groupId || null;
  const postWorkEmotions = Array.isArray(route?.params?.emotions) ? route.params.emotions : [];
  const motivoId = route?.params?.motivoId || null;
  const motivoLabelParam = route?.params?.motivoLabel || '';
  const nextPayload = route?.params?.next || null;
  const { data } = normalizeTherapyNext(nextPayload);
  const resolvedMotivoId = motivoId || getMotivoId(data);
  const resolvedMotivoLabel = motivoLabelParam || getMotivoLabel(data);

  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextResponse, setNextResponse] = useState<any>(null);

  const postEvalMessage = nextResponse?.post_eval_message || null;
  const hasResponse = !!nextResponse;
  const title = postEvalMessage?.message_title || 'Evaluación del enfoque positivo';
  const message =
    postEvalMessage?.message_body ||
    `¿Cómo percibes ahora el motivo de ${resolvedMotivoLabel || `#${resolvedMotivoId || ''}` }? Selecciona la opción que mejor describa cómo te sientes ahora.`;

  const options = useMemo(
    () => [
      { value: 0, label: 'Nulo (no percibo ese motivo en este momento)' },
      { value: 1, label: 'Bajo (el motivo está presente pero no me afecta)' },
      { value: 2, label: 'Medio (siento el motivo de forma moderada)' },
      { value: 3, label: 'Alto (el motivo es intenso y me está afectando)' },
      { value: 4, label: 'Muy alto (el motivo sigue siendo muy fuerte y difícil de manejar)' },
    ],
    []
  );

  const onSubmitEval = async () => {
    console.log('[THERAPY] post-motivo-eval payload', {
      sessionId,
      motivoId: resolvedMotivoId,
      value: selectedValue,
    });
    try {
      if (!resolvedMotivoId) {
        throw new Error('Falta información para continuar.');
      }
      if (selectedValue == null) {
        throw new Error('Selecciona una opción para continuar.');
      }
      setLoading(true);
      if (postWork) {
        if (!postWorkGroupId) throw new Error('Falta información para continuar.');
        const next = await postPostWorkEval(Number(postWorkGroupId), {
          tipo: 'motivo',
          item_id: Number(resolvedMotivoId),
          value: selectedValue,
        });
        console.log('[THERAPY] post-work motivo eval response', next);
        setNextResponse(next);
      } else {
        if (!sessionId) throw new Error('Falta información para continuar.');
        const next = await postMotivoEval({ sessionId, motivoId: resolvedMotivoId, value: selectedValue });
        console.log('[THERAPY] post-motivo-eval response', next);
        setNextResponse(next);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    } finally {
      setLoading(false);
    }
  };

  const onContinue = () => {
    if (!nextResponse) return;
    if (postWork) {
      navigation.replace('TherapyHealingSelectEmotion', {
        postWork: true,
        groupId: postWorkGroupId,
        emotions: postWorkEmotions,
        entrypoint: 'post_work',
      });
      return;
    }
    navigation.replace('TherapyFlowRouter', { initialNext: nextResponse, entrypoint: 'focus' });
  };

  useEffect(() => {
    if (!postWork) return;
    if (nextResponse && !postEvalMessage) {
      onContinue();
    }
  }, [postWork, nextResponse, postEvalMessage]);


  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]} keyboardShouldPersistTaps={'handled'}>
        <CText type={'B20'}>{title}</CText>
        <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
          {message}
        </CText>
        {!hasResponse && (
          <View style={styles.mt20}>
            {options.map(opt => {
              const isOn = selectedValue === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  onPress={() => setSelectedValue(opt.value)}
                  style={[styles.rowSpaceBetween, styles.pv15]}
                >
                  <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>
                    {opt.label}
                  </CText>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isOn ? colors.primary : colors.grayScale2,
                      backgroundColor: isOn ? colors.primary : 'transparent',
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {!!postEvalMessage?.recommendation_label && (
          <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
            {postEvalMessage.recommendation_label}
          </CText>
        )}
      </ScrollView>
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
        {hasResponse ? (
          <CButton title={'Continuar'} onPress={onContinue} />
        ) : (
          <CButton title={'Enviar'} disabled={loading || selectedValue == null} onPress={onSubmitEval} />
        )}
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
