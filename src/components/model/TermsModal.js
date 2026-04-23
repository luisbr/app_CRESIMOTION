import React from 'react';
import {Modal, StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {styles} from '../../theme';
import {deviceWidth, moderateScale} from '../../common/constants';
import CText from '../common/CText';

const CONTENT_TYPES = {
  privacy: {
    title: 'Aviso de Privacidad',
    content: `En CresiMotion respetamos tu privacidad y nos comprometemos a proteger tus datos personales.

1) Responsable: CresiMotion es responsable del tratamiento de tus datos personales.
2) Datos que recopilamos: Podemos recopilar información como nombre, correo electrónico, número de teléfono y datos de uso de la aplicación.
3) Finalidad: Utilizamos tus datos para提供服务, mejorar la experiencia del usuario y comunicarte información relevante.
4) Compartición: No compartimos tus datos con terceros sin tu consentimiento, excepto cuando sea requerido por ley.
5) Tus derechos: Puedes acceder, rectificar o eliminar tus datos en cualquier momento contactándonos.

Para más información sobre nuestra política de privacidad, consulta nuestro sitio web.`
  },
  terms: {
    title: 'Términos y Condiciones',
    content: `Este es un texto de muestra para los Términos y Condiciones de uso de CresiMotion.

Al utilizar esta aplicación, aceptas cumplir con estas condiciones. El contenido, funcionalidades y servicios pueden cambiar sin previo aviso.

1) Uso Aceptable: No podrás usar la app para actividades ilícitas o no autorizadas.
2) Cuenta: Eres responsable de mantener la confidencialidad de tus credenciales.
3) Privacidad: Consulta nuestra política de privacidad para conocer cómo tratamos tus datos.
4) Contenido: El contenido con fines informativos no sustituye orientación profesional.
5) Modificaciones: Podemos actualizar estos términos; el uso continuo implica aceptación.

Si no estás de acuerdo con alguno de los puntos, deberás dejar de usar la aplicación.`
  },
  important: {
    title: 'Aviso Importante',
    content: `AVISO: Esta aplicación NO está diseñada para casos que requieran atención especializada en salud mental.

CresiMotion es una herramienta de apoyo emocional y bienestar general, pero NO sustituye la atención médica, psicológica o psiquiátrica profesional.

1) No es atención médica: La app no proporciona diagnóstico, tratamiento ni atención médica de ningún tipo.
2) Situaciones de emergencia: Si estás en crisis o necesitas ayuda inmediata, por favor contacta a los servicios de emergencia de tu país.
3) Limitaciones: Si tienes condiciones de salud mental severas, busca ayuda de un profesional calificado.
4) Responsabilidad: El uso de la app es bajo tu propio riesgo y CresiMotion no se hace responsable de decisiones tomadas con base en su contenido.

Tu bienestar es importante. Si necesitas ayuda profesional, no dudes en buscarla.`
  },
  accessibility: {
    title: 'Aviso de Accesibilidad',
    content: `CresiMotion está comprometido con la accesibilidad digital para todas las personas.

1) Nuestro compromiso: Buscamos garantizar que nuestra aplicación sea accesible para usuarios con diversas discapacidades.
2) Características de accesibilidad: Nuestra app incluye soporte para lectores de pantalla, navegación por teclado y ajustes de tamaño de texto.
3) Mejora continua: Estamos trabajando continuamente para mejorar la accesibilidad de nuestra plataforma.
4) Feedback: Si tienes dificultades para acceder a cualquier parte de la aplicación, por favor contáctanos para recibir asistencia.
5) Estándares: Seguimos las pautas de accesibilidad web (WCAG) para asegurar una experiencia inclusiva.

Tus comentarios nos ayudan a mejorar.`
  }
};

export default function TermsModal({visible, onClose, type = 'terms'}) {
  const colors = useSelector(state => state.theme.theme);
  const content = CONTENT_TYPES[type] || CONTENT_TYPES.terms;
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[localStyles.overlay, {backgroundColor: colors.transparentModel}]}> 
        <View style={[localStyles.container, {backgroundColor: colors.backgroundColor}]}> 
          <TouchableOpacity style={localStyles.closeIcon} onPress={onClose}>
            <Ionicons name="close-outline" size={moderateScale(32)} color={colors.textColor} />
          </TouchableOpacity>
          <CText type={'B18'} align={'center'} style={styles.mb10}>
            {content.title}
          </CText>
          <ScrollView style={styles.mt10} showsVerticalScrollIndicator={true}>
            <CText type={'R14'} color={colors.labelColor}>
              {content.content}
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

