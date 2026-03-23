import {StatusBar, View} from 'react-native';
import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppNavigator from './navigation';
import {styles} from './theme';
import {usePushNotifications} from './hooks/usePushNotifications';
import {useAgendaNotifications} from './hooks/useAgendaNotifications';
import {savePushToken, getSession} from './api/auth';
import {StackNav} from './navigation/NavigationKey';

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

  const { expoPushToken } = usePushNotifications(handleNotificationTap);
  useAgendaNotifications(); // sync local notifications from agenda

  React.useEffect(() => {
    const sendToken = async () => {
      if (expoPushToken) {
        const session = await getSession();
        if (session && session.token) {
          try {
            await savePushToken(expoPushToken);
          } catch (e) {
            console.log('Failed to save push token on startup', e);
          }
        }
      }
    };
    sendToken();
  }, [expoPushToken]);

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={'#0aa693'}  />
      <AppNavigator />
    </View>
  );
};

export default App;
