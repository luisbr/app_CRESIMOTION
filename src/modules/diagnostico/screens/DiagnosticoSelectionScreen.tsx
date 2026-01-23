import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import {Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import CInput from '../../../components/common/CInput';
import {styles} from '../../../theme';
import type {CatalogItem, ModuleKey, MotivoCategory} from '../types';
import {getMotivosCatalog, getMotivosCategories, getSintomasEmocionalesCatalog, getSintomasFisicosCatalog} from '../api/wsCatalogApi';
import {saveSelection, startSession} from '../api/sessionsApi';
import ChecklistItem from '../components/ChecklistItem';
import {getGroupId, saveGroupId, saveLastRoute} from '../utils';

export default function DiagnosticoSelectionScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
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
      const preSelected = sessionResp?.selection?.selected_item_ids || [];
      setSelectedIds(preSelected.map((id: any) => Number(id)));
      setAnswers(Array.isArray(sessionResp?.answers) ? sessionResp.answers : []);
      let catalog: CatalogItem[] = [];
      if (moduleKey === 'motivos') {
        const categories = await getMotivosCategories();
        const flatMotivos = categories.flatMap(category => category.motivos || []);
        setMotivoCategories(categories);
        catalog = flatMotivos;
      }
      if (moduleKey === 'sintomas_fisicos') catalog = await getSintomasFisicosCatalog();
      if (moduleKey === 'sintomas_emocionales') catalog = await getSintomasEmocionalesCatalog();
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
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const onPressNext = async () => {
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
    try {
      const resp = await saveSelection(sessionId, selectedIds);
      console.log('[DiagnosticoSelection] saveSelection response', resp);
      await saveLastRoute({session_id: sessionId, module_key: moduleKey, screen: 'Wizard'});
      navigation.navigate('DiagnosticoWizard', {
        sessionId,
        module_key: moduleKey,
        items,
        selectedIds,
        answers,
      });
    } catch (e: any) {
      console.log('[DiagnosticoSelection] saveSelection error', e?.body || e?.message || e);
      setError(e?.body?.message || e?.message || 'No se pudo guardar la seleccion.');
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategoryIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
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

  const introTitle =
    moduleKey === 'motivos'
      ? 'Motivos de tu estado emocional'
      : moduleKey === 'sintomas_fisicos'
      ? 'Sintomatología física'
      : 'Sintomatología emocional';

  const introBody =
    moduleKey === 'motivos'
      ? 'Cuéntanos cuáles son los motivos de tu estado emocional. Al final, recibirás un resumen gráfico de los motivos de tu estado emocional, y podremos ofrecerte un enfoque positivo, constructivo e inteligente.'
      : moduleKey === 'sintomas_fisicos'
      ? 'Para ayudarte a entender mejor cómo te encuentras hoy y brindarte un servicio de calidad, por favor, cuéntanos sobre tu sintomatología física. Al terminar, recibirás un resumen gráfico de tu sintomatología física actual.'
      : 'Para ayudarte a entender mejor cómo te encuentras hoy y brindarte un servicio de calidad, por favor, cuéntanos sobre tu sintomatología emocional. Al terminar, recibirás un resumen gráfico de tu sintomatología emocional actual.';

  return (
    <CSafeAreaView>
      <CHeader
        isHideBack
        centerAccessory={
          <Image
            source={require('../../../../assets/logo.png')}
            style={{width: moderateScale(110), height: moderateScale(28)}}
            resizeMode="contain"
          />
        }
        isLeftIcon={
          <TouchableOpacity onPress={drawer.open} style={{padding: 6, marginLeft: -8}}>
            <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
          </TouchableOpacity>
        }
        rightAccessory={
          <View style={[styles.rowStart, styles.g10]}>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={[styles.flex, styles.p20, {position: 'relative'}]}>
        <CText type={'S24'} align={'center'} style={styles.mb10}>
          Selecciona tus {moduleKey.replace('_', ' ')}
        </CText>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: moderateScale(12),
            padding: moderateScale(12),
            marginBottom: moderateScale(12),
          }}
        >
          <CText type={'M16'} align={'center'} style={{marginBottom: moderateScale(4)}}>
            {`--${introTitle}--`}
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
              filteredCategories.length ? (
                filteredCategories.map(category => {
                  const isExpanded = normalizedQuery
                    ? true
                    : expandedCategoryIds.includes(Number(category.id));
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
                            {category.nombre}
                          </CText>
                          {!!category.descripcion && (
                            <CText type={'S12'} color={colors.labelColor}>
                              {category.descripcion}
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
                            title={item.titulo}
                            description={item.descripcion}
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
                    title={item.titulo}
                    description={item.descripcion}
                    selected={selectedIds.includes(Number(item.id))}
                    onPress={() => toggleId(Number(item.id))}
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
        <CButton title={'Siguiente'} onPress={onPressNext} disabled={!selectedIds.length} />
      </View>
    </CSafeAreaView>
  );
}
