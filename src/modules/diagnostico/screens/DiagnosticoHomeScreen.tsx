import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CSafeAreaView from '../../../components/common/CSafeAreaView';

import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import {clearLastRoute, getLastRoute, saveGroupId} from '../utils';
import {getOpenSession, checkFirstDiagnosticComplete} from '../api/sessionsApi';
import type {ModuleKey} from '../types';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';
import {getTherapyNext, getResumenMensual} from '../../../api/sesionTerapeutica';
import {isTherapyRoute, normalizeTherapyNext} from '../../../screens/therapy/therapyUtils';
import {getSession, getSuscripcionActual, getMembresias} from '../../../api/auth';
import {getStoredNotifications} from '../../../utils/notificationStorage';
import {StackNav, TabNav} from '../../../navigation/NavigationKey';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import CMainAppBar from '../../../components/common/CMainAppBar';
import CCustomScrollView from '../../../components/common/CCustomScrollView';
import {useSafeNavigation} from '../../../navigation/safeNavigation';
import LimitReachedModal from '../../../components/common/LimitReachedModal';
import Ionicons from 'react-native-vector-icons/Ionicons';

const THERAPY_SESSION_CHECKLIST_ACK_KEY = 'therapy_session_checklist_ack';

export default function DiagnosticoHomeScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const drawer = useDrawer();
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const [loading, setLoading] = useState(false);
  const [hasResolvedResume, setHasResolvedResume] = useState(false);
  const [resumeTarget, setResumeTarget] = useState<null | {screen: string; params: any}>(null);
  const [therapyNext, setTherapyNext] = useState<any | null>(null);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);
  const [hasCompletedFirstFlow, setHasCompletedFirstFlow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isCheckingRef = useRef(false);
  const [navigating, setNavigating] = useState(false);
  const navigatingRef = useRef(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{usadas: number; limite: number} | null>(null);
  const [therapyIntroChecks, setTherapyIntroChecks] = useState<Record<string, boolean>>({
    alone: false,
    internet: false,
    comfort: false,
    understood: false,
  });
  const hideHeroImage = !!route?.params?.hideHeroImage;
  const nextModuleKey: ModuleKey =
    (resumeTarget?.params?.module_key as ModuleKey) || 'motivos';

  const screenModule: ModuleKey =
    (resumeTarget?.params?.module_key as ModuleKey) || '---';
    console.log("screenModulescreenModule",screenModule);
  const moduleTitleMap: Record<ModuleKey, string> = {
    motivos: 'Motivos de tu estado emocional',
    sintomas_fisicos: 'Sintomatología física',
    sintomas_emocionales: 'Sintomatología emocional',
  };
  const moduleTitle = therapyNext ? 'Sesión terapéutica' : (moduleTitleMap[nextModuleKey] || moduleTitleMap.motivos);
  const moduleTitleInlineMap: Record<ModuleKey, string> = {
    motivos: 'Motivos de tu estado emocional',
    sintomas_fisicos: 'Sintomatología física',
    sintomas_emocionales: 'Sintomatología emocional',
  };
  const moduleTitleInline = therapyNext ? '' : (moduleTitleInlineMap[nextModuleKey] || moduleTitleInlineMap.motivos);
  const moduleBodyPrefixMap: Record<ModuleKey, string> = {
    motivos:
      'Para ayudarte a entender cómo te sientes hoy y brindarte un servicio de calidad, por favor, cuéntanos cuáles son los motivos de tu estado emocional. Al final, recibirás tu resumen gráfico ',
    sintomas_fisicos:
      'Para ayudarte a entender cómo te sientes hoy y brindarte un servicio de calidad, por favor, cuéntanos cuáles son tus síntomas físicos. Al final, recibirás tu resumen gráfico ',
    sintomas_emocionales:
      'Para ayudarte a entender cómo te sientes hoy y brindarte un servicio de calidad, por favor, cuéntanos tu sintomatología emocional. Al final, recibirás tu resumen gráfico ',
  };
  const moduleBodySuffixMap: Record<ModuleKey, string> = {
    motivos: ' actual.',
    sintomas_fisicos: ' actual.',
    sintomas_emocionales: ' actual.',
  };
  const moduleBodyPrefix = therapyNext
    ? 'A partir de este momento, inicias tu Sesión terapéutica.'
    : (moduleBodyPrefixMap[nextModuleKey] || moduleBodyPrefixMap.motivos);
  const moduleBodySuffix = therapyNext ? '' : (moduleBodySuffixMap[nextModuleKey] || moduleBodySuffixMap.motivos);
  const showTherapyChecklist = Boolean(therapyNext);
  const therapyChecklistItems = [
    {
      key: 'alone',
      label:
        'Dispongo de al menos media hora para estar a solas, en un lugar tranquilo, libre de ruidos excesivos, distracciones o interrupciones externas, dedicando toda la atención a mi salud emocional.',
    },
    {
      key: 'internet',
      label: 'Cuento con una óptima conexión a internet para evitar interrupciones.',
    },
    {
      key: 'comfort',
      label: 'Me encuentro en un espacio cómodo donde puedo recostarme o relajarme completamente.',
    },
    {
      key: 'understood',
      label: 'He entendido estas recomendaciones. No volver a mostrar.',
    },
  ];
  const canContinueTherapyChecklist = therapyChecklistItems.every(item => therapyIntroChecks[item.key]);

  const heroImageSource =
    nextModuleKey === 'sintomas_fisicos'
      ? require('../../../assets/images/img_sesion/CresiMotion_03-02.png')
      : nextModuleKey === 'sintomas_emocionales'
      ? require('../../../assets/images/img_sesion/CresiMotion_05-02.png')
      : nextModuleKey === 'motivos'
      ? require('../../../assets/images/CM_Pic_MisEvaluaciones.png')
      : require('../../../assets/images/CM_Pic_white.png');

  console.log('DiagnosticoHomeScreen render',screenModule, {nextModuleKey, therapyNext});

  const checkResume = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    setHasResolvedResume(false);
    setLoading(true);
    try {
      try {
        console.log('[DiagnosticoHomeScreen] getSession request');
        const s = await getSession();
        console.log('[DiagnosticoHomeScreen] getSession response', s);
        const userId = s?.id ? String(s.id) : null;
        if (userId) {
          console.log('[DiagnosticoHomeScreen] getTherapyNext request', {userId, from_menu: 1});
          const next = await getTherapyNext(userId, { from_menu: 1 });
          console.log('[DiagnosticoHomeScreen] getTherapyNext response', next);
          const normalized = normalizeTherapyNext(next);
          if (isTherapyRoute(normalized.route)) {
            setTherapyNext(next);
          } else {
            setTherapyNext(null);
          }
        } else {
          setTherapyNext(null);
        }
      } catch (e) {
        setTherapyNext(null);
      }
      console.log('[DiagnosticoHomeScreen] getLastRoute request');
      const local = await getLastRoute();
      console.log('[DiagnosticoHomeScreen] getLastRoute response', local);
      let open: any = null;
      try {
        console.log('[DiagnosticoHomeScreen] getOpenSession request');
        open = await getOpenSession();
        console.log('[DiagnosticoHomeScreen] getOpenSession response', open);
      } catch (e) {
        console.log('[DiagnosticoHomeScreen] getOpenSession error', e);
        open = null;
      }
      const sessions = open?.sessions || [];
      const groupId = open?.group_id;
      if (sessions.length) {
        const inProgress = sessions.find((s: any) => s?.session?.status === 'in_progress');
        if (!inProgress) {
          await clearLastRoute();
          setResumeTarget(null);
          return;
        }
        if (groupId) {
          await saveGroupId(Number(groupId));
        }
        const moduleKey = inProgress?.session?.module_key as ModuleKey;
        const sessionId = Number(inProgress?.session?.id);
        const selectionRaw = inProgress?.selection || inProgress?.selection_ids || [];
        const selection =
          Array.isArray(selectionRaw)
            ? selectionRaw
            : Array.isArray(selectionRaw?.selected_item_ids)
            ? selectionRaw.selected_item_ids
            : [];
        const answers = inProgress?.answers || [];
        if (local && Number(local.session_id) === sessionId) {
          setResumeTarget({
            screen: `Diagnostico${local.screen}`,
            params: {
              sessionId,
              module_key: moduleKey,
              selection,
              answers,
            },
          });
        } else {
          setResumeTarget({
            screen: 'DiagnosticoSelection',
            params: {
              module_key: moduleKey,
              sessionId,
              selection,
              answers,
            },
          });
        }
        return;
      }
      await clearLastRoute();
      setResumeTarget(null);
    } finally {
      setLoading(false);
      setHasResolvedResume(true);
      isCheckingRef.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkSessionAndNotifs = async () => {
        try {
          console.log('[DiagnosticoHomeScreen] getSession (focus) request');
          const session = await getSession();
          console.log('[DiagnosticoHomeScreen] getSession (focus) response', session);
          if (isActive) {
            if (session?.token) {
              setIsLoggedIn(true);
              console.log('[DiagnosticoHomeScreen] getStoredNotifications request');
              const notifs = await getStoredNotifications();
              console.log('[DiagnosticoHomeScreen] getStoredNotifications response', notifs);
              const hasNew = notifs.some(n => n.isNew && !n.isDeleted && !n.isArchived);
              setHasNewNotifs(hasNew);
            } else {
              setIsLoggedIn(false);
            }
          }
        } catch (e) {
          if (isActive) {
            setIsLoggedIn(false);
          }
        }
      };
      const checkFirstFlow = async () => {
        const val = await checkFirstDiagnosticComplete();
        if (isActive) {
          setHasCompletedFirstFlow(val);
        }
      };
      checkSessionAndNotifs();
      checkFirstFlow();
      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);

  useEffect(() => {
    let mounted = true;
    const loadChecklistPreference = async () => {
      if (!showTherapyChecklist) return;
      try {
        const session = await getSession();
        const userId = session?.id ? String(session.id) : 'anon';
        const stored = await AsyncStorage.getItem(`${THERAPY_SESSION_CHECKLIST_ACK_KEY}_${userId}`);
        if (!mounted || stored !== '1') return;
        setTherapyIntroChecks({
          alone: true,
          internet: true,
          comfort: true,
          understood: true,
        });
      } catch (e) {
        console.log('[THERAPY] checklist preference load error', e);
      }
    };
    loadChecklistPreference();
    return () => {
      mounted = false;
    };
  }, [showTherapyChecklist]);

  const toggleTherapyChecklistItem = async (key: string) => {
    const nextValue = !therapyIntroChecks[key];
    const nextChecks = {
      ...therapyIntroChecks,
      [key]: nextValue,
    };
    setTherapyIntroChecks(nextChecks);
    if (key !== 'understood' || !nextValue) return;
    try {
      const session = await getSession();
      const userId = session?.id ? String(session.id) : 'anon';
      await AsyncStorage.setItem(`${THERAPY_SESSION_CHECKLIST_ACK_KEY}_${userId}`, '1');
      setTherapyIntroChecks({
        alone: true,
        internet: true,
        comfort: true,
        understood: true,
      });
    } catch (e) {
      console.log('[THERAPY] checklist preference save error', e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkResume();
    });
    return unsubscribe;
  }, [navigation, checkResume]);

  const checkLimitAndNavigate = async () => {
    try {
      const resumen = await getResumenMensual();
      const sesionesUsadas = resumen?.sesiones_realizadas?.count ?? 0;
      const suscripcionId = resumen?.period?.suscripcion_id;
      const membresiaId = resumen?.period?.membresia_id;

      let limite = 0;

      if (suscripcionId) {
        const suscripcion = await getSuscripcionActual();
        const conceptos = suscripcion?.conceptos ?? [];
        const emotionConcept = conceptos.find((c: any) => c.concepto_id === 1);
        limite = emotionConcept?.cantidad_asignada ?? 0;

        if (limite === 0 && membresiaId) {
          const membresias = await getMembresias();
          const membresia = membresias?.data?.find((m: any) => String(m.id) === String(membresiaId));
          const conceptoPlan = membresia?.conceptos?.find((c: any) => String(c.conceptos_id) === '1');
          limite = parseInt(conceptoPlan?.cantidad ?? 0, 10);
        }
        // ======================= LIMITE TEMPORAL =======================
        if (sesionesUsadas >= limite && limite > 0) {
          setLimitInfo({ usadas: sesionesUsadas, limite });
          setShowLimitModal(true);
          return false;
        }
        // ======================= LIMITE TEMPORAL =======================
      }

      return true;
    } catch (e) {
      return true;
    }
  };

  const onPressStart = async () => {
    const canContinue = await checkLimitAndNavigate();
    if (!canContinue) return;

    if (therapyNext) {
      safeNavigation.navigate('TherapyFlowRouter', {initialNext: therapyNext, entrypoint: 'home'});
    } else {
      safeNavigation.navigate('DiagnosticoSelection', {module_key: 'motivos'});
    }
  };

  const onPressHistory = () => {
    safeNavigation.navigate('DiagnosticoHistory');
  };

  const onPressContinue = async () => {
    if (!resumeTarget) return;
    const canContinue = await checkLimitAndNavigate();
    if (!canContinue) return;
    safeNavigation.navigate(resumeTarget.screen, resumeTarget.params);
  };

  const onPressTherapy = async () => {
    if (!therapyNext) return;
    const canContinue = await checkLimitAndNavigate();
    if (!canContinue) return;
    safeNavigation.navigate('TherapyFlowRouter', {initialNext: therapyNext, entrypoint: 'home'});
  };

  const onPressMasTarde = () => {
    setIsDiagnosticoFlow(false);
    safeNavigation.navigate(StackNav.WelcomeEmotion);
  };

  useEffect(() => {
    if (!navigating) return;
    const unsubscribe = navigation.addListener('blur', () => {
      navigatingRef.current = false;
      setNavigating(false);
    });
    return unsubscribe;
  }, [navigation, navigating]);

  const onPressResetHealingIntro = async () => {
    try {
      const session = await getSession();
      const uid = session?.id ? String(session.id) : null;
      if (!uid) return;
      const keys = await AsyncStorage.getAllKeys();
      const toRemove = keys.filter(key => key.startsWith(`healing_intro_hide_${uid}_`));
      if (toRemove.length) {
        await AsyncStorage.multiRemove(toRemove);
      }
    } catch (e) {
      console.log('[THERAPY] reset intro error', e);
    }
  };

  return (
    <CSafeAreaView>
      <CMainAppBar mode="main" />
      <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {!hideHeroImage && hasResolvedResume && (
          <View>
            <Image
              source={heroImageSource}
              style={{ width: '100%', height: moderateScale(180) }}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={[styles.p20, { paddingTop: 16 }]}>
          <CText type={'S20'} align={'center'} color={colors.textColor} style={styles.mb10}>
            {moduleTitle}
          </CText>
          <CText type={'S12'} align={'center'} color={colors.labelColor} style={styles.mb15}>
            {moduleBodyPrefix}
            <CText type={'S12'} color={colors.textColor} align="center" style={null}>
              {moduleTitleInline}
            </CText>
            {moduleBodySuffix}
          </CText>
          {showTherapyChecklist && (
            <View
              style={{
                marginBottom: moderateScale(16),
                borderRadius: moderateScale(12),
                backgroundColor: colors.inputBg,
                padding: moderateScale(14),
              }}
            >
              <CCustomScrollView
                containerStyle={localStyles.therapyChecklistScrollWrap}
                style={localStyles.therapyChecklistScroll}
                contentContainerStyle={localStyles.therapyChecklistScrollContent}
              >
                <CText type={'B16'} color={colors.textColor} style={styles.mb10}>
                  Recomendaciones para aprovechar la sesión terapéutica
                </CText>
                <CText type={'S14'} color={colors.labelColor} style={styles.mb10}>
                  Para aprovechar al máximo las siguientes dos fases (Enfoque positivo y Sanación emocional), confirma, por favor, que reúnes las siguientes condiciones:
                </CText>
                {therapyChecklistItems.map(item => {
                  const isOn = !!therapyIntroChecks[item.key];
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => toggleTherapyChecklistItem(item.key)}
                      style={[styles.rowStart, {alignItems: 'flex-start', marginTop: moderateScale(10)}]}
                    >
                      <Ionicons
                        name={isOn ? 'checkmark-circle' : 'ellipse-outline'}
                        size={moderateScale(22)}
                        color={isOn ? colors.primary : colors.grayScale2}
                        style={{marginRight: moderateScale(10), marginTop: moderateScale(1)}}
                      />
                      <CText type={'R14'} color={colors.textColor} style={{flex: 1, flexShrink: 1}}>
                        {item.label}
                      </CText>
                    </TouchableOpacity>
                  );
                })}
              </CCustomScrollView>
            </View>
          )}
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : therapyNext ? (
            !showTherapyChecklist ? (
              <CButton
                title={therapyNext?.payload?.title || 'Continuar sesión terapéutica'}
                type="B16"
                color={colors.white}
                containerStyle={null}
                style={null}
                textStyle={null}
                bgColor={null}
                borderColor={null}
                onPress={onPressTherapy}
                disabled={navigating}
                loading={navigating}
              />
            ) : null
          ) : resumeTarget ? (
            <CButton
              title={''}
              type="B14"
              color={colors.white}
              onPress={onPressContinue}
              disabled={navigating}
              loading={navigating}
              containerStyle={localStyles.evalButton}
              style={null}
              textStyle={null}
              bgColor={null}
              borderColor={null}
            >
              <CText type={'M12'} color={colors.white} align={'center'} style={null}>
                Autoevaluación:
              </CText>
              <CText type={'B14'} color={colors.white} align={'center'} style={null}>
                {moduleTitle}
              </CText>
            </CButton>
          ) : (
            <CButton
              title={''}
              type="B14"
              color={colors.white}
              onPress={onPressStart}
              disabled={navigating}
              loading={navigating}
              containerStyle={localStyles.evalButton}
              style={null}
              textStyle={null}
              bgColor={null}
              borderColor={null}
            >
              <CText type={'M12'} color={colors.white} align={'center'} style={null}>
                Autoevaluación:
              </CText>
              <CText type={'B14'} color={colors.white} align={'center'} style={null}>
                {moduleTitle}
              </CText>
            </CButton>
          )}
          {/* <CButton
            title={'Más tarde'}
            type="B16"
            onPress={onPressMasTarde}
            bgColor={colors.inputBg}
            color={colors.primary}
            containerStyle={null}
            style={null}
            textStyle={null}
            borderColor={null}
          /> */}
          {!showTherapyChecklist && (
            <CButton
              title={'Mis autoevaluaciones'}
              type="B16"
              onPress={onPressHistory}
              bgColor={colors.inputBg}
              color={colors.primary}
              containerStyle={null}
              style={null}
              textStyle={null}
              borderColor={null}
              disabled={!hasCompletedFirstFlow}
            />
          )}
        </View>
      </ScrollView>
      {showTherapyChecklist && !loading && (
        <View style={localStyles.bottomActionBar}>
          <CButton
            title={'Continuar'}
            onPress={onPressTherapy}
            disabled={!canContinueTherapyChecklist || navigating}
            loading={navigating}
          />
          <CButton
            title={'Más tarde'}
            onPress={() => safeNavigation.navigate(StackNav.WelcomeEmotion)}
            bgColor={colors.inputBg}
            color={colors.primary}
          />
        </View>
      )}
      </View>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'} align="left" style={null}>
            DiagnosticoHomeScreen
          </CText>
        </View>
      )}
      <LimitReachedModal
        visible={showLimitModal}
        limitKey="max_emociones_nombradas_mes"
        customMessage={`Has alcanzado el límite de sesiones de autoevaluación permitidas por tu plan actual (${limitInfo?.usadas || 0} de ${limitInfo?.limite || 0}). Mejora tu plan para desbloquear más sesiones.`}
        onClose={() => {
          setShowLimitModal(false);
          setLimitInfo(null);
        }}
        onUpgrade={() => {
          setShowLimitModal(false);
          setLimitInfo(null);
          safeNavigation.navigate('Subscription');
        }}
      />
    </CSafeAreaView>
  );
}

const localStyles: any = {
  scrollContent: {
    paddingBottom: moderateScale(24),
  },
  therapyChecklistScrollWrap: {
    position: 'relative',
    maxHeight: moderateScale(250),
  },
  therapyChecklistScroll: {
    maxHeight: moderateScale(250),
  },
  therapyChecklistScrollContent: {
    paddingRight: moderateScale(18),
    paddingBottom: moderateScale(88),
  },
  evalButton: {
    flexDirection: 'column',
    height: moderateScale(62),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  screenTooltip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bottomActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 6,
    elevation: 6,
  },
};
