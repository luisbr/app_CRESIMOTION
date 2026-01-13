import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo} from 'react';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Custom Imports
import CText from './CText';
import {styles} from '../../theme';
import {useSelector} from 'react-redux';
import CDivider from './CDivider';
import {moderateScale} from '../../common/constants';

const CHeader = props => {
  const {
    title,
    onPressBack,
    rightIcon,
    isHideBack,
    isLeftIcon,
    arrowColor,
    textColor,
    textStyle,
    centerAccessory,
    desc,
    type,
    arrowBgColor,
    arrowBorderColor,
    containerStyle,
    iconBgStyle,
    onPressClose,
    rightAccessory,
    arrowBackground,
    borderColor,
  } = props;
  const navigation = useNavigation();

  const colors = useSelector(state => state.theme.theme);

  const goBack = () => navigation.goBack();
  const RightIcon = () => {
    return (
      <TouchableOpacity onPress={onPressClose || goBack}></TouchableOpacity>
    );
  };
  return (
    <View style={styles.mt5}>
      <View
        style={[
          localStyles.container,
          !!isHideBack && styles.pr10,
          containerStyle,
        ]}>
        <View style={[styles.rowSpaceBetween, styles.flex]}>
          <View>
            {!isHideBack && (
              <TouchableOpacity
                style={[
                  localStyles.iconBg,
                  iconBgStyle,
                  {
                    backgroundColor: arrowBgColor
                      ? colors.primary2
                      : arrowBackground
                      ? arrowBackground
                      : colors.backgroundColor,
                    borderColor: borderColor
                      ? borderColor
                      : arrowBorderColor
                      ? colors.primary2
                      : colors.dark
                      ? colors.dividerColor
                      : colors.borderColor,
                  },
                ]}
                onPress={onPressBack || goBack}>
                <Ionicons
                  name={'arrow-back'}
                  color={arrowColor ? arrowColor : colors.textColor}
                  size={moderateScale(24)}
                />
              </TouchableOpacity>
            )}
          </View>
          {!!isLeftIcon && isLeftIcon}
          {centerAccessory ? (
            <View>{centerAccessory}</View>
          ) : (
            <View>
              <CText
                numberOfLines={1}
                style={[textStyle ? textStyle : styles.mr40]}
                align={'center'}
                color={textColor ? textColor : colors.black}
                type={type ? type : 'B18'}>
                {title}
              </CText>
            </View>
          )}
          <View>{!!rightIcon ? <RightIcon /> : rightAccessory}</View>
        </View>
      </View>
    </View>
  );
};

export default memo(CHeader);

const localStyles = StyleSheet.create({
  container: {
    ...styles.rowSpaceBetween,
    ...styles.ph25,
    ...styles.pt15,
  },
  iconBg: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: moderateScale(1),
    ...styles.center,
  },
});
