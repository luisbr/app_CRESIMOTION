import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import CButton from '../../../components/common/CButton';
import {styles} from '../../../theme';
import type {CatalogItem, ModuleKey} from '../types';
import {getMotivosCatalog, getSintomasEmocionalesCatalog, getSintomasFisicosCatalog} from '../api/wsCatalogApi';
import {saveSelection, startSession} from '../api/sessionsApi';
import ChecklistItem from '../components/ChecklistItem';
import {getGroupId, saveGroupId, saveLastRoute} from '../utils';

export default function DiagnosticoSelectionScreen({navigation, route}: any) {
  const colors = useSelector(state => state.theme.theme);
  const moduleKey: ModuleKey = route?.params?.module_key || 'motivos';
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async (mountedRef?: {current: boolean}) => {
    setLoading(true);
    setError('');
    try {
      const storedGroupId = moduleKey === 'motivos' ? null : await getGroupId();
      const sessionResp = await startSession(moduleKey, 'MX', storedGroupId);
      if (mountedRef && !mountedRef.current) return;
      setSessionId(Number(sessionResp?.session?.id));
      if (moduleKey === 'motivos' && sessionResp?.session?.group_id) {
        await saveGroupId(Number(sessionResp.session.group_id));
      }
      const preSelected = sessionResp?.selection?.selected_item_ids || [];
      setSelectedIds(preSelected.map((id: any) => Number(id)));
      setAnswers(Array.isArray(sessionResp?.answers) ? sessionResp.answers : []);
      let catalog: CatalogItem[] = [];
      if (moduleKey === 'motivos') catalog = await getMotivosCatalog();
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

  return (
    <CSafeAreaView>
      <CHeader />
      <View style={[styles.flex, styles.p20, {position: 'relative'}]}>
        <CText type={'S24'} align={'center'} style={styles.mb10}>
          Selecciona tus {moduleKey.replace('_', ' ')}
        </CText>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ScrollView
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 140}}
          >
            {items.map(item => (
              <ChecklistItem
                key={String(item.id)}
                title={item.titulo}
                description={item.descripcion}
                selected={selectedIds.includes(Number(item.id))}
                onPress={() => toggleId(Number(item.id))}
              />
            ))}
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
