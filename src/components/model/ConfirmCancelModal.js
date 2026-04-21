import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useSelector} from 'react-redux';
import CText from '../common/CText';
import {styles} from '../../theme';
import {deviceWidth, moderateScale} from '../../common/constants';
import CButton from '../common/CButton';

export default function ConfirmCancelModal({visible, title, message, onCancel, onConfirm}) {
  const colors = useSelector(state => state.theme.theme);

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={[localStyles.mainContainer, {backgroundColor: colors.transparentModel}]}>
        <View style={[localStyles.middleContainer, {backgroundColor: colors.backgroundColor}]}>
          <TouchableOpacity style={localStyles.closeIconStyle} onPress={onCancel}>
            <Ionicons name={'close-outline'} color={colors.textColor} size={moderateScale(28)} />
          </TouchableOpacity>

          <View style={localStyles.iconContainer}>
            <Ionicons name={'warning'} color={colors.redAlert} size={moderateScale(48)} />
          </View>

          <CText type={'M16'} align={'center'} color={colors.textColor} style={localStyles.titleStyle}>
            {title || '¿Deseas cancelar?'}
          </CText>

          <CText type={'M14'} align={'center'} color={colors.labelColor} style={localStyles.messageStyle}>
            {message}
          </CText>

          <View style={localStyles.btnRow}>
            <TouchableOpacity
              style={[localStyles.btnNo, {backgroundColor: colors.grayScale4}]}
              onPress={onCancel}>
              <CText type={'B16'} color={colors.white}>No</CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.btnYes, {backgroundColor: colors.redAlert}]}
              onPress={onConfirm}>
              <CText type={'B16'} color={colors.white}>Sí, cancelar</CText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.justifyCenter,
    ...styles.center,
  },
  middleContainer: {
    borderRadius: moderateScale(16),
    ...styles.p20,
    width: deviceWidth - moderateScale(60),
    ...styles.selfCenter,
    ...styles.pv20,
  },
  closeIconStyle: {
    ...styles.selfEnd,
  },
  iconContainer: {
    ...styles.selfCenter,
    ...styles.mv10,
  },
  titleStyle: {
    ...styles.mv10,
    ...styles.ph20,
  },
  messageStyle: {
    ...styles.mv10,
    ...styles.ph15,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...styles.mt20,
    gap: moderateScale(12),
  },
  btnNo: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.center,
  },
  btnYes: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.center,
  },
});