import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {OtpInput} from 'react-native-otp-entry';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import strings from '../../i18n/strings';
import {useSelector} from 'react-redux';
import {moderateScale} from '../../common/constants';
import typography from '../../theme/typography';
import CButton from '../../components/common/CButton';
import AgreePopUp from '../../components/model/AgreePopUp';
import {StackNav} from '../../navigation/NavigationKey';
import {setAuthToken} from '../../utils/AsyncStorage';

export default function OtpScreen({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [otp, setOtp] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const onOtpChange = text => setOtp(text);
  const onPressContinue = () => {
    setModalVisible(true);
  };
  const onPressDisgree = () => {
    setModalVisible(false);
  };
  const onPressAgree = async () => {
    setModalVisible(false);
    await setAuthToken(true);
    navigation.reset({
      index: 0,
      routes: [{name: StackNav.TabNavigation}],
    });
  };
  return (
    <CSafeAreaView>
      <CHeader />
      <KeyBoardAvoidWrapper contentContainerStyle={styles.p20}>
        <CText type={'S28'} align={'center'} style={styles.mb5}>
          {strings.enterOtp}
        </CText>
        <CText type={'S14'} align={'center'} color={colors.labelColor}>
          {strings.enterOtpDesc}
          <CText>{' example@gmail.com'}</CText>
        </CText>
        <OtpInput
          numberOfDigits={4}
          code={otp}
          onTextChange={onOtpChange}
          focusStickBlinkingDuration={500}
          keyboardAppearance={'light'}
          secureTextEntry={true}
          focusColor={colors.primary}
          theme={{
            containerStyle: localStyles.otpInputViewStyle,
            pinCodeContainerStyle: [
              localStyles.underlineStyleBase,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBg,
                color: colors.primary,
              },
            ],
            pinCodeTextStyle: [
              localStyles.pinCodeTextStyle,
              {
                color: colors.textColor,
              },
            ],
            filledPinCodeContainerStyle: [
              localStyles.filledContainerStyle,
              {
                color: colors.textColor,
              },
            ],
          }}
        />
        <CButton title={strings.continue} onPress={onPressContinue} />
        <View style={localStyles.bottomContainer}>
          <CText type={'M16'} color={colors.grayScale1}>
            {strings.didReceiveCode}
          </CText>
          <TouchableOpacity>
            <CText type={'M16'} color={colors.primary}>
              {strings.resendCode}
            </CText>
          </TouchableOpacity>
        </View>
      </KeyBoardAvoidWrapper>
      <AgreePopUp
        visible={modalVisible}
        onPressAgree={onPressAgree}
        onPressDisgree={onPressDisgree}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  underlineStyleBase: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(24),
  },
  otpInputViewStyle: {
    ...styles.mv20,
    width: '85%',
    ...styles.selfCenter,
  },
  filledContainerStyle: {
    borderWidth: moderateScale(2),
  },
  pinCodeTextStyle: {
    ...typography.fontWeights.Bold,
    ...typography.fontSizes.f24,
  },
  bottomContainer: {
    ...styles.rowCenter,
    ...styles.g2,
  },
});
