import {StyleSheet, TouchableOpacity, View, Switch} from 'react-native';
import React, {useState} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {useSelector} from 'react-redux';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import {validateEmail, validName, validPassword, validateMobileNumber} from '../../utils/Validation';
import CInput from '../../components/common/CInput';
import CButton from '../../components/common/CButton';
import {register as apiRegister} from '../../api/auth';
import TermsModal from '../../components/model/TermsModal';
import {moderateScale} from '../../common/constants';
// Removed social login icons
import {AuthNav, StackNav} from '../../navigation/NavigationKey';

export default function Register({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [apellido, setApellido] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [alias, setAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [minor, setMinor] = useState(false);
  const yearsAgo = y => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - y);
    return d;
  };
  const [selectedDate, setSelectedDate] = useState(yearsAgo(18));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [termsVisible, setTermsVisible] = useState(false);

  const onChangeNombre = val => {
    const {msg} = validName(val.trim());
    setNombre(val.trim());
    setNombreError(msg);
  };
  const onChangeApellido = val => {
    const {msg} = validName(val.trim());
    setApellido(val.trim());
    setApellidoError(msg);
  };

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
  const onChangeTelefono = val => {
    const onlyDigits = val.replace(/\D/g, '');
    const {msg} = validateMobileNumber(onlyDigits);
    setTelefono(onlyDigits);
    setTelefonoError(msg);
  };
  const onChangeAlias = val => {
    const v = val.trim().toLowerCase();
    const ok = /^[a-z0-9_]{4,20}$/.test(v);
    setAlias(v);
    setAliasError(ok ? '' : 'Alias inválido (4-20, letras/números/_ )');
  };
  const onPressCalender = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setFechaNac(`${yyyy}-${mm}-${dd}`);
    setSelectedDate(date);
    setDatePickerVisible(false);
  };
  const clampToRange = (d, isMinor) => {
    const min = isMinor ? yearsAgo(18) : yearsAgo(120);
    const max = isMinor ? yearsAgo(12) : yearsAgo(18);
    if (d < min) return min;
    if (d > max) return max;
    return d;
  };
  const onToggleMinor = (val) => {
    setMinor(val);
    setSelectedDate(prev => clampToRange(prev, val));
  };

  const onPressCreateAccount = async () => {
    if (
      nombreError ||
      apellidoError ||
      emailError ||
      passwordError ||
      telefonoError ||
      aliasError ||
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !fechaNac
    ) {
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const resp = await apiRegister({
        nombre,
        apellido,
        correo: email,
        contrasena: password,
        telefono,
        fecha_nacimiento: fechaNac,
        menor_edad: minor ? 1 : 0,
        alias,
      });
      if (resp && (resp.success === true || resp.status === true)) {
        navigation.reset({index: 0, routes: [{name: StackNav.ThankYou}]});
      } else {
        setSubmitError((resp && (resp.success_message || resp.message)) || 'Error al registrarse');
      }
    } catch (e) {
      setSubmitError('Error de red');
    } finally {
      setSubmitting(false);
    }
  };

  const onPressForgotPass = () => {
    navigation.navigate(AuthNav.ForgotPassword, {correo: email});
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
            title={strings.signUp}
            arrowBgColor
            textColor={colors.white}
            arrowBorderColor
          />
          <View style={localStyles.welcomeText}>
            <CText type={'B24'} color={colors.white}>
              {strings.createAccount}
            </CText>
            <CText type={'M14'} color={colors.white} style={styles.mt5}>
              {strings.welcomeBackDesc}
            </CText>
          </View>
        </View>
        <View style={styles.ph20}>
          <CInput
            label={strings.fullName}
            placeHolder={strings.enterYourName}
            keyBoardType={'default'}
            _value={nombre}
            _errorText={nombreError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeNombre}
          />
          <CInput
            label={strings.lastName}
            placeHolder={strings.enterYourLastName}
            keyBoardType={'default'}
            _value={apellido}
            _errorText={apellidoError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeApellido}
          />
          <CText type={'M14'} color={colors.labelColor} style={styles.mt20}>
            {strings.birthDate}
          </CText>
          <TouchableOpacity
            onPress={onPressCalender}
            style={[
              localStyles.birthDateContainer,
              {backgroundColor: colors.inputBg},
            ]}>
            <CText
              type={'M16'}
              color={fechaNac ? colors.textColor : colors.grayScale1}
              style={styles.ml10}>
              {fechaNac || strings.selectBirthDate}
            </CText>
          </TouchableOpacity>
          <View style={[styles.rowSpaceBetween, styles.mt10]}>
            <CText type={'M14'} color={colors.labelColor}>
              {strings.minor}
            </CText>
            <Switch value={minor} onValueChange={onToggleMinor} />
          </View>
          <CInput
            label={strings.alias}
            placeHolder={strings.enterAlias}
            keyBoardType={'default'}
            _value={alias}
            _errorText={aliasError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeAlias}
          />
          <CInput
            label={strings.phone}
            placeHolder={strings.enterPhone}
            keyBoardType={'number-pad'}
            _value={telefono}
            _errorText={telefonoError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeTelefono}
            maxLength={15}
          />
          <CInput
            label={strings.email}
            placeHolder={strings.enterYourEmail}
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
          <TouchableOpacity onPress={onPressForgotPass} style={styles.selfEnd}>
            <CText type={'S14'} color={colors.alertColor}>
              {strings.forgotPassword}
            </CText>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={datePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            date={selectedDate}
            minimumDate={minor ? yearsAgo(18) : yearsAgo(120)}
            maximumDate={minor ? yearsAgo(12) : yearsAgo(18)}
          />
          <CButton title={strings.createAnAccount} onPress={onPressCreateAccount} disabled={submitting} />
          {!!submitError && (
            <CText type={'S14'} align={'center'} color={colors.redAlert}>
              {submitError}
            </CText>
          )}
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
  birthDateContainer: {
    width: '100%',
    height: moderateScale(52),
    borderRadius: moderateScale(24),
    ...styles.justifyCenter,
    ...styles.mv10,
    ...styles.ph20,
  },
  signInWith: {
    ...styles.rowCenter,
    ...styles.g10,
    ...styles.mt20,
  },
  lineView: {
    width: moderateScale(62),
    height: moderateScale(1),
  },
  // Social styles removed
});
