import {StatusBar, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import AppNavigator from './navigation';
import {styles} from './theme';
import {usePushNotifications} from './hooks/usePushNotifications';
import {savePushToken, getSession} from './api/auth';

const App = () => {
  const colors = useSelector(state => state.theme.theme);
  const { expoPushToken } = usePushNotifications();

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
