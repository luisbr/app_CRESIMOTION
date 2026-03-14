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
import {getSession} from '../api/auth';
import {clearSession} from '../session/storage';
import {DEVICE_UUID} from '../common/constants';

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

  const navigateHomeScreen = (tabName) => {
    close();
    if (tabName) {
      navigation.navigate(tabName);
    } else {
      navigation.navigate(TabNav.HomeTab);
    }
  };

  const navigateToTab = (tabName) => {
    close();
    navigation.navigate(tabName);
  };

  const navigateToStackScreen = (tabName, screenName) => {
    close();
    navigation.navigate(tabName, {
      screen: screenName,
    });
  };

  const navigateRootScreen = (screenName) => {
    close();
    navigation.navigate(screenName);
  };

  const onPressLogout = async () => {
    close();
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
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToTab(TabNav.HomeTab)}>
          <Ionicons name={'happy-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>¿Cómo te sientes hoy?</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToStackScreen(TabNav.HomeTab, 'DiagnosticoHome')}>
          <Ionicons name={'pulse-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Diagnostico</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToTab(TabNav.EvaluationsTab)}>
          <Ionicons name={'list-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Mis autoevaluaciones</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToTab(TabNav.CalenderTab)}>
          <Ionicons name={'calendar-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Tareas</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToStackScreen(TabNav.HomeTab, 'TherapyPendingSessions')}>
          <Ionicons name={'heart-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Sesiones terapeuticas</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateToTab(TabNav.TestsTab)}>
          <Ionicons name={'clipboard-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Test</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateRootScreen(StackNav.Configuration)}>
          <Ionicons name={'settings-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Configuraciones</CText>
          </View>
        </TouchableOpacity>
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
