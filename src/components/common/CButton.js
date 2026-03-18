//Library Imports
import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionincons from 'react-native-vector-icons/Ionicons';

//Local Imports
import {moderateScale} from '../../common/constants';
import CText from './CText';
import {styles} from '../../theme';
import {useSelector} from 'react-redux';

export default function CButton({
  title,
  type,
  color,
  containerStyle,
  textStyle,
  style,
  bgColor,
  borderColor,
  frontIcon,
  icon,
  leftIconStyle,
  children,
  disabled = false,
  loading = false,
  arrowIcon = false,
  ...props
}) {
  const colors = useSelector(state => state.theme.theme);
  const isDisabled = disabled || loading;
  const resolvedTextColor = isDisabled ? colors.grayScale3 : (color ? color : colors.white);
  return (
    <TouchableOpacity
      style={[
        localStyle.btnContainer,
        containerStyle,
        {
          backgroundColor: !!bgColor ? bgColor : colors.primary,
          borderColor: !!borderColor ? borderColor : colors.primary,
        },
        isDisabled && {
          backgroundColor: colors.grayScale2,
          borderColor: colors.grayScale2,
        },
      ]}
      disabled={isDisabled}
      {...props}>
      {!!frontIcon && <View style={leftIconStyle}>{frontIcon}</View>}
      {loading && (
        <ActivityIndicator
          size={'small'}
          color={resolvedTextColor}
          style={title !== null && title !== undefined && title !== '' ? styles.mr10 : null}
        />
      )}
      {title !== null && title !== undefined && title !== '' && (
        <CText
          type={!!type ? type : 'B16'}
          style={textStyle}
          align={'center'}
          color={resolvedTextColor}>
          {title}
        </CText>
      )}
      {arrowIcon && (
        <Ionincons
          name={'arrow-forward-outline'}
          size={moderateScale(24)}
          style={styles.ml10}
          color={colors.white}
        />
      )}
      {icon}
      {children}

    </TouchableOpacity>
  );
}

const localStyle = StyleSheet.create({
  btnContainer: {
    ...styles.flexRow,
    ...styles.center,
    ...styles.mv10,
    borderRadius: moderateScale(20),
    borderWidth: moderateScale(1),
    height: moderateScale(48),
    ...styles.mt20,
  },
});
