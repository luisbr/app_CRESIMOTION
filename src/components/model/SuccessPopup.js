import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useSelector} from 'react-redux';
import CText from '../common/CText';
import {styles} from '../../theme';
import strings from '../../i18n/strings';
import {deviceWidth, moderateScale} from '../../common/constants';
import CButton from '../common/CButton';

export default function SuccessPopup(props) {
  const colors = useSelector(state => state.theme.theme);
  const {visible, title, desc, onClose} = props;
  
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
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
            onPress={onClose}>
            <Ionicons
              name={'close-outline'}
              color={colors.textColor}
              size={moderateScale(28)}
            />
          </TouchableOpacity>
          
          <View style={localStyles.iconContainer}>
            <Ionicons
              name={'checkmark-circle'}
              color={colors.primary}
              size={moderateScale(48)}
            />
          </View>
          
          <CText type={'M16'} align={'center'} color={colors.primary} style={localStyles.titleStyle}>
            {title || strings.success || '¡Éxito!'}
          </CText>
          
          <CText type={'M14'} align={'center'} color={colors.labelColor} style={localStyles.messageStyle}>
            {desc}
          </CText>
          
          <CButton
            title={strings.accept || 'Aceptar'}
            containerStyle={localStyles.btnStyle}
            onPress={onClose}
          />
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
  btnStyle: {
    ...styles.selfCenter,
    ...styles.mt15,
    width: moderateScale(120),
  },
});