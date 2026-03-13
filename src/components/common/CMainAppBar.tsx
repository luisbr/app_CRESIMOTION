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
import {getSession} from '../../api/auth';
import {StackNav} from '../../navigation/NavigationKey';
import {getStoredNotifications} from '../../utils/notificationStorage';
import {useDrawer} from '../../navigation/DrawerContext';

interface CMainAppBarProps {
  mode?: 'main' | 'sub';
  title?: string;
  onPressBack?: () => void;
  containerStyle?: ViewStyle;
}

const CMainAppBar: React.FC<CMainAppBarProps> = ({
  mode = 'main',
  title,
  onPressBack,
  containerStyle,
}) => {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const drawer = useDrawer();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);

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
            } else {
              setIsLoggedIn(false);
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

  return (
    <View style={[localStyles.headerContainer, containerStyle]}>
      {/* Left side */}
      <View style={localStyles.leftHeader}>
        {mode === 'main' ? (
          <TouchableOpacity
            style={localStyles.iconButton}
            onPress={() => drawer.open()}>
            <Ionicons name="menu-outline" size={26} color={colors.textColor} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={localStyles.iconButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={26} color={colors.textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center side */}
      <View style={localStyles.centerHeader}>
        {mode === 'main' ? (
          <TouchableOpacity
            onPress={() => isLoggedIn && navigation.navigate(StackNav.Subscription)}>
            <Image
              source={require('../../../assets/logo.png')}
              style={localStyles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <CText type="B18" color={colors.textColor} numberOfLines={1} style={null} align="center">
            {title}
          </CText>
        )}
      </View>

      {/* Right side icons */}
      <View style={localStyles.rightHeaderIcons}>
        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={() =>
            isLoggedIn && navigation.navigate(StackNav.WellnessNetwork)
          }>
          <Ionicons name="call-outline" size={26} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={() =>
            isLoggedIn && navigation.navigate(StackNav.Notification)
          }>
          <Ionicons
            name="notifications-outline"
            size={26}
            color={colors.primary}
          />
          {hasNewNotifs && <View style={localStyles.notifBadge} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.iconButtonRight}
          onPress={handleProfilePress}>
          <Ionicons
            name="person-circle-outline"
            size={26}
            color={colors.primary}
          />
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
    flex: 1,
    alignItems: 'flex-start',
  },
  centerHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  rightHeaderIcons: {
    flex: 1,
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
    width: getWidth(100),
    height: getHeight(40),
  },
});
