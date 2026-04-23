import {StatusBar, View} from 'react-native';
import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppNavigator from './navigation';
import {styles} from './theme';
import {usePushNotifications} from './hooks/usePushNotifications';
import {savePushToken, getSession, getProfile} from './api/auth';
import {StackNav} from './navigation/NavigationKey';
import {setProfilePreferences} from './redux/action/profileAction';

const App = () => {
  const colors = useSelector(state => state.theme.theme);
  const dispatch = useDispatch();

  const handleNotificationTap = React.useCallback((tapData) => {
    if (tapData.tipo && tapData.tipo.startsWith('apoyo_financiero_')) {
      dispatch({
        type: 'SET_PENDING_NAVIGATION',
        payload: {
          screen: StackNav.ApoyoFinanciero,
          params: {},
        },
      });
    }
  }, [dispatch]);

  const preferences = useSelector(state => state.profile?.preferences);
  
  const { expoPushToken } = usePushNotifications(handleNotificationTap);
  
  // Sync preferences to global for access outside of React components
  React.useEffect(() => {
    if (preferences) {
      global.__PROFILE_PREFERENCES__ = preferences;
    }
  }, [preferences]);
  
  // Load profile preferences on startup
  React.useEffect(() => {
    const loadPrefs = async () => {
      try {
        const resp = await getProfile();
        if (resp?.success && resp.perfil) {
          const loadedPrefs = {
            notificaciones_correo: parseInt(resp.perfil.notificaciones_correo ?? 1),
            notificaciones_push: parseInt(resp.perfil.notificaciones_push ?? 1),
            descarga_wifi: parseInt(resp.perfil.descarga_wifi ?? 1),
            accesibilidad_fuente: resp.perfil.accesibilidad_fuente || 'mediano',
            accesibilidad_contraste: resp.perfil.accesibilidad_contraste || 'estandar',
            idioma: resp.perfil.idioma || 'es',
          };
          dispatch(setProfilePreferences(loadedPrefs));
          global.__PROFILE_PREFERENCES__ = loadedPrefs;
        }
      } catch (e) {
        console.log('Error loading profile preferences on startup', e);
      }
    };
    loadPrefs();
  }, [dispatch]);

  React.useEffect(() => {
    const sendToken = async () => {
      if (expoPushToken) {
        const session = await getSession();
        if (session && session.token) {
          // Only register push token if user has enabled push notifications
          const pushEnabled = preferences?.notificaciones_push !== 0;
          if (pushEnabled) {
            try {
              await savePushToken(expoPushToken);
            } catch (e) {
              console.log('Failed to save push token on startup', e);
            }
          } else {
            console.log('[PUSH] Push notifications disabled by user preference, not registering token');
          }
        }
      }
    };
    sendToken();
  }, [expoPushToken, preferences]);

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={'#0aa693'}  />
      <AppNavigator />
    </View>
  );
};

export default App;
