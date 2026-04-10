import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CText from './CText';
import {styles} from '../../theme';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {getSession, getSuscripcionActual, getMembresias} from '../../api/auth';
import {StackNav} from '../../navigation/NavigationKey';
import {getStoredNotifications} from '../../utils/notificationStorage';
import {useDrawer} from '../../navigation/DrawerContext';

// Importar badges de planes
import BadgeBasico from '../../assets/images/badges/CM_Badge__Basico.svg';
import BadgePlata from '../../assets/images/badges/CM_Badge__Plata.svg';
import BadgeOro from '../../assets/images/badges/CM_Badge__Oro.svg';
import BadgePlatinum from '../../assets/images/badges/CM_Badge__Platinum.svg';

interface CMainAppBarProps {
  mode?: 'main' | 'sub';
  title?: string;
  onPressBack?: () => void;
  containerStyle?: ViewStyle;
  hideBackButton?: boolean;
}

const CMainAppBar: React.FC<CMainAppBarProps> = ({
  mode = 'main',
  title,
  onPressBack,
  containerStyle,
  hideBackButton = false,
}) => {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const drawer = useDrawer();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkSessionAndNotifs = async () => {
        try {
          const session = await getSession();
          if (isActive) {
            if (session?.token) {
              setIsLoggedIn(true);
              const notifs = await getStoredNotifications();
              const hasNew = notifs.some(
                n => n.isNew && !n.isDeleted && !n.isArchived,
              );
              setHasNewNotifs(hasNew);
              // Obtener suscripción actual
              try {
                const subRes = await getSuscripcionActual();
                console.log('[CMainAppBar] Suscripción response:', subRes);
                if (subRes?.suscripcion?.membresia_nombre) {
                  setUserPlan(subRes.suscripcion.membresia_nombre);
                  console.log('[CMainAppBar] Plan set to:', subRes.suscripcion.membresia_nombre);
                } else if (subRes?.suscripcion?.nombre) {
                  setUserPlan(subRes.suscripcion.nombre);
                  console.log('[CMainAppBar] Plan set to (nombre):', subRes.suscripcion.nombre);
                } else if (subRes?.suscripcion?.membresia_id) {
                  // Buscar el nombre de la membresía
                  try {
                    const membresiasRes = await getMembresias();
                    console.log('[CMainAppBar] Membresias:', membresiasRes);
                    if (membresiasRes?.data) {
                      const membresia = membresiasRes.data.find(
                        m => String(m.id) === String(subRes.suscripcion.membresia_id)
                      );
                      if (membresia?.nombre) {
                        setUserPlan(membresia.nombre);
                        console.log('[CMainAppBar] Plan set from membresia:', membresia.nombre);
                      } else {
                        setUserPlan(null);
                        console.log('[CMainAppBar] No matching membresia found');
                      }
                    } else {
                      setUserPlan(null);
                    }
                  } catch (e) {
                    console.log('[CMainAppBar] Error getting membresias:', e);
                    setUserPlan(null);
                  }
                } else {
                  setUserPlan(null);
                  console.log('[CMainAppBar] No plan found');
                }
              } catch (e) {
                console.log('[CMainAppBar] Error getting subscription:', e);
                setUserPlan(null);
              }
            } else {
              setIsLoggedIn(false);
              setUserPlan(null);
            }
          }
        } catch (e) {
          if (isActive) {
            setIsLoggedIn(false);
          }
        }
      };
      checkSessionAndNotifs();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleProfilePress = () => {
    if (isLoggedIn) {
      navigation.navigate(StackNav.Profile);
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    }
  };

  const goBack = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      navigation.goBack();
    }
  };

  // Función para obtener el badge correspondiente al plan
  const getPlanBadgeComponent = (nombrePlan: string | null) => {
    if (!nombrePlan) return null;
    const nombre = nombrePlan.toLowerCase();
    if (nombre.includes('básic') || nombre.includes('basic')) {
      return BadgeBasico;
    } else if (nombre.includes('plata') || nombre.includes('silver')) {
      return BadgePlata;
    } else if (nombre.includes('oro') || nombre.includes('gold')) {
      return BadgeOro;
    } else if (nombre.includes('platinum') || nombre.includes('platino')) {
      return BadgePlatinum;
    }
    return null;
  };

  const PlanBadgeComponent = getPlanBadgeComponent(userPlan);

  return (
    <View style={[localStyles.headerContainer, containerStyle]}>
      {/* Left side */}
      <View style={[localStyles.leftHeader, { flex: mode === 'main' ? 1 : 0 }]}>
        {mode === 'main' ? (
          <TouchableOpacity
            style={localStyles.iconButton}
            onPress={() => drawer.open()}>
            <Ionicons name="menu-outline" size={26} color={colors.textColor} />
          </TouchableOpacity>
        ) : !hideBackButton ? (
          <TouchableOpacity style={localStyles.iconButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={26} color={colors.textColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center side */}
      <View style={[localStyles.centerHeader, { 
        flex: mode === 'main' ? 2 : 1,
        alignItems: mode === 'main' ? 'center' : 'flex-start' 
      }]}>
        {mode === 'main' ? (
          <TouchableOpacity
            onPress={() => navigation.navigate(StackNav.WelcomeEmotion)}>
            <Image
              source={require('../../../assets/logo.png')}
              style={localStyles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={{flex: 1, paddingRight: moderateScale(8)}}>
            <CText type="B18" color={colors.textColor} align="left" style={{flexWrap: 'wrap'}} numberOfLines={3}>
              {title}
            </CText>
          </View>
        )}
      </View>

      {/* Right side icons */}
      <View style={[localStyles.rightHeaderIcons, { flex: mode === 'main' ? 1 : 0 }]}>
        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={() => navigation.navigate(StackNav.WellnessNetwork)}>
          <View style={localStyles.iconWrapper}>
            <Ionicons name="call-outline" size={26} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={() =>
            isLoggedIn && navigation.navigate(StackNav.Notification)
          }>
          <View style={localStyles.iconWrapper}>
            <Ionicons
              name="notifications-outline"
              size={26}
              color={colors.primary}
            />
            {hasNewNotifs && <View style={localStyles.notifBadge} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={handleProfilePress}>
          <View style={localStyles.iconWrapper}>
            <Ionicons
              name="person-circle-outline"
              size={26}
              color={colors.primary}
            />
            {isLoggedIn && PlanBadgeComponent && (
              <PlanBadgeComponent 
                width={moderateScale(40)} 
                height={moderateScale(16)} 
                style={{marginTop: moderateScale(4)}} 
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CMainAppBar;

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E7EB',
    justifyContent: 'space-between',
  },
  leftHeader: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerHeader: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  rightHeaderIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: moderateScale(5),
  },
  iconButton: {
    padding: moderateScale(5),
    marginLeft: moderateScale(-5),
  },
  iconButtonRight: {
    padding: moderateScale(5),
    height: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  logo: {
    width: getWidth(140),
    height: getHeight(55),
  },
});
