import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom imports
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import {styles} from '../../theme';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import CText from '../../components/common/CText';
import CInput from '../../components/common/CInput';
import {validateEmail, validPassword} from '../../utils/Validation';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {moderateScale} from '../../common/constants';
import CButton from '../../components/common/CButton';
import {login as apiLogin} from '../../api/auth';
import TermsModal from '../../components/model/TermsModal';
// Removed social login icons
import {AuthNav, StackNav} from '../../navigation/NavigationKey';
import {setAuthToken} from '../../utils/AsyncStorage';

export default function Login({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [termsVisible, setTermsVisible] = useState(false);

  const onChangeEmail = val => {
    const {msg} = validateEmail(val.trim());
    setEmail(val.trim());
    setEmailError(msg);
  };
  const onChangedPassword = val => {
    const {msg} = validPassword(val.trim());
    setPassword(val.trim());
    setPasswordError(msg);
  };

  const onPressRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const onPressSignUp = () => {
    navigation.navigate(AuthNav.Register);
  };

  const onPressForgotPass = () => {
    navigation.navigate(AuthNav.ForgotPassword);
  };
  const onPressSignIn = async () => {
    if (emailError || passwordError || !email || !password) {
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const resp = await apiLogin({correo: email, contrasena: password});
      if (resp && (resp.success === true || resp.status === true)) {
        navigation.reset({index: 0, routes: [{name: StackNav.TabNavigation}]});
      } else {
        setSubmitError((resp && (resp.success_message || resp.message)) || 'Error al iniciar sesión');
      }
    } catch (e) {
      console.log('Login error:', e);
      setSubmitError('Error de red');
    } finally {
      setSubmitting(false);
    }
  };
  // Social login removed

  return (
    <CSafeAreaView>
      <KeyBoardAvoidWrapper>
        <View
          style={[
            localStyles.headerContainer,
            {
              backgroundColor: colors.primary,
            },
          ]}>
          <CHeader
            arrowColor={colors.white}
            title={strings.signIn}
            arrowBgColor
            textColor={colors.white}
            arrowBorderColor
          />
          <View style={localStyles.welcomeText}>
            <CText type={'B24'} color={colors.white}>
              {strings.welcomeBackText}
            </CText>
            <CText type={'M14'} color={colors.white} style={styles.mt5}>
              {strings.welcomeBackDesc}
            </CText>
          </View>
        </View>
        <View style={styles.ph20}>
          <CInput
            label={strings.emailAddress}
            placeHolder={strings.enterYourEmailAddress}
            keyBoardType={'default'}
            _value={email}
            _errorText={emailError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeEmail}
          />
          <CInput
            label={strings.password}
            placeHolder={strings.enterYourPassword}
            keyBoardType={'default'}
            _value={password}
            _errorText={passwordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangedPassword}
            isSecure
          />
          <View style={localStyles.rememberContainer}>
            <TouchableOpacity
              style={localStyles.rememberText}
              onPress={onPressRememberMe}>
              <Ionicons
                name={rememberMe ? 'checkmark-circle' : 'radio-button-off'}
                color={
                  rememberMe
                    ? colors.primary
                    : colors.dark
                    ? colors.grayScale2
                    : colors.indicatorColor
                }
                size={moderateScale(24)}
              />
              <CText type={'S14'} color={colors.labelColor}>
                {strings.rememberMe}
              </CText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressForgotPass}>
              <CText type={'S14'} color={colors.alertColor}>
                {strings.forgotPassword}
              </CText>
            </TouchableOpacity>
          </View>
          <CButton title={strings.signIn} onPress={onPressSignIn} disabled={submitting} />
          {!!submitError && (
            <CText type={'S14'} align={'center'} color={colors.redAlert}>
              {submitError}
            </CText>
          )}
          <View style={localStyles.accountRoot}>
            <CText type={'S16'} color={colors.grayScale3}>
              {strings.donHaveAccount}
            </CText>
            <TouchableOpacity onPress={onPressSignUp}>
              <CText type={'S16'} color={colors.primary}>
                {strings.signUp}
              </CText>
            </TouchableOpacity>
          </View>
          {/* Social login removed */}
          <TouchableOpacity onPress={() => setTermsVisible(true)}>
            <CText
              type={'S14'}
              align={'center'}
              color={colors.dark ? colors.labelColor : colors.grayScale4}>
              {strings.bySigningUpYouAgreeToOur + ' '}
              <CText type={'S14'} color={colors.primary}>
                {strings.terms}
                <CText
                  type={'S14'}
                  color={colors.dark ? colors.labelColor : colors.grayScale4}>
                  {' ' + strings.and + ' '}
                  <CText type={'S14'} color={colors.primary}>
                    {strings.conditionsOfUse}
                  </CText>
                </CText>
              </CText>
            </CText>
          </TouchableOpacity>
          <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
        </View>
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    ...styles.pt10,
  },
  welcomeText: {
    ...styles.p20,
  },
  rememberContainer: {
    ...styles.rowSpaceBetween,
    ...styles.mb5,
  },
  rememberText: {
    ...styles.rowCenter,
    ...styles.g10,
  },
  accountRoot: {
    ...styles.rowCenter,
    ...styles.g3,
  },
  lineView: {
    width: moderateScale(62),
    height: moderateScale(1),
  },
  // Social styles removed
});
