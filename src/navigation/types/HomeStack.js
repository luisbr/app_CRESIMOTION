import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeTab from '../../container/home/HomeTab';
import ReasonsListScreen from '../../screens/forms/ReasonsListScreen';
import IntensityWizardScreen from '../../screens/forms/IntensityWizardScreen';
import SummaryScreen from '../../screens/forms/SummaryScreen';
import HealingStartScreen from '../../screens/forms/HealingStartScreen';

import HealingSelectMotivoScreen from '../../screens/forms/HealingSelectMotivoScreen';
import HealingSanacionScreen from '../../screens/forms/HealingSanacionScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeRoot" component={HomeTab} />
      <Stack.Screen name="ReasonsList" component={ReasonsListScreen} />
      <Stack.Screen name="IntensityWizard" component={IntensityWizardScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="HealingStart" component={HealingStartScreen} />
      <Stack.Screen name="HealingSelectMotivoScreen" component={HealingSelectMotivoScreen} />
      <Stack.Screen name="HealingSanacionScreen" component={HealingSanacionScreen} />
    </Stack.Navigator>
  );
}

