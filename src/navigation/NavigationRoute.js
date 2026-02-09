// Auth screens
import CreateNewPassword from '../container/auth/CreateNewPassword';
import ForgotPassword from '../container/auth/ForgotPassword';
import Login from '../container/auth/Login';
import OtpScreen from '../container/auth/OtpScreen';
import Register from '../container/auth/Register';
import Welcome from '../container/auth/Welcome';

// stack screens
import OnBoarding from '../container/OnBoarding';
import Splash from '../container/Splash';
import ThankYou from '../container/ThankYou';
import AuthNavigation from './types/AuthNavigation';
import TabNavigation from './types/TabNavigation';
import DoctorDetail from '../container/Calender/DoctorDetail';
import Appointment from '../container/Calender/Appointment';
import BookAppointment from '../container/Calender/BookAppointment';
import WaitingRoom from '../container/Calender/WaitingRoom';
import Chat from '../container/Message/Chat';
import VideoCall from '../container/Message/VideoCall';
import Notification from '../container/home/Notification';
import MyAddress from '../container/profile/MyAddress';
import AddNewAddress from '../container/profile/AddNewAddress';
import MyPayment from '../container/profile/MyPayment';
import AddNewCard from '../container/profile/AddNewCard';
import HelpAndSupport from '../container/profile/HelpAndSupport';
import Languages from '../container/profile/Languages';
// forms flow
import ReasonsListScreen from '../screens/forms/ReasonsListScreen';
import IntensityWizardScreen from '../screens/forms/IntensityWizardScreen';
import SummaryScreen from '../screens/forms/SummaryScreen';
import HealingStartScreen from '../screens/forms/HealingStartScreen';
import HealingSelectMotivoScreen from '../screens/forms/HealingSelectMotivoScreen';
import HealingSanacionScreen from '../screens/forms/HealingSanacionScreen';
import TherapyFlowRouter from '../screens/therapy/TherapyFlowRouter';
import SessionIntroScreen from '../screens/therapy/SessionIntroScreen';
import FocusSelectScreen from '../screens/therapy/FocusSelectScreen';
import FocusContentScreen from '../screens/therapy/FocusContentScreen';
import HealingSelectEmotionScreen from '../screens/therapy/HealingSelectEmotionScreen';
import HealingIntroScreen from '../screens/therapy/HealingIntroScreen';
import HealingPlaybackScreen from '../screens/therapy/HealingPlaybackScreen';
import HealingDoneScreen from '../screens/therapy/HealingDoneScreen';
import BehaviorIntroScreen from '../screens/therapy/BehaviorIntroScreen';
import BehaviorRecoSelectScreen from '../screens/therapy/BehaviorRecoSelectScreen';
import BehaviorExerciseSelectScreen from '../screens/therapy/BehaviorExerciseSelectScreen';
import AgendaSetupScreen from '../screens/therapy/AgendaSetupScreen';
import TasksScreen from '../screens/agenda/TasksScreen';
import TaskDetailScreen from '../screens/agenda/TaskDetailScreen';

// tab screens
import HomeTab from '../container/home/HomeTab';
import CalenderTab from '../container/Calender/CalenderTab';
import ProfileTab from '../container/profile/ProfileTab';
import DiagnosticoHistoryScreen from '../modules/diagnostico/screens/DiagnosticoHistoryScreen';

export const StackRoute = {
  Splash,
  OnBoarding,
  ThankYou,
  AuthNavigation,
  TabNavigation,
  DoctorDetail,
  Appointment,
  BookAppointment,
  WaitingRoom,
  Chat,
  VideoCall,
  Notification,
  MyAddress,
  AddNewAddress,
  MyPayment,
  AddNewCard,
  HelpAndSupport,
  Languages,
  // forms
  ReasonsListScreen,
  IntensityWizardScreen,
  SummaryScreen,
  HealingStartScreen,
  HealingSelectMotivoScreen,
  HealingSanacionScreen,
  TherapyFlowRouter,
  SessionIntroScreen,
  FocusSelectScreen,
  FocusContentScreen,
  HealingSelectEmotionScreen,
  HealingIntroScreen,
  HealingPlaybackScreen,
  HealingDoneScreen,
  BehaviorIntroScreen,
  BehaviorRecoSelectScreen,
  BehaviorExerciseSelectScreen,
  AgendaSetupScreen,
  TasksScreen,
  TaskDetailScreen,
};

export const AuthRoute = {
  Welcome,
  Login,
  Register,
  ForgotPassword,
  OtpScreen,
  CreateNewPassword,
};

export const TabRoute = {
  HomeTab,
  CalenderTab,
  EvaluationsTab: DiagnosticoHistoryScreen,
  ProfileTab,
};
