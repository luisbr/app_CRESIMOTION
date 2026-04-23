import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {StackNav, TabNav} from '../../navigation/NavigationKey';

export default function TestResultScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {testName, puntaje, result} = route.params ?? {};

  console.log('[TestResultScreen] Params:', {testName, puntaje, result});

  const rango = result?.rango ?? null;

  // resultado_texto is the label in the actual DB schema
  const rangoLabel = rango?.resultado_texto ?? rango?.etiqueta ?? '';
  const rangoColor = colors.primary;

  return (
    <CSafeAreaView color={colors.backgroundColor}>
      {/* Header */}
      <View style={[localStyles.header, {backgroundColor: colors.primary}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <CText type="B18" color="#fff" align="left" style={{}}>{testName ?? 'Resultado'}</CText>
      </View>

      <ScrollView contentContainerStyle={localStyles.scroll} showsVerticalScrollIndicator={true}>
        
        {/* Score circle */}
        <View style={localStyles.scoreContainer}>
          <View style={[localStyles.scoreCircle, {borderColor: rangoColor, shadowColor: rangoColor}]}>
            <CText type="B32" color={rangoColor} align="center" style={{}}>{puntaje}</CText>
            <CText type="R12" color={colors.labelColor} align="center" style={{}}>puntos</CText>
          </View>
        </View>

        {/* Etiqueta rango */}
        {rango ? (
          <>
            <View style={[localStyles.labelBadge, {backgroundColor: rangoColor + '22', borderColor: rangoColor}]}>
              <CText type="B16" color={rangoColor} align="center" style={{}}>
                {rangoLabel}
              </CText>
              <CText type="R12" color={colors.labelColor} align="center" style={styles.mt5}>
                Rango: {rango.puntuacion_min} – {rango.puntuacion_max} puntos
              </CText>
            </View>

            {/* Interpretación */}
            {!!rango.interpretacion && (
              <View style={[localStyles.card, {backgroundColor: '#E8F4FD', borderColor: '#A8C8EF'}]}>
                <View style={localStyles.cardTitleRow}>
                  <CText type="B15" color={colors.primary} align="left" style={{}}>✅ Interpretación</CText>
                </View>
                <CText type="R14" color={colors.textColor} style={styles.mt8} align="left">
                  {rango.interpretacion}
                </CText>
              </View>
            )}

            {/* Recomendación */}
            {!!rango.recomendacion && (
              <View style={[localStyles.card, {backgroundColor: '#FEFAE0', borderColor: '#F5D87C'}]}>
                <View style={localStyles.cardTitleRow}>
                  <CText type="B15" color="#7A6000" align="left" style={{}}>💡 Recomendación</CText>
                </View>
                <CText type="R14" color={colors.textColor} style={styles.mt8} align="left">
                  {rango.recomendacion}
                </CText>
              </View>
            )}
          </>
        ) : (
          <View style={localStyles.labelBadge}>
            <CText type="M14" align="center" color={colors.labelColor} style={{}}>
              No se encontró interpretación para este puntaje.
            </CText>
          </View>
        )}

        {/* Action buttons */}
        <CButton
          title="Hacer otro test"
          onPress={() => navigation.navigate(StackNav.TestsGabo)}
          bgColor={colors.inputBg}
          color={colors.primary}
          containerStyle={styles.mt10}
          type="B16"
          textStyle={{}}
          style={{}}
          borderColor={colors.primary}
        />
        <CButton
          title="Volver al inicio"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: StackNav.TabNavigation, state: { routes: [{ name: TabNav.HomeTab }] } }] })}
          containerStyle={styles.mt10}
          type="B16"
          color="#fff"
          bgColor={colors.primary}
          textStyle={{}}
          style={{}}
          borderColor={colors.primary}
        />
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
    gap: moderateScale(16),
    paddingBottom: moderateScale(30),
    alignItems: 'stretch',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(10),
  },
  scoreCircle: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#fff',
  },
  labelBadge: {
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    borderWidth: 1,
    alignItems: 'center',
  },
  card: {
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    borderWidth: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
});
