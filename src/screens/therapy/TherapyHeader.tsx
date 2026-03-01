import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CHeader from '../../components/common/CHeader';
import { moderateScale } from '../../common/constants';
import { useDrawer } from '../../navigation/DrawerContext';
import { styles } from '../../theme';

type TherapyHeaderProps = {
  disabled?: boolean;
};

export default function TherapyHeader({ disabled = false }: TherapyHeaderProps) {
  const colors = useSelector((s: any) => s.theme.theme);
  const drawer = useDrawer();

  return (
    <CHeader
      isHideBack
      centerAccessory={
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: moderateScale(110), height: moderateScale(50) }}
          resizeMode="contain"
        />
      }
      isLeftIcon={
        <TouchableOpacity
          onPress={disabled ? undefined : drawer.open}
          disabled={disabled}
          style={{ padding: 6, opacity: disabled ? 0.5 : 1 }}
        >
          <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
        </TouchableOpacity>
      }
      rightAccessory={
        <View style={[styles.rowStart, styles.g10, { opacity: disabled ? 0.5 : 1 }]}>
          <TouchableOpacity
            disabled={disabled}
            style={{ width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            style={{ width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
