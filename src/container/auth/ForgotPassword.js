import React, {useState} from 'react';

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

export default function ForgotPassword({navigation, route}) {
  const colors = useSelector(state => state.theme.theme);
  const [email, setEmail] = useState(route?.params?.correo || '');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    try {
      const resp = await requestPasswordReset({correo: normalizedEmail});
      if (resp?.retry_in_seconds) {
        setSubmitError(`Intenta de nuevo en ${resp.retry_in_seconds} s.`);
        return;
      }
      if (resp && (resp.success === true || resp.status === true)) {
        navigation.navigate(AuthNav.OtpScreen, {correo: normalizedEmail});
        return;
      }
      setSubmitError(resp?.message || 'No se pudo enviar el codigo.');
    } catch (e) {
      setSubmitError(e?.body?.message || e?.message || 'No se pudo enviar el codigo.');
    } finally {
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
        {!!submitError && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {submitError}
          </CText>
        )}
        <CButton title={strings.next} onPress={onPressNext} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}
