import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import { styles } from '../../theme';
import { normalizeTherapyNext } from './therapyUtils';
import ScreenTooltip from '../../components/common/ScreenTooltip';

export default function HealingDoneScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const emotionLabel = data?.emotion?.label || data?.emocion?.label || '';
  const emocionId =
    data?.emotion?.id ||
    data?.emocion?.id ||
    nextPayload?.session_state?.emocion_id ||
    null;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('TherapyBehaviorIntro', {
        sessionId,
        emotionLabel,
        emocionId,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, sessionId, emotionLabel, emocionId]);

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
