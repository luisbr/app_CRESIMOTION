import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { completeTherapyStep } from '../../api/sesionTerapeutica';
import { getAudioUrl, getAudioTitle, normalizeTherapyNext } from './therapyUtils';
import { getDebugTailPosition } from '../../utils/audioDebug';

const DEFAULT_TEXT =
  'Antes de la Sesión de sanación emocional, recuerda tomar en cuenta las siguientes recomendaciones para aprovechar al máximo tu experiencia. Por favor, confirma que cumples con las siguientes condiciones para tomar la sanación emocional.';

export default function HealingIntroScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const title = data?.title || 'Sanación emocional';
  const required = Array.isArray(data?.checkboxes_required) ? data.checkboxes_required : [];
  const optional = data?.checkbox_optional || null;
  const introText = data?.text || data?.texto || DEFAULT_TEXT;
  const audioUrl = getAudioUrl(data?.audio || data);
  const audioTitle = getAudioTitle(data?.audio || data);

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [nextResponse, setNextResponse] = useState<any>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const allRequiredChecked = useMemo(() => {
    if (!required.length) return true;
    return required.every((r: any) => checks[r?.key]);
  }, [checks, required]);

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
          }
        });
        return;
      }
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      console.log('[THERAPY] healing intro audio error', e);
    }
  };

  const onLater = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.log('[THERAPY] stop intro audio error', e);
    } finally {
      setSound(null);
      setPlaying(false);
      navigation.navigate('HomeRoot');
    }
  };

  const onContinue = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      if (nextResponse) {
        navigation.replace('TherapyFlowRouter', { initialNext: nextResponse, entrypoint });
        return;
      }
      const actionKey = data?.actions?.primary?.key || 'START_HEALING';
      setLoadingNext(true);
      const next = await completeTherapyStep({ sessionId, action: actionKey });
      setNextResponse(next);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    } finally {
      setLoadingNext(false);
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 240 }]}>
        <CText type={'B18'}>{title}</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          {introText}
        </CText>
        {!!audioUrl && (
          <View style={styles.mt20}>
            {!!audioTitle && (
              <CText type={'B16'}>{audioTitle}</CText>
            )}
            <CButton
              title={playing ? 'Pausar xx' : 'Reproducir 22'}
              onPress={onPlayAudio}
              style={styles.mt10}
            />
          </View>
        )}
        <View style={styles.mt20}>
          {required.map((opt: any, idx: number) => {
            const key = opt?.key || String(idx);
            const isOn = !!checks[key];
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setChecks(s => ({ ...s, [key]: !s[key] }))}
                style={[styles.rowSpaceBetween, styles.pv15, idx > 0 ? { marginTop: 4 } : null]}
              >
                <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>
                  {opt?.label || ''}
                </CText>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: isOn ? colors.primary : colors.grayScale2,
                    backgroundColor: isOn ? colors.primary : 'transparent',
                  }}
                />
              </TouchableOpacity>
            );
          })}
          {!!optional?.label && (
            <TouchableOpacity
              onPress={() => setChecks(s => ({ ...s, [optional.key]: !s[optional.key] }))}
              style={[styles.rowSpaceBetween, styles.pv15, { marginTop: 4 }]}
            >
              <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>
                {optional.label}
              </CText>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: checks[optional.key] ? colors.primary : colors.grayScale2,
                  backgroundColor: checks[optional.key] ? colors.primary : 'transparent',
                }}
              />
            </TouchableOpacity>
          )}
        </View>
        {nextResponse && (
          <View style={{ marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.grayScale2, padding: 12 }}>
            <CText type={'B16'}>Payload de completeTherapyStep</CText>
            <ScrollView style={{ maxHeight: 200, marginTop: 8 }}>
              <CText type={'R12'} style={{ fontFamily: 'monospace' }}>
                {JSON.stringify(nextResponse, null, 2)}
              </CText>
            </ScrollView>
          </View>
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
        <View style={styles.mb10}>
          <CButton title={data?.actions?.secondary?.label || 'Más tarde'} bgColor={colors.inputBg} color={colors.primary} onPress={onLater} />
        </View>
        <CButton title={data?.actions?.primary?.label || 'Comenzarss'} disabled={!allRequiredChecked} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
