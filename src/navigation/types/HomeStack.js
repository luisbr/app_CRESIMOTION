import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeTab from '../../container/home/HomeTab';
import ReasonsListScreen from '../../screens/forms/ReasonsListScreen';
import IntensityWizardScreen from '../../screens/forms/IntensityWizardScreen';
import SummaryScreen from '../../screens/forms/SummaryScreen';
import HealingStartScreen from '../../screens/forms/HealingStartScreen';

import HealingSelectMotivoScreen from '../../screens/forms/HealingSelectMotivoScreen';
import HealingSanacionScreen from '../../screens/forms/HealingSanacionScreen';
import TherapyFlowRouter from '../../screens/therapy/TherapyFlowRouter';
import SessionIntroScreen from '../../screens/therapy/SessionIntroScreen';
import FocusSelectScreen from '../../screens/therapy/FocusSelectScreen';
import FocusContentScreen from '../../screens/therapy/FocusContentScreen';
import HealingSelectEmotionScreen from '../../screens/therapy/HealingSelectEmotionScreen';
import HealingIntroScreen from '../../screens/therapy/HealingIntroScreen';
import HealingPlaybackScreen from '../../screens/therapy/HealingPlaybackScreen';
import HealingDoneScreen from '../../screens/therapy/HealingDoneScreen';
import BehaviorIntroScreen from '../../screens/therapy/BehaviorIntroScreen';
import BehaviorRecoSelectScreen from '../../screens/therapy/BehaviorRecoSelectScreen';
import BehaviorExerciseSelectScreen from '../../screens/therapy/BehaviorExerciseSelectScreen';
import AgendaSetupScreen from '../../screens/therapy/AgendaSetupScreen';
import TherapyPendingSessionsScreen from '../../screens/therapy/TherapyPendingSessionsScreen';
import TasksScreen from '../../screens/agenda/TasksScreen';
import TaskDetailScreen from '../../screens/agenda/TaskDetailScreen';
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
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="DiagnosticoHome">
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
      <Stack.Screen name="TherapyFlowRouter" component={TherapyFlowRouter} />
      <Stack.Screen name="TherapySessionIntro" component={SessionIntroScreen} />
      <Stack.Screen name="TherapyFocusSelect" component={FocusSelectScreen} />
      <Stack.Screen name="TherapyFocusContent" component={FocusContentScreen} />
      <Stack.Screen name="TherapyHealingSelectEmotion" component={HealingSelectEmotionScreen} />
      <Stack.Screen name="TherapyHealingIntro" component={HealingIntroScreen} />
      <Stack.Screen name="TherapyHealingPlayback" component={HealingPlaybackScreen} />
      <Stack.Screen name="TherapyHealingDone" component={HealingDoneScreen} />
      <Stack.Screen name="TherapyBehaviorIntro" component={BehaviorIntroScreen} />
      <Stack.Screen name="TherapyBehaviorRecoSelect" component={BehaviorRecoSelectScreen} />
      <Stack.Screen name="TherapyBehaviorExerciseSelect" component={BehaviorExerciseSelectScreen} />
      <Stack.Screen name="TherapyPendingSessions" component={TherapyPendingSessionsScreen} />
      <Stack.Screen name="TherapyAgendaSetup" component={AgendaSetupScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}
