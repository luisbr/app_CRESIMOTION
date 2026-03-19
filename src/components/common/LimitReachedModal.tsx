import React from 'react';
import {Modal, StyleSheet, View, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {styles} from '../../theme';
import {deviceWidth, moderateScale} from '../../common/constants';
import CText from '../common/CText';
import CButton from '../common/CButton';
import {getLimitKeyLabel} from '../../utils/apiError';

export default function LimitReachedModal({visible, onClose, onUpgrade, limitKey}) {
  const colors = useSelector(state => state.theme.theme);
  const conceptoLabel = getLimitKeyLabel(limitKey || '');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[localStyles.overlay, {backgroundColor: colors.transparentModel}]}>
        <View style={[localStyles.container, {backgroundColor: colors.backgroundColor}]}>
          <TouchableOpacity style={localStyles.closeIcon} onPress={onClose}>
            <Ionicons name="close-outline" size={moderateScale(32)} color={colors.textColor} />
          </TouchableOpacity>
          <View style={localStyles.iconContainer}>
            <Ionicons name="warning-outline" size={moderateScale(48)} color={colors.primary} />
          </View>
          <CText type={'B18'} align={'center'} style={styles.mt15}>
            {'Límite alcanzado'}
          </CText>
          <CText
            type={'R14'}
            align={'center'}
            color={colors.labelColor}
            style={[styles.mt10, styles.mb20]}>
            {`Has alcanzado el límite de ${conceptoLabel} mensuales permitidas por tu plan actual. Mejora tu plan para desbloquear más beneficios.`}
          </CText>
          <CButton
            title={'Ver Planes'}
            onPress={onUpgrade}
            containerStyle={styles.mb10}
          />
          <CButton
            title={'Cerrar'}
            onPress={onClose}
            bgColor={colors.grayScale2}
            borderColor={colors.grayScale2}
            color={colors.textColor}
          />
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: deviceWidth - moderateScale(40),
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    maxHeight: '80%',
  },
  closeIcon: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
});