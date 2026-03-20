import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import DiagnosticoHistoryScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryScreen';
import DiagnosticoHistoryDetailScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryDetailScreen';

const Stack = createStackNavigator();

export default function EvaluationsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="DiagnosticoHistory"
        component={DiagnosticoHistoryScreen}
      />
      <Stack.Screen
        name="DiagnosticoHistoryDetail"
        component={DiagnosticoHistoryDetailScreen}
      />
    </Stack.Navigator>
  );
}
