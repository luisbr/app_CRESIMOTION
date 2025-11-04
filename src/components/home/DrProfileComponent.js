import {Image, StyleSheet, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// custom imports
import CText from '../common/CText';
import {useSelector} from 'react-redux';
import strings from '../../i18n/strings';
import {getWidth, moderateScale} from '../../common/constants';
import {styles} from '../../theme';
import CButton from '../common/CButton';

export default function DrProfileComponent({
  drProfileImage,
  drName,
  specialist,
  color,
  scheduleBgColor,
  scheduleTextColor,
  scheduleLabel,
  reschedule,
  btnTitle1,
  btnTitle2,
  onPressDrProfile,
  onPressBtn1,
  onPressBtn2,
  isCompleted,
}) {
  const colors = useSelector(state => state.theme.theme);
  return (
    <View style={localStyles.drProfileContainer} onPress={onPressDrProfile}>
      
      <View>
        <CText type={'B16'} color={color ? colors.white : colors.textColor}>
          {drName}
        </CText>
        <CText
          type={'S12'}
          color={color ? colors.white : colors.labelColor}
          style={styles.mt5}>
          {specialist}
        </CText>
        <View
          style={[
            localStyles.scheduleContainer,
            {
              backgroundColor: scheduleBgColor
                ? scheduleBgColor
                : colors.primary2,
            },
          ]}>
          <View style={localStyles.scheduleInnerRoot}>
            <Ionicons
              name={'calendar-outline'}
              color={scheduleTextColor ? scheduleTextColor : colors.white}
              size={moderateScale(16)}
            />
            <CText
              type={'S12'}
              color={scheduleTextColor ? scheduleTextColor : colors.white}>
              {scheduleLabel ? scheduleLabel : strings.today}
            </CText>
          </View>
          {!scheduleLabel && (
            <View style={localStyles.scheduleInnerRoot}>
              <MaterialIcon
                name={'clock-time-four-outline'}
                color={scheduleTextColor ? scheduleTextColor : colors.white}
                size={moderateScale(16)}
              />
              <CText
                type={'S12'}
                color={scheduleTextColor ? scheduleTextColor : colors.white}>
                {'14:30 - 15:30 AM  '}
              </CText>
            </View>
          )}
        </View>
        {reschedule && (
          <View style={localStyles.drProfileContainer}>
            <CButton
              title={btnTitle1}
              containerStyle={localStyles.btnStyle}
              type={'S12'}
              bgColor={colors.inputBg}
              color={colors.primary}
              onPress={onPressBtn1}
            />
            <CButton
              title={btnTitle2}
              containerStyle={localStyles.btnStyle}
              type={'S12'}
              onPress={isCompleted && onPressBtn2}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  drProfileContainer: {
    ...styles.flexRow,
    ...styles.g15,
  },
  drProfileImage: {
    height: moderateScale(49),
    width: moderateScale(49),
  },
  scheduleContainer: {
    borderRadius: moderateScale(12),
    ...styles.ph10,
    ...styles.pv5,
    ...styles.mt15,
    ...styles.flexRow,
    ...styles.g10,
  },
  scheduleInnerRoot: {
    ...styles.flexRow,
    ...styles.g5,
  },
  btnStyle: {
    width: getWidth(99),
    height: moderateScale(30),
  },
});
