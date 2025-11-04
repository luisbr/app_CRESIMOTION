import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthNav} from '../NavigationKey';
// Break require cycle: import screens directly instead of NavigationRoute
import CreateNewPassword from '../../container/auth/CreateNewPassword';
import ForgotPassword from '../../container/auth/ForgotPassword';
import Login from '../../container/auth/Login';
import OtpScreen from '../../container/auth/OtpScreen';
import Register from '../../container/auth/Register';
import Welcome from '../../container/auth/Welcome';

const Stack = createStackNavigator();
export default function AuthNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={AuthNav.Welcome}>
      <Stack.Screen name={AuthNav.Welcome} component={Welcome} />
      <Stack.Screen name={AuthNav.Login} component={Login} />
      <Stack.Screen name={AuthNav.Register} component={Register} />
      <Stack.Screen
        name={AuthNav.ForgotPassword}
        component={ForgotPassword}
      />
      <Stack.Screen name={AuthNav.OtpScreen} component={OtpScreen} />
      <Stack.Screen
        name={AuthNav.CreateNewPassword}
        component={CreateNewPassword}
      />
    </Stack.Navigator>
  );
}
