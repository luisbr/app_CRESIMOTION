import {Image, Modal, StyleSheet, View} from 'react-native';
import React from 'react';

// custom imports
import {styles} from '../../theme';
import {useSelector} from 'react-redux';
import {
  deviceWidth,
  getHeight,
  getWidth,
  moderateScale,
} from '../../common/constants';
import images from '../../assets/images';
import CText from '../common/CText';
import strings from '../../i18n/strings';
import CButton from '../common/CButton';

export default function PasswordSuccessModel(props) {
  const colors = useSelector(state => state.theme.theme);
  const {visible, onPressContinue, desc} = props;
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
          <Image
            source={
              colors.dark
                ? images.PassSuccessDarkImage
                : images.PassSuccessLightImage
            }
            style={localStyles.imageStyle}
          />
          <CText type={'S18'} align={'center'} style={styles.mv10}>
            {strings.success}
          </CText>
          <CText type={'R14'} align={'center'} color={colors.grayScale1}>
            {desc}
          </CText>
          <CButton
            title={strings.continue}
            containerStyle={localStyles.btnStyle}
            onPress={onPressContinue}
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
  },
  middleContainer: {
    borderRadius: moderateScale(16),
    ...styles.p20,
    width: deviceWidth - moderateScale(100),
    ...styles.selfCenter,
  },
  imageStyle: {
    height: getHeight(104),
    width: getWidth(134),
    resizeMode: 'contain',
    ...styles.selfCenter,
  },
  btnStyle: {
    width: getWidth(123),
    ...styles.selfCenter,
    ...styles.mv10,
  },
});
