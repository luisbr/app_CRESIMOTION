import {StyleSheet, View} from 'react-native';
import React, {memo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {getHeight, getWidth} from '../../common/constants';
import {TabNav} from '../NavigationKey';
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
import CalenderTab from '../../container/Calender/CalenderTab';
import ChatTab from '../../container/Message/ChatTab';
import ProfileTab from '../../container/profile/ProfileTab';

const Tab = createBottomTabNavigator();
export default function TabNavigation() {
  const colors = useSelector(state => state.theme.theme);
  console.log('TabNavigation mounted');

  const TabText = memo(({IconType}) => (
    <View style={localStyles.tabViewContainer}>{IconType}</View>
  ));
  return (
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
        component={CalenderTab}
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
  );
}

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
});
