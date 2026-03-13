import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {StackNav, TabNav} from '../NavigationKey';
import DiagnosticoHistoryScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryScreen';
// Break require cycle: import screens directly instead of NavigationRoute
import HomeStack from './HomeStack';
import TasksScreen from '../../screens/agenda/TasksScreen';
import TestsListScreen from '../../screens/tests/TestsListScreen';
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

  const TabText = memo(({iconName, label, focused}) => (
    <View style={localStyles.tabViewContainer}>
      <Ionicons
        name={iconName}
        size={32}
        color={colors.textColor}
      />
      <CText
        type="S12"
        align="center"
        color={colors.textColor}
        style={styles.mt5}>
        {label}
      </CText>
    </View>
  ));

  return (
    <View style={styles.flex}>
      <Tab.Navigator
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarStyle: [
            localStyles.tabBarStyle,
            {backgroundColor: '#FFFFFF', borderTopWidth: 0, paddingHorizontal: 0},
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
                iconName="home-outline"
                label="Home"
                focused={focused}
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
                iconName="calendar-outline"
                label="Tareas"
                focused={focused}
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
                iconName="document-text-outline"
                label="Mis evaluaciones"
                focused={focused}
              />
            ),
          }}
        />
        <Tab.Screen
          name={TabNav.TestsTab}
          component={TestsListScreen}
          options={{
            tabBarIcon: ({focused}) => (
              <TabText
                iconName="clipboard-outline"
                label="Test"
                focused={focused}
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
    alignItems: 'center',
    width: getWidth(95),
    justifyContent: 'flex-start',
    paddingTop: moderateScale(5),
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
