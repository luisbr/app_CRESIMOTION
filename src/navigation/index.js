import React from 'react';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import StackNavigation from './types/StackNavigation';
import {DrawerProvider} from './DrawerContext';
import {DiagnosticoFlowProvider} from './DiagnosticoFlowContext';
import DrawerMenu from './DrawerMenu';
import {releaseNavigationLock} from './safeNavigation';
import {resolveUnauthenticatedRoute, shouldRedirectUnauthenticatedRoute} from './authGuard';

const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const redirectingRef = React.useRef(false);

  const handleNavigationStateChange = React.useCallback(async () => {
    releaseNavigationLock();
    if (redirectingRef.current || !navigationRef.isReady()) {
      return;
    }

    const route = navigationRef.getCurrentRoute();
    const routeName = route?.name || null;
    if (!(await shouldRedirectUnauthenticatedRoute(routeName))) {
      return;
    }

    redirectingRef.current = true;
    try {
      const fallbackRoute = await resolveUnauthenticatedRoute();
      navigationRef.reset({
        index: 0,
        routes: [{name: fallbackRoute}],
      });
    } finally {
      setTimeout(() => {
        redirectingRef.current = false;
      }, 0);
    }
  }, []);

  return (
    <DrawerProvider>
      <DiagnosticoFlowProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={handleNavigationStateChange}
          onStateChange={handleNavigationStateChange}>
          <StackNavigation />
          <DrawerMenu />
        </NavigationContainer>
      </DiagnosticoFlowProvider>
    </DrawerProvider>
  );
}
