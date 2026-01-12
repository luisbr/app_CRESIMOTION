import React, {useCallback, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import {getLastRoute, clearLastRoute} from '../utils';
import {getOpenSession} from '../api/sessionsApi';
import type {ModuleKey} from '../types';

export default function DiagnosticoHomeScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const [loading, setLoading] = useState(false);
  const [resumeTarget, setResumeTarget] = useState<null | {screen: string; params: any}>(null);

  const checkResume = useCallback(async () => {
    setLoading(true);
    try {
      const local = await getLastRoute();
      let open: any = null;
      try {
        open = await getOpenSession();
      } catch (e) {
        open = null;
      }
      const openSession = open?.open_session || null;
      if (openSession) {
        if (local && Number(local.session_id) === Number(openSession.id)) {
          setResumeTarget({
            screen: `Diagnostico${local.screen}`,
            params: {
              sessionId: Number(local.session_id),
              module_key: local.module_key as ModuleKey,
            },
          });
        } else {
          setResumeTarget({
            screen: 'DiagnosticoSelection',
            params: {module_key: openSession.module_key as ModuleKey},
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
    navigation.navigate('DiagnosticoSelection', {module_key: 'motivos'});
  };

  const onPressHistory = () => {
    navigation.navigate('DiagnosticoHistory');
  };

  const onPressContinue = () => {
    if (!resumeTarget) return;
    navigation.navigate(resumeTarget.screen, resumeTarget.params);
  };

  return (
    <CSafeAreaView>
      <CHeader />
      <View style={styles.p20}>
        <CText type={'S28'} align={'center'} style={styles.mb10}>
          Diagnostico
        </CText>
        <CText type={'S14'} align={'center'} color={colors.labelColor} style={styles.mb20}>
          Selecciona el modulo para iniciar la evaluacion.
        </CText>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
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
