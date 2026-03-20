import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNav, AuthNav} from './NavigationKey';
import {ON_BOARDING} from '../common/constants';
import {hasValidSession} from '../api/auth';

const PUBLIC_ROUTES = new Set([
  StackNav.Splash,
  StackNav.OnBoarding,
  StackNav.ThankYou,
  StackNav.AuthNavigation,
  StackNav.WelcomeEmotion,
  StackNav.About,
  StackNav.AboutDetail,
  StackNav.WellnessNetwork,
  AuthNav.Welcome,
  AuthNav.Login,
  AuthNav.Register,
  AuthNav.ForgotPassword,
  AuthNav.OtpScreen,
  AuthNav.CreateNewPassword,
]);

export const isProtectedRoute = (routeName) => !PUBLIC_ROUTES.has(routeName);

export const resolveUnauthenticatedRoute = async () => {
  const onBoarding = await AsyncStorage.getItem(ON_BOARDING);
  return onBoarding ? StackNav.WelcomeEmotion : StackNav.OnBoarding;
};

export const shouldRedirectUnauthenticatedRoute = async (routeName) => {
  if (!routeName || !isProtectedRoute(routeName)) {
    return false;
  }
  return !(await hasValidSession());
};
