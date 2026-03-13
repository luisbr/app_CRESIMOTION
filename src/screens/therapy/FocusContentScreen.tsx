import React, { useEffect, useMemo, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { canSkipAudio, getAudioTitle, getAudioUrl, getMotivoId, getMotivoLabel, getSkipLabel, normalizeTherapyNext } from './therapyUtils';
import { completeTherapyStep } from '../../api/sesionTerapeutica';
import { getDebugTailPosition } from '../../utils/audioDebug';
import { API_BASE_URL } from '../../api/config';

export default function FocusContentScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const dispatch = useDispatch();
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const postWork = route?.params?.postWork || false;
  const postWorkGroupId = route?.params?.groupId || null;
  const postWorkMotivoId = route?.params?.motivoId || null;
  const postWorkMotivoLabel = route?.params?.motivoLabel || '';
  const postWorkEmotions = Array.isArray(route?.params?.emotions) ? route.params.emotions : [];
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const audioUrl = getAudioUrl(data);
  const title = (postWork ? data?.motivo_title : getAudioTitle(data)) || 'Enfoque positivo';
  const motivoId = postWorkMotivoId || getMotivoId(data?.focus || data);
  const motivoLabel = postWorkMotivoLabel || getMotivoLabel(data?.focus || data);
  const contentText = data?.text || data?.texto || data?.contenido_texto || '';
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const withTimeout = <T,>(promise: Promise<T>, ms = 8000) =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);

  const getCachedAudioUri = async (remoteUrl: string) => {
    const safeName = encodeURIComponent(remoteUrl);
    const fileUri = `${FileSystem.cacheDirectory || ''}focus_${safeName}.mp3`;
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists && info.uri) return info.uri;
      const downloaded = await FileSystem.downloadAsync(remoteUrl, fileUri);
      return downloaded?.uri || remoteUrl;
    } catch (e) {
      console.log('[THERAPY] audio cache error', e);
      return remoteUrl;
    }
  };

  const allowSkip = useMemo(() => canSkipAudio(data), [data]);
  const skipLabel = useMemo(() => getSkipLabel(data), [data]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(e => console.log('[THERAPY] audio mode error', e));
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

  const ensureAbsoluteUrl = (u?: string) => {
    if (!u) return '';
    const normalized = u.normalize('NFC');
    if (/^https?:\/\//i.test(normalized)) return encodeURI(normalized);
    const base = API_BASE_URL || '';
    //const base = "http://192.168.1.105"
    return encodeURI(`${base}${normalized.startsWith('/') ? '' : '/'}${normalized}`);
  };

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
      console.log('[THERAPY] audio mode error', e);
    }
  };

  const onPlay = async () => {
    console.log('[THERAPY] focus audio url raw', audioUrl);
    console.log('[THERAPY] focus audio url abs', ensureAbsoluteUrl(audioUrl));
    if (!audioUrl) return;
    if (loadingAudio) return;


    


    
    try {
      await ensureAudioMode();
      setLoadingAudio(true);
      if (playing && sound) {
        await sound.pauseAsync();
        setPlaying(false);
        return;
      }
      if (!sound) {
        const s = new Audio.Sound();
        s.setOnPlaybackStatusUpdate((st: any) => {
          if (st?.durationMillis != null) setDurationMillis(st.durationMillis);
          if (st?.positionMillis != null) setPositionMillis(st.positionMillis);
          if (st?.didJustFinish) {
            setEnded(true);
            setPlaying(false);
          }
          if (st?.error) {
            console.log('[THERAPY] playback status error', st.error);
          }
        });
        const remoteUrl = ensureAbsoluteUrl(audioUrl);
        const localUri = await getCachedAudioUri(remoteUrl);
        await withTimeout(s.loadAsync({ uri: localUri }, { shouldPlay: true }));
        const st = await s.getStatusAsync();
        if (!(st as any)?.isLoaded) {
          console.log('[THERAPY] audio not loaded', (st as any)?.error || st);
          return;
        }

        console.log('[THERAPY] audio loaded, duration:', st?.durationMillis);
        await s.setIsMutedAsync(false);
        await s.setVolumeAsync(1.0);
        await s.setProgressUpdateIntervalAsync(250);
        const probe = await s.getStatusAsync();
        console.log('[THERAPY] after load status', {
          isLoaded: probe?.isLoaded,
          isPlaying: probe?.isPlaying,
          positionMillis: probe?.positionMillis,
        });
        setSound(s);
        //setDurationMillis((st as any)?.durationMillis ?? 0);
        //setPositionMillis((st as any)?.positionMillis ?? 0);
        const tailPosition = getDebugTailPosition((st as any)?.durationMillis ?? 0);
        if (tailPosition > 0) {
          //await s.setPositionAsync(tailPosition);
        }

        console.log('[THERAPY] status', {
          isPlaying: st.isPlaying,
          positionMillis: st.positionMillis,
          durationMillis: st.durationMillis,
          isLoaded: st.isLoaded,
        });


        console.log('[THERAPY] playing audio');
        setEnded(false);
        await withTimeout(s.playAsync());
        console.log('[THERAPY] audio play started');
        setPlaying(true);
        console.log('[THERAPY] audio play async completed');
        return;
      }
      const st = await sound.getStatusAsync();
      if (!(st as any)?.isLoaded) {
        console.log('[THERAPY] audio not loaded on resume, reloading', (st as any)?.error || st);
        try {
          await sound.unloadAsync();
        } catch (e) {
          // ignore
        }
        setSound(null);
        setPlaying(false);
        setLoadingAudio(false);
        return;
      }
      await sound.setIsMutedAsync(false);
      await sound.setVolumeAsync(1.0);
      setEnded(false);
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] audio play error', e);
      setPlaying(false);
    } finally {
      setLoadingAudio(false);
    }
  };


  const fmt = (ms: number) => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

  const onForward = async () => {
    if (!sound) return;
    try {
      const st = await sound.getStatusAsync();
      if (!(st as any)?.isLoaded) return;
      const duration = (st as any)?.durationMillis ?? 0;
      const position = (st as any)?.positionMillis ?? 0;
      const nextPos = Math.min(duration, position + 10000);
      await sound.setPositionAsync(nextPos);
      setPositionMillis(nextPos);
    } catch (e) {
      console.log('[THERAPY] forward error', e);
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

  const goNext = () => {
    if (postWork) {
      if (!postWorkGroupId || !motivoId) {
        Alert.alert('Error', 'Falta información para continuar.');
        return;
      }
      navigation.replace('TherapyFocusMotivoEval', {
        postWork: true,
        groupId: postWorkGroupId,
        motivoId,
        motivoLabel,
        emotions: postWorkEmotions,
        next: nextPayload,
        entrypoint: 'post_work',
      });
      return;
    }
    if (!sessionId) {
      Alert.alert('Error', 'No se encontró la sesión.');
      return;
    }
    completeTherapyStep({ sessionId, action: 'NEXT' })
      .then(next => {
        navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
      })
      .catch((e: any) => {
        Alert.alert('Error', e?.message || 'No se pudo continuar.');
      });
  };

  return (
    <CSafeAreaView>
      <TherapyHeader disabled={playing} />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}>
        <View style={styles.mb20}>
          <View style={[styles.rowSpaceBetween, styles.g10]}>
            <View style={{ flex: 1 }}>
              <CButton title={playing ? ' ll ' : 'Reproducir'} onPress={onPlay} />
            </View>
            <CButton title={'>> 10s'} onPress={onForward} disabled={!sound} />
          </View>
          <View style={[styles.rowSpaceBetween, { marginTop: 8 }]}>
            <CText type={'S14'}>{fmt(positionMillis)}</CText>
            <CText type={'S14'}>{fmt(durationMillis)}</CText>
          </View>
          <View style={styles.mt10}>
            <CButton
              title={'Más tarde'}
              bgColor={colors.inputBg}
              color={colors.primary}
              disabled={playing}
              onPress={onLater}
            />
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
            <CButton
              title={skipLabel}
              bgColor={colors.inputBg}
              color={colors.primary}
              disabled={playing}
              onPress={goNext}
            />
          </View>
        )}
        <CButton title={'Siguiente'} disabled={!audioUrl || !ended || playing} onPress={goNext} />
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
