import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {StackNav} from '../../navigation/NavigationKey';
import {getCustomTest, submitCustomTestResult} from '../../api/customTests';

const SCALE_OPTIONS = [
  {value: 0, label: 'Nulo'},
  {value: 1, label: 'Bajo'},
  {value: 2, label: 'Medio'},
  {value: 3, label: 'Alto'},
  {value: 4, label: 'Muy alto'},
];

export default function TestDetailScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {testId, testName} = route.params ?? {};

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCustomTest(testId);
      setTest(data);
      setLoading(false);
    };
    load();
  }, [testId]);

  const allAnswered = test
    ? test.preguntas.length > 0 &&
      test.preguntas.every((p: any) => answers[p.id] !== undefined)
    : false;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const total = Object.values(answers).reduce((acc, val) => acc + val, 0);
    const result = await submitCustomTestResult(testId, total);
    setSubmitting(false);
    navigation.navigate(StackNav.TestResult, {
      testName: test?.nombre ?? testName,
      puntaje: total,
      result,
    });
  };

  const setAnswer = (preguntaId: number, value: number) => {
    setAnswers(prev => ({...prev, [preguntaId]: value}));
  };

  if (loading) {
    return (
      <CSafeAreaView>
        <ActivityIndicator size="large" color={colors.primary} style={styles.mt25} />
      </CSafeAreaView>
    );
  }

  if (!test) {
    return (
      <CSafeAreaView>
        <CText type="M16" align="center" style={styles.mt25} color={colors.textColor}>
          No se pudo cargar el test.
        </CText>
      </CSafeAreaView>
    );
  }

  return (
    <CSafeAreaView>
      {/* Header */}
      <View style={[localStyles.header, {backgroundColor: colors.primary}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <View style={styles.flex}>
          <CText type="B18" color="#fff" numberOfLines={2} align="left" style={{}}>{test.titulo}</CText>
        </View>
      </View>

      <ScrollView contentContainerStyle={localStyles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Descripción / Objetivo card */}
        {!!test.descripcion && (
          <View style={[localStyles.infoCard, {backgroundColor: '#E3F7F1', borderColor: '#A8D8CB'}]}>
            <CText type="B14" color={colors.primary} style={styles.mb5} align="left">🎯 Descripción</CText>
            <CText type="R14" color={colors.textColor} align="left" style={{}}>{test.descripcion}</CText>
          </View>
        )}

        {/* Note: instrucciones not in current schema, skipped */}

        {/* Escala reference */}
        <View style={localStyles.scaleRef}>
          {SCALE_OPTIONS.map(opt => (
            <View key={opt.value} style={localStyles.scaleRefItem}>
              <CText type="B13" color={colors.primary} align="center" style={{}}>{opt.value}</CText>
              <CText type="R11" color={colors.labelColor} align="center" style={{}}>{opt.label}</CText>
            </View>
          ))}
        </View>

        {/* Questions */}
        {test.preguntas.map((pregunta: any, index: number) => (
          <View
            key={pregunta.id}
            style={[
              localStyles.questionCard,
              {
                backgroundColor: colors.inputBg,
                borderColor: answers[pregunta.id] !== undefined
                  ? colors.primary + '60'
                  : colors.grayScale3,
              },
            ]}
          >
            <CText type="M14" color={colors.textColor} style={styles.mb10} align="left">
              {index + 1}. {pregunta.pregunta}
            </CText>
            <View style={localStyles.optionsRow}>
              {SCALE_OPTIONS.map(opt => {
                const selected = answers[pregunta.id] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      localStyles.optionBtn,
                      selected && {backgroundColor: colors.primary},
                    ]}
                    onPress={() => setAnswer(pregunta.id, opt.value)}
                  >
                    <CText
                      type="B14"
                      color={selected ? '#fff' : colors.textColor}
                      align="center"
                      style={{}}
                    >
                      {opt.value}
                    </CText>
                  </TouchableOpacity>
                );
              })}
            </View>
            {answers[pregunta.id] !== undefined && (
              <CText type="R11" color={colors.primary} style={styles.mt5} align="left">
                {SCALE_OPTIONS[answers[pregunta.id]].label}
              </CText>
            )}
          </View>
        ))}

        {/* Submit button */}
        <CButton
          title={submitting ? 'Calculando...' : 'Ver mi resultado'}
          onPress={handleSubmit}
          disabled={!allAnswered || submitting}
          loading={submitting}
          containerStyle={[
            localStyles.submitBtn,
            !allAnswered && {opacity: 0.5},
          ]}
        />

        {!allAnswered && (
          <CText type="R12" align="center" color={colors.labelColor} style={styles.mb20}>
            Responde todas las preguntas para continuar
          </CText>
        )}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(16),
    gap: moderateScale(12),
  },
  backBtn: {padding: moderateScale(4)},
  scroll: {
    padding: moderateScale(16),
    gap: moderateScale(14),
    paddingBottom: moderateScale(30),
  },
  infoCard: {
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    borderWidth: 1,
  },
  scaleRef: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0F5EE',
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
  },
  scaleRefItem: {
    alignItems: 'center',
  },
  questionCard: {
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    borderWidth: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginTop: moderateScale(4),
  },
  optionBtn: {
    flex: 1,
    height: moderateScale(44),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#DCE1E7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  submitBtn: {
    marginTop: moderateScale(6),
    marginBottom: moderateScale(10),
  },
});
