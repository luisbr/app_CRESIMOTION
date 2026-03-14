import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './types/StackNavigation';
import {DrawerProvider} from './DrawerContext';
import DrawerMenu from './DrawerMenu';

export default function AppNavigator() {
  return (
    <DrawerProvider>
      <NavigationContainer>
        <StackNavigation />
        <DrawerMenu />
      </NavigationContainer>
    </DrawerProvider>
  );
}
