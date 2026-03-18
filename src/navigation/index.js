import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './types/StackNavigation';
import {DrawerProvider} from './DrawerContext';
import DrawerMenu from './DrawerMenu';
import {releaseNavigationLock} from './safeNavigation';

export default function AppNavigator() {
  return (
    <DrawerProvider>
      <NavigationContainer onReady={releaseNavigationLock} onStateChange={releaseNavigationLock}>
        <StackNavigation />
        <DrawerMenu />
      </NavigationContainer>
    </DrawerProvider>
  );
}
