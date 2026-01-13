import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import {moderateScale} from '../../../common/constants';
import type {CatalogBehavior} from '../types';
import images from '../../../assets/images';

type Props = {
  behavior?: CatalogBehavior | null;
};

const styleMap: Record<string, {bg: string; border: string; icon: string}> = {
  warning: {bg: '#FFF7E6', border: '#F6C46A', icon: 'warning-outline'},
  info: {bg: '#E7F3FF', border: '#7BB6F5', icon: 'information-circle-outline'},
  info_blue: {bg: '#E7F1FF', border: '#6EA8FF', icon: 'information-circle-outline'},
  success: {bg: '#E8F6EF', border: '#6BCB77', icon: 'checkmark-circle-outline'},
  danger: {bg: '#FDECEC', border: '#F28B82', icon: 'close-circle-outline'},
};

const resolveStyle = (styleKey?: string, iconKey?: string) => {
  const key = String(styleKey || iconKey || 'info').toLowerCase();
  if (styleMap[key]) return styleMap[key];
  if (key.includes('warning') || key.includes('alert')) return styleMap.warning;
  if (key.includes('blue') || key.includes('info')) return styleMap.info_blue;
  if (key.includes('success')) return styleMap.success;
  if (key.includes('danger') || key.includes('error')) return styleMap.danger;
  return styleMap.info;
};

const resolveIcon = (styleKey?: string, iconKey?: string) => {
  const cleanIconKey = String(iconKey || '').trim().toLowerCase();
  if (cleanIconKey) {
    if (cleanIconKey.includes('alert') || cleanIconKey.includes('warning')) {
      return {type: 'ion', name: 'warning-outline'};
    }
    if (cleanIconKey.includes('info')) {
      return {type: 'ion', name: 'information-circle-outline'};
    }
    return {type: 'ion', name: 'information-circle-outline'};
  }
  const style = String(styleKey || '').toLowerCase();
  if (style === 'info_blue' && images?.SerenityIcon) {
    return {type: 'image', source: images.SerenityIcon};
  }
  const fallback = resolveStyle(styleKey, iconKey);
  return {type: 'ion', name: fallback.icon};
};

export default function BehaviorMessageCard({behavior}: Props) {
  const colors = useSelector(state => state.theme.theme);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: behavior ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [anim, behavior]);

  if (!behavior?.text_below) return null;
  const stylesFor = resolveStyle(behavior.text_style, behavior.icon_key);
  const icon = resolveIcon(behavior.text_style, behavior.icon_key);
  return (
    <Animated.View
      accessibilityRole="alert"
      style={[
        localStyles.card,
        {
          backgroundColor: stylesFor.bg,
          borderColor: stylesFor.border,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [6, 0],
              }),
            },
          ],
        },
      ]}
    >
      {icon.type === 'image' ? (
        <View style={localStyles.mediaRow}>
          <Image source={icon.source} style={localStyles.imageIconLarge} resizeMode="contain" />
          <View style={localStyles.textColumn}>
            <CText type={'S14'} color={colors.textColor}>
              {behavior.text_below}
            </CText>
          </View>
        </View>
      ) : (
        <>
          <Ionicons
            name={icon.name}
            size={moderateScale(20)}
            color={colors.textColor}
            style={localStyles.icon}
          />
          <View style={styles.flex}>
            <CText type={'S14'} color={colors.textColor}>
              {behavior.text_below}
            </CText>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const localStyles = StyleSheet.create({
  card: {
    ...styles.p15,
    ...styles.mt10,
    ...styles.rowStart,
    borderWidth: 1,
    borderRadius: moderateScale(12),
  },
  icon: {
    marginRight: moderateScale(10),
  },
  imageIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: moderateScale(10),
  },
  imageIconLarge: {
    width: '30%',
    maxWidth: moderateScale(96),
    height: undefined,
    aspectRatio: 1,
    marginRight: moderateScale(12),
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textColumn: {
    flex: 1,
  },
});
