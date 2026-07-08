import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ChecklistItem from '../../modules/diagnostico/components/ChecklistItem';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import {
  getHistory,
  startSession,
  saveSelection,
  saveAnswer,
  completeSession,
  getPostWork
} from '../../modules/diagnostico/api/sessionsApi';
import {
  getMotivosCategories,
  getSintomasEmocionalesCatalog
} from '../../modules/diagnostico/api/wsCatalogApi';
import { StackNav, TabNav } from '../../navigation/NavigationKey';
import { isLimitReached } from '../../utils/apiError';

export default function TherapyResumeScreen({ navigation }: any) {
  const colors = useSelector((state: any) => state.theme.theme);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [motivosCatalog, setMotivosCatalog] = useState<any[]>([]);
  const [emotionsCatalog, setEmotionsCatalog] = useState<any[]>([]);
  
  const [historyMotivos, setHistoryMotivos] = useState<any[]>([]);
  const [historyEmotions, setHistoryEmotions] = useState<any[]>([]);

  const [selectedMotivos, setSelectedMotivos] = useState<number[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Load catalogs
      const [motivosCats, emotionsCat] = await Promise.all([
        getMotivosCategories(),
        getSintomasEmocionalesCatalog(),
      ]);

      const flatMotivos = motivosCats.flatMap((cat: any) => cat.motivos || []);
      setMotivosCatalog(flatMotivos);
      setEmotionsCatalog(emotionsCat || []);

      // 2. Load history
      const historyData = await getHistory('motivos', 1, 0);
      const list = historyData?.items || historyData?.data || historyData || [];
      const latestHistory = Array.isArray(list) && list.length > 0 ? list[0] : null;

      if (latestHistory) {
        const summary = latestHistory?.summary || {};
        const prevMotivos = Array.isArray(summary.motivos) ? summary.motivos : [];
        const prevEmotions = Array.isArray(summary.emotions) ? summary.emotions : [];

        // Pre-select items
        const motiveIds = prevMotivos.map((m: any) => Number(m.item_id || m.id || m.motivo_id)).filter((id) => !isNaN(id));
        const emotionIds = prevEmotions.map((e: any) => Number(e.item_id || e.id || e.emocion_id)).filter((id) => !isNaN(id));

        // Enrich the history items with titles from the catalog
        const enrichedMotivos = prevMotivos.map((m: any) => {
          const id = Number(m.item_id || m.id || m.motivo_id);
          const catalogItem = flatMotivos.find((c: any) => Number(c.id) === id);
          const isTrabajado = Array.isArray(m.evaluations) && m.evaluations.length > 0;
          return {
            ...m,
            id,
            titulo: catalogItem?.titulo || m.titulo || m.label || m.name || 'Motivo',
            descripcion: isTrabajado ? '✅ Trabajado' : '⏳ Pendiente',
            isTrabajado,
          };
        });

        const enrichedEmotions = prevEmotions.map((e: any) => {
          const id = Number(e.item_id || e.id || e.emocion_id);
          const catalogItem = emotionsCat.find((c: any) => Number(c.id) === id);
          const isTrabajado = Array.isArray(e.evaluations) && e.evaluations.length > 0;
          return {
            ...e,
            id,
            titulo: catalogItem?.titulo || e.titulo || e.label || e.name || 'Emoción',
            descripcion: isTrabajado ? '✅ Trabajado' : '⏳ Pendiente',
            isTrabajado,
          };
        });

        setHistoryMotivos(enrichedMotivos);
        setHistoryEmotions(enrichedEmotions);

        setSelectedMotivos(motiveIds);
        setSelectedEmotions(emotionIds);
      }
    } catch (e: any) {
      setError(e?.body?.message || e?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMotivo = (id: number) => {
    setSelectedMotivos((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEmotion = (id: number) => {
    setSelectedEmotions((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onContinue = async () => {
    if (selectedMotivos.length === 0 || selectedEmotions.length === 0) return;
    
    setSubmitting(true);
    setError('');
    try {
      // Create new session for motivos
      const sessionRespM: any = await startSession('motivos', 'MX', null);
      const groupId = sessionRespM.session.group_id;
      const sessionMId = sessionRespM.session.id;

      await saveSelection(sessionMId, selectedMotivos);
      
      // Save fake answers so we can complete session
      for (const mId of selectedMotivos) {
        await saveAnswer(sessionMId, {
          item_id: mId,
          response_type: 'intensidad_estandar',
          intensity_key: '5',
          intensity_value: 5
        });
      }
      await completeSession(sessionMId);

      // Create new session for emotions
      const sessionRespE: any = await startSession('sintomas_emocionales', 'MX', groupId);
      const sessionEId = sessionRespE.session.id;

      await saveSelection(sessionEId, selectedEmotions);
      
      for (const eId of selectedEmotions) {
        await saveAnswer(sessionEId, {
          item_id: eId,
          response_type: 'intensidad_estandar',
          intensity_key: '5',
          intensity_value: 5
        });
      }
      await completeSession(sessionEId);

      // Fetch post-work and navigate
      const data = await getPostWork(groupId);
      
      navigation.navigate(StackNav.TabNavigation, {
        screen: TabNav.HomeTab,
        params: {
          screen: 'TherapyFocusSelect',
          params: {
            postWork: true,
            groupId,
            motivos: data?.motivos || [],
            emotions: data?.emotions || [],
            entrypoint: 'history',
          },
        },
      });

    } catch (e: any) {
      console.log('Error creating resume session', e);
      if (!isLimitReached(e)) {
        setError(e?.body?.message || e?.message || 'No se pudo iniciar la sesión.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const capitalizeSentence = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    const lower = trimmed.toLowerCase();
    return lower.replace(
      /^([^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*)([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/,
      (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`
    );
  };

  const isContinueEnabled = selectedMotivos.length > 0 && selectedEmotions.length > 0;

  return (
    <CSafeAreaView color={null}>
      <CMainAppBar mode="sub" title="Reanudar Sesión" />
      <View style={[styles.p20, { flex: 1, paddingBottom: 0 }]}>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <CText type={'R14'} color={colors.labelColor} style={null} align={null}>
            Con base en tu última autoevaluación, identificamos algunos motivos y emociones que aún puedes trabajar para seguir avanzando en tu bienestar.
          </CText>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {!!error && (
              <CText type={'S14'} align={'center'} color={colors.redAlert} style={styles.mb10}>
                {error}
              </CText>
            )}

            <CText type="B16" style={styles.mb10} color={colors.textColor} align={null}>Motivos</CText>
            {historyMotivos.length === 0 ? (
              <CText type="S14" color={colors.labelColor} style={styles.mb10} align={null}>No tienes motivos en tu historial.</CText>
            ) : (
              historyMotivos.map(item => (
                <ChecklistItem
                  key={`motivo-${item.id}`}
                  title={capitalizeSentence(String(item.titulo || ''))}
                  description={item.descripcion}
                  selected={selectedMotivos.includes(Number(item.id))}
                  onPress={() => toggleMotivo(Number(item.id))}
                />
              ))
            )}

            <CText type="B16" style={[styles.mb10, styles.mt20]} color={colors.textColor} align={null}>Emociones</CText>
            {historyEmotions.length === 0 ? (
              <CText type="S14" color={colors.labelColor} style={styles.mb10} align={null}>No tienes emociones en tu historial.</CText>
            ) : (
              historyEmotions.map(item => (
                <ChecklistItem
                  key={`emocion-${item.id}`}
                  title={capitalizeSentence(String(item.titulo || ''))}
                  description={item.descripcion}
                  selected={selectedEmotions.includes(Number(item.id))}
                  onPress={() => toggleEmotion(Number(item.id))}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
      <View style={[styles.ph20, styles.pb20, styles.pt10, {
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1, borderTopColor: colors.grayScale2,
      }]}>
        <CButton
          title={'Comenzar sesión'}
          onPress={onContinue}
          disabled={!isContinueEnabled || submitting}
          loading={submitting}
          type={null} color={null} textStyle={null} style={null} bgColor={null} borderColor={null} frontIcon={null} icon={null} leftIconStyle={null} children={null} containerStyle={null}
        />
      </View>
    </CSafeAreaView>
  );
}
