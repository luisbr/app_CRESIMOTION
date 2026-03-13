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
  ProfileFocusedIcon,
  ProfileUnFocusedIcon,
} from '../../assets/svg';
import DiagnosticoHistoryScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryScreen';
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
function TabNavigation() {
  const colors = useSelector(state => state.theme.theme);
  const audioLocked = useSelector(state => state.ui?.audioLocked);
  //console.log('TabNavigation mounted');

  const TabText = memo(({IconType}) => (
    <View style={localStyles.tabViewContainer}>{IconType}</View>
  ));
  return (
    <View style={styles.flex}>
      <Tab.Navigator
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarStyle: [
            localStyles.tabBarStyle,
            {backgroundColor: colors.backgroundColor},
            audioLocked ? {opacity: 0.5} : null,
          ],
          tabBarShowLabel: false,
          tabBarButton: props => (
            <TouchableOpacity {...props} disabled={audioLocked} />
          ),
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
          name={TabNav.EvaluationsTab}
          component={DiagnosticoHistoryScreen}
          options={{
            tabBarIcon: ({focused}) => (
              <TabText
                IconType={
                  <Ionicons
                    name={focused ? 'stats-chart' : 'stats-chart-outline'}
                    size={28}
                    color={focused ? colors.primary : colors.textColor}
                  />
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
    </View>
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
