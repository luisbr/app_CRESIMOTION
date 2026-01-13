import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { Audio } from 'expo-av';
import { getDebugTailPosition } from '../../utils/audioDebug';

export default function HealingSanacionScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const motivo = route?.params?.motivo || null;
  const sanacion = route?.params?.sanacion || null;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const alertTimeoutRef = useRef<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [audioList, setAudioList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextEvalText, setNextEvalText] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync?.();
      }
    };
  }, [sound]);

  const ensureAbsoluteUrl = (u?: string | null) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    // fallback a localhost si viene ruta relativa
    return `http://localhost${u.startsWith('/') ? '' : '/'}${u}`;
  };

  useEffect(() => {
    const list = Array.isArray(sanacion?.audios) && sanacion.audios.length
      ? [...sanacion.audios]
          .sort((a: any, b: any) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0))
          .map((a: any) => ensureAbsoluteUrl(a?.url))
      : (sanacion?.audio_url ? [ensureAbsoluteUrl(sanacion.audio_url)] : []);
    setAudioList(list);
    setCurrentIndex(0);
  }, [sanacion]);

  const fmt = (ms: number) => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const onBlockTap = () => {
    if (!playing) return;
    setShowBanner(true);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setShowBanner(false), 5000);
  };

  return (
    <CSafeAreaView>
      <CHeader title={motivo?.motivo ? String(motivo.motivo) : 'Sanación'} />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20]}
                  scrollEnabled={!playing}
      >
        {showBanner && (
          <View style={{ position: 'absolute', top: 8, left: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 }}>
            <CText type={'S14'} color={'#fff'}>
              Mientras el audio está activo no se puede usar otra función.
            </CText>
          </View>
        )}
        <TouchableWithoutFeedback onPress={onBlockTap}>
        <View>
        {sanacion?.tipo === 'texto' ? (
          <View>
            <CText type={'B18'}>{sanacion?.titulo || 'Texto'}</CText>
            <CText type={'R16'} color={colors.textColor} style={styles.mt10}>
              {sanacion?.contenido_texto || ''}
            </CText>
          </View>
        ) : sanacion?.tipo === 'audio' ? (
          <View>
            <CText type={'B18'}>{sanacion?.titulo || 'Audio'}</CText>
            <View style={styles.mt20}>
              <CButton title={playing ? 'Pausar' : 'Escuchar'} onPress={async () => {
                try {
                  if (playing && sound) {
                    await sound.pauseAsync();
                    setPlaying(false);
                    return;
                  }
                  if (!sound) {
                    const s = new Audio.Sound();
                    const uri = audioList[currentIndex];
                    await s.loadAsync({ uri });
                    setSound(s);
                    const st = await s.getStatusAsync();
                    setDurationMillis((st as any)?.durationMillis ?? 0);
                    const tailPosition = getDebugTailPosition((st as any)?.durationMillis ?? 0);
                    if (tailPosition > 0) {
                      await s.setPositionAsync(tailPosition);
                    }
                    await s.playAsync();
                    setPlaying(true);
                    s.setOnPlaybackStatusUpdate((st: any) => {
                      if (st?.durationMillis) setDurationMillis(st.durationMillis);
                      if (st?.positionMillis != null) setPositionMillis(st.positionMillis);
                      if (st?.didJustFinish) {
                        setPositionMillis(0);
                        setDurationMillis(0);
                        setCurrentIndex(prev => {
                          const next = prev + 1;
                          if (next < audioList.length) {
                            (async () => {
                              try {
                                await s.unloadAsync();
                                await s.loadAsync({ uri: audioList[next] });
                                const st2 = await s.getStatusAsync();
                                setDurationMillis((st2 as any)?.durationMillis ?? 0);
                                const tailPosition = getDebugTailPosition((st2 as any)?.durationMillis ?? 0);
                                if (tailPosition > 0) {
                                  await s.setPositionAsync(tailPosition);
                                }
                                await s.playAsync();
                              } catch (e) {
                                console.log('[HEALING] auto-next audio error', e);
                                setPlaying(false);
                              }
                            })();
                            return next;
                          } else {
                            // set next evaluation time (now + 2 days)
                            try {
                              const now = new Date();
                              const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
                              const pad = (n: number) => n.toString().padStart(2, '0');
                              const text = `Evaluación programada para ${pad(future.getDate())}-${pad(future.getMonth()+1)}-${future.getFullYear()} ${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}`;
                              setNextEvalText(text);
                            } catch {}
                            // reached end; wait 2s then restart from beginning automatically
                            (async () => {
                              try {
                                await s.unloadAsync();
                                await new Promise(res => setTimeout(res, 2000));
                                await s.loadAsync({ uri: audioList[0] });
                                const st0 = await s.getStatusAsync();
                                setDurationMillis((st0 as any)?.durationMillis ?? 0);
                                const tailPosition = getDebugTailPosition((st0 as any)?.durationMillis ?? 0);
                                if (tailPosition > 0) {
                                  await s.setPositionAsync(tailPosition);
                                }
                                await s.playAsync();
                              } catch (e) {
                                console.log('[HEALING] auto-restart audio error', e);
                                setPlaying(false);
                              }
                            })();
                            return 0;
                          }
                        });
                      }
                    });
                  } else {
                    const st = await sound.getStatusAsync();
                    setDurationMillis((st as any)?.durationMillis ?? durationMillis);
                    await sound.playAsync();
                    setPlaying(true);
                  }
                } catch (e) {
                  console.log('[HEALING] audio play error', e);
                }
              }} />
              <View style={[styles.rowSpaceBetween, { marginTop: 12, alignItems: 'center' }]}>
                <CText type={'S14'}>{fmt(positionMillis)}</CText>
                {audioList.length > 1 && (
                  <CText type={'S14'} color={colors.labelColor}>{`${Math.min(currentIndex + 1, audioList.length)}/${audioList.length}`}</CText>
                )}
                <CText type={'S14'}>{fmt(durationMillis)}</CText>
              </View>
            </View>
          </View>
        ) : (
          <CText type={'R16'}>No hay contenido de sanación disponible.</CText>
        )}
        {!!nextEvalText && (
          <View style={{ marginTop: 20 }}>
            <CText type={'S14'} color={colors.labelColor}>
              ({nextEvalText})
            </CText>
          </View>
        )}
        </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </CSafeAreaView>
  );
}
