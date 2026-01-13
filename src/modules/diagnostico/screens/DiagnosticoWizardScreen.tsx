import React, {useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import type {CatalogItem, CatalogOption, ModuleKey} from '../types';
import {normalizeOptions, saveLastRoute} from '../utils';
import OptionCard from '../components/OptionCard';
import ProgressBar from '../components/ProgressBar';
import {completeSession, saveAnswer} from '../api/sessionsApi';
import BehaviorMessageCard from '../components/BehaviorMessageCard';

export default function DiagnosticoWizardScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const sessionId: number = Number(route?.params?.sessionId);
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const items: CatalogItem[] = route?.params?.items || [];
  const selectedIds: number[] = route?.params?.selectedIds || [];
  const answers = route?.params?.answers || [];
  const initialAnswered = useMemo(() => {
    const ids = new Set<number>();
    (answers || []).forEach((a: any) => {
      if (a?.item_id) ids.add(Number(a.item_id));
    });
    return ids;
  }, [answers]);
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(initialAnswered);
  const [selectedOption, setSelectedOption] = useState<CatalogOption | null>(null);
  const [error, setError] = useState('');

  const selectedItems = useMemo(() => items.filter(i => selectedIds.includes(Number(i.id))), [items, selectedIds]);
  const currentItem = useMemo(() => selectedItems.find(i => !answeredIds.has(Number(i.id))), [selectedItems, answeredIds]);
  const options = currentItem ? normalizeOptions(currentItem) : [];
  const selectedBehavior = useMemo(() => {
    if (!currentItem || !selectedOption) return null;
    const behaviors = currentItem.behaviors || [];
    if (selectedOption.id != null) {
      const byId = behaviors.find(
        b =>
          b?.active === true &&
          b?.show_text_below === true &&
          Number(b?.option_id) === Number(selectedOption.id)
      );
      if (byId) return byId;
    }
    return (
      behaviors.find(
        b =>
          b?.active === true &&
          b?.show_text_below === true &&
          b?.option_key &&
          b.option_key === selectedOption.key
      ) || null
    );
  }, [currentItem, selectedOption]);
  const progress = selectedItems.length ? answeredIds.size / selectedItems.length : 0;

  const onSelectOption = (opt: CatalogOption) => {
    console.log('[DiagnosticoWizard] option selected', {
      sessionId,
      itemId: currentItem?.id,
      responseType: currentItem?.response_type,
      optionKey: opt?.key,
      optionValue: opt?.value,
    });
    setSelectedOption(opt);
    setError('');
  };

  const onPressNext = async () => {
    if (!currentItem || !selectedOption) {
      setError('Selecciona una opcion para continuar.');
      return;
    }
    console.log('[DiagnosticoWizard] save answer start', {
      sessionId,
      itemId: currentItem.id,
      responseType: currentItem.response_type,
      optionKey: selectedOption.key,
    });
    const responseType = currentItem.response_type || 'intensidad_estandar';
    const payload: any = {
      item_id: Number(currentItem.id),
      response_type: responseType,
    };
    if (responseType.startsWith('pensamiento_extremo')) {
      payload.special_value = selectedOption.value ?? selectedOption.key;
    } else {
      payload.intensity_key = selectedOption.key;
      payload.intensity_value = selectedOption.value ?? 0;
    }
    console.log('[DiagnosticoWizard] save answer payload', payload);
    try {
      const resp = await saveAnswer(sessionId, payload);
      console.log('[DiagnosticoWizard] save answer response', resp);
    } catch (e: any) {
      console.log('[DiagnosticoWizard] save answer error', e?.body || e?.message || e);
      setError(e?.body?.message || e?.message || 'No se pudo guardar la respuesta.');
      return;
    }
    const next = new Set(answeredIds);
    next.add(Number(currentItem.id));
    setAnsweredIds(next);
    setSelectedOption(null);
  };

  const onPressComplete = async () => {
    if (!sessionId) {
      setError('Falta sessionId para completar.');
      console.log('[DiagnosticoWizard] missing sessionId', {moduleKey});
      return;
    }
    console.log('[DiagnosticoWizard] complete start', {sessionId, moduleKey});
    try {
      const resp = await completeSession(sessionId);
      console.log('[DiagnosticoWizard] complete response', resp);
      await saveLastRoute({session_id: sessionId, module_key: moduleKey, screen: 'Results'});
      navigation.replace('DiagnosticoResults', {sessionId, module_key: moduleKey});
    } catch (e: any) {
      console.log('[DiagnosticoWizard] complete error', e?.body || e?.message || e);
      setError(e?.body?.message || e?.message || 'No se pudo completar.');
    }
  };

  return (
    <CSafeAreaView>
      <CHeader />
      <View style={[styles.p20, {paddingBottom: 120}]}>
        <CText type={'S20'} style={styles.mb10}>
          {currentItem ? currentItem.titulo : 'Completar diagnostico'}
        </CText>
        <ProgressBar progress={progress} />
        {currentItem ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 140}}
          >
            {options.map(opt => (
              <OptionCard
                key={String(opt.key)}
                label={opt.label}
                selected={selectedOption?.key === opt.key}
                onPress={() => onSelectOption(opt)}
              />
            ))}
            <BehaviorMessageCard behavior={selectedBehavior} />
          </ScrollView>
        ) : (
          <CText type={'S16'} color={colors.labelColor}>
            {`Has completado todas las respuestas de ${
              moduleKey === 'motivos'
                ? 'Motivos'
                : moduleKey === 'sintomas_fisicos'
                ? 'Síntomas físicos'
                : moduleKey === 'sintomas_emocionales'
                ? 'Síntomas emocionales'
                : 'esta sección'
            }.`}
          </CText>
        )}
        {!!error && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        )}
      </View>
      <View
        style={[
          styles.p20,
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.backgroundColor,
          },
        ]}
      >
        {currentItem ? (
          <CButton title={'Siguiente'} onPress={onPressNext} />
        ) : (
          <CButton title={'Completar'} onPress={onPressComplete} />
        )}
      </View>
    </CSafeAreaView>
  );
}
