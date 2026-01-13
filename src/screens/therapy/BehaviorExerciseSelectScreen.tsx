import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { submitBehaviorExercises } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';

export default function BehaviorExerciseSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const title = data?.title || 'Ejercicios prácticos';
  const message = data?.message || '';
  const groups = Array.isArray(data?.groups) ? data.groups : [];
  const rules = data?.global_rules || {};
  const maxTotal = Number(rules?.max_total || 3);
  const requiredMin = Number(rules?.required_min_per_group || 1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)), [selected]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = { ...prev };
      const isOn = !!prev[id];
      if (!isOn && maxTotal && selectedIds.length >= maxTotal) return prev;
      next[id] = !isOn;
      return next;
    });
  };

  const groupOk = useMemo(() => {
    if (!groups.length) return selectedIds.length >= requiredMin;
    return groups.every((g: any) => {
      const ids = (g?.items || []).map((i: any) => Number(i?.ejercicio_id ?? i?.id));
      const count = ids.filter((id: number) => selected[id]).length;
      return count >= (g?.required_min ?? requiredMin);
    });
  }, [groups, requiredMin, selected, selectedIds.length]);

  const onContinue = async () => {
    if (!sessionId) {
      Alert.alert('Error', 'No se encontró la sesión.');
      return;
    }
    const items: any[] = [];
    const exercisesForAgenda: any[] = [];
    groups.forEach((group: any) => {
      const recomendacionId = Number(group?.recomendacion_id ?? group?.id);
      const selectedIds: number[] = [];
      (group?.items || []).forEach((item: any) => {
        const id = Number(item?.ejercicio_id ?? item?.id);
        if (selected[id]) {
          selectedIds.push(id);
          exercisesForAgenda.push({
            ejercicio_id: id,
            title: item?.title || item?.nombre || 'Ejercicio',
          });
        }
      });
      if (recomendacionId && selectedIds.length) {
        items.push({ recomendacion_id: recomendacionId, ejercicio_ids: selectedIds });
      }
    });
    if (!items.length) return;
    try {
      const resp = await submitBehaviorExercises({ sessionId, items });
      console.log('[THERAPY] ejercicios response', resp);
      navigation.navigate('TherapyAgendaSetup', { sessionId, exercises: exercisesForAgenda });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar los ejercicios.');
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}
                  keyboardShouldPersistTaps={'handled'}>
        <CText type={'B18'}>{title}</CText>
        {!!message && (
          <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
            {message}
          </CText>
        )}
        {groups.map((group: any, idx: number) => (
          <View key={String(group?.recomendacion_id ?? idx)} style={styles.mt20}>
            <CText type={'B16'}>{group?.recomendacion_title || 'Recomendación'}</CText>
            <FlatList
              data={group?.items || []}
              keyExtractor={(item: any) => String(item?.ejercicio_id ?? item?.id)}
              renderItem={({ item }: any) => {
                const id = Number(item?.ejercicio_id ?? item?.id);
                const isOn = !!selected[id];
                return (
                  <TouchableOpacity onPress={() => toggle(id)} style={[styles.rowSpaceBetween, styles.pv15]}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <CText type={'S16'}>{item?.title || item?.nombre || 'Ejercicio'}</CText>
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
              contentContainerStyle={{ paddingBottom: 6 }}
            />
          </View>
        ))}
      </ScrollView>
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
        <CButton title={'Siguiente'} disabled={!groupOk || selectedIds.length === 0} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
