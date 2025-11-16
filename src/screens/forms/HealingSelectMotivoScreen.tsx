import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { moderateScale } from '../../common/constants';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../../api/config';
import { clearSession } from '../../session/storage';
import { getSession } from '../../api/auth';

type MotivoItem = { id: string; texto: string; intensidad_id: string | null; peso: number | null };
type Section = { encuestaId: string; encuestaTitulo: string; motivos: MotivoItem[] };
type SelectedMotivo = { motivo: MotivoItem; encuestaId: string };

const pesoToLabel = (peso?: number | null) => {
  switch (Number(peso)) {
    case 5: return 'Muy Alto';
    case 4: return 'Alto';
    case 3: return 'Medio';
    case 2: return 'Bajo';
    case 1: return 'Muy Bajo';
    default: return 'Sin dato';
  }
};

export default function HealingSelectMotivoScreen({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedMotivo, setSelectedMotivo] = useState<SelectedMotivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { listAllProgress, listReasonsForProgress, listIntensitiesForProgress } = require('../../repositories/formsRepo');
        const { getEncuestaById } = require('../../api/encuestas');
        const s = await getSession();
        const userId = String(s?.id || 'anon');
        const progres: any[] = listAllProgress(userId) || [];
        const order = ['1', '2'];
        const byEncuesta: Record<string, any> = {};
        for (const encId of order) {
          const p = progres.find(pr => String(pr.encuesta_id) === encId) || null;
          if (!p) { byEncuesta[encId] = null; continue; }
          const encuesta = await getEncuestaById(String(p.encuesta_id));
          const motivosById = new Map((encuesta?.motivos || []).map((m: any) => [String(m.id), m.motivo]));
          const selected = listReasonsForProgress(p.id).map((r: any) => String(r.motivo_id));
          const intensities = listIntensitiesForProgress(p.id);
          const intensidadByMotivo = new Map(intensities.map((it: any) => [String(it.motivo_id), it]));
          const motivos: MotivoItem[] = selected.map((id: string) => {
            const it = intensidadByMotivo.get(id);
            return { id, texto: motivosById.get(id) || '', intensidad_id: it?.intensidad_id ?? null, peso: it?.peso ?? null };
          });
          byEncuesta[encId] = { encuestaId: encId, encuestaTitulo: encuesta?.encuesta || '', motivos };
        }
        const list: Section[] = order.map(id => byEncuesta[id]).filter(Boolean);
        setSections(list);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar motivos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const empty = useMemo(() => sections.every(s => (s?.motivos?.length || 0) === 0), [sections]);

  const renderMotivo = (item: MotivoItem, encuestaId: string) => {
    const isOn = selectedMotivo?.motivo.id === item.id;
    return (
      <TouchableOpacity onPress={() => setSelectedMotivo(isOn ? null : { motivo: item, encuestaId })} style={[styles.rowSpaceBetween, styles.pv15]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <CText type={'S16'}>{`${item.texto} (${pesoToLabel(item.peso)})`}</CText>
        </View>
        <View
          style={{
            width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11),
            borderWidth: 2, borderColor: isOn ? colors.primary : colors.grayScale2,
            backgroundColor: isOn ? colors.primary : 'transparent',
          }}
        />
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={[styles.flex, styles.center]}><CText>Cargando…</CText></View>;
  if (error) return <View style={[styles.flex, styles.center, styles.ph20]}><CText>{error}</CText></View>;

  return (
    <CSafeAreaView>
      <CHeader title={'Inicio de sanación'} />
      <View style={[styles.ph20, styles.pv20, { flex: 1 }]}>
        <CText type={'B18'}>Selecciona un motivo</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          Nos alegra tenerte aquí. {/*La sanación emocional es el camino para sanar las heridas del pasado, procesar las emociones no resueltas y restaurar la paz interna. A través de herramientas avanzadas y personalizadas, te ayudaremos a reconocer, comprender y liberar esas emociones, permitiéndote vivir con mayor equilibrio, autocomprensión y resiliencia.
Ahora, a fin de proporcionarte una Sesión de sanación emocional para reducir considerablemente una a una cualquier emoción negativa, selecciona la emoción que más está teniendo impacto en tu vida en este momento, entre las emociones que marcaste en nivel Muy alto, Alto o Medio.*/}
        </CText>
        {empty && (
          <CText type={'S14'} color={colors.labelColor} style={styles.mt20}>
            No hay motivos seleccionados en las encuestas.
          </CText>
        )}
        {sections.map((sec, idx) => (
          <View key={sec.encuestaId} style={{ marginTop: idx === 0 ? moderateScale(16) : moderateScale(24) }}>
            <CText type={'B16'}>{`Encuesta ${sec.encuestaId}: ${sec.encuestaTitulo}`}</CText>
            <FlatList
              data={sec.motivos}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => renderMotivo(item, sec.encuestaId)}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.grayScale2 }} />}
              contentContainerStyle={{ paddingTop: 18 }}
            />
          </View>
        ))}
      </View>
      <View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20,
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1, borderTopColor: colors.grayScale2,
          shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: -2 }, shadowRadius: 6, elevation: 6,
        }}
      >
        {/* Resultado se mostrará en pantalla dedicada */}
        {fetching ? (
          <View style={{ paddingVertical: 8, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <CButton title={'Siguiente'} disabled={!selectedMotivo} onPress={async () => {
            if (!selectedMotivo) return;
            try {
              setFetching(true);
              setResult(null);
              const session = await getSession();
              const userId = session?.id ? String(session.id) : null;
              if (!userId) throw new Error('No se encontró una sesión activa.');

              if (selectedMotivo.encuestaId === '1') {
                const url = `${API_BASE_URL}/api/ws/motivo/${selectedMotivo.motivo.id}/enfoques?usuario_id=${userId}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error('No se pudo obtener el enfoque positivo.');
                if (!json?.data?.usuario_id) {
                  await clearSession();
                  Alert.alert('Sesión caducada', 'Tu sesión ya no es válida. Vuelve a iniciar sesión para continuar.', [
                    {
                      text: 'Aceptar',
                      onPress: () => navigation.reset({ index: 0, routes: [{ name: 'AuthNavigation' }] }),
                    },
                  ]);
                  return;
                }
                const enfoque = json?.data?.enfoque;
                if (!enfoque) throw new Error('No se encontró un enfoque disponible para este motivo.');
                const sanacionPayload = {
                  tipo: enfoque.audio_url ? 'audio' : 'texto',
                  titulo: enfoque.nombre || 'Enfoque positivo',
                  contenido_texto: enfoque.descripcion || '',
                  audio_url: enfoque.audio_url || null,
                  audios: enfoque.audio_url ? [{ orden: 1, url: enfoque.audio_url }] : [],
                };
                navigation.navigate('HealingSanacionScreen', {
                  motivo: json?.data?.motivo || { motivo: selectedMotivo.motivo.texto },
                  sanacion: sanacionPayload,
                });
              } else {
                const url = `${API_BASE_URL}/api/ws/motivo/${selectedMotivo.motivo.id}/sanaciones`;
                const res = await fetch(url);
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error('Error al obtener sanaciones.');
                const list = Array.isArray(json?.data?.sanaciones) ? json.data.sanaciones : [];
                const one = list.length ? list[0] : null;
                if (!one) throw new Error('No hay sanaciones disponibles para este motivo.');
                setResult({ motivo: json?.data?.motivo, sanacion: one });
                navigation.navigate('HealingSanacionScreen', { motivo: json?.data?.motivo, sanacion: one });
              }
            } catch (e: any) {
              console.log('[HEALING] fetch sanaciones error', e?.message || e);
              setResult(null);
              Alert.alert('Error', e?.message || 'No se pudo continuar con la sanación.');
            } finally {
              setFetching(false);
            }
          }} />
        )}
      </View>
    </CSafeAreaView>
  );
}
