import React, { useEffect, useMemo, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { completeTherapyStep, sendPlaybackEvent } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';
import { API_BASE_URL } from '../../api/config';

type PlaybackItem =
  | { type: 'local'; source: number; label: string }
  | { type: 'remote'; source: string; label: string };

const formatTime = (ms: number) => {
  const value = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForDuration = async (sound: Audio.Sound) => {
  const MAX_ATTEMPTS = 5;
  const INTERVAL = 200;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const status = await sound.getStatusAsync();
    if ((status as any)?.durationMillis) {
      return (status as any).durationMillis;
    }
    await delay(INTERVAL);
  }
  const fallbackStatus = await sound.getStatusAsync();
  return (fallbackStatus as any)?.durationMillis ?? 0;
};

export default function HealingPlaybackScreen({ navigation, route }: any) {
  console.log('[THERAPY] playback route params', route?.params || {});
  const colors = useSelector((s: any) => s.theme.theme);
  const dispatch = useDispatch();
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const postWork = route?.params?.postWork || false;
  const postWorkGroupId = route?.params?.groupId || null;
  const postWorkEmotionId = route?.params?.emocionId || null;
  const postWorkEmotionLabel = route?.params?.emotionLabel || '';
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const inferredPostWork = postWork || Boolean(nextPayload?.group_id);
  const resolvedGroupId = postWorkGroupId ?? nextPayload?.group_id ?? null;
  const resolvedEmotionId = postWorkEmotionId ?? data?.emotion?.id ?? data?.emotion_id ?? null;
  const resolvedEmotionLabel = postWorkEmotionLabel || data?.emotion?.label || '';
  const title = data?.title || 'Sanación emocional';
  const audioUrl1 = data?.audio?.url || data?.audio_url || null;
  const audioUrl2 = data?.audio_url2 || data?.audio2?.url || null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    positionMillis: 0,
    durationMillis: 0,
    isLoaded: false,
  });
  const [preloading, setPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [totalDurationMillis, setTotalDurationMillis] = useState(0);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [trackDurations, setTrackDurations] = useState<number[]>([]);

  const ensureAudioMode = async () => {
    try {
      await Audio.setIsEnabledAsync(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.log('[THERAPY] playback audio mode error', e);
    }
  };

  const ensureAbsoluteUrl = (u?: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const base = API_BASE_URL || '';
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };
  const sequence = useMemo(() => {
    const list: PlaybackItem[] = [];
    const chainItems = Array.isArray(data?.audio_chain?.items)
      ? data.audio_chain.items
      : Array.isArray(data?.audio_chain)
        ? data.audio_chain
        : [];
    if (chainItems.length) {
      chainItems.forEach((item: any, idx: number) => {
        const url = ensureAbsoluteUrl(item?.url || item?.uri || '');
        if (!url) return;
        list.push({
          type: 'remote',
          source: url,
          label: `${idx + 1}. ${item?.type || 'track'}`,
        });
      });
      return list;
    }
    list.push({
      type: 'local',
      source: require('../../assets/audios/01SE_induccion.mp3'),
      label: '01SE_induccion.mp3',
    });
    if (audioUrl1) {
      console.log('[THERAPY] playback audio_url resolved', ensureAbsoluteUrl(audioUrl1));
      list.push({
        type: 'remote',
        source: ensureAbsoluteUrl(audioUrl1),
        label: 'audio_url',
      });
    }
    list.push({
      type: 'local',
      source: require('../../assets/audios/03SE_induccion.mp3'),
      label: '03SE_induccion.mp3',
    });
    if (audioUrl2) {
      console.log('[THERAPY] playback audio_url2 resolved', ensureAbsoluteUrl(audioUrl2));
      list.push({
        type: 'remote',
        source: ensureAbsoluteUrl(audioUrl2),
        label: 'audio_url2',
      });
    }
    return list;
  }, [audioUrl1, audioUrl2, data]);

  const totalElapsedBeforeCurrent = trackDurations.slice(0, currentIndex).reduce((acc, dur) => acc + dur, 0);
  const totalElapsed = totalElapsedBeforeCurrent + playbackStatus.positionMillis;
  const chainDurationMillis = useMemo(() => {
    const items = Array.isArray(data?.audio_chain?.items)
      ? data.audio_chain.items
      : Array.isArray(data?.audio_chain)
        ? data.audio_chain
        : [];
    return items.reduce((acc: number, item: any) => {
      const seconds = Number(item?.duration_seconds) || 0;
      return acc + seconds * 1000;
    }, 0);
  }, [data]);
  const computedTotalDuration =
    totalDurationMillis || trackDurations.reduce((acc, dur) => acc + dur, 0) || chainDurationMillis || playbackStatus.durationMillis;
  const progressPercent = computedTotalDuration ? Math.min(1, totalElapsed / computedTotalDuration) : 0;

  useEffect(() => {
    let mounted = true;
    const preload = async () => {
      if (!sequence.length) {
        if (mounted) {
          setPreloading(false);
          setTotalDurationMillis(0);
          setPreloadProgress(0);
        }
        return;
      }
      if (mounted) {
        setPreloading(true);
        setPreloadProgress(0);
        setTotalDurationMillis(0);
        setPreloadError(null);
      }
      let total = 0;
      const durations: number[] = [];
      const len = sequence.length;
      for (let i = 0; i < len; i += 1) {
        const item = sequence[i];
        const tmpSound = new Audio.Sound();
        try {
          if (item.type === 'local') {
            await tmpSound.loadAsync(item.source);
          } else {
            await tmpSound.loadAsync({ uri: item.source });
          }
          const durationMillis = await waitForDuration(tmpSound);
          durations.push(durationMillis);
          total += durationMillis;
        } catch (error) {
          console.log('[THERAPY] preload error', item.label, error);
          if (mounted) {
            setPreloadError('No se pudieron descargar todos los audios. Revisa tu conexión.');
          }
        } finally {
          await tmpSound.unloadAsync().catch(() => {});
        }
        if (mounted) {
          setPreloadProgress((i + 1) / len);
        }
      }
      if (mounted) {
        setTrackDurations(durations);
        const resolvedTotal = total || chainDurationMillis;
        setTotalDurationMillis(resolvedTotal);
        setPreloading(false);
      }
    };
    preload();
    return () => {
      mounted = false;
    };
  }, [sequence]);

  useEffect(() => {
    console.log(
      '[THERAPY] playback plan on mount',
      sequence.map((item, idx) => ({
        index: idx,
        type: item.type,
        source: item.label,
      }))
    );
  }, [sequence]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync?.();
      }
    };
  }, [sound]);

  useEffect(() => {
    dispatch({ type: 'SET_AUDIO_LOCKED', payload: playing });
    return () => {
      dispatch({ type: 'SET_AUDIO_LOCKED', payload: false });
    };
  }, [dispatch, playing]);

  const queuePlayback = async (
    idx: number,
    options: { tailSeconds?: number; allowContinue: boolean; tailForAll?: boolean }
  ): Promise<boolean> => {
    if (!sequence[idx]) return false;
    const item = sequence[idx];
    const s = sound || new Audio.Sound();
    if (!sound) {
      setSound(s);
    } else {
      await s.unloadAsync();
    }
    setCurrentIndex(idx);
    setFinished(false);
    setPlaybackStatus({ positionMillis: 0, durationMillis: 0, isLoaded: false });
    try {
      await ensureAudioMode();
      if (item.type === 'local') {
        await s.loadAsync(item.source);
      } else {
        await s.loadAsync({ uri: item.source });
      }
      const st = await s.getStatusAsync();
      const duration = (st as any)?.durationMillis ?? 0;
      const tailPosition =
        options.tailSeconds != null ? Math.max(0, duration - options.tailSeconds * 1000) : null;
      if (tailPosition !== null && tailPosition > 0) {
        console.log(`[THERAPY] setting start position to ${tailPosition}ms (tailSeconds: ${options.tailSeconds})`);
        await s.setPositionAsync(tailPosition);
      }
      await s.setIsMutedAsync(false);
      await s.setVolumeAsync(1.0);
      await s.playAsync();
      setPlaying(true);
      s.setOnPlaybackStatusUpdate((status: any) => {
        if (!status) return;
        setPlaybackStatus({
          positionMillis: status.positionMillis ?? 0,
          durationMillis: status.durationMillis ?? 0,
          isLoaded: status.isLoaded ?? false,
        });
        if (status?.didJustFinish) {
          setPlaying(false);
          const nextIdx = idx + 1;
          if (options.allowContinue && nextIdx < sequence.length) {
            queuePlayback(nextIdx, {
              allowContinue: true,
              tailSeconds: options.tailForAll ? options.tailSeconds : undefined,
              tailForAll: options.tailForAll,
            })
              .then(success => {
                if (!success) {
                  // Do nothing, error already logged
                }
              })
              .catch(e => console.log('[THERAPY] healing playback next error', e));
          } else if (nextIdx >= sequence.length) {
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
      return true;
    } catch (error) {
      console.log('[THERAPY] healing playback load error', { index: idx, label: item.label, error });
      setPlaying(false);
      return false;
    }
  };

  const loadAndPlay = (idx: number) => queuePlayback(idx, { allowContinue: true });
  const loadAndPlayPast = () =>
    queuePlayback(0, { tailSeconds: 10, allowContinue: true, tailForAll: true });

  const onPlay = async () => {
    if (preloading) return;
    console.log(
      '[THERAPY] playback plan',
      sequence.map((item, idx) => ({
        index: idx,
        type: item.type,
        source: item.label,
      }))
    );
    try {
      if (playing && sound) {
        await sound.pauseAsync();
        setPlaying(false);
        return;
      }
      if (!sound) {
        const success = await loadAndPlay(currentIndex);
        if (!success) {
          return;
        }
        return;
      }
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] healing playback error', e);
    }
  };

  const onRestart = async () => {
    if (preloading) return;
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
    if (preloading) return;
    try {
      setCurrentIndex(0);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      await loadAndPlayPast();
    } catch (e) {
      console.log('[THERAPY] healing tail play error', e);
    }
  };

  const onContinue = async () => {
    try {
      if (inferredPostWork) {
        if (!resolvedGroupId || !resolvedEmotionId) {
          throw new Error('Falta información para continuar.');
        }
        console.log('[POST_WORK] playback -> behavior intro', {
          groupId: resolvedGroupId,
          emocionId: resolvedEmotionId,
          emotionLabel: resolvedEmotionLabel,
        });
        navigation.replace('TherapyBehaviorIntro', {
          postWork: true,
          groupId: resolvedGroupId,
          emocionId: resolvedEmotionId,
          emotionLabel: resolvedEmotionLabel,
          next: nextPayload,
          group_id: resolvedGroupId,
          entrypoint: 'post_work',
        });
        return;
      }
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const actionKey = data?.actions?.primary?.key || 'CONTINUE';
      const next = await completeTherapyStep({ sessionId, action: actionKey });
      //navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  const onForward = async () => {
    if (!sound) return;
    try {
      const st = await sound.getStatusAsync();
      if (!(st as any)?.isLoaded) return;
      const duration = (st as any)?.durationMillis ?? 0;
      const position = (st as any)?.positionMillis ?? 0;
      const nextPos = Math.min(duration, position + 10000);
      await sound.setPositionAsync(nextPos);
      setPlaybackStatus(prev => ({ ...prev, positionMillis: nextPos }));
    } catch (e) {
      console.log('[THERAPY] forward error', e);
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader disabled={playing} />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }]}>
        <CText type={'B18'}>{title}</CText>
        <View style={[styles.mt20]}>
          <View style={[styles.rowSpaceBetween, styles.g10]}>
            <View style={{ flex: 1 }}>
              <CButton
                title={playing ? 'Pausar' : playbackStatus.positionMillis === 0 ? 'Iniciar' : 'Continuar'}
                onPress={onPlay}
              />
            </View>
            <CButton title={'>> 10s'} onPress={onForward} disabled={!sound} />
          </View>
          <View style={styles.mt10}>
            {/* 
            <CButton
              title={'Reproducir ultimos 3s'}
              bgColor={colors.inputBg}
              color={colors.primary}
              onPress={onPlayLastSeconds}
            />*/}
          </View>
          <View style={styles.mt10}>
            {/* <CButton title={'Reiniciar'} bgColor={colors.inputBg} color={colors.primary} onPress={onRestart} />
            */}
          </View>
          {sequence.length > 0 && (
            <View style={[styles.mt10]}>
              <CText type={'S14'} color={colors.labelColor}>
                {formatTime(totalElapsed)} / {formatTime(computedTotalDuration)}
              </CText>
              <View style={localStyles.inlineProgressTrack}>
                <View
                  style={[
                    localStyles.inlineProgressFill,
                    { width: `${progressPercent * 100}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
            </View>
          )}
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
        <CButton
          title={data?.actions?.primary?.label || 'Continuar'}
          disabled={!finished || playing}
          onPress={onContinue}
        />
        <CText type={'S12'} color={colors.labelColor} style={styles.mt8}>
          {Math.round(progressPercent * 100)}% completado
        </CText>
      </View>
      {preloading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.backgroundColor + 'ee',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <CText type={'B16'} style={styles.mt10}>
            Preparando la sesión...
          </CText>
          <CText type={'S14'} style={styles.mt5}>
            {Math.round(preloadProgress * 100)}% descargado
          </CText>
          {preloadError && (
            <CText type={'S12'} color={colors.error} style={styles.mt5}>
              {preloadError}
            </CText>
          )}
        </View>
      )}
      <ScreenTooltip />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  inlineProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E6E6E6',
    overflow: 'hidden',
    marginTop: 8,
  },
  inlineProgressFill: {
    height: '100%',
  },
});
