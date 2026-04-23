import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import CInput from '../../components/common/CInput';
import strings from '../../i18n/strings';
import {useSelector} from 'react-redux';

import CButton from '../../components/common/CButton';
import {validateEmail} from '../../utils/Validation';
import {AuthNav} from '../../navigation/NavigationKey';
import {requestPasswordReset} from '../../api/auth';
import {useSafeNavigation} from '../../navigation/safeNavigation';

export default function ForgotPassword({navigation, route}) {
  const colors = useSelector(state => state.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const [email, setEmail] = useState(route?.params?.correo || '');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSubmitting(false);
    }, []),
  );

  useEffect(() => {
    if (countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownSeconds]);

  const onChangeEmail = val => {
    const {msg} = validateEmail(val.trim());
    setEmail(val.trim());
    setEmailError(msg);
  };
  const onPressNext = async () => {
    setSubmitError('');
    const normalizedEmail = (email || '').trim();
    const {msg} = validateEmail(normalizedEmail);
    if (msg) {
      setEmailError(msg);
      return;
    }
    if (submitting) {
      return;
    }
    setSubmitting(true);
    let didNavigate = false;
    try {
      const resp = await requestPasswordReset({correo: normalizedEmail});
      if (resp?.retry_in_seconds) {
        setCountdownSeconds(resp.retry_in_seconds);
        return;
      }
      if (resp && (resp.success === true || resp.status === true)) {
        didNavigate = true;
        safeNavigation.navigate(AuthNav.OtpScreen, {correo: normalizedEmail});
        return;
      }
      setSubmitError(resp?.message || 'No se pudo enviar el código.');
    } catch (e) {
      setSubmitError(e?.body?.message || e?.message || 'No se pudo enviar el código.');
    } finally {
      if (didNavigate) return;
      setSubmitting(false);
    }
  };
  return (
    <CSafeAreaView>
      <CHeader />
      <KeyBoardAvoidWrapper contentContainerStyle={styles.p20}>
        <CText type={'S28'} align={'center'} style={styles.mb5}>
          {strings.forgotPassword}
        </CText>
        <CText
          type={'S14'}
          align={'center'}
          color={colors.labelColor}
          style={styles.mb10}>
          {strings.forgotPassDesc}
        </CText>

        <CInput
          label={strings.email}
          placeHolder={strings.enterYourEmail}
          keyBoardType={'default'}
          _value={email}
          _errorText={emailError}
          autoCapitalize={'none'}
          toGetTextFieldValue={onChangeEmail}
        />
        {countdownSeconds > 0 ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            Intenta de nuevo en {countdownSeconds} segundos.
          </CText>
        ) : !!submitError && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {submitError}
          </CText>
        )}
        <CButton title={strings.next} onPress={onPressNext} disabled={submitting} loading={submitting} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}
