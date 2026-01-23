import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { submitBehaviorRecommendations } from '../../api/sesionTerapeutica';
import { normalizeTherapyNext } from './therapyUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BehaviorRecoSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const { sessionId, data, route: nextRoute } = normalizeTherapyNext(nextPayload);
  console.log("datadatadata ",data);
  const title = data?.title || 'Creación de hábitos saludables';
  const message = data?.description || data?.message || 'Selecciona las recomendaciones que deseas reforzar.';
  const items = Array.isArray(data?.items) ? data.items : [];
  const selection = data?.selection || {};
  const max = Number(selection?.max || 3);
  const min = Number(selection?.required_min || 1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getItemKey = (item: any, index: number) =>
    String(item?.recomendacion_id ?? item?.id ?? index);

  const getItemId = (item: any) => {
    const id = Number(item?.recomendacion_id ?? item?.id);
    return Number.isFinite(id) ? id : null;
  };

  const selectedIds = useMemo(() => {
    const ids: number[] = [];
    items.forEach((item: any, index: number) => {
      const key = getItemKey(item, index);
      if (!selected[key]) return;
      const id = getItemId(item);
      if (id != null) ids.push(id);
    });
    return ids;
  }, [items, selected]);
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = { ...prev };
      const isOn = !!prev[key];
      if (!isOn && max && selectedCount >= max) return prev;
      next[key] = !isOn;
      return next;
    });
  };

  const toggleExpanded = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };


  const onContinue = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      if (selectedCount < min) return;
      if (!selectedIds.length) {
        Alert.alert('Error', 'No pudimos identificar las recomendaciones seleccionadas.');
        return;
      }
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
          <CText type={'S12'} color={'#EF4444'} style={styles.mb5}>
            {`DEBUG · route=${String(nextRoute || 'N/A')} · entry=${String(entrypoint || 'N/A')} · session=${String(sessionId || 'N/A')}`}
          </CText>
          <CText type={'B18'}>{title}</CText>
          <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
            {message}
          </CText>
        </View>
        {items.length === 0 ? (
          <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
            No hay recomendaciones para mostrar.
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
            }}
          >
            <FlatList
            data={items}
            keyExtractor={(item: any, index: number) => getItemKey(item, index)}
            ListHeaderComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item, index }: any) => {
              const key = getItemKey(item, index);
              const isOn = !!selected[key];
              const isExpanded = !!expanded[key];
              const hasInfo = Boolean(item?.info);
              return (
                  <View style={{ borderBottomWidth: index === items.length - 1 ? 0 : 1, borderColor: colors.grayScale2 }}>
                    <View style={[styles.rowSpaceBetween, styles.pv15, { paddingHorizontal: 16 }]}>
                      <TouchableOpacity onPress={() => toggle(key)} style={{ marginRight: 10 }}>
                        <Ionicons
                          name={isOn ? 'checkbox' : 'square-outline'}
                          size={moderateScale(22)}
                          color={isOn ? colors.primary : colors.grayScale2}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => hasInfo && toggleExpanded(key)}
                        activeOpacity={hasInfo ? 0.7 : 1}
                        style={{ flex: 1, paddingRight: 10 }}
                      >
                        <CText type={'S16'}>{item?.label || item?.title || item?.nombre || 'Recomendación'}</CText>
                        {!!item?.motivo && (
                          <View
                            style={{
                              backgroundColor: colors.inputBg,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 12,
                              marginTop: 6,
                              alignSelf: 'flex-start',
                            }}
                          >
                            <CText type={'S12'} color={colors.primary}>
                              {item.motivo}
                            </CText>
                          </View>
                        )}
                      </TouchableOpacity>
                      {hasInfo ? (
                        <TouchableOpacity onPress={() => toggleExpanded(key)}>
                          <Ionicons
                            name={'chevron-down'}
                            size={moderateScale(18)}
                            color={'#999999'}
                            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
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
              ListFooterComponent={() => <View style={{ height: moderateScale(200) }} />}
              contentContainerStyle={{
                paddingBottom: moderateScale(20),
                borderRadius: 16,
                overflow: 'hidden',
              }}
            />
          </View>
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
        <CButton title={'Siguiente'} disabled={selectedCount < min} onPress={onContinue} />
      </View>
    </CSafeAreaView>
  );
}
