import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {styles as globalStyles} from '../../theme';
import CText from '../../components/common/CText';
import CMainAppBar from '../../components/common/CMainAppBar';
import {obtenerFormularioApoyo, obtenerEstadoApoyo, solicitarApoyoFinanciero} from '../../api/apoyoFinanciero';
import {getSession} from '../../api/auth';
import {StackNav} from '../../navigation/NavigationKey';

const STORAGE_KEY = '@apoyo_financiero_respuestas';

interface Opcion {
  id: number;
  texto: string;
  porcentaje_descuento: number;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface FormularioResponse {
  success: boolean;
  config: Record<string, string>;
  preguntas: Pregunta[];
}

export default function ApoyoFinancieroScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();

  const [cargando, setCargando] = useState(true);
  const [verificandoEstado, setVerificandoEstado] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState<any>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});

  const cargarFormulario = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data: FormularioResponse = await obtenerFormularioApoyo();
      if (data.success) {
        setConfig(data.config);
        setPreguntas(data.preguntas);
        
        // Cargar respuestas guardadas en AsyncStorage
        try {
          const respuestasGuardadas = await AsyncStorage.getItem(STORAGE_KEY);
          if (respuestasGuardadas) {
            setRespuestas(JSON.parse(respuestasGuardadas));
          }
        } catch (e) {
          console.log('Error cargando respuestas guardadas:', e);
        }
      }
    } catch (e) {
      setError('No se pudo cargar el formulario. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  const verificarEstadoSolicitud = useCallback(async () => {
    try {
      setVerificandoEstado(true);
      const estado = await obtenerEstadoApoyo();
      if (estado.success && estado.tiene_solicitud) {
        setEstadoSolicitud(estado);
        // Si ya tiene solicitud activa (pendiente o aprobada), redirigir a la pantalla de resultado
        if (estado.estatus === 'pendiente' || estado.estatus === 'aprobada') {
          navigation.replace(StackNav.ApoyoAceptado, {solicitudData: estado});
          return;
        }
      }
    } catch (e) {
      console.log('Error verificando estado:', e);
    } finally {
      setVerificandoEstado(false);
    }
  }, [navigation]);

  useEffect(() => {
    verificarEstadoSolicitud();
  }, [verificarEstadoSolicitud]);

  useEffect(() => {
    if (!verificandoEstado) {
      cargarFormulario();
    }
  }, [verificandoEstado, cargarFormulario]);

  const seleccionarOpcion = async (preguntaId: number, opcionId: number) => {
    const nuevasRespuestas = {...respuestas, [preguntaId]: opcionId};
    setRespuestas(nuevasRespuestas);
    
    // Guardar en AsyncStorage para persistencia
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasRespuestas));
    } catch (e) {
      console.log('Error guardando respuestas:', e);
    }
  };

  const todosRespondidos = preguntas.length > 0 && preguntas.every(p => respuestas[p.id]);

  const onSiguiente = async () => {
    if (!todosRespondidos) return;
    
    // Obtener el estado actual de respuestas directamente del callback
    const respuestasActuales = Object.entries(respuestas).map(([pregunta_id, opcion_id]) => ({
      pregunta_id: parseInt(pregunta_id, 10),
      opcion_id,
    }));

    // Validar que hay respuestas antes de enviar
    if (!respuestasActuales.length || respuestasActuales.length === 0) {
      setError('Por favor, responde todas las preguntas.');
      return;
    }
    
    try {
      setEnviando(true);
      setError(null);

      // Obtener sesión con reintento
      let session = await getSession();
      if (!session?.id) {
        // Reintentar después de un pequeño delay
        await new Promise(resolve => setTimeout(resolve, 500));
        session = await getSession();
      }
      
      if (!session?.id) {
        setError('Tu sesión expiró. Por favor, inicia sesión de nuevo.');
        setEnviando(false);
        return;
      }
      
      const res = await solicitarApoyoFinanciero(respuestasActuales);
      
      // Verificar respuesta del backend
      if (!res.success) {
        setError(res.message || 'Error al enviar tu solicitud.');
        setEnviando(false);
        return;
      }
      
      // Limpiar respuestas guardadas al enviar
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.log('Error limpiando respuestas:', e);
      }
      
      navigation.navigate(StackNav.ApoyoAceptado, {solicitudData: res});
    } catch (e) {
      setError('Error al enviar tu solicitud. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  //pantalla de carga mientras verifica el estado
  if (verificandoEstado) {
    return (
      <View style={localStyles.container}>
        <CMainAppBar mode="sub" title="Apoyo financiero" />
        <View style={localStyles.center}>
          <ActivityIndicator size="large" color="#0aa693" />
        </View>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <CMainAppBar mode="sub" title="Apoyo financiero" />

      {cargando ? (
        <View style={localStyles.center}>
          <ActivityIndicator size="large" color="#0aa693" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={localStyles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* Header card */}
          <View style={localStyles.headerCard}>
            <View style={localStyles.iconWrap}>
              <Ionicons name="cash-outline" size={32} color="#0aa693" />
            </View>
            <CText type="B20" style={localStyles.headerTitle}>
              {config.titulo_seccion || '¿Necesitas apoyo financiero?'}
            </CText>
            <CText type="R14" style={localStyles.headerDesc}>
              {config.descripcion_seccion || 'Queremos ayudarte. Si estás atravesando una situación financiera difícil, puedes recibir un descuento especial.'}
            </CText>
          </View>

          {error && (
            <View style={localStyles.errorBox}>
              <CText type="R14" color="#c62828">{error}</CText>
            </View>
          )}

          {/* Preguntas dinámicas */}
          {preguntas.map(preg => (
            <View key={preg.id} style={localStyles.preguntaCard}>
              <CText type="S16" style={localStyles.preguntaText}>{preg.texto}</CText>
              {preg.opciones.map(op => {
                const seleccionada = respuestas[preg.id] === op.id;
                return (
                  <TouchableOpacity
                    key={op.id}
                    style={[
                      localStyles.opcion,
                      seleccionada && localStyles.opcionSeleccionada,
                    ]}
                    onPress={() => seleccionarOpcion(preg.id, op.id)}
                    activeOpacity={0.7}>
                    <View style={[localStyles.radio, seleccionada && localStyles.radioSelected]}>
                      {seleccionada && <View style={localStyles.radioDot} />}
                    </View>
                    <CText type="R15" style={localStyles.opcionText}>{op.texto}</CText>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Botón Siguiente */}
          <TouchableOpacity
            style={[localStyles.btn, (!todosRespondidos || enviando) && localStyles.btnDisabled]}
            onPress={onSiguiente}
            disabled={!todosRespondidos || enviando}
            activeOpacity={0.8}>
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CText type="S16" color="#fff">Siguiente</CText>
            )}
          </TouchableOpacity>

          <View style={{height: 30}} />
        </ScrollView>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scroll: {padding: 20},
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f5f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  headerDesc: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  preguntaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  preguntaText: {
    marginBottom: 14,
    color: '#1a1a2e',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  opcionSeleccionada: {
    backgroundColor: '#e0f5f3',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#0aa693',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0aa693',
  },
  opcionText: {color: '#333'},
  btn: {
    backgroundColor: '#0aa693',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0aa693',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: {
    backgroundColor: '#b0d8d5',
    shadowOpacity: 0,
  },
});
