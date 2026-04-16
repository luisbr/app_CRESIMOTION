import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Dropdown} from 'react-native-element-dropdown';

// custom imports
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import typography from '../../theme/typography';
import CText from './CText';

export default function CDropdown(props) {
  const colors = useSelector(state => state.theme.theme);
  const {
    data,
    value,
    onChange,
    placeholder,
    contentContainerStyle,
    label,
    style,
    required = false,
  } = props;
  return (
    <View>
      <View style={localStyles.labelRow}>
        <CText
          type={'M14'}
          style={localStyles.titleText}
          color={colors.labelColor}>
          {label}
        </CText>
        {required && (
          <CText style={{color: colors.alertColor}}>{' *'}</CText>
        )}
      </View>
      <View
        style={[
          localStyles.genderContainer,
          style,
          {
            backgroundColor: colors.inputBg,
          },
        ]}>
        <Dropdown
          data={data}
          maxHeight={300}
          iconColor={colors.textColor}
          activeColor={colors.backgroundColor}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={localStyles.containerStyle}
          selectedTextStyle={[
            localStyles.selectedTextStyle,
            {
              color: colors.textColor,
            },
          ]}
          placeholderStyle={[
            localStyles.placeholderStyle,
            {
              color: colors.grayScale1,
            },
          ]}
          itemTextStyle={{
            color: colors.textColor,
          }}
          itemContainerStyle={{
            backgroundColor: colors.backgroundColor,
            color: colors.textColor,
          }}
        />
      </View>
    </View>
  );
}
const localStyles = StyleSheet.create({
  labelRow: {
    ...styles.flexRow,
    ...styles.mt10,
    ...styles.ml5,
    ...styles.mb5,
  },
  containerStyle: {
    ...styles.ph5,
    width: '100%',
  },
  genderContainer: {
    borderRadius: moderateScale(24),
    ...styles.mt5,
    ...styles.selfCenter,
    ...styles.rowStart,
    ...styles.justifyBetween,
    ...styles.ph15,
    width: '100%',
    height: moderateScale(48),
    ...styles.mb5,
  },
  selectedTextStyle: {
    ...typography.fontSizes.f16,
    ...typography.fontWeights.Medium,
  },
  placeholderStyle: {
    ...typography.fontSizes.f16,
    ...typography.fontWeights.Medium,
  },
  titleText: {
    // Los márgenes están en labelRow para alinear correctamente el asterisco
  },
});
