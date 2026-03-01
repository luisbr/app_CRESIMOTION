import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Image, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import {clearLastRoute, getLastRoute, saveGroupId} from '../utils';
import {getOpenSession} from '../api/sessionsApi';
import type {ModuleKey} from '../types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import {getTherapyNext} from '../../../api/sesionTerapeutica';
import {isTherapyRoute, normalizeTherapyNext} from '../../../screens/therapy/therapyUtils';
import {getSession} from '../../../api/auth';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';

export default function DiagnosticoHomeScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const drawer = useDrawer();
  const [loading, setLoading] = useState(false);
  const [resumeTarget, setResumeTarget] = useState<null | {screen: string; params: any}>(null);
  const [therapyNext, setTherapyNext] = useState<any | null>(null);
  const nextModuleKey: ModuleKey =
    (resumeTarget?.params?.module_key as ModuleKey) || 'motivos';
  const moduleTitleMap: Record<ModuleKey, string> = {
    motivos: 'Motivos de tu estado emocional',
    sintomas_fisicos: 'Sintomatología física.',
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
      'Para ayudarte a entender cómo te sientes hoy y brindarte un servicio de calidad, por favor, cuéntanos tu sintomatología física. Al final, recibirás tu resumen gráfico ',
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

  console.log('DiagnosticoHomeScreen render', {nextModuleKey, therapyNext});

  const checkResume = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const s = await getSession();
        const userId = s?.id ? String(s.id) : null;
        if (userId) {
          const next = await getTherapyNext(userId, { from_menu: 1 });
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
      const local = await getLastRoute();
      let open: any = null;
      try {
        open = await getOpenSession();
      } catch (e) {
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
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkResume();
    }, [checkResume])
  );

  const onPressStart = () => {
    if (therapyNext) {
      navigation.navigate('TherapyFlowRouter', {initialNext: therapyNext, entrypoint: 'home'});
      return;
    }
    navigation.navigate('DiagnosticoSelection', {module_key: 'motivos'});
  };

  const onPressHistory = () => {
    navigation.navigate('DiagnosticoHistory');
  };

  const onPressContinue = () => {
    if (!resumeTarget) return;
    navigation.navigate(resumeTarget.screen, resumeTarget.params);
  };

  const onPressTherapy = () => {
    if (!therapyNext) return;
    navigation.navigate('TherapyFlowRouter', {initialNext: therapyNext, entrypoint: 'home'});
  };

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
      <CHeader
        centerAccessory={
          <Image
            source={require('../../../../assets/logo.png')}
            style={localStyles.logo}
            resizeMode="contain"
          />
        }
        isHideBack
        isLeftIcon={
          <TouchableOpacity style={[localStyles.iconButton, { marginLeft: -8 }]} onPress={drawer.open}>
            <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
          </TouchableOpacity>
        }
        rightAccessory={
          <View style={localStyles.headerRight}>
            <TouchableOpacity style={localStyles.iconButton}>
              <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.iconButton}>
              <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
          </View>
        }
      />
      <View>
        <Image
          source={require('../../../assets/images/home.png')}
          style={{ width: '100%', height: moderateScale(180) }}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.p20, { paddingTop: 16 }]}>
        <CText type={'S20'} align={'center'} style={styles.mb10}>
          {moduleTitle}
        </CText>
        <CText type={'S12'} align={'center'} color={colors.labelColor} style={styles.mb15}>
          {moduleBodyPrefix}
          <CText type={'S12'} color={colors.textColor}>
            {moduleTitleInline}
          </CText>
          {moduleBodySuffix}
        </CText>
        {__DEV__ && (
          <View style={styles.mb10}>
            <CButton
              title={'Reset intro (debug)'}
              onPress={onPressResetHealingIntro}
              bgColor={colors.inputBg}
              color={colors.primary}
            />
          </View>
        )}
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : therapyNext ? (
          <CButton title={'Continuar sesión terapéutica'} onPress={onPressTherapy} />
        ) : resumeTarget ? (
          <CButton
            title={''}
            onPress={onPressContinue}
            containerStyle={localStyles.evalButton}
          >
            <CText type={'M12'} color={colors.white} align={'center'}>
              Autoevaluación:
            </CText>
            <CText type={'B14'} color={colors.white} align={'center'}>
              {moduleTitle}
            </CText>
          </CButton>
        ) : (
          <CButton
            title={''}
            onPress={onPressStart}
            containerStyle={localStyles.evalButton}
          >
            <CText type={'M12'} color={colors.white} align={'center'}>
              Autoevaluación:
            </CText>
            <CText type={'B14'} color={colors.white} align={'center'}>
              {moduleTitle}
            </CText>
          </CButton>
        )}
        <CButton
          title={'Mis autoevaluaciones'}
          onPress={onPressHistory}
          bgColor={colors.inputBg}
          color={colors.primary}
        />
      </View>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            DiagnosticoHomeScreen
          </CText>
        </View>
      )}
    </CSafeAreaView>
  );
}

const localStyles = {
  headerRight: {
    ...styles.rowStart,
    ...styles.g10,
  },
  iconButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    ...styles.center,
  },
  logo: {
    width: moderateScale(110),
    height: moderateScale(50),
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
};
