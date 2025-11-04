import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StackNav} from '../NavigationKey';
import {StackRoute} from '../NavigationRoute';
import ReasonsListScreen from '../../screens/forms/ReasonsListScreen';
import IntensityWizardScreen from '../../screens/forms/IntensityWizardScreen';
import SummaryScreen from '../../screens/forms/SummaryScreen';

const Stack = createStackNavigator();
export default function StackNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={StackNav.Splash}>
      <Stack.Screen name={StackNav.Splash} component={StackRoute.Splash} />
      <Stack.Screen name={StackNav.ThankYou} component={StackRoute.ThankYou} />
      <Stack.Screen
        name={StackNav.OnBoarding}
        component={StackRoute.OnBoarding}
      />
      <Stack.Screen
        name={StackNav.AuthNavigation}
        component={StackRoute.AuthNavigation}
      />
      <Stack.Screen
        name={StackNav.TabNavigation}
        component={StackRoute.TabNavigation}
      />
      <Stack.Screen
        name={StackNav.DoctorDetail}
        component={StackRoute.DoctorDetail}
      />
      <Stack.Screen
        name={StackNav.Appointment}
        component={StackRoute.Appointment}
      />
      <Stack.Screen
        name={StackNav.BookAppointment}
        component={StackRoute.BookAppointment}
      />
      <Stack.Screen
        name={StackNav.WaitingRoom}
        component={StackRoute.WaitingRoom}
      />
      <Stack.Screen name={StackNav.Chat} component={StackRoute.Chat} />
      <Stack.Screen
        name={StackNav.VideoCall}
        component={StackRoute.VideoCall}
      />
      <Stack.Screen
        name={StackNav.Notification}
        component={StackRoute.Notification}
      />
      <Stack.Screen
        name={StackNav.MyAddress}
        component={StackRoute.MyAddress}
      />
      <Stack.Screen
        name={StackNav.AddNewAddress}
        component={StackRoute.AddNewAddress}
      />
      <Stack.Screen
        name={StackNav.MyPayment}
        component={StackRoute.MyPayment}
      />
      <Stack.Screen
        name={StackNav.AddNewCard}
        component={StackRoute.AddNewCard}
      />
      <Stack.Screen
        name={StackNav.HelpAndSupport}
        component={StackRoute.HelpAndSupport}
      />
      <Stack.Screen
        name={StackNav.Languages}
        component={StackRoute.Languages}
      />
      <Stack.Screen name={"ReasonsList"} component={ReasonsListScreen} />
      <Stack.Screen name={"IntensityWizard"} component={IntensityWizardScreen} />
      <Stack.Screen name={"Summary"} component={SummaryScreen} />
    </Stack.Navigator>
  );
}
