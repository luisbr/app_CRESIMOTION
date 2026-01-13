import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { postEval } from '../../api/sesionTerapeutica';

export default function BehaviorIntroScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const sessionId = route?.params?.sessionId || null;
  const emocionId = route?.params?.emocionId || null;
  const emotionLabel = route?.params?.emotionLabel || '';

  const title = 'Creación de hábitos saludables';
  const message =
    `Ahora que has adoptado un enfoque positivo de tu situación y que has trabajado el ${emotionLabel || 'tema'}, es importante que sigas algunas recomendaciones para crear hábitos saludables. Selecciona aquellas recomendaciones en las que te gustaría recibir acompañamiento a través de mensajes o notificaciones.\n\nRecuerda que siempre puedes ajustar estas opciones desde tu perfil.`;

  const onContinue = async () => {
    console.log('[THERAPY] post-eval payload', {
      sessionId,
      emocionId,
      value: 2,
    });
    try {
      if (!sessionId || !emocionId) {
        throw new Error('Falta información para continuar.');
      }
      const next = await postEval({ sessionId, emocionId, value: 2 });
      console.log('[THERAPY] post-eval response', next);
      if (next?.route === 'BEHAVIOR_RECO_SELECT') {
        navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint: 'behavior' });
      } else {
        navigation.replace('TherapyBehaviorRecoSelect', { entrypoint: 'behavior', next });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}
                  keyboardShouldPersistTaps={'handled'}>
        <CText type={'B20'}>{title}</CText>
        <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
          {message}
        </CText>
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
        <CButton title={'Siguiente'} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
