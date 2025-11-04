import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {deviceWidth, moderateScale} from '../../common/constants';
import CText from '../common/CText';
import strings from '../../i18n/strings';
import CButton from '../common/CButton';

export default function AgreePopUp(props) {
  const colors = useSelector(state => state.theme.theme);
  const {visible, onPressAgree, onPressDisgree} = props;
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
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
          <CText type={'M14'} color={colors.labelColor} align={'center'}>
            {strings.iAgreeToThe}
            <CText>
              {strings.termsOfService}
              <CText color={colors.labelColor}>
                {' ' + strings.and}
                <CText>
                  {strings.conditions}
                  <CText color={colors.labelColor}>{strings.agreeText}</CText>
                </CText>
              </CText>
            </CText>
          </CText>
          <View style={localStyles.btnContainer}>
            <TouchableOpacity style={styles.ph20} onPress={onPressDisgree}>
              <CText type={'S14'} color={colors.alertColor}>
                {strings.disgree}
              </CText>
            </TouchableOpacity>
            <CButton
              title={strings.agree}
              containerStyle={localStyles.agreeBtn}
              onPress={onPressAgree}
            />
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
  },
  middleContainer: {
    borderRadius: moderateScale(16),
    ...styles.p20,
    width: deviceWidth - moderateScale(100),
    ...styles.selfCenter,
    ...styles.pv30,
  },
  btnContainer: {
    ...styles.rowSpaceBetween,
  },
  agreeBtn: {
    width: moderateScale(115),
  },
});
