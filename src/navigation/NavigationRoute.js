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

// tab screens
import HomeTab from '../container/home/HomeTab';
import CalenderTab from '../container/Calender/CalenderTab';
import ChatTab from '../container/Message/ChatTab';
import ProfileTab from '../container/profile/ProfileTab';

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
  ChatTab,
  ProfileTab,
};
