import React, {useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, LayoutAnimation} from 'react-native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constants';

const FAQ_DATA = [
  {
    id: '1',
    question: '¿Qué es CresiMotion?',
    answer: 'CresiMotion es una aplicación diseñada para apoyar tu bienestar emocional y mental, ofreciendo herramientas de sanación, ejercicios terapéuticos y seguimiento de tu progreso personal.',
  },
  {
    id: '2',
    question: '¿Cómo puedo agendar una sesión terapéutica?',
    answer: 'Puedes agendar una sesión desde la sección "Sesiones" en el menú principal. Selecciona el tipo de sesión que necesitas y elige el horario que mejor se adapte a tu disponibilidad.',
  },
  {
    id: '3',
    question: '¿Las sesiones son presenciales o virtuales?',
    answer: 'CresiMotion ofrece ambas modalidades. Puedes elegir entre sesiones presenciales en nuestras instalaciones o sesiones virtuales desde la comodidad de tu hogar.',
  },
  {
    id: '4',
    question: '¿Cómo funciona el apoyo financiero?',
    answer: 'El apoyo financiero está disponible para usuarios que cumplan con ciertos criterios. Puedes solicitarlo desde la sección "Apoyo financiero" en el menú lateral.',
  },
  {
    id: '5',
    question: '¿Puedo usar la app sin crear una cuenta?',
    answer: 'Sí, algunas funcionalidades básicas están disponibles sin necesidad de iniciar sesión. Sin embargo, para acceder a sesiones personalizadas y guardar tu progreso, te recomendamos crear una cuenta.',
  },
  {
    id: '6',
    question: '¿Cómo puedo cambiar mi contraseña?',
    answer: 'Puedes cambiar tu contraseña desde la sección "Configuraciones" > "Seguridad" > "Cambiar contraseña". También puedes usar la opción "Olvidé mi contraseña" en la pantalla de inicio de sesión.',
  },
  {
    id: '7',
    question: '¿Mis datos están seguros?',
    answer: 'Sí, en CresiMotion tomamos muy en serio tu privacidad. Todos tus datos personales y sesiones están protegidos con encriptación de nivel bancario y cumplimos con las normativas de protección de datos.',
  },
  {
    id: '8',
    question: '¿Cómo contacto al soporte técnico?',
    answer: 'Puedes contactar a nuestro equipo de soporte desde la sección "Configuraciones" > "Ayuda y soporte", o enviarnos un correo a soporte@cresimotion.com.',
  },
];

function FAQItem({item, isExpanded, onToggle}: {item: typeof FAQ_DATA[0]; isExpanded: boolean; onToggle: () => void}) {
  const colors = useSelector((state: any) => state.theme.theme);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={localStyles.faqItem}
      onPress={onToggle}>
      <View style={localStyles.questionRow}>
        <CText type="B16" color={colors.textColor} align="left" style={localStyles.questionText}>
          {item.question}
        </CText>
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={colors.primary2}
        />
      </View>
      {isExpanded && (
        <View style={localStyles.answerContainer}>
          <CText type="R14" color={colors.grayScale5} align="left" style={localStyles.answerText}>
            {item.answer}
          </CText>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <CSafeAreaView color="#F6FBFA" style={localStyles.safeArea}>
      <CMainAppBar mode="sub" title="Preguntas frecuentes" />
      <ScrollView
        contentContainerStyle={[
          localStyles.content,
          {paddingBottom: insets.bottom + moderateScale(28)},
        ]}
        showsVerticalScrollIndicator={true}>
        <View style={localStyles.heroCard}>
          <View style={localStyles.heroBadge}>
            <Ionicons name="help-circle-outline" size={22} color="#0AA693" />
          </View>
          <CText type="B22" color={colors.primary2} align="left" style={localStyles.heroTitle}>
            ¿Cómo podemos ayudarte?
          </CText>
          <CText type="R14" color={colors.grayScale5} align="left" style={{}}>
            Encuentra respuestas a las preguntas más comunes sobre CresiMotion
          </CText>
        </View>

        <View style={localStyles.faqList}>
          {FAQ_DATA.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          ))}
        </View>

        <View style={localStyles.contactCard}>
          <Ionicons name="chatbubbles-outline" size={28} color={colors.primary2} />
          <CText type="B16" color={colors.textColor} align="center" style={localStyles.contactTitle}>
            ¿No encontraste lo que buscabas?
          </CText>
          <CText type="R14" color={colors.grayScale5} align="center" style={localStyles.contactText}>
            Nuestro equipo está disponible para ayudarte con cualquier duda adicional.
          </CText>
        </View>
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F6FBFA',
  },
  content: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(18),
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(22),
    marginBottom: moderateScale(18),
    shadowColor: '#0E4033',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  heroBadge: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(14),
    backgroundColor: '#E8F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  heroTitle: {
    marginBottom: moderateScale(6),
  },
  faqList: {
    gap: moderateScale(12),
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: '#16392B',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  answerContainer: {
    marginTop: moderateScale(12),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerText: {
    lineHeight: moderateScale(20),
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginTop: moderateScale(18),
    marginBottom: moderateScale(12),
    alignItems: 'center',
    shadowColor: '#0E4033',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  contactTitle: {
    marginTop: moderateScale(12),
    marginBottom: moderateScale(6),
  },
  contactText: {
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});
