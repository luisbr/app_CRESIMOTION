import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { selectHealingEmotion } from '../../api/sesionTerapeutica';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  extractEmotions,
  getEmotionId,
  getEmotionLabel,
  getIntensityRank,
  normalizeTherapyNext,
} from './therapyUtils';

const INTRO_TEXT =
  'Nos alegra tenerte aquí. La sanación emocional es el camino para sanar las heridas del pasado, procesar las emociones no resueltas y restaurar la paz interna. A través de herramientas avanzadas y personalizadas, te ayudaremos a reconocer, comprender y liberar esas emociones, permitiéndote vivir con mayor equilibrio, autocomprensión y resiliencia.\n\nAhora, a fin de proporcionarte una Sesión de sanación emocional para reducir considerablemente una a una cualquier emoción dolorosa, selecciona la emoción que más está teniendo impacto en tu vida en este momento, entre las emociones que marcaste en nivel Muy alto, Alto o Medio.';

export default function HealingSelectEmotionScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const items = useMemo(() => {
    const raw = extractEmotions(data);
    const normalized = raw
      .map((item: any) => {
        const label = getEmotionLabel(item);
        const id = getEmotionId(item);
        const intensity =
          item?.intensity_label ||
          item?.intensidad_label ||
          item?.intensity ||
          item?.nivel ||
          item?.nivel_intensidad ||
          item?.peso ||
          item?.value ||
          null;
        return { id, label, intensity, raw: item };
      })
      .filter((it: any) => it.label && it.id != null);
    const filtered = normalized.filter((it: any) => getIntensityRank(it.intensity) >= 3);
    const list = filtered.length ? filtered : normalized;
    return list.sort((a: any, b: any) => getIntensityRank(b.intensity) - getIntensityRank(a.intensity));
  }, [data]);

  const otherOptions = useMemo(() => {
    const list = data?.other_options || data?.otras_opciones || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const onContinue = async () => {
    try {
      if (!sessionId || selectedId == null) return;
      const next = await selectHealingEmotion({
        sessionId,
        emocionId: selectedId,
      });
      navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  const renderItem = (label: string, id: string | number) => {
    const isOn = selectedId === id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedId(isOn ? null : id)}
        style={[styles.rowStart, styles.pv15, { paddingHorizontal: 16 }]}
      >
        <View style={[styles.rowStart, { flex: 1 }]}>
          <Ionicons
            name={isOn ? 'checkbox' : 'square-outline'}
            size={moderateScale(22)}
            color={isOn ? colors.primary : colors.grayScale2}
            style={{ marginRight: 10 }}
          />
          <CText type={'S16'}>{label}</CText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={[styles.ph20, styles.pv20, { flex: 1, backgroundColor: colors.backgroundColor }]}>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <CText type={'B18'}>Sanación emocional</CText>
          <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
            {INTRO_TEXT}
          </CText>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: moderateScale(240) }}
        >
          {items.length === 0 && otherOptions.length === 0 ? (
            <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
              No hay emociones para mostrar.
            </CText>
          ) : (
            <View
              style={{
                marginTop: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.grayScale2,
                backgroundColor: colors.white,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 6,
                overflow: 'hidden',
              }}
            >
              {items.map((item: any, index: number) => (
                <View
                  key={String(item.id ?? index)}
                  style={{ borderBottomWidth: index === items.length - 1 ? 0 : 1, borderColor: colors.grayScale2 }}
                >
                  {renderItem(item.label, item.id)}
                </View>
              ))}
            </View>
          )}
          {otherOptions.length > 0 && (
            <View style={styles.mt20}>
              <CText type={'B16'}>Otra</CText>
              {otherOptions.map((opt: any, idx: number) => {
                const id = opt?.id ?? opt?.emocion_id ?? `other-${idx}`;
                const label = opt?.label || opt?.nombre || opt?.name || `Opcion ${idx + 1}`;
                return (
                  <View key={String(id)}>
                    {renderItem(label, id)}
                    <View style={{ height: 1, backgroundColor: colors.grayScale2 }} />
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: colors.grayScale2,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <CButton title={'Siguiente'} disabled={selectedId == null} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
