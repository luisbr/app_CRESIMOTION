import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { completeTherapyStep, saveUserPreference } from '../../api/sesionTerapeutica';
import { getAudioUrl, getAudioTitle, normalizeTherapyNext } from './therapyUtils';
import { getDebugTailPosition } from '../../utils/audioDebug';
import { API_BASE_URL } from '../../api/config';
import { useSafeNavigation } from '../../navigation/safeNavigation';
import { getHideTherapyRecommendations } from '../../utils/AsyncStorage';

const DEFAULT_TEXT =
  'Recuerda tomar en cuenta las siguientes recomendaciones para aprovechar al máximo tu experiencia:';
const DEFAULT_TEXT_HIGHLIGHT = 'dos fases';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HealingIntroScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const postWork = route?.params?.postWork || false;
  const postWorkGroupId = route?.params?.groupId || null;
  const postWorkMotivoId = route?.params?.motivoId || null;
  const postWorkMotivoLabel = route?.params?.motivoLabel || '';
  const postWorkEmotions = Array.isArray(route?.params?.emotions) ? route.params.emotions : [];
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const title = postWork ? (data?.title || 'Recomendaciones para aprovechar el enfoque positivo') : (data?.title || 'Sanación emocional');
  const required = Array.isArray(data?.checkboxes_required) ? data.checkboxes_required : [];
  const optional = data?.checkbox_optional || null;
  const introText = postWork
    ? 'Recuerda tomar en cuenta las siguientes recomendaciones para aprovechar al máximo tu experiencia:'
    : (data?.text || data?.texto || DEFAULT_TEXT);
  const isDefaultIntro = introText === DEFAULT_TEXT;
  const audioUrl = getAudioUrl(data?.audio || data);
  const audioTitle = getAudioTitle(data?.audio || data);

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [nextResponse, setNextResponse] = useState<any>(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);
  const continuingRef = useRef(false);

  const allRequiredChecked = useMemo(() => {
    if (!required.length) return true;
    return required.every((r: any) => checks[r?.key]);
  }, [checks, required]);

  const ensureAbsoluteUrl = (u?: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const base = API_BASE_URL || '';
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  useEffect(() => {
    setInitialized(false);
  }, [required, optional?.key]);

  useEffect(() => {
    const init = async () => {
      console.log('[DEBUG] data object:', JSON.stringify(data?.user_preferences));
      const apiValue = data?.user_preferences?.hide_therapy_recommendations;
      const stored = await getHideTherapyRecommendations();
      console.log('[DEBUG] apiValue:', apiValue, 'stored:', stored);
      let shouldCollapse = true;
      if (apiValue !== undefined && apiValue !== null) {
        shouldCollapse = apiValue;
      } else if (stored !== null) {
        shouldCollapse = stored;
      }
      console.log('[DEBUG] shouldCollapse:', shouldCollapse);
      setRecommendationsCollapsed(shouldCollapse);
      const nextChecks: Record<string, boolean> = {};
      required.forEach((opt: any, idx: number) => {
        const key = opt?.key || String(idx);
        nextChecks[key] = true;
      });
      if (optional?.key) {
        nextChecks[optional.key] = true;
      }
      setChecks(nextChecks);
      setInitialized(true);
    };
    if (!initialized) {
      init();
    }
  }, [initialized, required, optional?.key, data?.user_preferences?.hide_therapy_recommendations]);

  const toggleRecommendations = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newValue = !recommendationsCollapsed;
    setRecommendationsCollapsed(newValue);
    try {
      await saveUserPreference('hide_therapy_recommendations', newValue);
    } catch (e) {
      console.log('[THERAPY] save preference error', e);
    }
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
      safeNavigation.navigate('HomeRoot');
    }
  };

  const onContinue = async () => {
    if (continuingRef.current) {
      return;
    }
    let didNavigate = false;
    try {
      continuingRef.current = true;
      setLoadingNext(true);
      if (postWork) {
        if (!postWorkGroupId || !postWorkMotivoId) {
          throw new Error('Falta información para continuar.');
        }
        didNavigate = true;
        safeNavigation.replace('TherapyFocusContent', {
          postWork: true,
          groupId: postWorkGroupId,
          motivoId: postWorkMotivoId,
          motivoLabel: postWorkMotivoLabel,
          emotions: postWorkEmotions,
          next: nextPayload,
          entrypoint: 'post_work',
        });
        return;
      }
      if (!sessionId) throw new Error('No se encontró la sesión.');
      if (nextResponse) {
        didNavigate = true;
        safeNavigation.replace('TherapyFlowRouter', { initialNext: nextResponse, entrypoint });
        return;
      }
      const actionKey = data?.actions?.primary?.key || 'START_HEALING';
      const next = await completeTherapyStep({ sessionId, action: actionKey });
      setNextResponse(next);
      didNavigate = true;
      safeNavigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    } finally {
      if (didNavigate) return;
      continuingRef.current = false;
      setLoadingNext(false);
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 240 }]}>
        <CText type={'B18'}>{title}</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          {isDefaultIntro ? (
            <>
              {introText.split(DEFAULT_TEXT_HIGHLIGHT)[0]}
              <CText type={'B14'} color={colors.labelColor}>
                {/* {DEFAULT_TEXT_HIGHLIGHT} */}
              </CText>
              {introText.split(DEFAULT_TEXT_HIGHLIGHT)[1]}
            </>
          ) : (
            introText
          )}
        </CText>

        <View style={styles.mt20}>
          <TouchableOpacity
            onPress={toggleRecommendations}
            style={[styles.rowSpaceBetween, styles.pv15, { borderBottomWidth: 1, borderColor: colors.grayScale2 }]}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <CText type={'B16'}>{title}</CText>
            </View>
            <Ionicons
              name={recommendationsCollapsed ? 'add-circle-outline' : 'remove-circle-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          {!recommendationsCollapsed && (
            <View style={{ marginTop: 8 }}>
              {required.map((opt: any, idx: number) => {
                const key = opt?.key || String(idx);
                const isOn = !!checks[key];
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setChecks(s => ({ ...s, [key]: !s[key] }))}
                    style={[styles.rowSpaceBetween, styles.pv15, idx > 0 ? { marginTop: 4 } : null]}
                  >
                    <CText type={'R16'} style={{ flex: 1, marginRight: 12 }}>
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
                  <CText type={'R16'} style={{ flex: 1, marginRight: 12 }}>
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
          <CButton title={data?.actions?.secondary?.label || 'Más tarde'} bgColor={colors.inputBg} color={colors.primary} disabled={loadingNext} onPress={onLater} />
        </View>
        <CButton title={data?.actions?.primary?.label || 'Comenzar'} disabled={!allRequiredChecked || loadingNext} loading={loadingNext} onPress={onContinue} />
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}