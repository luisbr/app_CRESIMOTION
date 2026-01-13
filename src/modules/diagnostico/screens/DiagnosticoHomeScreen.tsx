import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Image, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
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

export default function DiagnosticoHomeScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const drawer = useDrawer();
  const [loading, setLoading] = useState(false);
  const [resumeTarget, setResumeTarget] = useState<null | {screen: string; params: any}>(null);
  const [therapyNext, setTherapyNext] = useState<any | null>(null);

  const checkResume = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const s = await getSession();
        const userId = s?.id ? String(s.id) : null;
        if (userId) {
          const next = await getTherapyNext(userId);
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
        if (groupId) {
          await saveGroupId(Number(groupId));
        }
        const inProgress = sessions.find((s: any) => s?.session?.status === 'in_progress') || sessions[0];
        const moduleKey = inProgress?.session?.module_key as ModuleKey;
        const sessionId = Number(inProgress?.session?.id);
        const selection = inProgress?.selection || inProgress?.selection_ids || [];
        const answers = inProgress?.answers || [];
        if (local && Number(local.session_id) === sessionId) {
          setResumeTarget({
            screen: `Diagnostico${local.screen}`,
            params: {
              sessionId,
              module_key: moduleKey,
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
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : therapyNext ? (
          <CButton title={'Continuar sesión terapéutica'} onPress={onPressTherapy} />
        ) : resumeTarget ? (
          <CButton title={'Continuar diagnostico'} onPress={onPressContinue} />
        ) : (
          <CButton title={'Iniciar diagnostico'} onPress={onPressStart} />
        )}
        <CButton
          title={'Mis evaluaciones'}
          onPress={onPressHistory}
          bgColor={colors.inputBg}
          color={colors.primary}
        />
      </View>
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
    height: moderateScale(28),
  },
};
