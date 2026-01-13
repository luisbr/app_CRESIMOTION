import React, { useEffect, useMemo, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { completeTherapyStep } from '../../api/sesionTerapeutica';
import { canSkipAudio, getAudioTitle, getAudioUrl, getSkipLabel, normalizeTherapyNext } from './therapyUtils';
import { getDebugTailPosition } from '../../utils/audioDebug';

export default function FocusContentScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const audioUrl = getAudioUrl(data);
  const title = getAudioTitle(data) || 'Enfoque positivo';
  const contentText = data?.text || data?.texto || data?.contenido_texto || '';
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  const allowSkip = useMemo(() => canSkipAudio(data), [data]);
  const skipLabel = useMemo(() => getSkipLabel(data), [data]);

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

  const onPlay = async () => {
    if (!audioUrl) return;
    console.log('[THERAPY] focus audio url', ensureAbsoluteUrl(audioUrl));
    try {
      if (playing && sound) {
        await sound.pauseAsync();
        setPlaying(false);
        return;
      }
      if (!sound) {
        const s = new Audio.Sound();
        await s.loadAsync({ uri: ensureAbsoluteUrl(audioUrl) });
        setSound(s);
        const st = await s.getStatusAsync();
        const tailPosition = getDebugTailPosition((st as any)?.durationMillis ?? 0);
        if (tailPosition > 0) {
          await s.setPositionAsync(tailPosition);
        }
        await s.playAsync();
        setPlaying(true);
        s.setOnPlaybackStatusUpdate((st: any) => {
          if (st?.didJustFinish) {
            setEnded(true);
            setPlaying(false);
          }
        });
        return;
      }
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] audio play error', e);
    }
  };

  const onRestart = async () => {
    if (!sound) {
      setEnded(false);
      return;
    }
    try {
      const st = await sound.getStatusAsync();
      const tailPosition = getDebugTailPosition((st as any)?.durationMillis ?? 0);
      await sound.setPositionAsync(tailPosition);
      setEnded(false);
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] restart error', e);
    }
  };

  const onLater = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.log('[THERAPY] stop audio error', e);
    } finally {
      setSound(null);
      setPlaying(false);
      navigation.navigate('HomeRoot');
    }
  };

  const goNext = async (action: 'NEXT' | 'SKIP') => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const next = await completeTherapyStep({ sessionId, action });
      navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}>
        <View style={styles.mb20}>
          <CButton title={playing ? 'Pausar' : 'Reproducir'} onPress={onPlay} />
          <View style={styles.mt10}>
            <CButton title={'Más tarde'} bgColor={colors.inputBg} color={colors.primary} onPress={onLater} />
          </View>
        </View>
        <CText type={'B18'}>{title}</CText>
        {!!contentText && (
          <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
            {contentText}
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
        {allowSkip && (
          <View style={styles.mb10}>
            <CButton title={skipLabel} bgColor={colors.inputBg} color={colors.primary} onPress={() => goNext('SKIP')} />
          </View>
        )}
        <CButton title={'Siguiente'} disabled={!audioUrl} onPress={() => goNext('NEXT')} />
      </View>
    </CSafeAreaView>
  );
}
