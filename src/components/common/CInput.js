import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {getHeight, moderateScale} from '../../common/constants';
import CText from './CText';
import {styles} from '../../theme';
import typography from '../../theme/typography';
import {useSelector} from 'react-redux';

export default CInput = props => {
  let {
    _value,
    label,
    bgColor,
    inputContainerStyle,
    inputBoxStyle,
    toGetTextFieldValue,
    placeHolder,
    keyBoardType,
    _onFocus,
    _onBlur,
    _errorText,
    _autoFocus,
    _maxLength,
    _editable = true,
    autoCapitalize,
    required = false,
    labelStyle,
    multiline,
    errorStyle,
    fieldRef,
    isSecure,
    textColor,
    labelTextColor,
    rightAccessory,
    typeText,
    insideLeftIcon,
    showError = true,
  } = props;

  const [isSecurePass, setIsSecurePass] = useState(isSecure);

  // Change Text Input Value
  const onChangeText = val => {
    toGetTextFieldValue(val);
  };
  const onPressSecureIcon = () => {
    setIsSecurePass(!isSecurePass);
  };

  const colors = useSelector(state => state.theme.theme);

  return (
    <View style={styles.mv10}>
      {label && (
        <View style={[localStyle.labelContainer, labelStyle]}>
          <View style={styles.flexRow}>
            <CText
              style={localStyle.labelText}
              color={labelTextColor ? labelTextColor : colors.labelColor}
              type={typeText ? typeText : 'M14'}>
              {label}
            </CText>
            {required && (
              <CText style={{color: colors.alertColor}}>{' *'}</CText>
            )}
          </View>
        </View>
      )}
      <View
        style={[
          localStyle.inputContainer,
          {
            borderColor: _errorText
              ? colors.alertColor
              : bgColor
              ? bgColor
              : colors.inputBg,
            height: multiline ? getHeight(130) : getHeight(52),
            backgroundColor: bgColor ? bgColor : colors.inputBg,
          },
          inputContainerStyle,
        ]}>
        {insideLeftIcon ? <View>{insideLeftIcon()}</View> : null}
        <TextInput
          ref={fieldRef}
          secureTextEntry={isSecurePass}
          value={_value}
          maxLength={_maxLength}
          defaultValue={_value}
          autoFocus={_autoFocus}
          autoCorrect={false}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={colors.grayScale1}
          onChangeText={onChangeText}
          keyboardType={keyBoardType}
          multiline={multiline}
          editable={_editable}
          onFocus={_onFocus}
          onBlur={_onBlur}
          placeholder={placeHolder}
          style={[
            localStyle.inputBox,
            {color: textColor ? textColor : colors.textColor},
            {
              height: multiline ? getHeight(75) : getHeight(48),
            },
            inputBoxStyle,
            _editable == false && {color: colors.white},
          ]}
          {...props}
        />
        {/* Right Icon And Content Inside TextInput */}
        {rightAccessory ? (
          <View style={[styles.mr15]}>{rightAccessory()}</View>
        ) : null}
        {!!isSecure && (
          <TouchableOpacity onPress={onPressSecureIcon}>
            <Ionicons
              name={!isSecurePass ? 'eye-outline' : 'eye-off-outline'}
              size={moderateScale(20)}
              color={colors.grayScale1}
              style={styles.mr10}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* Error Text Message Of Input */}
      {_errorText && _errorText != '' ? (
        <CText
          style={{
            ...localStyle.errorText,
            ...errorStyle,
            color: colors.alertColor,
          }}>
          {_errorText}
        </CText>
      ) : null}

      {_maxLength && showError && _value?.length > _maxLength ? (
        <CText style={{...localStyle.errorText, ...errorStyle}}>
          It should be maximum {_maxLength} character
        </CText>
      ) : null}
    </View>
  );
};

const localStyle = StyleSheet.create({
  labelText: {
    textAlign: 'left',
    opacity: 0.9,
    ...styles.ml5,
  },
  inputBox: {
    ...typography.fontSizes.f16,
    ...typography.fontWeights.Medium,
    ...styles.ph10,
    ...styles.flex,
    borderRadius: moderateScale(24),
    ...styles.selfCenter,
    width: '100%',
  },
  inputContainer: {
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(24),
    ...styles.mt5,
    ...styles.selfCenter,
    ...styles.rowStart,
    ...styles.justifyBetween,
    ...styles.ph15,
    width: '100%',
  },
  labelContainer: {
    ...styles.rowSpaceBetween,
    ...styles.mv5,
  },
  errorText: {
    ...typography.fontSizes.f12,
    ...styles.mt5,
    ...styles.ml5,
  },
});
