import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
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
import {AuthNav} from '../../navigation/NavigationKey';
import {requestPasswordReset} from '../../api/auth';

export default function OtpScreen({navigation, route}) {
  const colors = useSelector(state => state.theme.theme);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendError, setResendError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const correo = route?.params?.correo || '';

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formattedTimer = useMemo(() => {
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [timer]);

  const onOtpChange = text => setOtp(text);
  const onPressContinue = () => {
    const trimmed = (otp || '').trim();
    if (trimmed.length < 4) {
      setOtpError('Ingresa el codigo de 4 digitos.');
      return;
    }
    setOtpError('');
    navigation.navigate(AuthNav.CreateNewPassword, {correo, token: trimmed});
  };
  const onPressResend = async () => {
    if (resending) return;
    if (!correo) {
      setResendError('Falta el correo para reenviar el codigo.');
      return;
    }
    setResendError('');
    setResendSuccess('');
    setResending(true);
    try {
      const resp = await requestPasswordReset({correo});
      if (resp?.retry_in_seconds) {
        setResendError(`Intenta de nuevo en ${resp.retry_in_seconds} s.`);
        setTimer(Number(resp.retry_in_seconds) || 60);
        return;
      }
      if (resp && (resp.success === true || resp.status === true)) {
        setTimer(60);
        setResendSuccess(resp?.success_message || 'Codigo reenviado.');
        return;
      }
      setResendError(resp?.message || 'No se pudo reenviar el codigo.');
    } catch (e) {
      setResendError(e?.body?.message || e?.message || 'No se pudo reenviar el codigo.');
    } finally {
      setResending(false);
    }
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
          {!!correo && <CText>{` ${correo}`}</CText>}
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
        <CText type={'S14'} align={'center'} color={colors.labelColor}>
          {timer > 0
            ? `El codigo vence en ${formattedTimer}`
            : 'El codigo vencio, puedes reenviarlo'}
        </CText>
        {!!otpError && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {otpError}
          </CText>
        )}
        <CButton title={strings.continue} onPress={onPressContinue} />
        <View style={localStyles.bottomContainer}>
          <CText type={'M16'} color={colors.grayScale1}>
            {strings.didReceiveCode}
          </CText>
          <TouchableOpacity
            onPress={onPressResend}
            disabled={timer > 0 || resending}
          >
            <CText type={'M16'} color={colors.primary}>
              {resending ? 'Enviando...' : strings.resendCode}
            </CText>
          </TouchableOpacity>
        </View>
        {!!resendSuccess && (
          <CText type={'S14'} align={'center'} color={colors.primary}>
            {resendSuccess}
          </CText>
        )}
        {!!resendError && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {resendError}
          </CText>
        )}
      </KeyBoardAvoidWrapper>
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
