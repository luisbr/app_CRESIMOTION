import React, { useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { getSession } from "../../api/auth";

import {
listAllProgress,
listReasonsForProgress,
listIntensitiesForProgress,
} from '../../repositories/formsRepo';

export default function HealingStartScreen({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const [checks, setChecks] = useState({ a: false, b: false, c: false, d: false });
  const allSelected = checks.a && checks.b && checks.c && checks.d;
  const isSpeakingRef = useRef(false);

  const introText = 'A partir de este momento, inicias tu proceso de sanación. Para aprovechar al máximo las siguientes dos fases (Enfoque positivo y Sanación emocional), confirma, por favor, que reúnes las siguientes condiciones:';
  const options = useMemo(() => [
    'Dispongo de al menos media hora para estar a solas, en un lugar tranquilo, libre de ruidos excesivos, distracciones o interrupciones externas, dedicando toda la atención a mi salud emocional.',
    'Cuento con una óptima conexión a internet para evitar interrupciones.',
    'Me encuentro en un espacio cómodo donde puedo recostarme o relajarme completamente.',
    'He entendido estas recomendaciones. No volver a mostrar.',
  ], []);

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const onSpeakPress = async () => {
    try {
      if (!Speech || typeof Speech.speak !== 'function') {
        console.log('[HEALING] speech module not available');
        return;
      }
      const ttsOptionsBase: any = { language: 'es-MX', pitch: 1.0, rate: 1.00 };
      // Try to pick a Spanish (Mexico) voice if available
      try {
        const voices = await Speech.getAvailableVoicesAsync?.();
        const mx = Array.isArray(voices) ? voices.find((v: any) => (v?.language || '').toLowerCase().startsWith('es-mx')) : null;
        const es = Array.isArray(voices) ? voices.find((v: any) => (v?.language || '').toLowerCase().startsWith('es-')) : null;
        if (mx?.identifier) ttsOptionsBase.voice = mx.identifier;
        else if (es?.identifier) ttsOptionsBase.voice = es.identifier;
      } catch {}
      if (isSpeakingRef.current) {
        Speech.stop();
        isSpeakingRef.current = false;
        return;
      }
      isSpeakingRef.current = true;
      await new Promise<void>((resolve) => Speech.speak(introText, { ...ttsOptionsBase, onDone: resolve, onStopped: resolve }));
      if (!isSpeakingRef.current) { isSpeakingRef.current = false; return; }
      await sleep(1200);
      for (const opt of options) {
        if (!isSpeakingRef.current) break;
        await new Promise<void>((resolve) => Speech.speak(opt, { ...ttsOptionsBase, onDone: resolve, onStopped: resolve }));
        if (!isSpeakingRef.current) break;
        await sleep(700);
      }
      isSpeakingRef.current = false;
    } catch (e) {
      console.log('[HEALING] speech not available', e);
    }
  };

  const buildEncuestasResumen = async () => {
    try {
      const { getSession } = require('../../api/auth');
      const { startOrGetProgress, listSelectedReasons } = require('../../repositories/formsRepo');
      const { getEncuestaById } = require('../../api/encuestas');
      const s = await getSession();
      const userId = String(s?.id || 'anon');
      const ids = ['1', '2', '3'];
      const result: any[] = [];
      for (const encuestaId of ids) {
        const encuesta = await getEncuestaById(encuestaId);
        const progress = startOrGetProgress(userId, encuestaId);
        const selectedIds: string[] = listSelectedReasons(progress.id);
        const motivosMap = new Map((encuesta?.motivos || []).map((m: any) => [String(m.id), m.motivo]));
        result.push({
          encuestaId,
          encuestaTitulo: encuesta?.encuesta || '',
          motivos: selectedIds.map((id: string) => ({ id, texto: motivosMap.get(String(id)) || '' })),
        });
      }
      return result;
    } catch (e) {
      console.log('[HEALING] buildEncuestasResumen error', e);
      return [];
    }
  };

  return (
    <CSafeAreaView>
      <CHeader title={'Inicio de proceso de sanación'} />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 120 }]}
                  keyboardShouldPersistTaps={'handled'}>
        <View style={[styles.rowSpaceBetween, { alignItems: 'center' }]}>
          <CText type={'B18'}>Introducción</CText>
          <TouchableOpacity onPress={onSpeakPress} style={{ padding: 8 }}>
            <CText type={'B16'} color={colors.primary}>🔊</CText>
          </TouchableOpacity>
        </View>
        <CText type={'R16'} color={colors.textColor}>
          {introText}
        </CText>

        <View style={[styles.mt20]}>
          {[{ key: 'a', label: options[0] }, { key: 'b', label: options[1] }, { key: 'c', label: options[2] }, { key: 'd', label: options[3] }].map((opt, idx) => {
            const isOn = (checks as any)[opt.key];
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setChecks(s => ({ ...s, [opt.key]: !((s as any)[opt.key]) }) as any)}
                style={[styles.rowSpaceBetween, styles.pv15, idx > 0 ? { marginTop: 4 } : null]}
              >
                <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>{opt.label}</CText>
                <View
                  style={{
                    width: 22, height: 22, borderRadius: 11,
                    borderWidth: 2, borderColor: isOn ? colors.primary : colors.grayScale2,
                    backgroundColor: isOn ? colors.primary : 'transparent',
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.mt30, styles.rowSpaceBetween]}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CButton title={'Más tarde'} bgColor={colors.inputBg} color={colors.primary} onPress={() => navigation.navigate('HomeRoot')} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CButton title={'Comenzar sanación'} disabled={!allSelected} onPress={async () => {
              try {
                const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                const flag = await AsyncStorage.getItem('HEALING_START_FLAG');
                const encuestasResumen = await (async () => {
                  try {
                    const { getSession } = require('../../api/auth');
                    const { listAllProgress, listReasonsForProgress, listIntensitiesForProgress } = require('../../repositories/formsRepo');
                    const { getEncuestaById } = require('../../api/encuestas');
                    const s = await getSession();
                    const userId = String(s?.id || 'anon');
                    const progres = listAllProgress(userId);
                    const result: any[] = [];
                    for (const p of progres) {
                      const encuesta = await getEncuestaById(String(p.encuesta_id));
                      const motivosById = new Map((encuesta?.motivos || []).map((m: any) => [String(m.id), m.motivo]));
                      const selected = listReasonsForProgress(p.id).map((r: any) => String(r.motivo_id));
                      const intensities = listIntensitiesForProgress(p.id);
                      const intensidadByMotivo = new Map(intensities.map((it: any) => [String(it.motivo_id), it]));
                      const motivos = selected.map((id: string) => {
                        const it = intensidadByMotivo.get(id);
                        return {
                          id,
                          texto: motivosById.get(id) || '',
                          intensidad_id: it?.intensidad_id ?? null,
                          peso: it?.peso ?? null,
                        };
                      });
                      result.push({
                        encuestaId: String(p.encuesta_id),
                        encuestaTitulo: encuesta?.encuesta || '',
                        progressId: p.id,
                        status: p.status,
                        motivos,
                      });
                    }
                    return result;
                  } catch (e) {
                    console.log('[HEALING] build full resumen error', e);
                    return [];
                  }
                })();
                const selected = Object.entries(checks)
                  .filter(([, v]) => v)
                  .map(([k]) => ({ key: k, text: (k === 'a' ? options[0] : k === 'b' ? options[1] : k === 'c' ? options[2] : options[3]) }));
                const resumen = {
                  pantalla: 'HealingStart',
                  healingFlag: flag,
                  introLeida: true,
                  opcionesSeleccionadas: selected,
                  encuestas: encuestasResumen,
                };
                console.log('[HEALING] continuar - resumen', resumen);
                navigation.navigate('HealingSelectMotivoScreen');
              } catch (e) {
                console.log('[HEALING] continuar - resumen error', e);
              }
            }} />
          </View>
          <View>
          </View>
        </View>
        <View style={[styles.mt10]}> <CButton title={'Log resultados (debug)'} onPress={async () => { try { const s = await getSession(); const userId = String(s?.id || 'anon'); const progresses = listAllProgress(userId); console.log('[DEBUG] Progresos:', progresses); for (const p of progresses) { const reasons = listReasonsForProgress(p.id); const intensities = listIntensitiesForProgress(p.id); console.log('[DEBUG] Progreso **',p.id, 'encuesta', p.encuesta_id, 'status', p.status); console.log(' [DEBUG] Motivos seleccionados:', reasons.map(r => String(r.motivo_id))); console.log(' [DEBUG] Intensidades:', intensities); } } catch (e) { console.log('[DEBUG][ERROR]', e?.message || e); } }} bgColor={colors.inputBg} color={colors.primary} /> </View>
      </ScrollView>
    </CSafeAreaView>
  );
}
