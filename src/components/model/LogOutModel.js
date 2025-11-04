import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom imports
import {useSelector} from 'react-redux';
import CText from '../common/CText';
import {styles} from '../../theme';
import strings from '../../i18n/strings';
import {deviceWidth, getWidth, moderateScale} from '../../common/constants';
import CButton from '../common/CButton';

export default function LogOutModel(props) {
  const colors = useSelector(state => state.theme.theme);
  const {visible, onPressCancel, onPressLOut} = props;
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View
        style={[
          localStyles.mainContainer,
          {
            backgroundColor: colors.transparentModel,
          },
        ]}>
        <View
          style={[
            localStyles.middleContainer,
            {
              backgroundColor: colors.backgroundColor,
            },
          ]}>
          <TouchableOpacity
            style={localStyles.closeIconStyle}
            onPress={onPressCancel}>
            <Ionicons
              name={'close-outline'}
              color={colors.textColor}
              size={moderateScale(32)}
            />
          </TouchableOpacity>
          <CText type={'S18'} align={'center'} style={localStyles.textStyle}>
            {strings.areYouSureWantToLogOut}
          </CText>
          <CButton
            title={strings.cancel}
            containerStyle={localStyles.btnStyle}
            onPress={onPressCancel}
          />
          <TouchableOpacity onPress={onPressLOut}>
            <CText type={'M14'} color={colors.redAlert} align={'center'}>
              {strings.logout}
            </CText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.center,
  },
  middleContainer: {
    borderRadius: moderateScale(16),
    ...styles.p20,
    width: deviceWidth - moderateScale(60),
  },
  closeIconStyle: {
    ...styles.selfEnd,
  },
  btnStyle: {
    width: getWidth(180),
    ...styles.selfCenter,
    ...styles.mv15,
  },
  textStyle: {
    ...styles.mv20,
    ...styles.ph35,
  },
});
