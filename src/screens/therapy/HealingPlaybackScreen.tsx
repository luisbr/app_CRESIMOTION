import React, { useEffect, useMemo, useState } from 'react';
import { View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { completeTherapyStep, sendPlaybackEvent } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';
import { getDebugTailPosition } from '../../utils/audioDebug';

export default function HealingPlaybackScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const title = data?.title || 'Sanación emocional';
  const audioUrl1 = data?.audio?.url || data?.audio_url || null;
  const audioUrl2 = data?.audio_url2 || data?.audio2?.url || null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tailSeconds, setTailSeconds] = useState<number | null>(null);

  const sequence = useMemo(() => {
    const list: Array<{ type: 'local' | 'remote'; source: any }> = [];
    list.push({ type: 'local', source: require('../../assets/audios/01SE_induccion.mp3') });
    if (audioUrl1) list.push({ type: 'remote', source: audioUrl1 });
    list.push({ type: 'local', source: require('../../assets/audios/03SE_induccion.mp3') });
    if (audioUrl2) list.push({ type: 'remote', source: audioUrl2 });
    return list;
  }, [audioUrl1, audioUrl2]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync?.();
      }
    };
  }, [sound]);

  const ensureAbsoluteUrl = (u?: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `http://localhost${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const loadAndPlay = async (idx: number) => {
    if (!sequence[idx]) return;
    const item = sequence[idx];
    const s = sound || new Audio.Sound();
    if (!sound) setSound(s);
    if (sound) {
      await s.unloadAsync();
    }
    if (item.type === 'local') {
      await s.loadAsync(item.source);
    } else {
      await s.loadAsync({ uri: ensureAbsoluteUrl(item.source) });
    }
    const st = await s.getStatusAsync();
    const duration = (st as any)?.durationMillis ?? 0;
    const tailPosition = tailSeconds != null
      ? Math.max(0, duration - tailSeconds * 1000)
      : getDebugTailPosition(duration);
    if (tailPosition > 0) {
      await s.setPositionAsync(tailPosition);
    }
    await s.playAsync();
    setPlaying(true);
    s.setOnPlaybackStatusUpdate((status: any) => {
      if (status?.didJustFinish) {
        setPlaying(false);
        const nextIdx = idx + 1;
        if (nextIdx < sequence.length) {
          setCurrentIndex(nextIdx);
          loadAndPlay(nextIdx).catch(e => console.log('[THERAPY] healing playback next error', e));
        } else {
          setFinished(true);
          if (sessionId) {
            sendPlaybackEvent({ sessionId, event: 'FINISH' })
              .then(() => navigation.replace('TherapyHealingDone', { entrypoint, next: nextPayload }))
              .catch(e => {
                console.log('[THERAPY] playback finish error', e);
                navigation.replace('TherapyHealingDone', { entrypoint, next: nextPayload });
              });
          } else {
            navigation.replace('TherapyHealingDone', { entrypoint, next: nextPayload });
          }
        }
      }
    });
  };

  const onPlay = async () => {
    try {
      if (playing && sound) {
        await sound.pauseAsync();
        setPlaying(false);
        return;
      }
      if (!sound) {
        await loadAndPlay(currentIndex);
        return;
      }
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] healing playback error', e);
    }
  };

  const onRestart = async () => {
    try {
      setCurrentIndex(0);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      await loadAndPlay(0);
    } catch (e) {
      console.log('[THERAPY] healing restart error', e);
    }
  };

  const onPlayLastSeconds = async () => {
    try {
      setTailSeconds(3);
      setCurrentIndex(0);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      await loadAndPlay(0);
    } catch (e) {
      console.log('[THERAPY] healing tail play error', e);
    }
  };

  const onContinue = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const actionKey = data?.actions?.primary?.key || 'CONTINUE';
      const next = await completeTherapyStep({ sessionId, action: actionKey });
      //navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }]}>
        <CText type={'B18'}>{title}</CText>
        <View style={[styles.mt20]}>
          <CButton title={playing ? 'Pausar' : 'Continuar DEBUG 33'} onPress={onPlay} />
          <View style={styles.mt10}>
            <CButton
              title={'Reproducir ultimos 3s'}
              bgColor={colors.inputBg}
              color={colors.primary}
              onPress={onPlayLastSeconds}
            />
          </View>
          <View style={styles.mt10}>
            <CButton title={'Reiniciar'} bgColor={colors.inputBg} color={colors.primary} onPress={onRestart} />
          </View>
        </View>
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
        <CButton title={data?.actions?.primary?.label || 'Continuar'} disabled={!finished} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
