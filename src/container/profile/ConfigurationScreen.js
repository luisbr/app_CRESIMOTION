import {StyleSheet, View, ScrollView, TouchableOpacity, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CDivider from '../../components/common/CDivider';
import CButton from '../../components/common/CButton';
import CInput from '../../components/common/CInput';
import {Modal} from 'react-native';
import {StackNav} from '../../navigation/NavigationKey';
import {getProfile, updateProfile, suspendAccount, deleteAccount, updateProfilePassword} from '../../api/auth';
import {styles} from '../../theme';
import {colors} from '../../theme/colors';
import {moderateScale, THEME} from '../../common/constants';
import strings from '../../i18n/strings';
import {changeThemeAction, changeFontScaleAction} from '../../redux/action/themeAction';
import {setAsyncStorageData} from '../../utils/AsyncStorage';

export default function ConfigurationScreen({navigation}) {
  const currentTheme = useSelector(state => state.theme.theme);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    notificaciones_correo: 1,
    notificaciones_push: 1,
    descarga_wifi: 1,
    accesibilidad_fuente: 'mediano',
    accesibilidad_contraste: 'estandar',
    idioma: 'es',
  });

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaveError, setPasswordSaveError] = useState('');
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await getProfile();
        if (resp && resp.success && resp.perfil) {
          setPreferences({
            notificaciones_correo: parseInt(resp.perfil.notificaciones_correo ?? 1),
            notificaciones_push: parseInt(resp.perfil.notificaciones_push ?? 1),
            descarga_wifi: parseInt(resp.perfil.descarga_wifi ?? 1),
            accesibilidad_fuente: resp.perfil.accesibilidad_fuente || 'mediano',
            accesibilidad_contraste: resp.perfil.accesibilidad_contraste || 'estandar',
            idioma: resp.perfil.idioma || 'es',
          });
        }
      } catch (e) {
        console.log('Error fetching configuration', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveConfig = async (newPrefs) => {
    setPreferences(newPrefs);
    try {
      await updateProfile(newPrefs);
    } catch (e) {
      console.log('Error saving profile changes', e);
    }
  };

  const handleContrastChange = (val) => {
    setOption('accesibilidad_contraste', val);
    if (val === 'alto_contraste') {
      setAsyncStorageData(THEME, 'dark');
      dispatch(changeThemeAction(colors.dark));
    } else {
      setAsyncStorageData(THEME, 'light');
      dispatch(changeThemeAction(colors.light));
    }
  };

  const handleFontScaleChange = (val) => {
    setOption('accesibilidad_fuente', val);
    let scale = 1.0;
    if (val === 'pequeno') scale = 0.85;
    if (val === 'mediano') scale = 1.0;
    if (val === 'grande') scale = 1.15;
    
    // Dispatch to redux
    dispatch(changeFontScaleAction(scale));
    // Persist local pref if we want, currently saving online via updateProfile
  };

  const toggleBoolean = (key) => {
    const newVal = preferences[key] === 1 ? 0 : 1;
    saveConfig({ ...preferences, [key]: newVal });
  };

  const setOption = (key, val) => {
    saveConfig({ ...preferences, [key]: val });
  };

  const renderCheckOption = (title, checked, onPress) => {
    return (
      <TouchableOpacity 
        style={localStyles.rowCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <CText type="s14" numberOfLines={1}>{title}</CText>
        <Feather
          name={checked ? "check-square" : "square"}
          size={moderateScale(24)}
          color={checked ? currentTheme.primary : currentTheme.gray}
        />
      </TouchableOpacity>
    );
  };

  const renderRadioOption = (title, checked, onPress) => {
    return (
      <TouchableOpacity 
        style={localStyles.radioRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Feather
          name={checked ? "check-circle" : "circle"}
          size={moderateScale(20)}
          color={checked ? currentTheme.primary : currentTheme.gray}
        />
        <CText type="s14" style={{marginLeft: moderateScale(10)}}>{title}</CText>
      </TouchableOpacity>
    );
  };

  const renderArrowOption = (title, onPress, hint = '') => {
    return (
      <TouchableOpacity 
        style={localStyles.rowCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View>
          <CText type="s14">{title}</CText>
          {hint ? <CText type="r12" color={currentTheme.gray}>{hint}</CText> : null}
        </View>
        <Feather name="chevron-right" size={moderateScale(24)} color={currentTheme.gray} />
      </TouchableOpacity>
    );
  };

  const onSuspend = () => {
    Alert.alert(
      "Suspender Cuenta",
      "¿Estás seguro de que deseas suspender tu cuenta temporalmente?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Suspender", style: "destructive", onPress: async () => {
            try {
              await suspendAccount();
              navigation.reset({ index: 0, routes: [{name: StackNav.AuthNavigation}] });
            } catch (e) { Alert.alert("Error", "No se pudo suspender la cuenta."); }
        }}
      ]
    );
  };

  const onDelete = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "Esta acción es irreversible. ¿Deseas eliminar permanentemente tu cuenta y todos tus datos?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
            try {
              await deleteAccount();
              navigation.reset({ index: 0, routes: [{name: StackNav.AuthNavigation}] });
            } catch (e) { Alert.alert("Error", "No se pudo eliminar la cuenta."); }
        }}
      ]
    );
  };

  const onPressChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setPasswordSaveError('');
    setPasswordSaveSuccess('');
    setPasswordModalVisible(true);
  };

  const onClosePasswordModal = () => {
    setPasswordModalVisible(false);
  };

  const onSavePassword = async () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setPasswordSaveError('');
    let valid = true;
    if (!currentPassword) {
      setCurrentPasswordError('* Requerido');
      valid = false;
    }
    if (!newPassword || newPassword.length < 8) {
      setNewPasswordError('* Al menos 8 caracteres');
      valid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('* No coinciden');
      valid = false;
    }
    if (!valid) return;

    setPasswordSaving(true);
    try {
      const payload = { current_password: currentPassword, new_password: newPassword };
      const res = await updateProfilePassword(payload);
      if (res && res.success) {
        setPasswordSaveSuccess('Contraseña actualizada correctamente');
        setTimeout(() => setPasswordModalVisible(false), 2000);
      } else {
        setPasswordSaveError(res?.message || 'Error al actualizar');
      }
    } catch (e) {
      setPasswordSaveError('Contraseña actual inválida.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <CSafeAreaView>
      <CHeader title="Configuración" isHideBack={false} />
      
      {!loading && (
        <ScrollView contentContainerStyle={localStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Cuenta Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Cuenta</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            {renderArrowOption("Contraseña", onPressChangePassword, "Cambiar o recuperar")}  
            <CDivider style={localStyles.divider} />
            {renderArrowOption("Preferencias de idioma", () => navigation.navigate(StackNav.Languages), preferences.idioma === 'en' ? 'Inglés' : 'Español')}
          </View>

          {/* Accesibilidad Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Accesibilidad</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            <CText type="b14" style={{marginBottom: moderateScale(10)}}>Tamaño de fuente</CText>
            {renderRadioOption("Pequeño", preferences.accesibilidad_fuente === 'pequeno', () => handleFontScaleChange('pequeno'))}
            {renderRadioOption("Mediano", preferences.accesibilidad_fuente === 'mediano', () => handleFontScaleChange('mediano'))}
            {renderRadioOption("Grande", preferences.accesibilidad_fuente === 'grande', () => handleFontScaleChange('grande'))}
            
            <CDivider style={localStyles.divider} />
            
            <CText type="b14" style={{marginBottom: moderateScale(10)}}>Contraste</CText>
            {renderRadioOption("Estándar (Modo Claro)", preferences.accesibilidad_contraste === 'estandar', () => handleContrastChange('estandar'))}
            {renderRadioOption("Alto contraste (Modo Oscuro)", preferences.accesibilidad_contraste === 'alto_contraste', () => handleContrastChange('alto_contraste'))}
          </View>

          {/* Notificaciones Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Notificaciones</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            {renderCheckOption("Correo electrónico", preferences.notificaciones_correo === 1, () => toggleBoolean('notificaciones_correo'))}
            <CDivider style={localStyles.divider} />
            {renderCheckOption("Notificaciones Push", preferences.notificaciones_push === 1, () => toggleBoolean('notificaciones_push'))}
          </View>

          {/* Reproduccion y Descarga Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Reproducción y descarga</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            {renderCheckOption("Descarga solo con Wifi", preferences.descarga_wifi === 1, () => toggleBoolean('descarga_wifi'))}
          </View>

          {/* Soporte y ayuda Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Soporte</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            {renderArrowOption("Soporte y ayuda", () => navigation.navigate(StackNav.HelpAndSupport))}
          </View>

          {/* Opciones de cuenta Section */}
          <CText type="B16" style={localStyles.sectionTitle}>Opciones de cuenta</CText>
          <View style={[localStyles.card, {backgroundColor: currentTheme.backgroundColor}]}>
            <TouchableOpacity style={localStyles.rowCard} onPress={onSuspend} activeOpacity={0.7}>
              <CText type="s14" color={colors.warning}>Suspender cuenta</CText>
            </TouchableOpacity>
            <CDivider style={localStyles.divider} />
            <TouchableOpacity style={localStyles.rowCard} onPress={onDelete} activeOpacity={0.7}>
              <CText type="s14" color={colors.alertColor}>Eliminar cuenta</CText>
            </TouchableOpacity>
          </View>

          <View style={localStyles.bottomSpacing} />
        </ScrollView>
      )}

      <Modal animationType="slide" transparent={true} visible={passwordModalVisible}>
        <View style={localStyles.modalOverlay}>
          <View style={[
            localStyles.modalCard,
            {backgroundColor: currentTheme.dark ? currentTheme.indicatorColor : currentTheme.white},
          ]}>
            <CText type={'B18'} style={styles.mb10}>Cambiar contraseña</CText>
            <CInput
              label="Contraseña actual"
              placeHolder="Contraseña actual"
              keyBoardType={'default'}
              _value={currentPassword}
              _errorText={currentPasswordError}
              autoCapitalize={'none'}
              toGetTextFieldValue={setCurrentPassword}
              isSecure
            />
            <CInput
              label="Nueva contraseña"
              placeHolder="Nueva contraseña"
              keyBoardType={'default'}
              _value={newPassword}
              _errorText={newPasswordError}
              autoCapitalize={'none'}
              toGetTextFieldValue={setNewPassword}
              isSecure
            />
            <CInput
              label="Confirmar nueva contraseña"
              placeHolder="Confirmar nueva contraseña"
              keyBoardType={'default'}
              _value={confirmPassword}
              _errorText={confirmPasswordError}
              autoCapitalize={'none'}
              toGetTextFieldValue={setConfirmPassword}
              isSecure
            />
            {!!passwordSaveError && (
              <CText type={'S12'} color={currentTheme.redAlert} style={styles.mt10}>
                {passwordSaveError}
              </CText>
            )}
            {!!passwordSaveSuccess && (
              <CText type={'S12'} color={colors.primary} style={styles.mt10}>
                {passwordSaveSuccess}
              </CText>
            )}
            <View style={localStyles.editActions}>
              <CButton title="Guardar" onPress={onSavePassword} disabled={passwordSaving} />
              <CButton title="Cancelar" onPress={onClosePasswordModal} />
            </View>
          </View>
        </View>
      </Modal>

    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
  },
  sectionTitle: {
    marginBottom: moderateScale(10),
    marginTop: moderateScale(10),
  },
  card: {
    ...styles.shadowStyle,
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(5),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  divider: {
    marginVertical: moderateScale(10),
  },
  bottomSpacing: {
    height: moderateScale(100),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  modalCard: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
  },
  editActions: {
    marginTop: moderateScale(10),
    gap: moderateScale(10),
  },
});
