import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {styles} from '../theme';
import CText from '../components/common/CText';
import {getHeight, getWidth} from '../common/constants';
import {StackNav, TabNav} from './NavigationKey';
import {useDrawer} from './DrawerContext';
import {getSession, clearPushToken} from '../api/auth';
import {clearSession} from '../session/storage';
import {DEVICE_UUID} from '../common/constants';

const MENU_OPTIONS = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'happy-outline',
    kind: 'root',
    screenName: StackNav.WelcomeEmotion,
    requiresSession: false,
  },
  {
    id: 'sessions',
    label: 'Sesiones',
    icon: 'heart-outline',
    kind: 'stack-tab',
    tabName: TabNav.HomeTab,
    screenName: StackNav.SessionsMenu,
    requiresSession: true,
  },
  {
    id: 'tasks',
    label: 'Tareas',
    icon: 'calendar-outline',
    kind: 'stack-tab',
    tabName: TabNav.HomeTab,
    screenName: StackNav.TasksMenu,
    requiresSession: true,
  },
  {
    id: 'evaluations',
    label: 'Autoevaluaciones',
    icon: 'list-outline',
    kind: 'stack-tab',
    tabName: TabNav.HomeTab,
    screenName: StackNav.EvaluationsMenu,
    requiresSession: true,
  },
  {
    id: 'support',
    label: 'Apoyo financiero',
    icon: 'cash-outline',
    kind: 'root',
    screenName: StackNav.ApoyoFinanciero,
    requiresSession: true,
  },
  {
    id: 'settings',
    label: 'Configuraciones',
    icon: 'settings-outline',
    kind: 'root',
    screenName: StackNav.Configuration,
    requiresSession: true,
  },
  {
    id: 'about',
    label: 'Acerca de',
    icon: 'information-circle-outline',
    kind: 'root',
    screenName: StackNav.About,
    requiresSession: false,
  },
  {
    id: 'faq',
    label: 'Preguntas frecuentes',
    icon: 'help-circle-outline',
    kind: 'root',
    screenName: StackNav.FAQ,
    requiresSession: false,
  },
  // {
  //   id: 'thank-you',
  //   label: 'Pantalla de gracias',
  //   icon: 'checkmark-circle-outline',
  //   kind: 'root',
  //   screenName: StackNav.ThankYou,
  //   requiresSession: false,
  // },
];

function DrawerMenu() {
  const colors = useSelector(state => state.theme.theme);
  const navigation = useNavigation();
  const {isOpen, close} = useDrawer();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const session = await getSession();
      setIsLoggedIn(!!session?.token);
    } catch (e) {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshSession();
    }
  }, [isOpen, refreshSession]);

  const navigateToStackScreen = (tabName, screenName) => {
    close();
    navigation.navigate(StackNav.TabNavigation, {
      screen: tabName,
      params: {
        screen: screenName,
      },
    });
  };

  const navigateRootScreen = (screenName) => {
    close();
    navigation.navigate(screenName);
  };

  const onPressMenuOption = option => {
    if (option.requiresSession && !isLoggedIn) {
      return;
    }

    if (option.kind === 'stack-tab') {
      navigateToStackScreen(option.tabName, option.screenName);
      return;
    }

    navigateRootScreen(option.screenName);
  };

  const onPressLogout = async () => {
    close();
    try {
      // Borrar el token de push notifications del servidor primero (requiere auth)
      await clearPushToken();
    } catch (e) {
      console.log('Error clearing push token:', e);
    }
    try {
      await clearSession();
      await AsyncStorage.removeItem(DEVICE_UUID);
    } catch (e) {}
    navigation.reset({
      index: 0,
      routes: [{name: StackNav.AuthNavigation}],
    });
  };

  const onPressLogin = () => {
    close();
    navigation.reset({
      index: 0,
      routes: [{name: StackNav.AuthNavigation}],
    });
  };

  if (!isOpen) return null;
  return (
    <View style={localStyles.drawerOverlay}>
      <TouchableOpacity style={localStyles.drawerBackdrop} onPress={close} />
      <View style={[localStyles.drawerPanel, {backgroundColor: '#0aa693'}]}>
        <View style={localStyles.drawerTopSpacer} />
        {MENU_OPTIONS.map(option => {
          const disabled = option.requiresSession && !isLoggedIn;
          return (
            <TouchableOpacity
              key={option.id}
              style={[localStyles.drawerItem, disabled && localStyles.drawerItemDisabled]}
              disabled={disabled}
              onPress={() => onPressMenuOption(option)}>
              <Ionicons
                name={disabled ? 'lock-closed-outline' : option.icon}
                size={20}
                color={colors.white}
              />
              <View style={styles.ml10}>
                <CText type={'S16'} color={colors.white}>
                  {option.label}
                </CText>
                {disabled ? (
                  <CText type={'R12'} color={'rgba(255,255,255,0.72)'}>
                    Requiere iniciar sesión
                  </CText>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={localStyles.drawerItem}
          onPress={isLoggedIn ? onPressLogout : onPressLogin}
        >
          <Ionicons
            name={isLoggedIn ? 'log-out-outline' : 'log-in-outline'}
            size={20}
            color={colors.white}
          />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>{isLoggedIn ? 'Cerrar sesion' : 'Iniciar sesion'}</CText>
          </View>
        </TouchableOpacity>
        <View style={localStyles.drawerFooter}>
          <Image source={require('../../assets/logo.png')} style={localStyles.drawerLogo} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

export default DrawerMenu;

const localStyles = StyleSheet.create({
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawerPanel: {
    width: '72%',
    paddingTop: getHeight(40),
    paddingHorizontal: getWidth(20),
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 2, height: 0},
  },
  drawerTopSpacer: {
    height: getHeight(10),
  },
  drawerItem: {
    ...styles.rowStart,
    ...styles.mb15,
  },
  drawerItemDisabled: {
    opacity: 0.55,
  },
  drawerFooter: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: getHeight(20),
  },
  drawerLogo: {
    width: getWidth(140),
    height: getHeight(40),
  },
});
