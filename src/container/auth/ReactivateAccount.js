import {StyleSheet, TouchableOpacity, View, Alert} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {OtpInput} from 'react-native-otp-entry';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import CInput from '../../components/common/CInput';
import {useSelector} from 'react-redux';
import {moderateScale} from '../../common/constants';
import typography from '../../theme/typography';
import CButton from '../../components/common/CButton';
import {AuthNav} from '../../navigation/NavigationKey';
import {requestReactivate, confirmReactivate} from '../../api/auth';

export default function ReactivateAccount({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(1800);
  const [resendError, setResendError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [validating, setValidating] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [reactivating, setReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState('');

  useEffect(() => {
    if (timer <= 0 || step !== 'otp') return;
    const id = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [timer, step]);

  const formattedTimer = useMemo(() => {
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [timer]);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const onPressSendCode = async () => {
    if (!email) {
      setEmailError('* Requerido');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('* Correo inválido');
      return;
    }
    setEmailError('');
    setRequestError('');
    setRequesting(true);
    try {
      const resp = await requestReactivate(email.toLowerCase());
      if (resp && resp.success) {
        setRequestSuccess('Código enviado al correo');
        setStep('otp');
        setTimer(1800);
      } else {
        setRequestError(resp?.message || 'No se pudo enviar el código');
      }
    } catch (e) {
      setRequestError(e?.body?.message || e?.message || 'No se pudo enviar el código');
    } finally {
      setRequesting(false);
    }
  };

  const onOtpChange = text => setOtp(text);

  const onPressReactive = async () => {
    const trimmed = (otp || '').trim();
    if (trimmed.length < 6) {
      setOtpError('Ingresa el código de 6 dígitos.');
      return;
    }
    if (timer === 0) {
      setOtpError('Este código ya venció; inténtalo de nuevo.');
      return;
    }
    if (validating) return;
    setOtpError('');
    setReactivateError('');
    setValidating(true);
    try {
      const resp = await confirmReactivate({correo: email.toLowerCase(), codigo: trimmed});
      if (resp && resp.success) {
        Alert.alert('Cuenta reactivada', 'Tu cuenta ha sido reactivada correctamente. Ahora puedes iniciar sesión.', [
          {text: 'OK', onPress: () => navigation.navigate(AuthNav.Login)}
        ]);
      } else {
        setReactivateError(resp?.message || 'El código no es válido.');
      }
    } catch (e) {
      setReactivateError(e?.body?.message || e?.message || 'No se pudo reactiva la cuenta.');
    } finally {
      setValidating(false);
    }
  };

  const onPressResend = async () => {
    if (resending) return;
    if (!email) {
      setResendError('Falta el correo para reenviar el código.');
      return;
    }
    setOtp('');
    setOtpError('');
    setResendError('');
    setResendSuccess('');
    setResending(true);
    try {
      const resp = await requestReactivate(email.toLowerCase());
      if (resp && resp.success) {
        setTimer(1800);
        setResendSuccess('Código reenviado.');
        return;
      }
      setResendError(resp?.message || 'No se pudo reenviar el código.');
    } catch (e) {
      setResendError(e?.body?.message || e?.message || 'No se pudo reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  return (
    <CSafeAreaView>
      <CHeader />
      <KeyBoardAvoidWrapper contentContainerStyle={styles.p20}>
        <CText type={'S28'} align={'center'} style={styles.mb5}>
          Reactivar cuenta
        </CText>
        <CText type={'S14'} align={'center'} color={colors.labelColor} style={styles.mb20}>
          Ingresa tu correo para recibir un código de verificación y reactivar tu cuenta suspendida.
        </CText>

        {step === 'email' && (
          <View>
            <CInput
              label="Correo electrónico"
              placeHolder="correo@ejemplo.com"
              _value={email}
              _errorText={emailError}
              autoCapitalize="none"
              toGetTextFieldValue={setEmail}
              keyBoardType="email-address"
            />
            {!!requestError && (
              <CText type={'S12'} color={colors.redAlert} style={styles.mt10}>
                {requestError}
              </CText>
            )}
            {!!requestSuccess && (
              <CText type={'S12'} color={colors.primary} style={styles.mt10}>
                {requestSuccess}
              </CText>
            )}
            <CButton
              title="Enviar código"
              onPress={onPressSendCode}
              disabled={requesting}
              loading={requesting}
              style={styles.mt20}
            />
          </View>
        )}

        {step === 'otp' && (
          <View>
            <CText type={'S14'} align={'center'} color={colors.labelColor}>
              Se envió un código a {email}
            </CText>
            <OtpInput
              numberOfDigits={6}
              code={otp}
              onTextChange={onOtpChange}
              focusStickBlinkingDuration={500}
              keyboardAppearance={'light'}
              secureTextEntry={false}
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
                ? `El código vence en ${formattedTimer}`
                : 'El código venció, puedes reenviarlo'}
            </CText>
            {!!otpError && (
              <CText type={'S14'} align={'center'} color={colors.redAlert}>
                {otpError}
              </CText>
            )}
            {!!reactivateError && (
              <CText type={'S14'} align={'center'} color={colors.redAlert}>
                {reactivateError}
              </CText>
            )}
            <CButton
              title="Reactivar cuenta"
              onPress={onPressReactive}
              disabled={validating}
              loading={validating}
            />
            <View style={localStyles.bottomContainer}>
              <CText type={'M16'} color={colors.grayScale1}>
                ¿No recibiste el código?
              </CText>
              <TouchableOpacity
                onPress={onPressResend}
                disabled={timer > 0 || resending}
              >
                <CText type={'M16'} color={colors.primary}>
                  {resending ? 'Enviando...' : 'Reenviar código'}
                </CText>
              </TouchableOpacity>
            </View>
            {!!resendError && (
              <CText type={'S14'} align={'center'} color={colors.redAlert}>
                {resendError}
              </CText>
            )}
          </View>
        )}
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  underlineStyleBase: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(20),
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
    ...typography.fontSizes.f20,
  },
  bottomContainer: {
    ...styles.rowCenter,
    ...styles.g2,
    marginTop: moderateScale(20),
  },
});