import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import { getSession } from '../../api/auth';
import { getTherapyNext } from '../../api/sesionTerapeutica';
import { isTherapyRoute, normalizeTherapyNext } from './therapyUtils';

export default function TherapyFlowRouter({ navigation, route }: any) {
  const initialNext = route?.params?.initialNext || null;
  const entrypoint = route?.params?.entrypoint || null;
  const [error, setError] = useState<string | null>(null);

  const goTo = async (payload: any) => {
    const next = normalizeTherapyNext(payload);
    if (!isTherapyRoute(next.route)) {
      navigation.replace('HomeRoot');
      return;
    }
    const common = { next: payload, entrypoint };
    if (next.route === 'SESSION_INTRO') {
      navigation.replace('TherapySessionIntro', common);
      return;
    }
    if (next.route === 'FOCUS_SELECT') {
      navigation.replace('TherapyFocusSelect', common);
      return;
    }
    if (next.route === 'FOCUS_CONTENT') {
      navigation.replace('TherapyFocusContent', common);
      return;
    }
    if (next.route === 'HEALING_SELECT_EMOTION') {
      navigation.replace('TherapyHealingSelectEmotion', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'HEALING_INTRO') {
      navigation.replace('TherapyHealingIntro', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'HEALING_PLAYBACK') {
      navigation.replace('TherapyHealingPlayback', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'HEALING_DONE') {
      navigation.replace('TherapyHealingDone', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'BEHAVIOR_RECO_SELECT') {
      navigation.replace('TherapyBehaviorRecoSelect', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'BEHAVIOR_EXERCISE_SELECT') {
      navigation.replace('TherapyBehaviorExerciseSelect', { entrypoint, next: payload });
      return;
    }
    if (next.route === 'AGENDA_SETUP') {
      navigation.replace('TherapyAgendaSetup', { entrypoint, next: payload });
      return;
    }
    navigation.replace('HomeRoot');
  };

  useEffect(() => {
    (async () => {
      try {
        if (initialNext) {
          await goTo(initialNext);
          return;
        }
        const s = await getSession();
        const userId = s?.id ? String(s.id) : null;
        if (!userId) throw new Error('No se encontró una sesión activa.');
        const next = await getTherapyNext(userId);
        await goTo(next);
      } catch (e: any) {
        setError(e?.message || 'No se pudo continuar la sesión.');
      }
    })();
  }, [initialNext]);

  return (
    <CSafeAreaView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {error ? (
          <CText>{error}</CText>
        ) : (
          <CText>Cargando sesión...</CText>
        )}
      </View>
    </CSafeAreaView>
  );
}
