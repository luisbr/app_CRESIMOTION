import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CHeader from '../../components/common/CHeader';
import { moderateScale } from '../../common/constants';
import { useDrawer } from '../../navigation/DrawerContext';
import { styles } from '../../theme';

export default function TherapyHeader() {
  const colors = useSelector((s: any) => s.theme.theme);
  const drawer = useDrawer();

  return (
    <CHeader
      isHideBack
      centerAccessory={
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: moderateScale(110), height: moderateScale(28) }}
          resizeMode="contain"
        />
      }
      isLeftIcon={
        <TouchableOpacity onPress={drawer.open} style={{ padding: 6 }}>
          <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
        </TouchableOpacity>
      }
      rightAccessory={
        <View style={[styles.rowStart, styles.g10]}>
          <TouchableOpacity style={{ width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
