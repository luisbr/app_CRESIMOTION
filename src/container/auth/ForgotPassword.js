import React, {useState} from 'react';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import strings from '../../i18n/strings';
import {useSelector} from 'react-redux';

import CButton from '../../components/common/CButton';
import {validateEmail} from '../../utils/Validation';
import {AuthNav} from '../../navigation/NavigationKey';

export default function ForgotPassword({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const onChangeEmail = val => {
    const {msg} = validateEmail(val.trim());
    setEmail(val.trim());
    setEmailError(msg);
  };
  const onPressNext = () => {
    navigation.navigate(AuthNav.CreateNewPassword);
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
        <CButton title={strings.next} onPress={onPressNext} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}
