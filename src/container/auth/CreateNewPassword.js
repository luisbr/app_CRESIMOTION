import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {useSelector} from 'react-redux';
import {validateConfirmPassword, validPassword} from '../../utils/Validation';
import CInput from '../../components/common/CInput';
import strings from '../../i18n/strings';
import {styles} from '../../theme';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import PasswordSuccessModel from '../../components/model/PasswordSuccessModel';
import {AuthNav} from '../../navigation/NavigationKey';
import {updatePassword} from '../../api/auth';

export default function CreateNewPassword({navigation, route}) {
  const colors = useSelector(state => state.theme.theme);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const correo = route?.params?.correo || '';
  const token = route?.params?.token || '';

  const onChangedPassword = val => {
    const {msg} = validPassword(val.trim());
    setPassword(val.trim());
    setPasswordError(msg);
  };

  const onChangedConfirmPassword = val => {
    const {msg} = validateConfirmPassword(val.trim(), password);
    setConfirmPassword(val.trim());
    setConfirmPasswordError(msg);
  };

  const onPressNext = async () => {
    setSubmitError('');
    const {msg: passMsg} = validPassword(password.trim());
    const {msg: confirmMsg} = validateConfirmPassword(confirmPassword.trim(), password);
    if (passMsg || confirmMsg) {
      setPasswordError(passMsg);
      setConfirmPasswordError(confirmMsg);
      return;
    }
    if (!correo || !token) {
      setSubmitError('Faltan datos para actualizar la contrasena.');
      return;
    }
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const resp = await updatePassword({correo, token, contrasena: password});
      if (resp && (resp.success === true || resp.status === true)) {
        setModalVisible(true);
        return;
      }
      setSubmitError(resp?.message || 'No se pudo actualizar la contrasena.');
    } catch (e) {
      setSubmitError(e?.body?.message || e?.message || 'No se pudo actualizar la contrasena.');
    } finally {
      setSubmitting(false);
    }
  };

  const onPressContinue = () => {
    setModalVisible(false);
    navigation.navigate(AuthNav.Login);
  };

  return (
    <CSafeAreaView>
      <KeyBoardAvoidWrapper>
        <CHeader title={strings.createNewPassword} />
        <CText type={'S28'} align={'center'} style={styles.mv5}>
          {strings.createNewPassword}
        </CText>
        <CText
          type={'S14'}
          align={'center'}
          color={colors.labelColor}
          style={styles.mb10}>
          {strings.enterYourNewPassword}
        </CText>
        <View style={localStyles.mainContainer}>
          <CInput
            label={strings.newPassword}
            placeHolder={strings.enterNewPassword}
            keyBoardType={'default'}
            _value={password}
            _errorText={passwordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangedPassword}
            isSecure
          />
          <CInput
            label={strings.confirmPassword}
            placeHolder={strings.confirmYourPassword}
            keyBoardType={'default'}
            _value={confirmPassword}
            _errorText={confirmPasswordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangedConfirmPassword}
            isSecure
          />
          <CButton
            title={strings.next}
            containerStyle={styles.mv20}
            onPress={onPressNext}
          />
          {!!submitError && (
            <CText type={'S14'} align={'center'} color={colors.redAlert}>
              {submitError}
            </CText>
          )}
        </View>
      </KeyBoardAvoidWrapper>
      <PasswordSuccessModel
        visible={modalVisible}
        onPressContinue={onPressContinue}
        desc={strings.successDesc}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.p20,
  },
});
