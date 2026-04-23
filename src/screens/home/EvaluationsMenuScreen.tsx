import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constants';
import {StackNav, TabNav} from '../../navigation/NavigationKey';

const EVALUATION_OPTIONS = [
  {
    id: 'history',
    title: 'Historial de Autoevaluaciones',
    description:
      'Abre tu historial de autoevaluaciones para revisar el seguimiento que llevas hasta ahora.',
    icon: 'pulse-outline',
    accent: '#0AA693',
    background: '#E8F7F2',
    target: TabNav.EvaluationsTab,
  },
  {
    id: 'tests',
    title: 'Mis test',
    description:
      'Consulta tu historial de resultados de Test y revisa lo que ya has contestado.',
    icon: 'clipboard-outline',
    accent: '#6C63A8',
    background: '#F1EEFB',
    target: StackNav.TestResultsHistory,
  },
];

export default function EvaluationsMenuScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <CSafeAreaView color="#F7FBF8" style={localStyles.safeArea}>
      <CMainAppBar mode="sub" title="Autoevaluaciones" />
      <ScrollView
        contentContainerStyle={[
          localStyles.content,
          {paddingBottom: insets.bottom + moderateScale(24)},
        ]}
        showsVerticalScrollIndicator={true}>
        <View style={localStyles.heroCard}>
          <View style={localStyles.heroBadge}>
            <Ionicons name="analytics-outline" size={22} color="#0AA693" />
          </View>
          <CText type="B22" color={colors.primary2} style={localStyles.heroTitle}>
            Sigue tu proceso con perspectiva
          </CText>
          <CText type="R14" color={colors.textColor} style={localStyles.heroText}>
            Aquí reunimos tus accesos de evaluación para que entres más rápido al
            flujo terapéutico o a la sección de Test cuando lo necesites.
          </CText>
        </View>

        {EVALUATION_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.88}
            style={localStyles.optionCard}
            onPress={() => navigation.navigate(option.target)}>
            <View style={[localStyles.iconWrap, {backgroundColor: option.background}]}>
              <Ionicons name={option.icon} size={28} color={option.accent} />
            </View>

            <View style={localStyles.optionBody}>
              <CText type="B18" color={colors.textColor} style={localStyles.optionTitle}>
                {option.title}
              </CText>
              <CText type="R14" color={colors.grayScale5} style={localStyles.optionText}>
                {option.description}
              </CText>
            </View>

            <View style={[localStyles.ctaChip, {backgroundColor: option.background}]}>
              <CText type="S12" color={option.accent} style={localStyles.ctaText}>
                Entrar
              </CText>
              <Ionicons name="arrow-forward" size={14} color={option.accent} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FBF8',
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
    marginBottom: moderateScale(8),
  },
  heroText: {
    lineHeight: moderateScale(21),
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(22),
    padding: moderateScale(18),
    marginBottom: moderateScale(14),
    shadowColor: '#16392B',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  optionBody: {
    marginBottom: moderateScale(18),
  },
  optionTitle: {
    marginBottom: moderateScale(6),
  },
  optionText: {
    lineHeight: moderateScale(20),
  },
  ctaChip: {
    alignSelf: 'flex-start',
    borderRadius: moderateScale(999),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    marginRight: moderateScale(6),
  },
});
