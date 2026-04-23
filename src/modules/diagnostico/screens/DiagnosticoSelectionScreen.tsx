import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, ScrollView, View, StyleSheet, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CMainAppBar from '../../../components/common/CMainAppBar';
import {Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';
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
import {StackNav} from '../../../navigation/NavigationKey';
import {API_BASE_URL} from '../../../api/config';
import {getSession, getMembresias} from '../../../api/auth';
import {getOrCreateDeviceUUID} from '../../../utils/uuid';
import {getResumenMensual} from '../../../api/sesionTerapeutica';

const capitalizeSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.replace(
    /^([^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*)([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/,
    (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`
  );
};

const matchItemsWithNames = (itemIds: number[], catalog: any[]): {id: number; titulo: string}[] => {
  return itemIds
    .map(id => {
      const found = catalog.find(item => item.id === id || item.motivo_id === id || item.emocion_id === id);
      return found ? { id, titulo: found.titulo || found.nombre || 'Sin nombre' } : null;
    })
    .filter(Boolean) as {id: number; titulo: string}[];
};

const getExceedStatus = (used: number, limit: number) => {
  if (limit <= 0) return { status: 'ok' as const, text: '' };
  if (used > limit) return { status: 'exceeded' as const, text: `Excedes por ${used - limit}` };
  if (used === limit) return { status: 'at_limit' as const, text: 'Alcanzaste el límite' };
  return { status: 'ok' as const, text: `${limit - used} disponibles` };
};

const renderResumenCard = ({
  resumenMensual,
  motivoCategories,
  emotionCatalog,
  moduleLimits,
  colors,
  resumenMotivoIds,
  resumenEmocionIds,
}: {
  resumenMensual: any;
  motivoCategories: any[];
  emotionCatalog: any[];
  moduleLimits: Record<string, {used: number; limit: number; remaining: number}>;
  colors: any;
  resumenMotivoIds: number[];
  resumenEmocionIds: number[];
}) => {
  if (!resumenMensual) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const periodo = resumenMensual.period;
  const periodoLabel = periodo ? `${formatDate(periodo.start)} - ${formatDate(periodo.end)}` : '';

  // Use passed resumen IDs
  const flatMotivos = motivoCategories.flatMap((cat: any) => cat.motivos || []);
  const selectedMotivos = matchItemsWithNames(resumenMotivoIds, flatMotivos);
  const motivoStatus = getExceedStatus(resumenMotivoIds.length, moduleLimits.motivos.limit);

  const selectedEmociones = matchItemsWithNames(resumenEmocionIds, emotionCatalog);
  const emocionStatus = getExceedStatus(resumenEmocionIds.length, moduleLimits.sintomas_emocionales.limit);

  const hasAnyData = resumenMotivoIds.length > 0 || resumenEmocionIds.length > 0;
  if (!hasAnyData) return null;

  return (
    <View style={{
      backgroundColor: colors.inputBg,
      borderRadius: moderateScale(12),
      padding: moderateScale(12),
      marginBottom: moderateScale(12),
    }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(4)}}>
        <Ionicons name="analytics-outline" size={moderateScale(20)} color={colors.primary} />
        <CText type={'B16'} style={{marginLeft: moderateScale(8)}}>
          Tu proceso de sanación
        </CText>
      </View>
      {periodoLabel && (
        <CText type={'S12'} color={colors.labelColor} style={{marginBottom: moderateScale(8)}}>
          Período: {periodoLabel}
        </CText>
      )}

      {resumenMotivoIds.length > 0 && (
        <View style={{marginBottom: moderateScale(12)}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(4)}}>
            <CText type={'M14'}>Motivos abordados: {resumenMotivoIds.length}/{moduleLimits.motivos.limit}</CText>
            {motivoStatus.status !== 'ok' && (
              <Ionicons
                name={motivoStatus.status === 'exceeded' ? 'warning' : 'checkmark-circle'}
                size={moderateScale(16)}
                color={motivoStatus.status === 'exceeded' ? colors.redAlert : colors.primary}
                style={{marginLeft: moderateScale(4)}}
              />
            )}
          </View>
          {selectedMotivos.slice(0, 5).map((item: any) => (
            <View key={`motivo-${item.id}`} style={{flexDirection: 'row', alignItems: 'center', marginLeft: moderateScale(8), marginTop: moderateScale(2)}}>
              <Ionicons name="checkmark" size={moderateScale(14)} color={colors.primary} />
              <CText type={'S12'} color={colors.labelColor} style={{marginLeft: moderateScale(4)}}>
                {capitalizeSentence(item.titulo)}
              </CText>
            </View>
          ))}
          {selectedMotivos.length > 5 && (
            <CText type={'S12'} color={colors.labelColor} style={{marginLeft: moderateScale(8), marginTop: moderateScale(2)}}>
              ...y {selectedMotivos.length - 5} más
            </CText>
          )}
          <CText type={'S12'} color={colors.primary} style={{marginTop: moderateScale(4)}}>
            Puedes seleccionar los mismos
          </CText>
        </View>
      )}

      {resumenEmocionIds.length > 0 && (
        <View style={{marginBottom: moderateScale(12)}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(4)}}>
            <CText type={'M14'}>Síntomas emocionales trabajados: {resumenEmocionIds.length}/{moduleLimits.sintomas_emocionales.limit}</CText>
            {emocionStatus.status !== 'ok' && (
              <Ionicons
                name={emocionStatus.status === 'exceeded' ? 'warning' : 'checkmark-circle'}
                size={moderateScale(16)}
                color={emocionStatus.status === 'exceeded' ? colors.redAlert : colors.primary}
                style={{marginLeft: moderateScale(4)}}
              />
            )}
          </View>
          {selectedEmociones.slice(0, 5).map((item: any) => (
            <View key={`emocion-${item.id}`} style={{flexDirection: 'row', alignItems: 'center', marginLeft: moderateScale(8), marginTop: moderateScale(2)}}>
              <Ionicons name="checkmark" size={moderateScale(14)} color={colors.primary} />
              <CText type={'S12'} color={colors.labelColor} style={{marginLeft: moderateScale(4)}}>
                {capitalizeSentence(item.titulo)}
              </CText>
            </View>
          ))}
          {selectedEmociones.length > 5 && (
            <CText type={'S12'} color={colors.labelColor} style={{marginLeft: moderateScale(8), marginTop: moderateScale(2)}}>
              ...y {selectedEmociones.length - 5} más
            </CText>
          )}
          <CText type={'S12'} color={colors.primary} style={{marginTop: moderateScale(4)}}>
            Puedes seleccionar los mismos
          </CText>
        </View>
      )}

      {(motivoStatus.status === 'exceeded' || emocionStatus.status === 'exceeded') && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FEF3F2',
          borderRadius: moderateScale(8),
          padding: moderateScale(8),
          marginTop: moderateScale(4),
        }}>
          <Ionicons name="warning-outline" size={moderateScale(16)} color={colors.redAlert} />
          <CText type={'S12'} color={colors.redAlert} style={{marginLeft: moderateScale(4), flex: 1}}>
            Excedes el límite de tu plan {periodo?.membresia_nombre || ''}
          </CText>
        </View>
      )}
    </View>
  );
};

export default function DiagnosticoSelectionScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const drawer = useDrawer();
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const isFirstFlow = route?.params?.isFirstFlow;
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
  const isNavigatingRef = useRef(false);
  const [resumenMensual, setResumenMensual] = useState<any>(null);
  const [emotionCatalog, setEmotionCatalog] = useState<CatalogItem[]>([]);
  const [moduleLimits, setModuleLimits] = useState<Record<string, {used: number; limit: number; remaining: number}>>({
    motivos: { used: 0, limit: 0, remaining: 0 },
    sintomas_emocionales: { used: 0, limit: 0, remaining: 0 },
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitsLoaded, setLimitsLoaded] = useState(false);
  const [resumenMotivoIds, setResumenMotivoIds] = useState<number[]>([]);
  const [resumenEmocionIds, setResumenEmocionIds] = useState<number[]>([]);
  const [scrollIndicator, setScrollIndicator] = useState({visible: false, top: 0, height: 0});
  const scrollLayoutHeightRef = useRef(0);
  const scrollContentHeightRef = useRef(0);

  const isInResumen = (id: number): boolean => {
    if (moduleKey === 'motivos') return resumenMotivoIds.includes(id);
    if (moduleKey === 'sintomas_emocionales') return resumenEmocionIds.includes(id);
    return false;
  };

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
        setEmotionCatalog(catalog);
      }
      if (mountedRef && !mountedRef.current) return;
      setItems(catalog);

      // Fetch resumen-mensual and calculate limits
      try {
        const [resumen, membresiasResp] = await Promise.all([
          getResumenMensual(),
          getMembresias(),
        ]);
        if (mountedRef && !mountedRef.current) return;
        setResumenMensual(resumen);

        // Extraer IDs del resumen para permitir seleccionarlos aunque esté en límite
        const motivoIds = resumen?.enfoques_positivos?.items?.map((i: any) => i.motivo_id) || [];
        const emocionIds = resumen?.sanacion_emocional?.items?.map((i: any) => i.emocion_id) || [];
        setResumenMotivoIds(motivoIds);
        setResumenEmocionIds(emocionIds);

        const membresiaId = resumen?.period?.membresia_id;
        const membresia = membresiasResp?.data?.find((m: any) => String(m.id) === String(membresiaId));

        // Motivos (concepto_id = 2 - Cambio de enfoque)
        const motivoConcept = membresia?.conceptos?.find((c: any) => String(c.conceptos_id) === '2');
        const motivoLimit = parseInt(motivoConcept?.cantidad ?? 0, 10);
        const motivoUsed = resumen?.enfoques_positivos?.count ?? 0;

        // Síntomas emocionales (concepto_id = 1 - Emoción a resolver)
        const emocionConcept = membresia?.conceptos?.find((c: any) => String(c.conceptos_id) === '1');
        const emocionLimit = parseInt(emocionConcept?.cantidad ?? 0, 10);
        const emocionUsed = resumen?.sesiones_realizadas?.count ?? 0;

        if (mountedRef && !mountedRef.current) return;
        setModuleLimits({
          motivos: { used: motivoUsed, limit: motivoLimit, remaining: Math.max(0, motivoLimit - motivoUsed) },
          sintomas_emocionales: { used: emocionUsed, limit: emocionLimit, remaining: Math.max(0, emocionLimit - emocionUsed) },
        });
        setLimitsLoaded(true);
      } catch (e) {
        console.log('[DiagnosticoSelectionScreen] Error fetching limits:', e);
      }
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

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => {
      if (!isNavigatingRef.current) {
        setIsDiagnosticoFlow(false);
      }
    };
  }, [setIsDiagnosticoFlow]);

  useFocusEffect(
    React.useCallback(() => {
      setSavingSelection(false);
      savingSelectionRef.current = false;
    }, [])
  );

  const toggleId = (id: number) => {
    if (moduleKey === 'sintomas_emocionales' || moduleKey === 'motivos') {
      const limitInfo = moduleLimits[moduleKey];
      if (limitInfo && limitsLoaded) {
        const isCurrentlySelected = selectedIds.includes(id);
        const alreadyInResumen = isInResumen(id);
        if (!isCurrentlySelected && !alreadyInResumen && limitInfo.remaining <= 0) {
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
      isNavigatingRef.current = true;
      setIsDiagnosticoFlow(true);
      safeNavigation.navigate('DiagnosticoWizard', {
        sessionId,
        module_key: moduleKey,
        items,
        selectedIds,
        answers,
        isFirstFlow: !!isFirstFlow,
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

  const updateScrollFade = (scrollY = 0) => {
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
      ? 'Motivos de tu estado emocional'
      : moduleKey === 'sintomas_fisicos'
      ? 'Sintomatología física'
      : 'Selecciona tus síntomas emocionales';

  const introBody =
    moduleKey === 'motivos'
      ? `Selecciona los motivos de tu estado emocional.`
      : moduleKey === 'sintomas_fisicos'
      ? 'Selecciona tus síntomas físicos.'
      : `Selecciona cuáles son tus síntomas emocionales.`;

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
        hideBackButton={!!isFirstFlow}
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
          <CText type={'B16'} align={'center'} style={{marginBottom: moderateScale(4)}}>
            {`${introTitle}`}
          </CText>
          <CText type={'S13'} align={'center'} color={colors.labelColor}>
            {introBody}
          </CText>
        </View>
        {!loading && renderResumenCard({
          resumenMensual,
          motivoCategories,
          emotionCatalog,
          moduleLimits,
          colors,
          resumenMotivoIds,
          resumenEmocionIds,
        })}
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{flex: 1, position: 'relative'}}>
            <ScrollView
              style={{flex: 1}}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 140, paddingRight: moderateScale(18)}}
              onLayout={event => {
                scrollLayoutHeightRef.current = event.nativeEvent.layout.height;
                updateScrollFade();
              }}
              onContentSizeChange={(_, height) => {
                scrollContentHeightRef.current = height;
                updateScrollFade();
              }}
              onScroll={event => {
                updateScrollFade(event.nativeEvent.contentOffset.y);
              }}
              scrollEventThrottle={16}
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
                    placeHolder={'Buscar síntoma'}
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
                  filteredCategories.map(category => {
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
                    })
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
      {!!selectedIds.length && (
        <View style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20,
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1, borderTopColor: colors.grayScale2,
          shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: -2 }, shadowRadius: 6, elevation: 6,
        }}>
          <CButton title={'Siguiente'} onPress={onPressNext} disabled={savingSelection} loading={savingSelection} />
        </View>
      )}
      <LimitReachedModal
        visible={showLimitModal}
        limitKey={moduleKey === 'motivos' ? 'max_enfoques_mes' : 'max_emociones_nombradas_mes'}
        customMessage={
          moduleKey === 'motivos'
            ? `Has alcanzado el límite de cambios de enfoque de tu plan actual (${moduleLimits.motivos.used} de ${moduleLimits.motivos.limit}). Mejora tu plan para desbloquear más.`
            : `Has alcanzado el límite de emociones a resolver de tu plan actual (${moduleLimits.sintomas_emocionales.used} de ${moduleLimits.sintomas_emocionales.limit}). Mejora tu plan para desbloquear más.`
        }
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          safeNavigation.navigate(StackNav.Subscription);
        }}
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
