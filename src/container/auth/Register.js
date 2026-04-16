import {StyleSheet, View, Switch, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';

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
import CDropdown from '../../components/common/CDropdown';
import {
  register as apiRegister,
  requestEmailVerificationCode,
  verifyEmailCode,
  requestTutorVerificationCode,
  verifyTutorCode,
  checkAliasAvailability,
  checkEmailAvailability,
} from '../../api/auth';
import {moderateScale} from '../../common/constants';
// Removed social login icons
import {StackNav} from '../../navigation/NavigationKey';
import TermsModal from '../../components/model/TermsModal';
import ErrorPopup from '../../components/model/ErrorPopup';

export default function Register({navigation}) {
  const colors = useSelector(state => state.theme.theme);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
      if (aliasCheckTimeout) clearTimeout(aliasCheckTimeout);
      if (emailExpiryTimer) clearInterval(emailExpiryTimer);
      if (tutorExpiryTimer) clearInterval(tutorExpiryTimer);
    };
  }, []);
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [apellido, setApellido] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);
  const [emailConfirm, setEmailConfirm] = useState('');
  const [emailConfirmError, setEmailConfirmError] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeError, setEmailCodeError] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeSentMessage, setEmailCodeSentMessage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifiedMessage, setEmailVerifiedMessage] = useState('');
  const [emailRequesting, setEmailRequesting] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailCodeExpiresAt, setEmailCodeExpiresAt] = useState(null);
  const [emailCodeRemaining, setEmailCodeRemaining] = useState(0);
  const [emailExpiryTimer, setEmailExpiryTimer] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [alias, setAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasChecking, setAliasChecking] = useState(false);
  const [aliasCheckTimeout, setAliasCheckTimeout] = useState(null);
  const [genero, setGenero] = useState('');
  const [generoOption, setGeneroOption] = useState('');
  const [generoOtro, setGeneroOtro] = useState('');
  const [generoError, setGeneroError] = useState('');
  const [idioma, setIdioma] = useState('');
  const [idiomaOption, setIdiomaOption] = useState('');
  const [idiomaError, setIdiomaError] = useState('');
  const [comoSeEntero, setComoSeEntero] = useState('');
  const [comoSeEnteroOption, setComoSeEnteroOption] = useState('');
  const [comoSeEnteroOtro, setComoSeEnteroOtro] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [isUnder13, setIsUnder13] = useState(false);
  const [guardianDeclAdult, setGuardianDeclAdult] = useState(false);
  const [guardianDeclTerms, setGuardianDeclTerms] = useState(false);
  const [guardianDeclNotice, setGuardianDeclNotice] = useState(false);
  const [guardianDeclPrivacy, setGuardianDeclPrivacy] = useState(false);
  const [guardianDeclConsent, setGuardianDeclConsent] = useState(false);
  const [guardianDeclarationsError, setGuardianDeclarationsError] = useState('');
  const [guardianNombre, setGuardianNombre] = useState('');
  const [guardianNombreError, setGuardianNombreError] = useState('');
  const [guardianApellido, setGuardianApellido] = useState('');
  const [guardianApellidoError, setGuardianApellidoError] = useState('');
  const [guardianBirthDay, setGuardianBirthDay] = useState('');
  const [guardianBirthMonth, setGuardianBirthMonth] = useState('');
  const [guardianBirthYear, setGuardianBirthYear] = useState('');
  const [guardianBirthDateError, setGuardianBirthDateError] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianPhoneError, setGuardianPhoneError] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianEmailError, setGuardianEmailError] = useState('');
  const [guardianCountryCode, setGuardianCountryCode] = useState('+52');
  const [tutorCode, setTutorCode] = useState('');
  const [tutorCodeError, setTutorCodeError] = useState('');
  const [tutorCodeSent, setTutorCodeSent] = useState(false);
  const [tutorCodeSentMessage, setTutorCodeSentMessage] = useState('');
  const [tutorVerified, setTutorVerified] = useState(false);
  const [tutorVerifiedMessage, setTutorVerifiedMessage] = useState('');
  const [tutorRequesting, setTutorRequesting] = useState(false);
  const [tutorVerifying, setTutorVerifying] = useState(false);
  const [tutorCodeExpiresAt, setTutorCodeExpiresAt] = useState(null);
  const [tutorCodeRemaining, setTutorCodeRemaining] = useState(0);
  const [tutorExpiryTimer, setTutorExpiryTimer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedError, setTermsAcceptedError] = useState('');
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [importantModalVisible, setImportantModalVisible] = useState(false);
  const [accessibilityModalVisible, setAccessibilityModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const showErrorPopup = (message, title) => {
    setErrorModalTitle(title || 'Error');
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  const hideErrorPopup = () => {
    setErrorModalVisible(false);
    setErrorModalTitle('');
    setErrorModalMessage('');
  };

  const onChangeNombre = val => {
    const normalized = val.replace(/\s+/g, ' ');
    const trimmed = normalized.trim();
    const {msg} = validName(trimmed, strings.enterValidName);
    const withCaps = normalized.replace(/^\s+/, '').replace(/(^|\s)([a-zA-ZÁÉÍÓÚÜÑáéíóúüñ])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
    setNombre(withCaps);
    setNombreError(msg);
  };
  const onChangeApellido = val => {
    const normalized = val.replace(/\s+/g, ' ');
    const trimmed = normalized.trim();
    const {msg} = validName(trimmed, strings.enterValidLastName);
    const withCaps = normalized.replace(/^\s+/, '').replace(/(^|\s)([a-zA-ZÁÉÍÓÚÜÑáéíóúüñ])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
    setApellido(withCaps);
    setApellidoError(msg);
  };

  const onChangeEmail = val => {
    const v = val.trim();
    const {msg} = validateEmail(v);
    setEmail(v);
    setEmailError(msg);
    if (emailConfirm && v !== emailConfirm) {
      setEmailConfirmError(strings.emailConfirmMismatch);
    } else {
      setEmailConfirmError('');
    }
    setEmailVerified(false);
    setEmailVerifiedMessage('');
    setEmailCodeSent(false);
    setEmailCodeSentMessage('');
    setEmailCode('');
    setEmailCodeError('');
    setEmailCodeExpiresAt(null);
    setEmailCodeRemaining(0);
    if (emailExpiryTimer) clearInterval(emailExpiryTimer);
    setEmailExpiryTimer(null);

    // Check email availability if format is valid
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }
    if (!v || msg) {
      setEmailChecking(false);
      return;
    }
    setEmailChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const resp = await checkEmailAvailability({correo: v});
        if (resp && resp.available === false) {
          setEmailError(resp.message || strings.emailAlreadyRegistered);
        }
      } catch (e) {
        // Silently fail on network errors
      } finally {
        setEmailChecking(false);
      }
    }, 500);
    setEmailCheckTimeout(timeout);
  };

  const onChangeEmailConfirm = val => {
    const v = val.trim();
    setEmailConfirm(v);
    if (!v) {
      setEmailConfirmError(strings.thisFieldIsMandatory);
      return;
    }
    if (email && v !== email) {
      setEmailConfirmError(strings.emailConfirmMismatch);
      return;
    }
    setEmailConfirmError('');
  };
  const onChangedPassword = val => {
    const {msg} = validPassword(val.trim());
    setPassword(val.trim());
    setPasswordError(msg);
    if (confirmPassword) {
      setConfirmPasswordError(val.trim() === confirmPassword ? '' : strings.confirmPasswordMismatch);
    }
  };
  const onChangeConfirmPassword = val => {
    const v = val.trim();
    setConfirmPassword(v);
    setConfirmPasswordError(v === password ? '' : strings.confirmPasswordMismatch);
  };
  const onChangeTelefono = val => {
    const onlyDigits = val.replace(/\D/g, '');
    const {msg} = validateMobileNumber(onlyDigits);
    setTelefono(onlyDigits);
    setTelefonoError(msg);
  };
  const onChangeCountry = item => {
    setCountryCode(item?.value || '+52');
  };
  const onChangeAlias = val => {
    const v = val.trim();
    const ok = /^[A-Za-z0-9_]{4,20}$/.test(v);
    setAlias(v);
    if (aliasCheckTimeout) {
      clearTimeout(aliasCheckTimeout);
    }
    if (!v) {
      setAliasError('');
      setAliasChecking(false);
      return;
    }
    if (!ok) {
      setAliasError('Alias no disponible (usar otro con 4-20 caracteres)');
      setAliasChecking(false);
      return;
    }
    setAliasError('');
    setAliasChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const resp = await checkAliasAvailability({alias: v});
        if (resp && resp.available === false) {
          setAliasError(resp.message || 'Este alias ya está registrado. Elige otro.');
        } else {
          setAliasError('');
        }
      } catch (e) {
        setAliasError('');
      } finally {
        setAliasChecking(false);
      }
    }, 500);
    setAliasCheckTimeout(timeout);
  };
  const onChangeGenero = item => {
    const v = item?.value || '';
    setGeneroOption(v);
    if (v && v !== 'Otro') {
      setGenero(v);
    } else if (v === 'Otro') {
      setGenero(generoOtro);
    } else {
      setGenero('');
    }
    setGeneroError(v ? '' : strings.requiredField);
  };
  const onChangeGeneroOtro = val => {
    const v = val.trim();
    setGeneroOtro(v);
    if (generoOption === 'Otro') {
      setGenero(v);
      setGeneroError(v ? '' : strings.requiredField);
    }
  };
  const onChangeIdioma = item => {
    const v = item?.value || '';
    setIdiomaOption(v);
    setIdioma(v);
    setIdiomaError(v ? '' : strings.requiredField);
  };
  const onChangeComoSeEntero = item => {
    const v = item?.value || '';
    setComoSeEnteroOption(v);
    if (v && v !== 'Otro') {
      setComoSeEntero(v);
    } else if (v === 'Otro') {
      setComoSeEntero(comoSeEnteroOtro);
    } else {
      setComoSeEntero('');
    }
  };
  const onChangeComoSeEnteroOtro = val => {
    const normalized = val.replace(/\s+/g, ' ');
    const v = normalized.replace(/^\s+/, '');
    setComoSeEnteroOtro(v);
    if (comoSeEnteroOption === 'Otro') {
      setComoSeEntero(v.trim());
    }
  };
  const onChangeBirthDay = item => {
    setBirthDay(item?.value || '');
  };
  const onChangeBirthMonth = item => {
    setBirthMonth(item?.value || '');
  };
  const onChangeBirthYear = val => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setBirthYear(v);
  };
  const onChangeGuardianNombre = val => {
    const normalized = val.replace(/\s+/g, ' ');
    const trimmed = normalized.trim();
    const {msg} = validName(trimmed, strings.enterValidGuardianName);
    setGuardianNombre(normalized.replace(/^\s+/, ''));
    setGuardianNombreError(msg);
  };
  const onChangeGuardianApellido = val => {
    const normalized = val.replace(/\s+/g, ' ');
    const trimmed = normalized.trim();
    const {msg} = validName(trimmed, strings.enterValidGuardianLastName);
    setGuardianApellido(normalized.replace(/^\s+/, ''));
    setGuardianApellidoError(msg);
  };
  const onChangeGuardianBirthDay = item => {
    setGuardianBirthDay(item?.value || '');
  };
  const onChangeGuardianBirthMonth = item => {
    setGuardianBirthMonth(item?.value || '');
  };
  const onChangeGuardianBirthYear = val => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setGuardianBirthYear(v);
  };
  const onChangeGuardianPhone = val => {
    const onlyDigits = val.replace(/\D/g, '');
    const {msg} = validateMobileNumber(onlyDigits);
    setGuardianPhone(onlyDigits);
    setGuardianPhoneError(msg);
    setTutorVerified(false);
    setTutorVerifiedMessage('');
    setTutorCodeSent(false);
    setTutorCodeSentMessage('');
    setTutorCode('');
    setTutorCodeError('');
    setTutorCodeExpiresAt(null);
    setTutorCodeRemaining(0);
    if (tutorExpiryTimer) clearInterval(tutorExpiryTimer);
    setTutorExpiryTimer(null);
  };
  const onChangeGuardianEmail = val => {
    const {msg} = validateEmail(val.trim());
    setGuardianEmail(val.trim());
    setGuardianEmailError(msg);
    setTutorVerified(false);
    setTutorVerifiedMessage('');
    setTutorCodeSent(false);
    setTutorCodeSentMessage('');
    setTutorCode('');
    setTutorCodeError('');
    setTutorCodeExpiresAt(null);
    setTutorCodeRemaining(0);
    if (tutorExpiryTimer) clearInterval(tutorExpiryTimer);
    setTutorExpiryTimer(null);
  };
  const onChangeGuardianCountry = item => {
    setGuardianCountryCode(item?.value || '+52');
  };
  const onChangeTutorCode = val => {
    const v = val.replace(/\D/g, '').slice(0, 6);
    setTutorCode(v);
    setTutorCodeError('');
  };
  const onChangeEmailCode = val => {
    const v = val.replace(/\D/g, '').slice(0, 6);
    setEmailCode(v);
    setEmailCodeError('');
  };

  const isValidDate = (y, m, d) => {
    if (!y || !m || !d) return false;
    const yyyy = Number(y);
    const mm = Number(m);
    const dd = Number(d);
    const date = new Date(yyyy, mm - 1, dd);
    return (
      date.getFullYear() === yyyy &&
      date.getMonth() === mm - 1 &&
      date.getDate() === dd
    );
  };

  const getAgeFromDate = (y, m, d) => {
    const yyyy = Number(y);
    const mm = Number(m);
    const dd = Number(d);
    const now = new Date();
    const birth = new Date(yyyy, mm - 1, dd);
    return (
      now.getFullYear() -
      birth.getFullYear() -
      (now.getMonth() < mm - 1 || (now.getMonth() === mm - 1 && now.getDate() < dd) ? 1 : 0)
    );
  };

  const syncBirthDate = (y, m, d) => {
    if (!y || !m || !d) {
      setFechaNac('');
      setBirthDateError('');
      setIsMinor(false);
      setIsUnder13(false);
      return;
    }
    if (!isValidDate(y, m, d)) {
      setFechaNac('');
      setBirthDateError(strings.invalidBirthDate);
      setIsMinor(false);
      setIsUnder13(false);
      return;
    }
    const computedAge = getAgeFromDate(y, m, d);
    setIsMinor(computedAge >= 13 && computedAge < 18);
    setIsUnder13(computedAge > 0 && computedAge < 13);
    if (computedAge < 13) {
      setFechaNac('');
      setBirthDateError(strings.birthDateUnder13);
      return;
    }
    if (computedAge > 120) {
      setFechaNac('');
      setBirthDateError(strings.birthDateOutOfRange);
      return;
    }
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    setFechaNac(`${y}-${mm}-${dd}`);
    setBirthDateError('');
  };
  const syncGuardianBirthDate = (y, m, d) => {
    if (!y || !m || !d) {
      setGuardianBirthDateError('');
      return;
    }
    if (!isValidDate(y, m, d)) {
      setGuardianBirthDateError(strings.invalidBirthDate);
      return;
    }
    const computedAge = getAgeFromDate(y, m, d);
    if (computedAge < 18) {
      setGuardianBirthDateError(strings.guardianMustBeAdult);
      return;
    }
    if (computedAge > 120) {
      setGuardianBirthDateError(strings.birthDateOutOfRange);
      return;
    }
    setGuardianBirthDateError('');
  };

  const onRequestTutorCode = async () => {
    const guardianDeclarationsOk =
      guardianDeclAdult &&
      guardianDeclTerms &&
      guardianDeclNotice &&
      guardianDeclPrivacy &&
      guardianDeclConsent;
    if (!guardianDeclarationsOk) setGuardianDeclarationsError(strings.guardianDeclarationsRequired);
    if (!guardianNombre) setGuardianNombreError(strings.enterValidGuardianName);
    if (!guardianApellido) setGuardianApellidoError(strings.enterValidGuardianLastName);
    if (!guardianEmail) setGuardianEmailError(strings.thisFieldIsMandatory);
    if (!guardianPhone) setGuardianPhoneError(strings.thisFieldIsMandatory);
    if (!guardianBirthDay || !guardianBirthMonth || !guardianBirthYear) {
      setGuardianBirthDateError(strings.thisFieldIsMandatory);
    }
    if (
      !guardianDeclarationsOk ||
      guardianNombreError ||
      guardianApellidoError ||
      guardianEmailError ||
      guardianPhoneError ||
      guardianBirthDateError ||
      !guardianNombre ||
      !guardianApellido ||
      !guardianEmail ||
      !guardianPhone ||
      !guardianBirthDay ||
      !guardianBirthMonth ||
      !guardianBirthYear
    ) {
      return;
    }
    setTutorRequesting(true);
    setTutorCodeError('');
    try {
      const resp = await requestTutorVerificationCode({
        correo_tutor: guardianEmail,
        telefono_tutor: `${guardianCountryCode}${guardianPhone}`,
        nombre_tutor: guardianNombre,
        apellido_tutor: guardianApellido,
        fecha_nacimiento_tutor: `${guardianBirthYear}-${String(guardianBirthMonth).padStart(2, '0')}-${String(guardianBirthDay).padStart(2, '0')}`,
        correo_usuario: email,
      });
      if (resp && resp.ok === true) {
        setTutorCodeSent(true);
        setTutorCodeSentMessage(strings.tutorCodeSentSuccess);
        setTutorVerifiedMessage('');
        const expiresAt = Date.now() + 30 * 60 * 1000;
        setTutorCodeExpiresAt(expiresAt);
        setTutorCodeRemaining(30 * 60);
        if (tutorExpiryTimer) clearInterval(tutorExpiryTimer);
        const timer = setInterval(() => {
          const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
          setTutorCodeRemaining(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            setTutorCodeSent(false);
            setTutorCode('');
            setTutorCodeError(strings.tutorCodeExpired);
            setTutorCodeSentMessage('');
          }
        }, 1000);
        setTutorExpiryTimer(timer);
      } else {
        setTutorCodeError(strings.tutorCodeSendError);
      }
    } catch (e) {
      setTutorCodeError(strings.tutorCodeSendError);
    } finally {
      setTutorRequesting(false);
    }
  };

  const onVerifyTutorCode = async () => {
    if (!tutorCode) {
      setTutorCodeError(strings.tutorCodeRequired);
      return;
    }
    setTutorVerifying(true);
    setTutorCodeError('');
    try {
      const resp = await verifyTutorCode({
        correo_tutor: guardianEmail,
        codigo: tutorCode,
      });
      if (resp && resp.ok === true && resp.valid === true) {
        setTutorVerified(true);
        setTutorVerifiedMessage(strings.tutorCodeVerifiedSuccess);
        setTutorCodeSent(false);
        setTutorCodeRemaining(0);
        setTutorCodeExpiresAt(null);
        if (tutorExpiryTimer) clearInterval(tutorExpiryTimer);
        setTutorExpiryTimer(null);
      } else {
        setTutorCodeError(strings.tutorCodeInvalid);
        setTutorVerified(false);
      }
    } catch (e) {
      setTutorCodeError(strings.tutorCodeInvalid);
      setTutorVerified(false);
    } finally {
      setTutorVerifying(false);
    }
  };

  const onRequestEmailCode = async () => {
    const ok = runBaseValidation(false);
    if (!ok) return false;
    setEmailRequesting(true);
    setEmailCodeError('');
    try {
      const resp = await requestEmailVerificationCode({correo: email});
      if (resp && resp.ok === true) {
        if (resp.valid === true) {
          setEmailVerified(true);
          setEmailVerifiedMessage(strings.emailCodeVerifiedSuccess);
          setEmailCodeSent(false);
          setEmailCodeSentMessage('');
          return true;
        } else {
          setEmailCodeSent(true);
          setEmailCodeSentMessage(strings.emailCodeSentSuccess);
          setEmailVerifiedMessage('');
          const expiresAt = Date.now() + 30 * 60 * 1000;
          setEmailCodeExpiresAt(expiresAt);
          setEmailCodeRemaining(30 * 60);
          if (emailExpiryTimer) clearInterval(emailExpiryTimer);
          const timer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setEmailCodeRemaining(remaining);
            if (remaining <= 0) {
              clearInterval(timer);
              setEmailCodeSent(false);
              setEmailCode('');
              setEmailCodeError(strings.emailCodeExpired);
              setEmailCodeSentMessage('');
            }
          }, 1000);
          setEmailExpiryTimer(timer);
          return true;
        }
      } else {
        setEmailCodeError(strings.emailCodeSendError);
        return false;
      }
    } catch (e) {
      setEmailCodeError(strings.emailCodeSendError);
      return false;
    } finally {
      setEmailRequesting(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const onVerifyEmailCode = async () => {
    if (!emailCode) {
      setEmailCodeError(strings.emailCodeRequired);
      return;
    }
    setEmailVerifying(true);
    setEmailCodeError('');
    try {
      const resp = await verifyEmailCode({correo: email, codigo: emailCode});
      if (resp && resp.ok === true && resp.valid === true) {
        setEmailVerified(true);
        setEmailVerifiedMessage(strings.emailCodeVerifiedSuccess);
      } else {
        setEmailCodeError(strings.emailCodeInvalid);
        setEmailVerified(false);
      }
    } catch (e) {
      setEmailCodeError(strings.emailCodeInvalid);
      setEmailVerified(false);
    } finally {
      setEmailVerifying(false);
    }
  };

  const runBaseValidation = (requireTutorVerified) => {
    if (!nombre) setNombreError(strings.enterValidName);
    if (!apellido) setApellidoError(strings.enterValidLastName);
    if (!email) setEmailError(strings.thisFieldIsMandatory);
    if (!emailConfirm) setEmailConfirmError(strings.thisFieldIsMandatory);
    if (!password) setPasswordError(strings.plsEnterPassword);
    if (!fechaNac) setBirthDateError(strings.thisFieldIsMandatory);
    if (!telefono) setTelefonoError(strings.thisFieldIsMandatory);
    if (!termsAccepted) setTermsAcceptedError(strings.termsRequired);
    const generoMissing = !genero;
    const idiomaMissing = !idioma;
    const confirmMissing = !confirmPassword;
    if (generoMissing) setGeneroError(strings.requiredField);
    if (idiomaMissing) setIdiomaError(strings.requiredField);
    if (confirmMissing) setConfirmPasswordError(strings.requiredField);
    if (isUnder13) {
      showErrorPopup(strings.birthDateUnder13, 'Edad no permitida');
      return false;
    }
    if (
      nombreError ||
      apellidoError ||
      emailError ||
      emailConfirmError ||
      passwordError ||
      confirmPasswordError ||
      telefonoError ||
      aliasError ||
      generoError ||
      idiomaError ||
      termsAcceptedError ||
      !nombre ||
      !apellido ||
      !email ||
      !emailConfirm ||
      !password ||
      !confirmPassword ||
      !telefono ||
      !genero ||
      !idioma ||
      !termsAccepted ||
      !fechaNac
    ) {
      return false;
    }
    if (emailConfirm !== email) {
      setEmailConfirmError(strings.emailConfirmMismatch);
      return false;
    }
    if (isMinor) {
      const guardianDeclarationsOk =
        guardianDeclAdult &&
        guardianDeclTerms &&
        guardianDeclNotice &&
        guardianDeclPrivacy &&
        guardianDeclConsent;
      if (!guardianDeclarationsOk) setGuardianDeclarationsError(strings.guardianDeclarationsRequired);
      if (!guardianNombre) setGuardianNombreError(strings.enterValidGuardianName);
      if (!guardianApellido) setGuardianApellidoError(strings.enterValidGuardianLastName);
      if (!guardianEmail) setGuardianEmailError(strings.thisFieldIsMandatory);
      if (!guardianPhone) setGuardianPhoneError(strings.thisFieldIsMandatory);
      if (!guardianBirthDay || !guardianBirthMonth || !guardianBirthYear) {
        setGuardianBirthDateError(strings.thisFieldIsMandatory);
      }
      if (requireTutorVerified && !tutorVerified) setTutorCodeError(strings.tutorVerificationRequired);
      if (
        !guardianDeclarationsOk ||
        guardianNombreError ||
        guardianApellidoError ||
        guardianEmailError ||
        guardianPhoneError ||
        guardianBirthDateError ||
        !guardianNombre ||
        !guardianApellido ||
        !guardianEmail ||
        !guardianPhone ||
        !guardianBirthDay ||
        !guardianBirthMonth ||
        !guardianBirthYear ||
        (requireTutorVerified && !tutorVerified)
      ) {
        return false;
      }
    }
    return true;
  };

  const onPressRegister = async () => {
    const ok = runBaseValidation(true);
    if (!ok) {
      showErrorPopup('Por favor completa todos los campos obligatorios correctamente.', 'Campos incompletos');
      return;
    }
    if (!emailCodeSent) {
      const sent = await onRequestEmailCode();
      if (sent) {
        // setSubmitError(strings.emailVerificationSent);
      }
      return;
    }
    if (!emailCode) {
      setEmailCodeError(strings.emailCodeRequired);
      return;
    }
    setSubmitting(true);
    try {
      const verifyResp = await verifyEmailCode({correo: email, codigo: emailCode});
      if (!(verifyResp && verifyResp.ok === true && verifyResp.valid === true)) {
        setEmailCodeError(strings.emailCodeInvalid);
        setSubmitting(false);
        return;
      }
      setEmailVerified(true);
      const phoneWithCode = telefono ? `${countryCode}${telefono}` : '';
      const guardianDeclarationsOk =
        guardianDeclAdult &&
        guardianDeclTerms &&
        guardianDeclNotice &&
        guardianDeclPrivacy &&
        guardianDeclConsent;
      const guardianPayload = isMinor
        ? {
            tutor_consent: guardianDeclarationsOk ? 1 : 0,
            tutor_nombre: guardianNombre,
            tutor_apellido: guardianApellido,
            tutor_fecha_nacimiento: `${guardianBirthYear}-${String(guardianBirthMonth).padStart(2, '0')}-${String(guardianBirthDay).padStart(2, '0')}`,
            tutor_telefono: `${guardianCountryCode}${guardianPhone}`,
            tutor_correo: guardianEmail,
            tutor_verificado: tutorVerified ? 1 : 0,
          }
        : {};
      const resp = await apiRegister({
        nombre,
        apellido,
        correo: email,
        contrasena: password,
        telefono: phoneWithCode,
        fecha_nacimiento: fechaNac,
        menor_edad: isMinor ? 1 : 0,
        alias,
        genero,
        idioma,
        como_se_entero: comoSeEntero,
        ...guardianPayload,
      });
      if (resp && (resp.success === true || resp.status === true)) {
        navigation.reset({index: 0, routes: [{name: StackNav.ThankYou}]});
      } else {
        showErrorPopup((resp && (resp.success_message || resp.message)) || 'Error al registrarse', 'Error de registro');
      }
    } catch (e) {
      showErrorPopup('Error de red. Verifica tu conexión e intenta de nuevo.', 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Social login removed
  return (
    <CSafeAreaView>
      <KeyBoardAvoidWrapper contentContainerStyle={{paddingBottom: moderateScale(320)}}>
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
            required
          />
          <CInput
            label={strings.lastName}
            placeHolder={strings.enterYourLastName}
            keyBoardType={'default'}
            _value={apellido}
            _errorText={apellidoError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeApellido}
            required
          />
          <CText type={'M14'} color={colors.labelColor} style={styles.mt20}>
            {strings.birthDate}
            <CText type={'M10'} color={'#FF927D'}>
              {' *'}  
            </CText>
          </CText>
          <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
            {strings.birthDateHelp}
          </CText>
          <View style={localStyles.birthRow}>
            <View style={[localStyles.birthFieldWrapper, localStyles.birthFieldSpacer]}>
              <CDropdown
                label={strings.birthDay}
                placeholder={strings.selectDay}
                value={birthDay}
                data={Array.from({length: 31}, (_, i) => ({
                  label: String(i + 1),
                  value: String(i + 1),
                }))}
                onChange={(item) => {
                  onChangeBirthDay(item);
                  syncBirthDate(birthYear, birthMonth, item?.value);
                }}
                style={localStyles.birthDropdown}
              />
            </View>
            <View style={[localStyles.birthFieldWrapper, localStyles.birthFieldSpacer]}>
              <CDropdown
                label={strings.birthMonth}
                placeholder={strings.selectMonth}
                value={birthMonth}
                data={[
                  {label: 'Ene', value: '1'},
                  {label: 'Feb', value: '2'},
                  {label: 'Mar', value: '3'},
                  {label: 'Abr', value: '4'},
                  {label: 'May', value: '5'},
                  {label: 'Jun', value: '6'},
                  {label: 'Jul', value: '7'},
                  {label: 'Ago', value: '8'},
                  {label: 'Sep', value: '9'},
                  {label: 'Oct', value: '10'},
                  {label: 'Nov', value: '11'},
                  {label: 'Dic', value: '12'},
                ]}
                onChange={(item) => {
                  onChangeBirthMonth(item);
                  syncBirthDate(birthYear, item?.value, birthDay);
                }}
                style={localStyles.birthDropdown}
              />
            </View>
            <View style={localStyles.birthFieldWrapper}>
              <CInput
                label={strings.birthYear}
                placeHolder={strings.selectYear}
                keyBoardType={'number-pad'}
                _value={birthYear}
                _errorText={birthDateError}
                autoCapitalize={'none'}
                toGetTextFieldValue={(val) => {
                  onChangeBirthYear(val);
                  syncBirthDate(val.replace(/\D/g, '').slice(0, 4), birthMonth, birthDay);
                }}
                _maxLength={4}
                required
                inputContainerStyle={localStyles.birthYearInputContainer}
                inputBoxStyle={localStyles.birthYearInputBox}
              />
            </View>
          </View>
          <CInput
            label={strings.alias}
            placeHolder={strings.enterAlias}
            keyBoardType={'default'}
            _value={alias}
            _errorText={aliasError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeAlias}
            required
          />
          <View style={localStyles.phoneRow}>
            <View style={localStyles.phoneCode}>
              <CDropdown
                label={strings.registerCountry}
                placeholder={strings.selectCountry}
                value={countryCode}
                data={[
                  {label: 'MX +52', value: '+52'},
                  {label: 'US +1', value: '+1'},
                  {label: 'CO +57', value: '+57'},
                  {label: 'AR +54', value: '+54'},
                  {label: 'CL +56', value: '+56'},
                  {label: 'PE +51', value: '+51'},
                  {label: 'ES +34', value: '+34'},
                  {label: 'GT +502', value: '+502'},
                  {label: 'EC +593', value: '+593'},
                  {label: 'VE +58', value: '+58'},
                  {label: 'UY +598', value: '+598'},
                  {label: 'PY +595', value: '+595'},
                  {label: 'CR +506', value: '+506'},
                  {label: 'PA +507', value: '+507'},
                  {label: 'DO +1', value: '+1'},
                  {label: 'HN +504', value: '+504'},
                  {label: 'SV +503', value: '+503'},
                  {label: 'NI +505', value: '+505'},
                ]}
                onChange={onChangeCountry}
                style={localStyles.phoneDropdown}
              />
            </View>
            <View style={localStyles.phoneInput}>
              <CInput
                label={strings.phone}
                placeHolder={strings.enterPhone}
                keyBoardType={'number-pad'}
                _value={telefono}
                _errorText={telefonoError}
                autoCapitalize={'none'}
                toGetTextFieldValue={onChangeTelefono}
                maxLength={15}
                required
              />
            </View>
          </View>
          <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
            {strings.phoneWhatsAppHelp}
          </CText>
          <CInput
            label={strings.email}
            placeHolder={strings.enterYourEmail}
            keyBoardType={'default'}
            _value={email}
            _errorText={emailError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeEmail}
            required
          />
          <CInput
            label={strings.confirmEmail}
            placeHolder={strings.confirmYourEmail}
            keyBoardType={'default'}
            _value={emailConfirm}
            _errorText={emailConfirmError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeEmailConfirm}
            required
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
            required
          />
          {/* <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
            {strings.passwordHelp}
          </CText> */}
          <CInput
            label={strings.confirmPassword}
            placeHolder={strings.confirmYourPassword}
            keyBoardType={'default'}
            _value={confirmPassword}
            _errorText={confirmPasswordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangeConfirmPassword}
            isSecure
            required
          />
          <CDropdown
            label={strings.gender}
            placeholder={strings.selectGender}
            value={generoOption}
            data={[
              {label: 'Agénero', value: 'Agénero'},
              {label: 'Andrógino', value: 'Andrógino'},
              {label: 'Bigénero', value: 'Bigénero'},
              {label: 'Cisgénero', value: 'Cisgénero'},
              {label: 'Demigénero', value: 'Demigénero'},
              {label: 'Femenino', value: 'Femenino'},
              {label: 'Género fluido', value: 'Género fluido'},
              {label: 'Intergénero', value: 'Intergénero'},
              {label: 'Masculino', value: 'Masculino'},
              {label: 'Neutro', value: 'Neutro'},
              {label: 'No binario', value: 'No binario'},
              {label: 'Otro', value: 'Otro'},
              {label: 'Pangénero', value: 'Pangénero'},
              {label: 'Prefiero no especificar', value: 'Prefiero no especificar'},
              {label: 'Transgénero (FtM)', value: 'Transgénero (FtM)'},
              {label: 'Transgénero (MtF)', value: 'Transgénero (MtF)'},
            ]}
            onChange={onChangeGenero}
            required
          />
          {!!generoError && (
            <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
              {generoError}
            </CText>
          )}
          {generoOption === 'Otro' && (
            <CInput
              label={strings.genderOtherInputLabel}
              placeHolder={strings.genderOtherInputPlaceholder}
              keyBoardType={'default'}
              _value={generoOtro}
              _errorText={generoError}
              autoCapitalize={'words'}
              toGetTextFieldValue={onChangeGeneroOtro}
              required
            />
          )}
          <CDropdown
            label={strings.registerLanguage}
            placeholder={strings.selectLanguage}
            value={idiomaOption}
            data={[
              {label: 'Español', value: 'Español'},
              {label: 'Alemán', value: 'Alemán'},
              {label: 'Árabe', value: 'Árabe'},
              {label: 'Chino (Mandarín)', value: 'Chino (Mandarín)'},
              {label: 'Coreano', value: 'Coreano'},
              {label: 'Francés', value: 'Francés'},
              {label: 'Hindi', value: 'Hindi'},
              {label: 'Inglés', value: 'Inglés'},
              {label: 'Italiano', value: 'Italiano'},
              {label: 'Japonés', value: 'Japonés'},
              {label: 'Polaco', value: 'Polaco'},
              {label: 'Portugués', value: 'Portugués'},
              {label: 'Ruso', value: 'Ruso'},
              {label: 'Turco', value: 'Turco'},
            ]}
            onChange={onChangeIdioma}
            required
          />
          {!!idiomaError && (
            <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
              {idiomaError}
            </CText>
          )}
          <CDropdown
            label={strings.howDidYouHear}
            placeholder={strings.howDidYouHearPlaceholder}
            value={comoSeEnteroOption}
            data={[
              {label: strings.howDidYouHearFamily, value: strings.howDidYouHearFamily},
              {label: strings.howDidYouHearFriends, value: strings.howDidYouHearFriends},
              {label: strings.howDidYouHearAds, value: strings.howDidYouHearAds},
              {label: strings.howDidYouHearOther, value: 'Otro'},
            ]}
            onChange={onChangeComoSeEntero}
          />
          {comoSeEnteroOption === 'Otro' && (
            <CInput
              label={strings.howDidYouHearOtherInputLabel}
              placeHolder={strings.howDidYouHearOtherInputPlaceholder}
              keyBoardType={'default'}
              _value={comoSeEnteroOtro}
              autoCorrect
              spellCheck
              autoCapitalize={'sentences'}
              toGetTextFieldValue={onChangeComoSeEnteroOtro}
              multiline
            />
          )}
          {isMinor && (
            <View style={localStyles.guardianSection}>
              <CText type={'S16'} color={colors.textColor} style={styles.mb10}>
                {strings.guardianDataTitle}
              </CText>
              <CInput
                label={strings.guardianName}
                placeHolder={strings.guardianNamePlaceholder}
                keyBoardType={'default'}
                _value={guardianNombre}
                _errorText={guardianNombreError}
                autoCapitalize={'words'}
                toGetTextFieldValue={onChangeGuardianNombre}
                required
              />
              <CInput
                label={strings.guardianLastName}
                placeHolder={strings.guardianLastNamePlaceholder}
                keyBoardType={'default'}
                _value={guardianApellido}
                _errorText={guardianApellidoError}
                autoCapitalize={'words'}
                toGetTextFieldValue={onChangeGuardianApellido}
                required
              />
              <CText type={'M14'} color={colors.labelColor} style={styles.mt10}>
                {strings.guardianBirthDate}
              </CText>
              <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
                {strings.birthDateHelp}
              </CText>
              <View style={localStyles.birthRow}>
                <View style={[localStyles.birthFieldWrapper, localStyles.birthFieldSpacer]}>
                  <CDropdown
                    label={strings.birthDay}
                    placeholder={strings.selectDay}
                    value={guardianBirthDay}
                    data={Array.from({length: 31}, (_, i) => ({
                      label: String(i + 1),
                      value: String(i + 1),
                    }))}
                    onChange={(item) => {
                      onChangeGuardianBirthDay(item);
                      syncGuardianBirthDate(guardianBirthYear, guardianBirthMonth, item?.value);
                    }}
                    style={localStyles.birthDropdown}
                  />
                </View>
                <View style={[localStyles.birthFieldWrapper, localStyles.birthFieldSpacer]}>
                  <CDropdown
                    label={strings.birthMonth}
                    placeholder={strings.selectMonth}
                    value={guardianBirthMonth}
                    data={[
                      {label: 'Ene', value: '1'},
                      {label: 'Feb', value: '2'},
                      {label: 'Mar', value: '3'},
                      {label: 'Abr', value: '4'},
                      {label: 'May', value: '5'},
                      {label: 'Jun', value: '6'},
                      {label: 'Jul', value: '7'},
                      {label: 'Ago', value: '8'},
                      {label: 'Sep', value: '9'},
                      {label: 'Oct', value: '10'},
                      {label: 'Nov', value: '11'},
                      {label: 'Dic', value: '12'},
                    ]}
                    onChange={(item) => {
                      onChangeGuardianBirthMonth(item);
                      syncGuardianBirthDate(guardianBirthYear, item?.value, guardianBirthDay);
                    }}
                    style={localStyles.birthDropdown}
                  />
                </View>
                <View style={localStyles.birthFieldWrapper}>
                  <CInput
                    label={strings.birthYear}
                    placeHolder={strings.selectYear}
                    keyBoardType={'number-pad'}
                    _value={guardianBirthYear}
                    _errorText={guardianBirthDateError}
                    autoCapitalize={'none'}
                    toGetTextFieldValue={(val) => {
                      onChangeGuardianBirthYear(val);
                      syncGuardianBirthDate(val.replace(/\D/g, '').slice(0, 4), guardianBirthMonth, guardianBirthDay);
                    }}
                    _maxLength={4}
                    required
                    inputContainerStyle={localStyles.birthYearInputContainer}
                    inputBoxStyle={localStyles.birthYearInputBox}
                  />
                </View>
              </View>
              <View style={localStyles.phoneRow}>
                <View style={localStyles.phoneCode}>
                  <CDropdown
                    label={strings.registerCountry}
                    placeholder={strings.selectCountry}
                    value={guardianCountryCode}
                    data={[
                      {label: 'MX +52', value: '+52'},
                      {label: 'US +1', value: '+1'},
                      {label: 'CO +57', value: '+57'},
                      {label: 'AR +54', value: '+54'},
                      {label: 'CL +56', value: '+56'},
                      {label: 'PE +51', value: '+51'},
                      {label: 'ES +34', value: '+34'},
                      {label: 'GT +502', value: '+502'},
                      {label: 'EC +593', value: '+593'},
                      {label: 'VE +58', value: '+58'},
                      {label: 'UY +598', value: '+598'},
                      {label: 'PY +595', value: '+595'},
                      {label: 'CR +506', value: '+506'},
                      {label: 'PA +507', value: '+507'},
                      {label: 'DO +1', value: '+1'},
                      {label: 'HN +504', value: '+504'},
                      {label: 'SV +503', value: '+503'},
                      {label: 'NI +505', value: '+505'},
                    ]}
                    onChange={onChangeGuardianCountry}
                    style={localStyles.phoneDropdown}
                  />
                </View>
                <View style={localStyles.phoneInput}>
                  <CInput
                    label={strings.guardianPhone}
                    placeHolder={strings.enterPhone}
                    keyBoardType={'number-pad'}
                    _value={guardianPhone}
                    _errorText={guardianPhoneError}
                    autoCapitalize={'none'}
                    toGetTextFieldValue={onChangeGuardianPhone}
                    maxLength={15}
                    required
                  />
                </View>
              </View>
              <CInput
                label={strings.guardianEmail}
                placeHolder={strings.enterYourEmail}
                keyBoardType={'default'}
                _value={guardianEmail}
                _errorText={guardianEmailError}
                autoCapitalize={'none'}
                toGetTextFieldValue={onChangeGuardianEmail}
                required
              />
              <CText type={'M14'} color={colors.labelColor} style={styles.mb10}>
                {strings.guardianDeclarationsTitle}
              </CText>
              <View style={[styles.rowSpaceBetween, styles.mb10]}>
                <CText type={'M14'} color={colors.labelColor} style={styles.flex}>
                  {strings.guardianDeclAdult}
                </CText>
                <Switch value={guardianDeclAdult} disabled={tutorCodeSent || tutorVerified} onValueChange={(val) => {
                  setGuardianDeclAdult(val);
                  setGuardianDeclarationsError('');
                }} />
              </View>
              <View style={[styles.rowSpaceBetween, styles.mb10]}>
                <CText type={'M14'} color={colors.labelColor} style={styles.flex}>
                  {strings.guardianDeclTerms}
                </CText>
                <Switch value={guardianDeclTerms} disabled={tutorCodeSent || tutorVerified} onValueChange={(val) => {
                  setGuardianDeclTerms(val);
                  setGuardianDeclarationsError('');
                }} />
              </View>
              <View style={[styles.rowSpaceBetween, styles.mb10]}>
                <CText type={'M14'} color={colors.labelColor} style={styles.flex}>
                  {strings.guardianDeclNotice}
                </CText>
                <Switch value={guardianDeclNotice} disabled={tutorCodeSent || tutorVerified} onValueChange={(val) => {
                  setGuardianDeclNotice(val);
                  setGuardianDeclarationsError('');
                }} />
              </View>
              <View style={[styles.rowSpaceBetween, styles.mb10]}>
                <CText type={'M14'} color={colors.labelColor} style={styles.flex}>
                  {strings.guardianDeclPrivacy}
                </CText>
                <Switch value={guardianDeclPrivacy} disabled={tutorCodeSent || tutorVerified} onValueChange={(val) => {
                  setGuardianDeclPrivacy(val);
                  setGuardianDeclarationsError('');
                }} />
              </View>
              <View style={[styles.rowSpaceBetween, styles.mb10]}>
                <CText type={'M14'} color={colors.labelColor} style={styles.flex}>
                  {strings.guardianDeclConsent}
                </CText>
                <Switch value={guardianDeclConsent} disabled={tutorCodeSent || tutorVerified} onValueChange={(val) => {
                  setGuardianDeclConsent(val);
                  setGuardianDeclarationsError('');
                }} />
              </View>
              {!!guardianDeclarationsError && (
                <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
                  {guardianDeclarationsError}
                </CText>
              )}
              {!tutorVerified && !tutorCodeSent && (
                <CButton
                  title={strings.tutorCodeSend}
                  onPress={onRequestTutorCode}
                  disabled={tutorRequesting}
                  loading={tutorRequesting}
                />
              )}
              {!tutorVerified && !tutorCodeSent && !!tutorCodeError && (
                <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
                  {tutorCodeError}
                </CText>
              )}
              {!tutorVerified && !!tutorCodeSentMessage && (
                <CText type={'S12'} color={colors.primary} style={styles.ml5}>
                  {tutorCodeSentMessage}
                </CText>
              )}
              {!tutorVerified && !!tutorCodeRemaining && (
                <CText type={'S12'} color={colors.labelColor} style={styles.ml5}>
                  {strings.tutorCodeCountdown.replace('{time}', formatCountdown(tutorCodeRemaining))}
                </CText>
              )}
              {!tutorVerified && tutorCodeSent && (
                <>
                  <CInput
                    label={strings.tutorCodeLabel}
                    placeHolder={strings.tutorCodePlaceholder}
                    keyBoardType={'number-pad'}
                    _value={tutorCode}
                    _errorText={tutorCodeError}
                    autoCapitalize={'none'}
                    toGetTextFieldValue={onChangeTutorCode}
                    _maxLength={6}
                    required
                  />
                  <CButton
                    title={strings.tutorCodeVerify}
                    onPress={onVerifyTutorCode}
                    disabled={tutorVerifying}
                    loading={tutorVerifying}
                  />
                </>
              )}
              {!!tutorVerifiedMessage && (
                <CText type={'S12'} color={colors.primary} style={styles.ml5}>
                  {tutorVerifiedMessage}
                </CText>
              )}
            </View>
          )}
          {/* Social login removed */}
          <View style={[styles.rowSpaceBetween, styles.mt10]}>
            <View style={[styles.rowStart, styles.wrap, styles.flex]}>
              <CText type={'S14'} color={colors.labelColor} style={styles.mr5}>
                {strings.termsAcceptanceLabel}
              </CText>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
                <CText type={'S14'} color={colors.primary} style={localStyles.linkInline}>
                  Aviso de privacidad
                </CText>
              </TouchableOpacity>
              <CText type={'S14'} color={colors.labelColor}>, </CText>
              <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
                <CText type={'S14'} color={colors.primary} style={localStyles.linkInline}>
                  Términos y condiciones
                </CText>
              </TouchableOpacity>
              <CText type={'S14'} color={colors.labelColor}>, </CText>
              <TouchableOpacity onPress={() => setImportantModalVisible(true)}>
                <CText type={'S14'} color={colors.primary} style={localStyles.linkInline}>
                  Aviso importante
                </CText>
              </TouchableOpacity>
              <CText type={'S14'} color={colors.labelColor}> y </CText>
              <TouchableOpacity onPress={() => setAccessibilityModalVisible(true)}>
                <CText type={'S14'} color={colors.primary} style={localStyles.linkInline}>
                  Aviso de accesibilidad
                </CText>
              </TouchableOpacity>
            </View>
            <Switch
              value={termsAccepted}
              onValueChange={(val) => {
                setTermsAccepted(val);
                setTermsAcceptedError(val ? '' : strings.termsRequired);
              }}
            />
          </View>
          {!!termsAcceptedError && (
            <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
              {termsAcceptedError}
            </CText>
          )}
          {isMinor && !tutorVerified ? (
            <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
              {strings.tutorVerificationRequired}
            </CText>
          ) : (
          !emailVerified ? (
            <View style={[localStyles.emailVerifySection, styles.mt10, styles.mb10]}>
              {!emailCodeSent && (
                <CButton
                  title={strings.register}
                  onPress={onPressRegister}
                  disabled={emailRequesting || submitting || !termsAccepted}
                  loading={emailRequesting || submitting}
                />
              )}
              {!emailCodeSent && !!emailCodeError && (
                <CText type={'S12'} color={colors.alertColor} style={styles.ml5}>
                  {emailCodeError}
                </CText>
              )}
              {!!emailCodeSentMessage && (
                <CText type={'S12'} color={colors.primary} style={styles.ml5}>
                  {emailCodeSentMessage}
                </CText>
              )}
              {emailCodeSent && (
                <>
                  <CText type={'S12'} color={colors.labelColor} style={styles.ml5}>
                    {strings.emailVerificationLegend}
                  </CText>
                  {!!emailCodeRemaining && (
                    <CText type={'S12'} color={colors.labelColor} style={styles.ml5}>
                      {strings.emailCodeCountdown.replace('{time}', formatCountdown(emailCodeRemaining))}
                    </CText>
                  )}
                  <CInput
                    label={strings.emailCodeLabel}
                    placeHolder={strings.emailCodePlaceholder}
                    keyBoardType={'number-pad'}
                    _value={emailCode}
                    _errorText={emailCodeError}
                    autoCapitalize={'none'}
                    toGetTextFieldValue={onChangeEmailCode}
                    _maxLength={6}
                    required
                  />
                  <CButton
                    title={strings.register}
                    onPress={onPressRegister}
                    disabled={submitting || !termsAccepted}
                    loading={submitting}
                  />
                </>
              )}
              {!!emailVerifiedMessage && (
                <CText type={'S12'} color={colors.primary} style={styles.ml5}>
                  {emailVerifiedMessage}
                </CText>
              )}
            </View>
          ) : (
            <CText type={'S12'} color={colors.primary} style={styles.ml5}>
              {strings.emailVerifiedDone}
            </CText>
          )
          )}
        </View>
        <TermsModal visible={privacyModalVisible} onClose={() => setPrivacyModalVisible(false)} type="privacy" />
        <TermsModal visible={termsModalVisible} onClose={() => setTermsModalVisible(false)} type="terms" />
        <TermsModal visible={importantModalVisible} onClose={() => setImportantModalVisible(false)} type="important" />
        <TermsModal visible={accessibilityModalVisible} onClose={() => setAccessibilityModalVisible(false)} type="accessibility" />
        <ErrorPopup
          visible={errorModalVisible}
          title={errorModalTitle}
          message={errorModalMessage}
          onClose={hideErrorPopup}
        />
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
  birthRow: {
    ...styles.rowStart,
    ...styles.mt10,
    ...styles.mb5,
    ...styles.itemsStart,
  },
  birthFieldWrapper: {
    flex: 1,
  },
  birthFieldSpacer: {
    marginRight: moderateScale(8),
  },
  birthDropdown: {
    width: '100%',
  },
  birthYearInputContainer: {
    width: '100%',
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.mt5,
    ...styles.selfCenter,
    ...styles.rowStart,
    ...styles.justifyBetween,
    ...styles.ph10,
  },
  birthYearInputBox: {
    ...styles.ph10,
    width: '100%',
    height: moderateScale(44),
  },
  guardianSection: {
    ...styles.mt10,
    ...styles.mb10,
  },
  legalLinks: {
    ...styles.mt10,
    ...styles.g5,
    ...styles.itemsCenter,
  },
  emailVerifySection: {
    ...styles.mt10,
  },
  phoneRow: {
    ...styles.rowSpaceBetween,
    ...styles.itemsStart,
  },
  phoneCode: {
    width: '35%',
    marginRight: moderateScale(8),
    ...styles.mt10,
  },
  phoneInput: {
    flex: 1,
  },
  phoneDropdown: {
    width: '100%',
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
  linkInline: {
    textDecorationLine: 'underline',
  },
  // Social styles removed
});
