import {StatusBar, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import AppNavigator from './navigation';
import {styles} from './theme';

const App = () => {
  const colors = useSelector(state => state.theme.theme);

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={'#0aa693'}  />
      <AppNavigator />
    </View>
  );
};

export default App;
