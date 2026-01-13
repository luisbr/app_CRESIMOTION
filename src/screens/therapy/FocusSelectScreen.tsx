import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { selectTherapyFocus } from '../../api/sesionTerapeutica';
import { extractMotivos, getMotivoLabel, normalizeTherapyNext } from './therapyUtils';

export default function FocusSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const motivos = useMemo(() => extractMotivos(data), [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onContinue = async () => {
    try {
      if (!sessionId || !selectedId) return;
      const next = await selectTherapyFocus({ sessionId, motivoId: selectedId });
      navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }]}>
        <CText type={'B18'}>Enfoque positivo, constructivo e inteligente con la metodología de última generación CresiMotion</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          Elige un motivo para continuar con tu enfoque positivo.
        </CText>
        {motivos.length === 0 ? (
          <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
            No hay motivos disponibles.
          </CText>
        ) : (
          <FlatList
            data={motivos}
            keyExtractor={(item: any, idx: number) => String(item?.id ?? item?.motivo_id ?? idx)}
            renderItem={({ item }: any) => {
              const id = String(item?.id ?? item?.motivo_id ?? '');
              const label = getMotivoLabel(item);
              const isOn = selectedId === id;
              return (
                <TouchableOpacity onPress={() => setSelectedId(isOn ? null : id)} style={[styles.rowSpaceBetween, styles.pv15]}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <CText type={'S16'}>{label || 'Motivo'}</CText>
                  </View>
                  <View
                    style={{
                      width: moderateScale(22),
                      height: moderateScale(22),
                      borderRadius: moderateScale(11),
                      borderWidth: 2,
                      borderColor: isOn ? colors.primary : colors.grayScale2,
                      backgroundColor: isOn ? colors.primary : 'transparent',
                    }}
                  />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.grayScale2 }} />}
            style={[styles.mt20]}
            contentContainerStyle={{ paddingBottom: moderateScale(96) }}
          />
        )}
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
        <CButton title={'Siguiente'} disabled={!selectedId} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
