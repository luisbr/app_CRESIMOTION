import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { selectTherapyFocus } from '../../api/sesionTerapeutica';
import { postPostWorkMotivoIntro } from '../../modules/diagnostico/api/sessionsApi';
import { extractMotivos, getMotivoLabel, normalizeTherapyNext } from './therapyUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function FocusSelectScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const nextPayload = route?.params?.next || null;
  const entrypoint = route?.params?.entrypoint || null;
  const postWork = route?.params?.postWork || false;
  const postWorkGroupId = route?.params?.groupId || null;
  const postWorkMotivos = Array.isArray(route?.params?.motivos) ? route.params.motivos : [];
  const postWorkEmotions = Array.isArray(route?.params?.emotions) ? route.params.emotions : [];
  const { sessionId, data } = normalizeTherapyNext(nextPayload);
  const motivos = useMemo(() => (postWork ? postWorkMotivos : extractMotivos(data)), [data, postWork, postWorkMotivos]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skipFocus, setSkipFocus] = useState(false);
  const [scrollIndicator, setScrollIndicator] = useState({visible: false, top: 0, height: 0});
  const scrollLayoutHeightRef = useRef(0);
  const scrollContentHeightRef = useRef(0);

  const updateScrollIndicator = (scrollY = 0) => {
    const layoutHeight = scrollLayoutHeightRef.current;
    const contentHeight = scrollContentHeightRef.current;
    if (!layoutHeight || !contentHeight || contentHeight <= layoutHeight + 4) {
      setScrollIndicator({visible: false, top: 0, height: 0});
      return;
    }
    const trackHeight = Math.max(layoutHeight - moderateScale(8), 1);
    const thumbHeight = Math.max((layoutHeight / contentHeight) * trackHeight, moderateScale(36));
    const maxScroll = Math.max(contentHeight - layoutHeight, 1);
    const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
    const thumbTop = (scrollY / maxScroll) * maxThumbTop;
    setScrollIndicator({
      visible: true,
      top: thumbTop,
      height: thumbHeight,
    });
  };

  const onContinue = async () => {
    try {
      if (postWork) {
        if (skipFocus) {
          navigation.replace('TherapyHealingSelectEmotion', {
            postWork: true,
            groupId: postWorkGroupId,
            emotions: postWorkEmotions,
            entrypoint: 'post_work',
          });
          return;
        }
        if (!postWorkGroupId || !selectedId) return;
        const selectedMotivo = motivos.find((m: any) => String(m?.id ?? m?.motivo_id ?? m?.item_id ?? '') === selectedId);
        console.log('[POST_WORK] motivo-intro payload', {
          groupId: postWorkGroupId,
          motivo_id: Number(selectedId),
        });
        const intro = await postPostWorkMotivoIntro(Number(postWorkGroupId), {
          motivo_id: Number(selectedId),
        });
        console.log('[POST_WORK] motivo-intro response', intro);
        navigation.replace('TherapyHealingIntro', {
          postWork: true,
          groupId: postWorkGroupId,
          motivoId: Number(selectedId),
          motivoLabel: getMotivoLabel(selectedMotivo),
          emotions: postWorkEmotions,
          next: intro,
          entrypoint: 'post_work',
        });
        return;
      }
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
      <View style={[styles.ph20, styles.pv20, { flex: 1, backgroundColor: colors.backgroundColor }]}>
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: moderateScale(160), paddingRight: moderateScale(18)}}
            onLayout={event => {
              scrollLayoutHeightRef.current = event.nativeEvent.layout.height;
              updateScrollIndicator();
            }}
            onContentSizeChange={(_, height) => {
              scrollContentHeightRef.current = height;
              updateScrollIndicator();
            }}
            onScroll={event => {
              updateScrollIndicator(event.nativeEvent.contentOffset.y);
            }}
            scrollEventThrottle={16}
          >
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
              <CText type={'B18'}>Enfoque positivo, constructivo e inteligente con la metodología de última generación CresiMotion</CText>
              <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
                Te acompañamos para transformar el enfoque de lo negativo, doloroso o traumático hacia uno más positivo e inteligente, para reducir la intensidad del evento vivido. Sabemos que estás atravesando un momento difícil, y queremos que sepas que estamos aquí para apoyarte. Sin embargo, también queremos recordarte que este es un proceso de crecimiento y aprendizaje. Cada experiencia, incluso la más desafiante, nos ofrece la oportunidad de conocernos mejor y de entender lo que necesitamos en nuestras relaciones más significativas. Reproduce el audio y escúchalo con atención.
              </CText>
            </View>
            {motivos.length === 0 ? (
              <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
                No hay motivos disponibles.
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
                {motivos.map((item: any, index: number) => {
                  const id = String(item?.id ?? item?.motivo_id ?? item?.item_id ?? '');
                  const label = getMotivoLabel(item);
                  const isOn = selectedId === id;
                  return (
                    <View key={id || String(index)} style={{ borderBottomWidth: index === motivos.length - 1 ? 0 : 1, borderColor: colors.grayScale2 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setSkipFocus(false);
                          setSelectedId(isOn ? null : id);
                        }}
                        style={[styles.rowSpaceBetween, styles.pv15, { paddingHorizontal: 16 }]}
                      >
                        <View style={[styles.rowStart, { flex: 1 }]}>
                          <Ionicons
                            name={isOn ? 'checkbox' : 'square-outline'}
                            size={moderateScale(22)}
                            color={isOn ? colors.primary : colors.grayScale2}
                            style={{ marginRight: 10 }}
                          />
                          <CText type={'S16'} style={{flex: 1, flexShrink: 1}}>
                            {label || 'Motivo'}
                          </CText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
          {scrollIndicator.visible && (
            <View pointerEvents="none" style={localStyles.scrollIndicatorTrack}>
              <View
                style={[
                  localStyles.scrollIndicatorThumb,
                  {
                    top: scrollIndicator.top,
                    height: scrollIndicator.height,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          )}
        </View>
        {postWork && null}
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
        {postWork ? (
          <View style={[styles.rowSpaceBetween]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CButton
                title={'Más tarde'}
                bgColor={colors.inputBg}
                color={colors.primary}
                onPress={() =>
                  navigation.replace('TherapyHealingSelectEmotion', {
                    postWork: true,
                    groupId: postWorkGroupId,
                    emotions: postWorkEmotions,
                    entrypoint: 'post_work',
                  })
                }
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CButton title={'Siguiente'} disabled={!selectedId} onPress={onContinue} />
            </View>
          </View>
        ) : (
          <CButton title={'Siguiente'} disabled={!selectedId} onPress={onContinue} />
        )}
      </View>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  scrollIndicatorTrack: {
    position: 'absolute',
    top: moderateScale(4),
    bottom: moderateScale(4),
    right: moderateScale(4),
    width: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  scrollIndicatorThumb: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: moderateScale(4),
  },
});
