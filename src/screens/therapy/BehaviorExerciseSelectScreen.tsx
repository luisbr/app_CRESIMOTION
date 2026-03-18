import React, { useMemo, useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, ScrollView, Platform, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { submitBehaviorExercises } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeNavigation} from '../../navigation/safeNavigation';

export default function BehaviorExerciseSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

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

  const toggleExpanded = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
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
    if (submittingRef.current) {
      return;
    }
    let didNavigate = false;
    if (!sessionId) {
      Alert.alert('Error', 'No se encontró la sesión.');
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert(
        'Mensaje',
        'Escoge los ejercicios que se adapten a tu estilo de vida. Cada cambio positivo, por pequeño que sea, tiene un impacto significativo en tu calidad de vida.',
        [{ text: 'Cerrar', style: 'cancel' }]
      );
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
      submittingRef.current = true;
      setSubmitting(true);
      const resp = await submitBehaviorExercises({ sessionId, items });
      console.log('[THERAPY] ejercicios response', resp);
      didNavigate = true;
      safeNavigation.navigate('TherapyAgendaSetup', { sessionId, exercises: exercisesForAgenda });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar los ejercicios.');
    } finally {
      if (didNavigate) return;
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140, backgroundColor: colors.backgroundColor }]}
                  keyboardShouldPersistTaps={'handled'}>
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


          {!!groups?.[0]?.motivo && (
          <CText type={'B18'}>
            Selecciona tus ejercicios para {groups[0].motivo}
          </CText>
         
        )}


          {!!message && (
            <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
              {message}
            </CText>
          )}
        </View>

        {groups.map((group: any, idx: number) => (
          <View key={String(group?.recomendacion_id ?? idx)} style={styles.mt20}>
            <View
              style={{
                backgroundColor: colors.inputBg,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 3,
                marginBottom: 8,
              }}
            >
              <CText type={'R18'} style={{ color: colors.textColor }}>
                {group?.recomendacion_title || 'Recomendación'}
              </CText>
            </View>
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
              }}
            >
              <FlatList
                data={group?.items || []}
                keyExtractor={(item: any, index: number) =>
                  String(item?.ejercicio_id ?? item?.id ?? index)
                }
                renderItem={({ item, index }: any) => {
                  const id = Number(item?.ejercicio_id ?? item?.id);
                  const isOn = !!selected[id];
                  const key = String(id);
                  const hasInfo = Boolean(item?.info);
                  const isExpanded = !!expanded[key];
                  return (
                    <View style={{ borderBottomWidth: index === (group?.items || []).length - 1 ? 0 : 1, borderColor: colors.grayScale2 }}>
                    <View style={[styles.rowSpaceBetween, styles.pv15, { paddingHorizontal: 16 }]}>
                        <TouchableOpacity onPress={() => toggle(id)} style={{ marginRight: 10 }}>
                          <Ionicons
                            name={isOn ? 'checkbox' : 'square-outline'}
                            size={moderateScale(22)}
                            color={isOn ? colors.primary : colors.grayScale2}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => hasInfo && toggleExpanded(key)}
                          activeOpacity={hasInfo ? 0.7 : 1}
                          style={{ flex: 1, marginRight: 12 }}
                        >
                          <CText type={'S16'}>{item?.title || item?.nombre || 'Ejercicio'} </CText>
                        </TouchableOpacity>
                        {hasInfo ? (
                          <TouchableOpacity onPress={() => toggleExpanded(key)}>
                            <Ionicons
                              name={'information-circle-outline'}
                              size={moderateScale(18)}
                              color={'#999999'}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      {hasInfo && isExpanded ? (
                        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                          <CText type={'R12'} color={'#666666'} style={{ lineHeight: 18 }}>
                            {item.info}
                          </CText>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
                contentContainerStyle={{
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              />
            </View>
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
        <CButton title={'Siguiente'} disabled={selectedIds.length === 0 || submitting} loading={submitting} onPress={onContinue} />
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
