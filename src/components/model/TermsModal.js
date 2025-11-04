import React from 'react';
import {Modal, StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {styles} from '../../theme';
import {deviceWidth, moderateScale} from '../../common/constants';
import CText from '../common/CText';

export default function TermsModal({visible, onClose}) {
  const colors = useSelector(state => state.theme.theme);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[localStyles.overlay, {backgroundColor: colors.transparentModel}]}> 
        <View style={[localStyles.container, {backgroundColor: colors.backgroundColor}]}> 
          <TouchableOpacity style={localStyles.closeIcon} onPress={onClose}>
            <Ionicons name="close-outline" size={moderateScale(32)} color={colors.textColor} />
          </TouchableOpacity>
          <CText type={'B18'} align={'center'} style={styles.mb10}>
            {"Términos y Condiciones"}
          </CText>
          <ScrollView style={styles.mt10} showsVerticalScrollIndicator={false}>
            <CText type={'R14'} color={colors.labelColor}>
              {`Este es un texto de muestra para los Términos y Condiciones de uso de CresiMotion.

Al utilizar esta aplicación, aceptas cumplir con estas condiciones. El contenido, funcionalidades y servicios pueden cambiar sin previo aviso.

1) Uso Aceptable: No podrás usar la app para actividades ilícitas o no autorizadas.
2) Cuenta: Eres responsable de mantener la confidencialidad de tus credenciales.
3) Privacidad: Consulta nuestra política de privacidad para conocer cómo tratamos tus datos.
4) Contenido: El contenido con fines informativos no sustituye orientación profesional.
5) Modificaciones: Podemos actualizar estos términos; el uso continuo implica aceptación.

Si no estás de acuerdo con alguno de los puntos, deberás dejar de usar la aplicación.`}
            </CText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    ...styles.flex,
    ...styles.center,
  },
  container: {
    width: deviceWidth - moderateScale(40),
    borderRadius: moderateScale(16),
    ...styles.p20,
    maxHeight: '80%',
  },
  closeIcon: {
    ...styles.selfEnd,
  },
});

