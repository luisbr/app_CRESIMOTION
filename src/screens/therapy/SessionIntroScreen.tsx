import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { completeTherapyStep } from '../../api/sesionTerapeutica';
import { getAudioTitle, getAudioUrl, normalizeTherapyNext } from './therapyUtils';
import { getDebugTailPosition } from '../../utils/audioDebug';

export default function SessionIntroScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const entrypoint = route?.params?.entrypoint || null;
  const nextPayload = route?.params?.next || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const [checked, setChecked] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  console.log('[THERAPY] next payload', nextPayload)

  const instructions = useMemo(() => [
    'Dispongo de al menos media hora para estar a solas, en un lugar tranquilo, libre de ruidos excesivos, distracciones o interrupciones externas, dedicando toda la atención a mi salud emocional.',
    'Cuento con una óptima conexión a internet para evitar interrupciones.',
    'Me encuentro en un espacio cómodo donde puedo recostarme o relajarme completamente.',
  ], []);

  const audioUrl = getAudioUrl(data);
  const audioTitle = getAudioTitle(data) || 'Aquí da inicio tu sesión terapéutica';

  const ensureAbsoluteUrl = (u?: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `http://localhost${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const onPlayAudio = async () => {
    if (!audioUrl) return;
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
            setPlaying(false);
            s.unloadAsync?.();
            setSound(null);
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

  const onBack = () => {
    if (entrypoint === 'home') {
      navigation.navigate('HomeRoot');
      return;
    }
    navigation.goBack();
  };

  const onNext = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const next = await completeTherapyStep({ sessionId, action: 'START' });
      navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 120 }]} keyboardShouldPersistTaps={'handled'}>
        <CText type={'B18'}>Antes de comenzar</CText>
        <View style={[styles.mt20]}>
          {instructions.map((txt, idx) => (
            <View key={String(idx)} style={{ marginBottom: 12 }}>
              <CText type={'R16'} color={colors.textColor}>{txt}</CText>
            </View>
          ))}
        </View>
        {!!audioUrl && (
          <View style={[styles.mt10]}>
            <CText type={'B16'}>{audioTitle}</CText>
            <CButton title={playing ? 'Pausar audio' : 'Reproducir audio'} onPress={onPlayAudio} style={styles.mt10} />
          </View>
        )}
        <TouchableOpacity
          onPress={() => setChecked(v => !v)}
          style={[styles.rowSpaceBetween, styles.pv15, styles.mt20]}
        >
          <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>
            Confirmo que reúno las condiciones
          </CText>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: checked ? colors.primary : colors.grayScale2,
              backgroundColor: checked ? colors.primary : 'transparent',
            }}
          />
        </TouchableOpacity>
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
        <View style={[styles.rowSpaceBetween]}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CButton title={'Atrás'} bgColor={colors.inputBg} color={colors.primary} onPress={onBack} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CButton title={'Siguiente'} disabled={!checked} onPress={onNext} />
          </View>
        </View>
      </View>
    </CSafeAreaView>
  );
}
