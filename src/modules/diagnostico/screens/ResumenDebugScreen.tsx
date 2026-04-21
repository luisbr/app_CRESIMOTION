import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CMainAppBar from '../../../components/common/CMainAppBar';
import CText from '../../../components/common/CText';
import {getResumenMensual} from '../../../api/sesionTerapeutica';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';

export default function ResumenDebugScreen({navigation}: any) {
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getResumenMensual();
        setData(result);
      } catch (e: any) {
        setError(e?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);

  return (
    <CSafeAreaView>
      <CMainAppBar mode="sub" title="Resumen Mensual (Debug)" onBack={() => navigation.goBack()} />
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F7A6A" />
          <CText type="R14" style={styles.loadingText}>Cargando...</CText>
        </View>
      )}
      {error && (
        <View style={styles.center}>
          <CText type="B16" color="#B42318">Error</CText>
          <CText type="R14" style={styles.errorText}>{error}</CText>
        </View>
      )}
      {data && !loading && (
        <ScrollView style={styles.container}>
          <CText type="B18" style={styles.sectionTitle}>JSON Completo</CText>
          <View style={styles.jsonCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <CText type="R12" style={styles.jsonText}>
                {JSON.stringify(data, null, 2)}
              </CText>
            </ScrollView>
          </View>
          <CText type="B18" style={styles.sectionTitle}>Datos</CText>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Periodo</CText>
            <View style={styles.card}>
              <CText type="R14">Start: {data?.period?.start}</CText>
              <CText type="R14">End: {data?.period?.end}</CText>
              <CText type="R14">Suscripcion ID: {data?.period?.suscripcion_id}</CText>
              <CText type="R14">Membresia: {data?.period?.membresia_nombre}</CText>
              <CText type="R14">Source: {data?.period?.source}</CText>
            </View>
          </View>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Sesiones Realizadas</CText>
            <View style={styles.card}>
              <CText type="R14">Count: {data?.sesiones_realizadas?.count}</CText>
              <CText type="R14">Group IDs: {JSON.stringify(data?.sesiones_realizadas?.group_ids)}</CText>
            </View>
          </View>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Enfoques Positivos</CText>
            <View style={styles.card}>
              <CText type="R14">Count: {data?.enfoques_positivos?.count}</CText>
              <CText type="R12">Items: {JSON.stringify(data?.enfoques_positivos?.items, null, 2)}</CText>
            </View>
          </View>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Sanacion Emocional</CText>
            <View style={styles.card}>
              <CText type="R14">Count: {data?.sanacion_emocional?.count}</CText>
              <CText type="R12">Items: {JSON.stringify(data?.sanacion_emocional?.items, null, 2)}</CText>
            </View>
          </View>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Recomendaciones para Sanar</CText>
            <View style={styles.card}>
              <CText type="R14">Count: {data?.recomendaciones_para_sanar?.count}</CText>
              <CText type="R12">Items: {JSON.stringify(data?.recomendaciones_para_sanar?.items, null, 2)}</CText>
            </View>
          </View>
          <View style={styles.section}>
            <CText type="B16" style={styles.sectionSubtitle}>Ejercicio Automatizado</CText>
            <View style={styles.card}>
              <CText type="R14">Seleccionados Count: {data?.ejercicio_automatizado?.seleccionados_count}</CText>
              <CText type="R14">Programados Count: {data?.ejercicio_automatizado?.programados_count}</CText>
              <CText type="R12">Seleccionados: {JSON.stringify(data?.ejercicio_automatizado?.seleccionados, null, 2)}</CText>
              <CText type="R12">Programados: {JSON.stringify(data?.ejercicio_automatizado?.programados, null, 2)}</CText>
            </View>
          </View>
        </ScrollView>
      )}
    </CSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 16,
  },
  sectionSubtitle: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  jsonCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  jsonText: {
    color: '#D4D4D4',
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
});