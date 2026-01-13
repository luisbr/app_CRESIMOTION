import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { submitBehaviorRecommendations } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';

export default function BehaviorRecoSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  console.log("datadatadata ",data);
  const title = data?.title || 'Creación de hábitos saludables';
  const message = data?.message || 'Selecciona las recomendaciones que deseas reforzar.';
  const items = Array.isArray(data?.items) ? data.items : [];
  const selection = data?.selection || {};
  const max = Number(selection?.max || 3);
  const min = Number(selection?.required_min || 1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)), [selected]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = { ...prev };
      const isOn = !!prev[id];
      if (!isOn && max && selectedIds.length >= max) return prev;
      next[id] = !isOn;
      return next;
    });
  };

  const onContinue = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      if (selectedIds.length < min) return;
      console.log('[THERAPY] recomendaciones payload', {
        sessionId,
        recomendacionIds: selectedIds,
        min,
        max,
      });
      const next = await submitBehaviorRecommendations({ sessionId, recomendacionIds: selectedIds });
      console.log('[THERAPY] recomendaciones response', next);
      navigation.replace('TherapyFlowRouter', { initialNext: next, entrypoint });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo continuar.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }]}>
        <CText type={'B18'}>{title}</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          {message}
        </CText>
        {items.length === 0 ? (
          <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
            No hay recomendaciones para mostrar.
          </CText>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item: any) => String(item?.recomendacion_id ?? item?.id)}
            renderItem={({ item }: any) => {
              const id = Number(item?.recomendacion_id ?? item?.id);
              const isOn = !!selected[id];
              return (
                <TouchableOpacity onPress={() => toggle(id)} style={[styles.rowSpaceBetween, styles.pv15]}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <CText type={'S16'}>{item?.title || item?.nombre || 'Recomendación'}</CText>
                    {!!item?.info && (
                      <CText type={'R12'} color={colors.labelColor} style={styles.mt5}>
                        {item.info}
                      </CText>
                    )}
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
        <CButton title={'Siguiente'} disabled={selectedIds.length < min} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
