import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo, useState, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigationState} from '@react-navigation/native';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {StackNav, TabNav} from '../NavigationKey';
// Break require cycle: import screens directly instead of NavigationRoute
import HomeStack from './HomeStack';
import EvaluationsStack from './EvaluationsStack';
import TasksScreen from '../../screens/agenda/TasksScreen';
import TestsListScreen from '../../screens/tests/TestsListScreen';
import WelcomeEmotionScreen from '../../screens/home/WelcomeEmotionScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const SCREENS_THAT_HIDE_TAB_BAR = [
  'DiagnosticoHome',
  'DiagnosticoSelection',
  'DiagnosticoWizard',
  'DiagnosticoResults',
  'DiagnosticoHistory',
  'DiagnosticoHistoryDetail',
  'TestResultsHistory',
  'ResumenDebug',
  'TherapyFlowRouter',
  'TherapySessionIntro',
  'TherapyFocusSelect',
  'TherapyFocusContent',
  'TherapyFocusMotivoEval',
  'TherapyHealingSelectEmotion',
  'TherapyHealingIntro',
  'TherapyHealingPlayback',
  'TherapyHealingDone',
  'TherapyBehaviorIntro',
  'TherapyBehaviorRecoSelect',
  'TherapyBehaviorExerciseSelect',
  'TherapyAgendaSetup',
  'TherapyPendingSessions',
  'HealingStart',
  'HealingSelectMotivoScreen',
  'HealingSanacionScreen',
  'ReasonsList',
  'IntensityWizard',
  'Summary',
];

function findActiveRouteName(state) {
  if (!state) return null;
  if (state.routes && state.routes[state.index]) {
    const activeRoute = state.routes[state.index];
    if (activeRoute.state) {
      return findActiveRouteName(activeRoute.state);
    }
    return activeRoute.name;
  }
  return state.name || null;
}

function useShouldHideTabBar() {
  const navigationState = useNavigationState(state => state);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (!navigationState) {
      setShouldHide(false);
      return;
    }

    const activeRouteName = findActiveRouteName(navigationState);
    const hide = activeRouteName && SCREENS_THAT_HIDE_TAB_BAR.includes(activeRouteName);
    setShouldHide(Boolean(hide));
  }, [navigationState]);

  return shouldHide;
}

function TabNavigationContent() {
  const colors = useSelector(state => state.theme.theme);
  const audioLocked = useSelector(state => state.ui?.audioLocked);
  const shouldHideTabBarFromRoute = useShouldHideTabBar();

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
              (audioLocked || shouldHideTabBarFromRoute) ? {display: 'none'} : null,
            ],
            tabBarShowLabel: false,
            tabBarButton: props => (
              <TouchableOpacity {...props} disabled={audioLocked || shouldHideTabBarFromRoute} />
            ),
          }}
          initialRouteName={TabNav.HomeTab}>
        <Tab.Screen
          name={TabNav.HomeTab}
          component={HomeStack}
          options={{
            tabBarItemStyle: localStyles.compactTabItem,
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
            tabBarItemStyle: localStyles.compactTabItem,
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
          component={EvaluationsStack}
          options={{
            tabBarItemStyle: localStyles.wideTabItem,
            tabBarIcon: ({focused}) => (
              <TabText
                iconName="document-text-outline"
                label={'Mis auto-\nevaluaciones'}
                focused={focused}
              />
            ),
          }}
        />
        <Tab.Screen
          name={TabNav.TestsTab}
          component={TestsListScreen}
          options={{
            tabBarItemStyle: localStyles.compactTabItem,
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

export default function TabNavigation() {
  return <TabNavigationContent />;
}
const localStyles = StyleSheet.create({
  tabBarStyle: {
    height: getHeight(88),
    ...styles.ph20,
    ...styles.pt10,
  },
  tabViewContainer: {
    alignItems: 'center',
    width: getWidth(95),
    justifyContent: 'flex-start',
    paddingTop: moderateScale(4),
  },
  compactTabItem: {
    flex: 0.92,
  },
  wideTabItem: {
    flex: 1.24,
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
