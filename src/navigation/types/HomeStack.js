import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeTab from '../../container/home/HomeTab';
import ReasonsListScreen from '../../screens/forms/ReasonsListScreen';
import IntensityWizardScreen from '../../screens/forms/IntensityWizardScreen';
import SummaryScreen from '../../screens/forms/SummaryScreen';
import HealingStartScreen from '../../screens/forms/HealingStartScreen';

import HealingSelectMotivoScreen from '../../screens/forms/HealingSelectMotivoScreen';
import HealingSanacionScreen from '../../screens/forms/HealingSanacionScreen';
import DiagnosticoHomeScreen from '../../modules/diagnostico/screens/DiagnosticoHomeScreen';
import DiagnosticoSelectionScreen from '../../modules/diagnostico/screens/DiagnosticoSelectionScreen';
import DiagnosticoWizardScreen from '../../modules/diagnostico/screens/DiagnosticoWizardScreen';
import DiagnosticoResultsScreen from '../../modules/diagnostico/screens/DiagnosticoResultsScreen';
import DiagnosticoHistoryScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryScreen';
import DiagnosticoHistoryDetailScreen from '../../modules/diagnostico/screens/DiagnosticoHistoryDetailScreen';
import SupportResourcesScreen from '../../modules/diagnostico/screens/SupportResourcesScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeRoot" component={HomeTab} />
      <Stack.Screen name="DiagnosticoHome" component={DiagnosticoHomeScreen} />
      <Stack.Screen name="DiagnosticoSelection" component={DiagnosticoSelectionScreen} />
      <Stack.Screen name="DiagnosticoWizard" component={DiagnosticoWizardScreen} />
      <Stack.Screen name="DiagnosticoResults" component={DiagnosticoResultsScreen} />
      <Stack.Screen name="DiagnosticoHistory" component={DiagnosticoHistoryScreen} />
      <Stack.Screen name="DiagnosticoHistoryDetail" component={DiagnosticoHistoryDetailScreen} />
      <Stack.Screen name="SupportResources" component={SupportResourcesScreen} />
      <Stack.Screen name="ReasonsList" component={ReasonsListScreen} />
      <Stack.Screen name="IntensityWizard" component={IntensityWizardScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="HealingStart" component={HealingStartScreen} />
      <Stack.Screen name="HealingSelectMotivoScreen" component={HealingSelectMotivoScreen} />
      <Stack.Screen name="HealingSanacionScreen" component={HealingSanacionScreen} />
    </Stack.Navigator>
  );
}
