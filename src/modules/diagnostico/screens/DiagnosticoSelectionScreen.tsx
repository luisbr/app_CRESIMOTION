import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, ScrollView, View, StyleSheet, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CMainAppBar from '../../../components/common/CMainAppBar';
import {Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import CInput from '../../../components/common/CInput';
import LimitReachedModal from '../../../components/common/LimitReachedModal';
import {styles} from '../../../theme';
import type {CatalogItem, ModuleKey, MotivoCategory} from '../types';
import {getMotivosCatalog, getMotivosCategories, getSintomasEmocionalesCatalog, getSintomasFisicosCatalog} from '../api/wsCatalogApi';
import {saveSelection, startSession} from '../api/sessionsApi';
import ChecklistItem from '../components/ChecklistItem';
import {getGroupId, saveGroupId, saveLastRoute} from '../utils';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import {useSafeNavigation} from '../../../navigation/safeNavigation';
import {API_BASE_URL} from '../../../api/config';
import {getSession} from '../../../api/auth';
import {getOrCreateDeviceUUID} from '../../../utils/uuid';

const capitalizeSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

export default function DiagnosticoSelectionScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const drawer = useDrawer();
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const preloadedSessionId = route?.params?.sessionId;
  const preloadedSelection = route?.params?.selection || [];
  const preloadedAnswers = route?.params?.answers || [];
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [motivoCategories, setMotivoCategories] = useState<MotivoCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);
  const [savingSelection, setSavingSelection] = useState(false);
  const savingSelectionRef = useRef(false);
  const [emotionLimits, setEmotionLimits] = useState<{assigned: number; used: number; remaining: number} | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const load = async (mountedRef?: {current: boolean}) => {
    setLoading(true);
    setError('');
    try {
      let sessionResp: any = null;
      if (preloadedSessionId) {
        sessionResp = {
          session: {id: Number(preloadedSessionId)},
          selection: {selected_item_ids: preloadedSelection},
          answers: preloadedAnswers,
        };
      } else {
        const storedGroupId = moduleKey === 'motivos' ? null : await getGroupId();
        sessionResp = await startSession(moduleKey, 'MX', storedGroupId);
      }
      if (mountedRef && !mountedRef.current) return;
      setSessionId(Number(sessionResp?.session?.id));
      if (moduleKey === 'motivos' && sessionResp?.session?.group_id) {
        await saveGroupId(Number(sessionResp.session.group_id));
      }
      if (sessionResp?.emotion_limits) {
        setEmotionLimits(sessionResp.emotion_limits);
      } else if (moduleKey === 'sintomas_emocionales') {
        setEmotionLimits(null);
      }
      const preSelected = preloadedSessionId
        ? (preloadedSelection || [])
        : (sessionResp?.selection?.selected_item_ids || []);
      setSelectedIds(preSelected.map((id: any) => Number(id)));
      const preAnswers = preloadedSessionId
        ? (preloadedAnswers || [])
        : (sessionResp?.answers || []);
      setAnswers(Array.isArray(preAnswers) ? preAnswers : []);
      let catalog: CatalogItem[] = [];
      if (moduleKey === 'motivos') {
        console.log(
          '[DiagnosticoSelectionScreen] curl getMotivosCategories',
          `curl -X GET '${API_BASE_URL}/api/ws/diagnostico/motivos'`,
        );
        const categories = await getMotivosCategories();
        console.log('[DiagnosticoSelectionScreen] getMotivosCategories response', categories);
        const flatMotivos = categories.flatMap(category => category.motivos || []);
        setMotivoCategories(categories);
        catalog = flatMotivos;
      }
      if (moduleKey === 'sintomas_fisicos') {
        console.log(
          '[DiagnosticoSelectionScreen] curl getSintomasFisicosCatalog',
          `curl -X GET '${API_BASE_URL}/api/ws/diagnostico/sintomas-fisicos'`,
        );
        catalog = await getSintomasFisicosCatalog();
        console.log('[DiagnosticoSelectionScreen] getSintomasFisicosCatalog response', catalog);
      }
      if (moduleKey === 'sintomas_emocionales') {
        console.log(
          '[DiagnosticoSelectionScreen] curl getSintomasEmocionalesCatalog',
          `curl -X GET '${API_BASE_URL}/api/ws/diagnostico/sintomas-emocionales'`,
        );
        catalog = await getSintomasEmocionalesCatalog();
        console.log('[DiagnosticoSelectionScreen] getSintomasEmocionalesCatalog response', catalog);
      }
      if (mountedRef && !mountedRef.current) return;
      setItems(catalog);
    } catch (e: any) {
      if (mountedRef && !mountedRef.current) return;
      console.warn('[DiagnosticoSelection] load error', e?.body || e?.message || e);
      setError('No se pudo cargar el catalogo. Intenta de nuevo.');
    } finally {
      if (!mountedRef || mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = {current: true};
    load(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, [moduleKey]);

  const toggleId = (id: number) => {
    if (moduleKey === 'sintomas_emocionales' && emotionLimits) {
      const isCurrentlySelected = selectedIds.includes(id);
      if (!isCurrentlySelected) {
        const availableSlots = emotionLimits.remaining - selectedIds.length;
        if (availableSlots <= 0) {
          setShowLimitModal(true);
          return;
        }
      }
    }
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const onPressNext = async () => {
    if (savingSelectionRef.current) {
      return;
    }
    console.log('[DiagnosticoSelection] next pressed', {
      moduleKey,
      sessionId,
      selectedCount: selectedIds.length,
    });
    if (!sessionId) {
      setError('Falta sessionId para continuar.');
      console.log('[DiagnosticoSelection] missing sessionId', {moduleKey});
      return;
    }
    if (!selectedIds.length) {
      setError('Selecciona al menos un elemento.');
      return;
    }
    setError('');
    savingSelectionRef.current = true;
    setSavingSelection(true);
    let didNavigate = false;
    try {
      const session = await getSession();
      const uuid = await getOrCreateDeviceUUID();
      console.log(
        '[DiagnosticoSelectionScreen] curl saveSelection',
        `curl -X POST '${API_BASE_URL}/api/v1/evaluations/sessions/${sessionId}/selection' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify({selected_item_ids: selectedIds})}'`,
      );
      const resp = await saveSelection(sessionId, selectedIds);
      console.log('[DiagnosticoSelection] saveSelection response', resp);
      await saveLastRoute({session_id: sessionId, module_key: moduleKey, screen: 'Wizard'});
      didNavigate = true;
      safeNavigation.navigate('DiagnosticoWizard', {
        sessionId,
        module_key: moduleKey,
        items,
        selectedIds,
        answers,
      });
    } catch (e: any) {
      console.log('[DiagnosticoSelection] saveSelection error', e?.body || e?.message || e);
      if (isLimitReached(e)) {
        setShowLimitModal(true);
      } else {
        setError(e?.body?.message || e?.message || 'No se pudo guardar la seleccion.');
      }
    } finally {
      if (didNavigate) return;
      savingSelectionRef.current = false;
      setSavingSelection(false);
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategoryIds(prev => (prev.includes(id) ? [] : [id]));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = !!normalizedQuery;
  const filteredCategories = moduleKey === 'motivos'
    ? motivoCategories
        .map(category => {
          if (!normalizedQuery) return category;
          const filteredMotivos = (category.motivos || []).filter(motivo => {
            const title = String(motivo.titulo || '').toLowerCase();
            const description = String(motivo.descripcion || '').toLowerCase();
            return title.includes(normalizedQuery) || description.includes(normalizedQuery);
          });
          return {...category, motivos: filteredMotivos};
        })
        .filter(category => (category.motivos || []).length > 0)
    : [];
  const searchResults = moduleKey === 'motivos' && isSearching
    ? filteredCategories
        .flatMap(category => category.motivos || [])
        .filter(item => {
          const title = String(item.titulo || '').toLowerCase();
          const description = String(item.descripcion || '').toLowerCase();
          return title.includes(normalizedQuery) || description.includes(normalizedQuery);
        })
    : [];

  const introTitle =
    moduleKey === 'motivos'
      ? 'Selecciona los motivos de tu estado emocional'
      : moduleKey === 'sintomas_fisicos'
      ? 'Selecciona tus síntomas físicos'
      : 'Selecciona tus síntomas emocionales';

  const introBody =
    moduleKey === 'motivos'
      ? 'Cuéntanos cuáles son los motivos de tu estado emocional.'
      : moduleKey === 'sintomas_fisicos'
      ? 'Cuéntanos cuáles son tus síntomas físicos.'
      : moduleKey === 'sintomas_emocionales' && emotionLimits
      ? `Cuéntanos cuáles son tus síntomas emocionales. (${emotionLimits.remaining} de ${emotionLimits.assigned} disponibles)`
      : 'Cuéntanos cuáles son tus síntomas emocionales.';

  return (
    <CSafeAreaView>
      <CMainAppBar 
        mode="sub" 
        title={
          moduleKey === 'motivos'
            ? 'Motivos de tu estado emocional'
            : moduleKey === 'sintomas_fisicos'
            ? 'Sintomatología física'
            : moduleKey === 'sintomas_emocionales'
            ? 'Sintomatología emocional'
            : capitalizeSentence(moduleKey.replace('_', ' '))
        } 
      />
      <View style={[styles.flex, styles.p20, {position: 'relative', paddingTop: moderateScale(10)}]}>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: moderateScale(12),
            padding: moderateScale(12),
            marginBottom: moderateScale(12),
          }}
        >
          <CText type={'M16'} align={'center'} style={{marginBottom: moderateScale(4)}}>
            {`${introTitle}`}
          </CText>
          <CText type={'S13'} align={'center'} color={colors.labelColor}>
            {introBody}
          </CText>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ScrollView
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 140}}
          >
            {moduleKey === 'motivos' && (
              <View style={{marginBottom: moderateScale(10)}}>
                <CInput
                  _value={searchQuery}
                  placeHolder={'Buscar motivo'}
                  toGetTextFieldValue={setSearchQuery}
                  insideLeftIcon={() => (
                    <Ionicons
                      name={'search-outline'}
                      size={moderateScale(18)}
                      color={colors.grayScale1}
                      style={{marginRight: moderateScale(6)}}
                    />
                  )}
                />
              </View>
            )}
            {(moduleKey === 'sintomas_fisicos' || moduleKey === 'sintomas_emocionales') && (
              <View style={{marginBottom: moderateScale(10)}}>
                <CInput
                  _value={searchQuery}
                  placeHolder={'Buscar sintoma'}
                  toGetTextFieldValue={setSearchQuery}
                  insideLeftIcon={() => (
                    <Ionicons
                      name={'search-outline'}
                      size={moderateScale(18)}
                      color={colors.grayScale1}
                      style={{marginRight: moderateScale(6)}}
                    />
                  )}
                />
              </View>
            )}
            {moduleKey === 'motivos' ? (
              isSearching ? (
                searchResults.length ? (
                  searchResults.map(item => (
                    <ChecklistItem
                      key={`search-${item.id}`}
                      title={capitalizeSentence(String(item.titulo || ''))}
                      description={capitalizeSentence(String(item.descripcion || ''))}
                      selected={selectedIds.includes(Number(item.id))}
                      onPress={() => toggleId(Number(item.id))}
                    />
                  ))
                ) : (
                  <CText type={'S14'} align={'center'} color={colors.labelColor}>
                    No encontramos motivos con esa búsqueda.
                  </CText>
                )
              ) : filteredCategories.length ? (
                (() => {
                  const visibleCategories =
                    expandedCategoryIds.length > 0
                      ? filteredCategories.filter(category =>
                          expandedCategoryIds.includes(Number(category.id))
                        )
                      : filteredCategories;
                  return visibleCategories.map(category => {
                    const isExpanded = expandedCategoryIds.includes(Number(category.id));
                    return (
                      <View key={`category-${category.id}`} style={{marginBottom: moderateScale(14)}}>
                        <TouchableOpacity
                          onPress={() => toggleCategory(Number(category.id))}
                          style={[
                            styles.rowSpaceBetween,
                            {
                              paddingVertical: moderateScale(10),
                              paddingHorizontal: moderateScale(12),
                              backgroundColor: colors.inputBg,
                              borderRadius: moderateScale(12),
                            },
                          ]}
                        >
                          <View style={{flex: 1, paddingRight: moderateScale(8)}}>
                            <CText type={'M16'} style={{marginBottom: category.descripcion ? moderateScale(2) : 0}}>
                              {capitalizeSentence(String(category.nombre || ''))}
                            </CText>
                            {!!category.descripcion && (
                              <CText type={'S12'} color={colors.labelColor}>
                                {capitalizeSentence(String(category.descripcion || ''))}
                              </CText>
                            )}
                          </View>
                          <Ionicons
                            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                            size={moderateScale(20)}
                            color={colors.textColor}
                          />
                        </TouchableOpacity>
                        {isExpanded &&
                          (category.motivos || []).map(item => (
                            <ChecklistItem
                              key={String(item.id)}
                              title={capitalizeSentence(String(item.titulo || ''))}
                              description={capitalizeSentence(String(item.descripcion || ''))}
                              selected={selectedIds.includes(Number(item.id))}
                              onPress={() => toggleId(Number(item.id))}
                            />
                          ))}
                      </View>
                    );
                  });
                })()
              ) : (
                <CText type={'S14'} align={'center'} color={colors.labelColor}>
                  No encontramos motivos con esa busqueda.
                </CText>
              )
            ) : (
              items
                .filter(item => {
                  if (!normalizedQuery) return true;
                  const title = String(item.titulo || '').toLowerCase();
                  const description = String(item.descripcion || '').toLowerCase();
                  return title.includes(normalizedQuery) || description.includes(normalizedQuery);
                })
                .map(item => (
                  <ChecklistItem
                    key={String(item.id)}
                    title={capitalizeSentence(String(item.titulo || ''))}
                    description={capitalizeSentence(String(item.descripcion || ''))}
                    selected={selectedIds.includes(Number(item.id))}
                    onPress={() => toggleId(Number(item.id))}
                    showInfoIcon
                  />
                ))
            )}
          </ScrollView>
        )}
        {!!error && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        )}
        {!!error && (
          <CButton
            title={'Reintentar'}
            onPress={() => load()}
            bgColor={colors.inputBg}
            color={colors.primary}
          />
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
            zIndex: 10,
          },
        ]}
      >
        {!!selectedIds.length && (
          <CButton title={'Siguiente'} onPress={onPressNext} disabled={savingSelection} loading={savingSelection} />
        )}
      </View>
      <LimitReachedModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          safeNavigation.navigate('SubscriptionScreen');
        }}
        limitKey="max_emociones_nombradas_mes"
      />
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            DiagnosticoSelectionScreen
          </CText>
        </View>
      )}
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  screenTooltip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
