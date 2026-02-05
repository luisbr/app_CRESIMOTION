import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import {getHeight, getWidth} from '../../common/constants';
import {StackNav, TabNav} from '../NavigationKey';
import {
  CalenderFocusedIcon,
  CalenderUnFocusedIcon,
  HomeFocusedIcon,
  HomeUnFocusedIcon,
  MessageFocusedIcon,
  MessageUnFocusedIcon,
  ProfileFocusedIcon,
  ProfileUnFocusedIcon,
} from '../../assets/svg';
// Break require cycle: import screens directly instead of NavigationRoute
import HomeStack from './HomeStack';
import TasksScreen from '../../screens/agenda/TasksScreen';
import ChatTab from '../../container/Message/ChatTab';
import ProfileTab from '../../container/profile/ProfileTab';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DrawerProvider, useDrawer} from '../DrawerContext';
import {getSession} from '../../api/auth';
import {clearSession} from '../../session/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEVICE_UUID} from '../../common/constants';

const Tab = createBottomTabNavigator();
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

  const navigateHomeScreen = (screenName) => {
    close();
    navigation.navigate(StackNav.TabNavigation, {
      screen: TabNav.HomeTab,
      params: {screen: screenName},
    });
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
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateHomeScreen('DiagnosticoHome')}>
          <Ionicons name={'pulse-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Diagnostico</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateHomeScreen('DiagnosticoHistory')}>
          <Ionicons name={'list-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Mis evaluaciones</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateHomeScreen('Tasks')}>
          <Ionicons name={'calendar-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Tareas</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigateHomeScreen('TherapyPendingSessions')}>
          <Ionicons name={'heart-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Sesiones terapeuticas</CText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.drawerItem} onPress={() => navigation.navigate(TabNav.ProfileTab)}>
          <Ionicons name={'person-outline'} size={20} color={colors.white} />
          <View style={styles.ml10}>
            <CText type={'S16'} color={colors.white}>Perfil</CText>
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
          <Image source={require('../../../assets/logo.png')} style={localStyles.drawerLogo} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

function TabNavigation() {
  const colors = useSelector(state => state.theme.theme);
  //console.log('TabNavigation mounted');

  const TabText = memo(({IconType}) => (
    <View style={localStyles.tabViewContainer}>{IconType}</View>
  ));
  return (
    <DrawerProvider>
      <View style={styles.flex}>
        <Tab.Navigator
          screenOptions={{
            tabBarHideOnKeyboard: true,
            headerShown: false,
            tabBarStyle: [
              localStyles.tabBarStyle,
              {backgroundColor: colors.backgroundColor},
            ],
            tabBarShowLabel: false,
          }}
          initialRouteName={TabNav.HomeTab}>
          <Tab.Screen
            name={TabNav.HomeTab}
            component={HomeStack}
            options={{
              tabBarIcon: ({focused}) => (
                <TabText
                  IconType={focused ? <HomeFocusedIcon /> : <HomeUnFocusedIcon />}
                />
              ),
            }}
          />
          <Tab.Screen
            name={TabNav.CalenderTab}
            component={TasksScreen}
            options={{
              tabBarIcon: ({focused}) => (
                <TabText
                  IconType={
                    focused ? <CalenderFocusedIcon /> : <CalenderUnFocusedIcon />
                  }
                />
              ),
            }}
          />
          <Tab.Screen
            name={TabNav.ChatTab}
            component={ChatTab}
            options={{
              tabBarIcon: ({focused}) => (
                <TabText
                  IconType={
                    focused ? <MessageFocusedIcon /> : <MessageUnFocusedIcon />
                  }
                />
              ),
            }}
          />
          <Tab.Screen
            name={TabNav.ProfileTab}
            component={ProfileTab}
            options={{
              tabBarIcon: ({focused}) => (
                <TabText
                  IconType={
                    focused ? <ProfileFocusedIcon /> : <ProfileUnFocusedIcon />
                  }
                />
              ),
            }}
          />
        </Tab.Navigator>
        <DrawerMenu />
      </View>
    </DrawerProvider>
  );
}

export default TabNavigation;
const localStyles = StyleSheet.create({
  tabBarStyle: {
    height: getHeight(80),
    ...styles.ph20,
    ...styles.pt10,
  },
  tabViewContainer: {
    ...styles.center,
    width: getWidth(65),
  },
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
