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
import {SvgXml} from 'react-native-svg';

import CText from './CText';
import {styles} from '../../theme';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {getSession, getSuscripcionActual, getMembresias} from '../../api/auth';
import {StackNav} from '../../navigation/NavigationKey';
import {getStoredNotifications} from '../../utils/notificationStorage';
import {useDrawer} from '../../navigation/DrawerContext';

// SVG strings for badges (cross-platform compatible) - Inline colors for react-native-svg
const BADGE_SVG_XML = {
  basico: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.4 11.12">
    <rect fill="#fff" stroke="#09a692" stroke-width="0.75" x="0.37" y="0.37" width="29.65" height="10.37" rx="5.18"/>
    <text fill="#324b6c" font-family="SFPro-Bold, 'SF Pro'" font-size="4.92" font-weight="700" transform="translate(11.59 7.27)">Básico</text>
    <g>
      <path fill="#d0eadb" d="M4.12,3.44s0,0,0-.01c.1-.18.29-.28.49-.28h4.64c.2,0,.39.11.49.28l.71-.39c-.25-.43-.69-.69-1.19-.69h-4.64c-.5,0-.94.26-1.19.69l.71.39Z"/>
      <path fill="#80cbad" d="M3.43,4.41l1.11,1.93,1.21,2.1c.25.43.69.69,1.19.69v-.81c-.2,0-.39-.11-.49-.28l-1.2-2.08-1.12-1.94c-.1-.17-.1-.38,0-.56l-.71-.39c-.24.43-.23.93.01,1.35Z"/>
      <path fill="#22b276" d="M8.14,8.43l1.21-2.09,1.12-1.93c.25-.43.25-.93.01-1.36l-.71.39c.1.18.1.39,0,.56l-1.12,1.94-1.2,2.08c-.09.16-.25.26-.43.28v.81c.47-.02.9-.27,1.13-.69Z"/>
    </g>
  </svg>`,
  plata: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.45 11.12">
    <rect fill="#fff" stroke="#09a692" stroke-width="0.75" x="0.37" y="0.38" width="26.7" height="10.37" rx="5.18"/>
    <text fill="#324b6c" font-family="SFPro-Bold, 'SF Pro'" font-size="4.92" font-weight="700" transform="translate(11.59 7.27)">Plata</text>
    <g>
      <path fill="#d6dbd8" d="M4.08,3.67c.1-.18.29-.28.49-.28h4.64c.2,0,.39.11.49.28l.71-.39c-.25-.43-.69-.69-1.19-.69h-4.64c-.5,0-.94.26-1.19.69l.71.39Z"/>
      <path fill="#b7bcb6" d="M3.39,4.63l1.11,1.93,1.21,2.1c.25.43.69.69,1.19.69v-.81c-.2,0-.39-.11-.49-.28l-1.2-2.08-1.12-1.94c-.1-.17-.1-.38,0-.56l-.71-.39c-.24.43-.23.93.01,1.35Z"/>
      <path fill="#606161" d="M8.1,8.65l1.21-2.09,1.12-1.93c.25-.43.25-.93.01-1.36l-.71.39c.1.18.1.39,0,.56l-1.12,1.94-1.2,2.08c-.09.16-.25.26-.43.28v.81c.47-.02.9-.27,1.13-.69Z"/>
    </g>
  </svg>`,
  oro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.16 11.12">
    <rect fill="#fff" stroke="#09a692" stroke-width="0.75" x="0.37" y="0.38" width="23.41" height="10.37" rx="5.18"/>
    <text fill="#324b6c" font-family="SFPro-Bold, 'SF Pro'" font-size="4.92" font-weight="700" transform="translate(11.59 7.27)">Oro</text>
    <g>
      <path fill="#ffd068" d="M4.08,3.51c.1-.18.29-.28.49-.28h4.64c.2,0,.39.11.49.28l.71-.39c-.25-.43-.69-.69-1.19-.69h-4.64c-.5,0-.94.26-1.19.69l.71.39Z"/>
      <path fill="#febf19" d="M3.39,4.47l1.11,1.93,1.21,2.1c.25.43.69.69,1.19.69v-.81c-.2,0-.39-.11-.49-.28l-1.2-2.08-1.12-1.94c-.1-.17-.1-.38,0-.56l-.71-.39c-.24.43-.23.93.01,1.35Z"/>
      <path fill="#ecaf24" d="M8.09,8.5l1.21-2.09,1.12-1.93c.25-.43.25-.93.01-1.36l-.71.39c.1.18.1.39,0,.56l-1.12,1.94-1.2,2.08c-.09.16-.25.26-.43.28v.81c.47-.02.9-.27,1.13-.69Z"/>
    </g>
  </svg>`,
  platinum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34.94 11.12">
    <rect fill="#fff" stroke="#09a692" stroke-width="0.75" x="0.37" y="0.38" width="34.19" height="10.37" rx="5.18"/>
    <text fill="#324b6c" font-family="SFPro-Bold, 'SF Pro'" font-size="4.92" font-weight="700" transform="translate(11.59 7.27)">Platinum</text>
    <g>
      <path fill="#daebf9" d="M4.1,3.27c.1-.18.29-.28.49-.28h4.64c.2,0,.39.11.49.28l.71-.39c-.25-.43-.69-.69-1.19-.69h-4.64c-.5,0-.94.26-1.19.69l.71.39Z"/>
      <path fill="#b6d4ef" d="M3.4,4.24l1.11,1.93,1.21,2.1c.25.43.69.69,1.19.69v-.81c-.2,0-.39-.11-.49-.28l-1.2-2.08-1.12-1.94c-.1-.17-.1-.38,0-.56l-.71-.39c-.24.43-.23.93.01,1.35Z"/>
      <path fill="#8abae4" d="M8.11,8.26l1.21-2.09,1.12-1.93c.25-.43.25-.93.01-1.36l-.71.39c.1.18.1.39,0,.56l-1.12,1.94-1.2,2.08c-.09.16-.25.26-.43.28v.81c.47-.02.9-.27,1.13-.69Z"/>
    </g>
  </svg>`,
};

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

  // Función para obtener el badge SVG correspondiente al plan
  const getPlanBadgeXml = (nombrePlan: string | null): string | null => {
    if (!nombrePlan) return null;
    const nombre = nombrePlan.toLowerCase();
    if (nombre.includes('básic') || nombre.includes('basic')) {
      return BADGE_SVG_XML.basico;
    } else if (nombre.includes('plata') || nombre.includes('silver')) {
      return BADGE_SVG_XML.plata;
    } else if (nombre.includes('oro') || nombre.includes('gold')) {
      return BADGE_SVG_XML.oro;
    } else if (nombre.includes('platinum') || nombre.includes('platino')) {
      return BADGE_SVG_XML.platinum;
    }
    return null;
  };

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
            {isLoggedIn && userPlan && getPlanBadgeXml(userPlan) && (
              <View style={{marginTop: moderateScale(4)}}>
                <SvgXml
                  xml={getPlanBadgeXml(userPlan)!}
                  width={moderateScale(40)}
                  height={moderateScale(16)}
                />
              </View>
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
