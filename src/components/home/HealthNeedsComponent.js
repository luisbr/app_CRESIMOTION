import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import CText from '../common/CText';
import strings from '../../i18n/strings';

export default function HealthNeedsComponent({item, onPress}) {
  const colors = useSelector(state => state.theme.theme);
  return (
    <TouchableOpacity
      style={localStyles.mainContainer}
      onPress={item.title === strings.more ? onPress : null}>
      <View
        style={[
          localStyles.iconContainer,
          {
            backgroundColor: colors.inputBg,
          },
        ]}>
        {item.icon}
      </View>
      <CText type={'S12'} color={colors.labelColor}>
        {item.title}
      </CText>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.center,
    ...styles.g12,
  },
  iconContainer: {
    height: moderateScale(64),
    width: moderateScale(64),
    borderRadius: moderateScale(64 / 2),
    ...styles.center,
  },
});
