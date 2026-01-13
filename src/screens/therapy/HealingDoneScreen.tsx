import React from 'react';
import { Image, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { normalizeTherapyNext } from './therapyUtils';

const DONE_TEXT =
  'Ya avanzaste en el proceso de Sanación emocional para reducir una emoción dolorosa. Te recomendamos que dejes pasar de 48 a 72 horas, antes de volver a tomar otra sesión terapéutica para la sanación de la misma emoción u otra emoción dolorosa que identificaste en nivel Muy alto, Alto y Medio de acuerdo con tu nivel de membresía comenzando desde la fase del Enfoque positivo.';

export default function HealingDoneScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const { width } = useWindowDimensions();
  const imageWidth = Math.max(0, width - 40);
  const nextPayload = route?.params?.next || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const emotionLabel = data?.emotion?.label || data?.emocion?.label || '';
  const emocionId =
    data?.emotion?.id ||
    data?.emocion?.id ||
    nextPayload?.session_state?.emocion_id ||
    null;
  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}>
        <Image
          source={require('../../assets/images/felicidades.png')}
          style={{ width: imageWidth, height: 220, marginBottom: 16 }}
          resizeMode="contain"
        />
        <CText type={'B20'}>¡Muchas felicidades!</CText>
        <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
          {DONE_TEXT}
        </CText>
        {!!emotionLabel && (
          <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>
            Emoción trabajada: {emotionLabel}
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
        <CButton
          title={'Continuar'}
          onPress={() =>
            navigation.navigate('TherapyBehaviorIntro', {
              sessionId,
              emotionLabel,
              emocionId,
            })
          }
        />
      </View>
    </CSafeAreaView>
  );
}
