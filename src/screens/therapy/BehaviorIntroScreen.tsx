import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { postEval } from '../../api/sesionTerapeutica';
import { API_BASE_URL } from '../../api/config';
import { normalizeTherapyNext } from './therapyUtils';

export default function BehaviorIntroScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const sessionId = route?.params?.sessionId || null;
  const emocionId = route?.params?.emocionId || null;
  const nextPayload = route?.params?.next || null;
  const { data } = normalizeTherapyNext(nextPayload);
  const initialEmotionLabel =
    route?.params?.emotionLabel ||
    data?.emotion?.label ||
    data?.emocion?.label ||
    '';
  const [resolvedEmotionLabel, setResolvedEmotionLabel] = useState(initialEmotionLabel);

  useEffect(() => {
    let mounted = true;
    const loadEmotionLabel = async () => {
      if (resolvedEmotionLabel || !emocionId) return;
      try {
        const url = `${API_BASE_URL}/api/ws/emociones/${emocionId}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!mounted) return;
        if (json?.ok && json?.data?.label) {
          setResolvedEmotionLabel(String(json.data.label));
        }
      } catch (e) {
        // ignore
      }
    };
    loadEmotionLabel();
    return () => {
      mounted = false;
    };
  }, [emocionId, resolvedEmotionLabel]);

  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextResponse, setNextResponse] = useState<any>(null);

  const postEvalMessage = nextResponse?.post_eval_message || null;
  const title = postEvalMessage?.message_title || 'Evaluación de la Sesión terapéutica';
  const message = postEvalMessage?.message_body ||
    `¿Cómo percibes ahora la emoción de ${resolvedEmotionLabel || `#${emocionId || ''}` }? Selecciona la opción que mejor describa cómo te sientes ahora.`;

  const options = useMemo(
    () => [
      { value: 0, label: 'Nulo (no percibo esa emoción en este momento)' },
      { value: 1, label: 'Bajo (la emoción está presente pero no me afecta)' },
      { value: 2, label: 'Medio (siento la emoción de forma moderada)' },
      { value: 3, label: 'Alto (la emoción es intensa y me está afectando)' },
      { value: 4, label: 'Muy alto (la emoción sigue siendo muy fuerte y difícil de manejar)' },
    ],
    []
  );

  const onSubmitEval = async () => {
    console.log('[THERAPY] post-eval payload', {
      sessionId,
      emocionId,
      value: selectedValue,
    });
    try {
      if (!sessionId || !emocionId) {
        throw new Error('Falta información para continuar.');
      }
      if (selectedValue == null) {
        throw new Error('Selecciona una opción para continuar.');
      }
      setLoading(true);
      const next = await postEval({ sessionId, emocionId, value: selectedValue });
      console.log('[THERAPY] post-eval response', next);
      setNextResponse(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    } finally {
      setLoading(false);
    }
  };

  const onContinue = () => {
    if (!nextResponse) return;
    if (nextResponse?.route === 'BEHAVIOR_RECO_SELECT') {
      navigation.replace('TherapyFlowRouter', { initialNext: nextResponse, entrypoint: 'behavior' });
    } else {
      navigation.replace('TherapyBehaviorRecoSelect', { entrypoint: 'behavior', next: nextResponse });
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]} keyboardShouldPersistTaps={'handled'}>
        <CText type={'B20'}>{title}</CText>
        <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
          {message}
        </CText>
        {!postEvalMessage && (
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
        {postEvalMessage ? (
          <CButton title={'Continuar'} onPress={onContinue} />
        ) : (
          <CButton title={'Enviar'} disabled={loading || selectedValue == null} onPress={onSubmitEval} />
        )}
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}



motivo Adicciones en general

Ansiedad (emocion)