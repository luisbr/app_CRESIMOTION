import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Linking, Modal, ScrollView, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CMainAppBar from '../../../components/common/CMainAppBar';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import CInput from '../../../components/common/CInput';
import {styles} from '../../../theme';
import type {CatalogItem, CatalogOption, ModuleKey} from '../types';
import {normalizeOptions, saveLastRoute} from '../utils';
import OptionCard from '../components/OptionCard';
import ProgressBar from '../components/ProgressBar';
import {completeSession, saveAnswer} from '../api/sessionsApi';
import BehaviorMessageCard from '../components/BehaviorMessageCard';
import {getMotivosCatalog, getSintomasEmocionalesCatalog, getSintomasFisicosCatalog} from '../api/wsCatalogApi';
import {getEmergencyByLocation, getEmergencyContacts} from '../api/emergencyApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import {useSafeNavigation} from '../../../navigation/safeNavigation';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';

export default function DiagnosticoWizardScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const sessionId: number = Number(route?.params?.sessionId);
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const isFirstFlow = route?.params?.isFirstFlow;
  const initialItems: CatalogItem[] = route?.params?.items || [];
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const selectedIds: number[] =
    route?.params?.selectedIds ||
    route?.params?.selection ||
    [];
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
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const [showSpecialInput, setShowSpecialInput] = useState(false);
  const [specialValue, setSpecialValue] = useState('');
  const [specialValueError, setSpecialValueError] = useState('');
  const [error, setError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyError, setEmergencyError] = useState('');
  const [emergencyCountry, setEmergencyCountry] = useState<any | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [completing, setCompleting] = useState(false);
  const savingAnswerRef = useRef(false);
  const completingRef = useRef(false);

  const selectedItems = useMemo(() => items.filter(i => selectedIds.includes(Number(i.id))), [items, selectedIds]);
  const currentItem =
    currentIndex != null && currentIndex < selectedItems.length ? selectedItems[currentIndex] : null;
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
  const totalItems = selectedItems.length;
  const currentStep = totalItems
    ? Math.min(totalItems, (currentIndex ?? 0) + 1)
    : 0;
  const progress = totalItems ? currentStep / totalItems : 0;

  useEffect(() => {
    if (currentIndex != null) return;
    if (!selectedItems.length) return;
    const nextIdx = selectedItems.findIndex(i => !answeredIds.has(Number(i.id)));
    setCurrentIndex(nextIdx === -1 ? selectedItems.length : nextIdx);
  }, [currentIndex, selectedItems, answeredIds]);

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);

  const introPrompt =
    moduleKey === 'motivos'
      ? 'Ahora cuéntanos cuál es el nivel de intensidad de tu estado emocional.'
      : moduleKey === 'sintomas_fisicos'
      ? 'Ahora cuéntanos cuál es el nivel de intensidad de tu sintomatología física.'
      : 'Ahora cuéntanos cuál es el nivel de intensidad de tu sintomatología emocional.';
  const currentTitle = String(currentItem?.titulo || '').toLowerCase().trim();
  const isOtherAddictionsItem =
    currentTitle === 'adicciones otras' || currentTitle === 'otras adicciones';

  const onSelectOption = (opt: CatalogOption) => {
    console.log('[DiagnosticoWizard] option selected', {
      sessionId,
      itemId: currentItem?.id,
      responseType: currentItem?.response_type,
      optionKey: opt?.key,
      optionValue: opt?.value,
    });
    setSelectedOption(opt);
    console.log('[DiagnosticoWizard] selected key check', {
      key: String(opt?.key || ''),
      matchesOtrasAdicciones: String(opt?.key || '').toLowerCase() === 'otras_adicciones',
    });
    setError('');
    const shouldShow = isOtherAddictionsItem;
    setShowSpecialInput(shouldShow);
    if (shouldShow) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({animated: true});
      }, 80);
    }
    const emergenciaRecentKeys = ['desde_hace_pocos_meses', 'desde_hace_varios_dias_o_semanas'];
    const isRecentEmergencyOption = emergenciaRecentKeys.some(k =>
      String(opt?.key || '').toLowerCase().includes(k)
    );
    if (
      currentItem?.response_type?.startsWith('pensamiento_extremo') &&
      isRecentEmergencyOption
    ) {
      console.log('[Emergency] trigger by pensamiento_extremo', {
        itemId: currentItem?.id,
        responseType: currentItem?.response_type,
        optionKey: opt?.key,
        optionValue: opt?.value,
      });
      openEmergencyModal();
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadCatalog = async () => {
      if (items.length || !moduleKey) return;
      setCatalogLoading(true);
      try {
        let catalog: CatalogItem[] = [];
        if (moduleKey === 'motivos') catalog = await getMotivosCatalog();
        if (moduleKey === 'sintomas_fisicos') catalog = await getSintomasFisicosCatalog();
        if (moduleKey === 'sintomas_emocionales') catalog = await getSintomasEmocionalesCatalog();
        if (mounted) setItems(catalog);
      } catch (e) {
        if (mounted) setError('No se pudo cargar el catalogo.');
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    };
    loadCatalog();
    return () => {
      mounted = false;
    };
  }, [items.length, moduleKey]);

  const loadEmergencyData = async () => {
    setEmergencyLoading(true);
    setEmergencyError('');
    try {
      const listResp = await getEmergencyContacts();
      const list = listResp?.data || listResp?.items || listResp || [];
      const countries = Array.isArray(list) ? list : [];
      setAllCountries(countries);

      let coords: {lat: number; lng: number} | null = null;
      const currentPermission = await Location.getForegroundPermissionsAsync();
      let status = currentPermission?.status;
      if (status !== 'granted') {
        const requested = await Location.requestForegroundPermissionsAsync();
        status = requested?.status;
      }
      console.log('[Emergency] location permission status', status);
      if (status !== 'granted') {
        setEmergencyLoading(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
      coords = {
        lat: Number(position?.coords?.latitude),
        lng: Number(position?.coords?.longitude),
      };
      console.log('[Emergency] device location', coords);
      if (coords?.lat && coords?.lng) {
        const nearbyResp = await getEmergencyByLocation(coords.lat, coords.lng);
        const nearby = nearbyResp?.data || null;
        console.log('[Emergency] by-location response', {coords, nearby});
        if (nearby?.country_code) {
          setEmergencyCountry(nearby);
          setEmergencyContacts(Array.isArray(nearby?.contacts) ? nearby.contacts : []);
        } else {
          setEmergencyCountry(null);
          setEmergencyContacts([]);
        }
      }
    } catch (e: any) {
      setEmergencyError(e?.message || 'No pudimos obtener los contactos de emergencia.');
    } finally {
      setEmergencyLoading(false);
    }
  };

  const openEmergencyModal = () => {
    setEmergencyVisible(true);
    setEmergencyCountry(null);
    setEmergencyContacts([]);
    setCountryQuery('');
    loadEmergencyData();
  };

  const closeEmergencyModal = () => {
    setEmergencyVisible(false);
  };

  const filteredCountries = allCountries.filter(c => {
    if (!countryQuery.trim()) return true;
    const name = String(c?.country_name || '').toLowerCase();
    const code = String(c?.country_code || '').toLowerCase();
    const query = countryQuery.trim().toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  const onSelectCountry = (country: any) => {
    setEmergencyCountry(country);
    setEmergencyContacts(Array.isArray(country?.contacts) ? country.contacts : []);
  };

  const onCallPhone = (phone: string) => {
    const cleaned = String(phone || '').trim();
    if (!cleaned) return;
    Linking.openURL(`tel:${cleaned}`);
  };

  const onPressNext = async () => {
    if (savingAnswerRef.current) {
      return;
    }
    if (!currentItem || !selectedOption) {
      setError('Selecciona una opcion para continuar.');
      return;
    }
    if (isOtherAddictionsItem && !specialValue.trim()) {
      setSpecialValueError('Especifica tu respuesta.');
      return;
    }
    console.log('[DiagnosticoWizard] item', {currentItem});
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
      if (isOtherAddictionsItem) {
        payload.special_value = specialValue.trim();
      }
    }
    console.log('[DiagnosticoWizard] save answer payload', payload);
    savingAnswerRef.current = true;
    setSavingAnswer(true);
    try {
      const resp = await saveAnswer(sessionId, payload);
      console.log('[DiagnosticoWizard] save answer response', resp);
    } catch (e: any) {
      console.log('[DiagnosticoWizard] save answer error', e?.body || e?.message || e);
      setError(e?.body?.message || e?.message || 'No se pudo guardar la respuesta.');
      return;
    } finally {
      savingAnswerRef.current = false;
      setSavingAnswer(false);
    }
    const next = new Set(answeredIds);
    next.add(Number(currentItem.id));
    setAnsweredIds(next);
    setSelectedOption(null);
    setShowSpecialInput(false);
    setSpecialValue('');
    setSpecialValueError('');
    if (currentIndex != null) {
      const nextIndex = Math.min(selectedItems.length, currentIndex + 1);
      setCurrentIndex(nextIndex);
    }
  };

  const onPressComplete = async () => {
    if (completingRef.current) {
      return;
    }
    if (!sessionId) {
      setError('Falta sessionId para completar.');
      console.log('[DiagnosticoWizard] missing sessionId', {moduleKey});
      return;
    }
    console.log('[DiagnosticoWizard] complete start', {sessionId, moduleKey});
    completingRef.current = true;
    setCompleting(true);
    let didNavigate = false;
    try {
      const resp = await completeSession(sessionId);
      console.log('[DiagnosticoWizard] complete response', resp);
      await saveLastRoute({session_id: sessionId, module_key: moduleKey, screen: 'Results'});
      didNavigate = true;
      safeNavigation.replace('DiagnosticoResults', {sessionId, module_key: moduleKey, isFirstFlow: !!isFirstFlow});
    } catch (e: any) {
      console.log('[DiagnosticoWizard] complete error', e?.body || e?.message || e);
      setError(e?.body?.message || e?.message || 'No se pudo completar.');
    } finally {
      if (didNavigate) return;
      completingRef.current = false;
      setCompleting(false);
    }
  };

  const onPressBack = () => {
    if (currentIndex == null) return;
    if (currentIndex <= 0) {
      safeNavigation.navigate('DiagnosticoSelection', {
        module_key: moduleKey,
        sessionId,
        selection: selectedIds,
        answers,
      });
      return;
    }
    setCurrentIndex(prev => (prev == null ? 0 : Math.max(0, prev - 1)));
    setSelectedOption(null);
    setShowSpecialInput(false);
    setSpecialValue('');
    setSpecialValueError('');
  };

  return (
    <CSafeAreaView>
      <CMainAppBar
        mode="sub"
        title={currentItem ? currentItem.titulo : 'Completando autoevaluación'}
        onPressBack={onPressBack}
        hideBackButton={!!isFirstFlow}
      />
      <View style={[styles.p20, {paddingBottom: 120, paddingTop: moderateScale(10)}]}>
        {!!currentItem && totalItems > 0 && (
          <CText type={'S14'} color={colors.labelColor} style={styles.mb10}>
            {moduleKey === 'motivos'
              ? `Motivo ${currentStep} de ${totalItems}`
              : moduleKey === 'sintomas_fisicos'
              ? `Síntoma físico ${currentStep} de ${totalItems}`
              : `Síntoma emocional ${currentStep} de ${totalItems}`}
          </CText>
        )}
        <ProgressBar progress={progress} />
        {!selectedIds.length ? (
          <CText type={'S14'} color={colors.labelColor}>
            No encontramos tu seleccion. Vuelve a elegir las opciones para continuar.
          </CText>
        ) : currentItem ? (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 140}}
            keyboardShouldPersistTaps="handled"
          >
            <CText type={'S14'} color={colors.labelColor} style={styles.mb10}>
              {introPrompt}
            </CText>
            {catalogLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                {options.map(opt => (
                  <OptionCard
                    key={String(opt.key)}
                    label={opt.label}
                    selected={selectedOption?.key === opt.key}
                    onPress={() => {
                      onSelectOption(opt);
                      if (!isOtherAddictionsItem) {
                        setSpecialValue('');
                        setSpecialValueError('');
                      }
                    }}
                  />
                ))}
                {showSpecialInput && (
                  <View style={styles.mt10}>
                    <CInput
                      label={'Especifica'}
                      placeHolder={'Escribe aquí'}
                      keyBoardType={'default'}
                      _value={specialValue}
                      _errorText={specialValueError}
                      autoCapitalize={'sentences'}
                      toGetTextFieldValue={(val) => {
                        setSpecialValue(val);
                        if (val.trim()) setSpecialValueError('');
                      }}
                      required
                      multiline
                    />
                  </View>
                )}
                <BehaviorMessageCard behavior={selectedBehavior} />
              </>
            )}
          </ScrollView>
        ) : (
          <CText type={'S16'} color={colors.labelColor}>
            {`Has completado todas las respuestas de ${
              moduleKey === 'motivos'
                ? 'Motivos de tu estado emocional'
                : moduleKey === 'sintomas_fisicos'
                ? 'Sintomatología física'
                : moduleKey === 'sintomas_emocionales'
                ? 'Sintomatología emocional'
                : 'esta sección'
            }. ¡Gracias por compartirnos la información que nos permitirá acompañarte en tu proceso de sanación emocional!`}
          </CText>
        )}
        {!!error && (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        )}
      </View>
      <Modal visible={emergencyVisible} transparent animationType="fade" onRequestClose={closeEmergencyModal}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20}}>
          <View style={{backgroundColor: colors.backgroundColor, borderRadius: 16, padding: 16, maxHeight: '90%'}}>
            <View style={[styles.rowStart, styles.mb10, {alignItems: 'center'}]}>
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(18),
                  backgroundColor: colors.redAlert,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Ionicons name={'warning-outline'} size={moderateScale(20)} color={colors.white} />
              </View>
              <View style={{flex: 1}}>
                <CText type={'B16'}>Apoyo inmediato</CText>
                <CText type={'S12'} color={colors.labelColor}>
                  Si estas en riesgo, estos contactos pueden ayudarte ahora.
                </CText>
              </View>
            </View>
            {emergencyLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : emergencyError ? (
              <CText type={'S14'} align={'center'} color={colors.redAlert}>
                {emergencyError}
              </CText>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {emergencyCountry ? (
                  <View style={styles.mb10}>
                    <CText type={'S14'} color={colors.labelColor} style={styles.mb5}>
                      {`Pais detectado: ${emergencyCountry.country_name || emergencyCountry.country_code || ''}`}
                    </CText>
                    {emergencyContacts.length ? (
                      emergencyContacts.map((contact, idx) => (
                        <TouchableOpacity
                          key={`em-${idx}`}
                          onPress={() => onCallPhone(contact?.phone)}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            backgroundColor: colors.inputBg,
                            marginBottom: 8,
                          }}
                        >
                          <CText type={'M14'}>{contact?.service_type || 'Linea de ayuda'}</CText>
                          <CText type={'S14'} color={colors.primary}>
                            {contact?.phone}
                          </CText>
                          {!!contact?.notes && (
                            <CText type={'S12'} color={colors.labelColor}>
                              {contact.notes}
                            </CText>
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <CText type={'S14'} color={colors.labelColor}>
                        No encontramos telefonos para este pais.
                      </CText>
                    )}
                  </View>
                ) : (
                  <CText type={'S14'} color={colors.labelColor} style={styles.mb10}>
                    No pudimos determinar tu ubicacion. Puedes buscar tu pais para ver telefonos de emergencia.
                  </CText>
                )}
                <View style={styles.mb10}>
                  <CText type={'M14'} style={styles.mb5}>
                    Buscar otro pais
                  </CText>
                  <CInput
                    _value={countryQuery}
                    placeHolder={'Escribe un pais'}
                    toGetTextFieldValue={setCountryQuery}
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
                {filteredCountries.map((country, idx) => (
                  <TouchableOpacity
                    key={`country-${idx}`}
                    onPress={() => onSelectCountry(country)}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: colors.grayScale3,
                    }}
                  >
                    <CText type={'S14'}>
                      {country?.country_name || country?.country_code}
                    </CText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={[styles.mt10]}>
              <CButton title={'Cerrar'} onPress={closeEmergencyModal} />
            </View>
          </View>
        </View>
      </Modal>
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
          <CButton
            title={'Siguiente'}
            onPress={onPressNext}
            disabled={savingAnswer || !selectedOption || (isOtherAddictionsItem && !specialValue.trim())}
            loading={savingAnswer}
          />
        ) : selectedIds.length ? (
          <CButton title={'Continuar'} onPress={onPressComplete} disabled={completing} loading={completing} />
        ) : (
          <CButton
            title={'Volver a seleccion'}
            onPress={() => safeNavigation.replace('DiagnosticoSelection', {module_key: moduleKey, sessionId})}
          />
        )}
      </View>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            DiagnosticoWizardScreen
          </CText>
        </View>
      )}
    </CSafeAreaView>
  );
}

const localStyles = {
  screenTooltip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
};
