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
  const [mostrarSubMenu, setMostrarSubMenu] = useState<Record<number, boolean>>({});

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
            const parsed = JSON.parse(respuestasGuardadas);
            setRespuestas(parsed);
            
            // Inicializar el estado de mostrarSubMenu basado en las respuestas guardadas
            const initialSubMenuState: Record<number, boolean> = {};
            data.preguntas.forEach(preg => {
              const idxOtro = preg.opciones.findIndex(op => op.texto.trim() === 'Otro');
              if (idxOtro !== -1 && parsed[preg.id]) {
                const isSubOpcionSeleccionada = preg.opciones.findIndex(op => op.id === parsed[preg.id]) > idxOtro;
                if (isSubOpcionSeleccionada) {
                  initialSubMenuState[preg.id] = true;
                }
              }
            });
            setMostrarSubMenu(initialSubMenuState);
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
          {preguntas.map(preg => {
            const idxOtro = preg.opciones.findIndex(op => op.texto.trim() === 'Otro');
            const tieneOtro = idxOtro !== -1;
            const opcionesPrincipales = tieneOtro ? preg.opciones.slice(0, idxOtro + 1) : preg.opciones;
            const subOpciones = tieneOtro ? preg.opciones.slice(idxOtro + 1) : [];
            const subMenuAbierto = mostrarSubMenu[preg.id] || false;
            
            // Verificar si la respuesta actual es una de las sub-opciones
            const isSubOpcionSeleccionada = subOpciones.some(op => op.id === respuestas[preg.id]);
            const isOtroOpcionSeleccionada = respuestas[preg.id] === preg.opciones[idxOtro]?.id || isSubOpcionSeleccionada;

            return (
              <View key={preg.id} style={localStyles.preguntaCard}>
                <CText type="S16" style={localStyles.preguntaText}>{preg.texto}</CText>
                {opcionesPrincipales.map(op => {
                  const esLaOpcionOtro = op.texto.trim() === 'Otro';
                  // Si es la opción "Otro", la consideramos seleccionada si se eligió ella misma o alguna de sus sub-opciones
                  const seleccionada = esLaOpcionOtro ? isOtroOpcionSeleccionada : respuestas[preg.id] === op.id;
                  
                  return (
                    <View key={op.id}>
                      <TouchableOpacity
                        style={[
                          localStyles.opcion,
                          seleccionada && localStyles.opcionSeleccionada,
                        ]}
                        onPress={() => {
                          if (esLaOpcionOtro) {
                            // Si toca "Otro", abrimos/cerramos el submenú
                            setMostrarSubMenu(prev => ({...prev, [preg.id]: !prev[preg.id]}));
                            // Si no hay ninguna subopción seleccionada, seleccionamos la propia opción "Otro" temporalmente
                            if (!isSubOpcionSeleccionada) {
                              seleccionarOpcion(preg.id, op.id);
                            }
                          } else {
                            seleccionarOpcion(preg.id, op.id);
                            // Cerramos submenú si elige otra opción principal
                            setMostrarSubMenu(prev => ({...prev, [preg.id]: false}));
                          }
                        }}
                        activeOpacity={0.7}>
                        <View style={[localStyles.radio, seleccionada && localStyles.radioSelected]}>
                          {seleccionada && <View style={localStyles.radioDot} />}
                        </View>
                        <CText type="R15" style={localStyles.opcionText}>{op.texto}</CText>
                        
                        {esLaOpcionOtro && subOpciones.length > 0 && (
                          <Ionicons 
                            name={subMenuAbierto ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={seleccionada ? "#0aa693" : "#666"} 
                          />
                        )}
                      </TouchableOpacity>

                      {/* Renderizar Sub-opciones si es la opción "Otro" y el menú está abierto */}
                      {esLaOpcionOtro && subMenuAbierto && subOpciones.length > 0 && (
                        <View style={localStyles.subMenuContainer}>
                          {subOpciones.map(subOp => {
                            const subSeleccionada = respuestas[preg.id] === subOp.id;
                            return (
                              <TouchableOpacity
                                key={subOp.id}
                                style={[
                                  localStyles.subOpcion,
                                  subSeleccionada && localStyles.subOpcionSeleccionada
                                ]}
                                onPress={() => seleccionarOpcion(preg.id, subOp.id)}
                                activeOpacity={0.7}>
                                <View style={[localStyles.radio, subSeleccionada && localStyles.radioSelected]}>
                                  {subSeleccionada && <View style={localStyles.radioDot} />}
                                </View>
                                <CText type="R14" style={localStyles.opcionText}>{subOp.texto}</CText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}

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
    borderColor: '#0aa693',
    backgroundColor: '#e6fcf8',
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#0aa693',
  },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#0aa693',
  },
  opcionText: {
    flex: 1, color: '#444',
  },
  subMenuContainer: {
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 30, // Sangría para las subopciones
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 10,
  },
  subOpcion: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1, borderColor: '#eee',
    borderRadius: 8, padding: 12, marginBottom: 8,
  },
  subOpcionSeleccionada: {
    borderColor: '#0aa693',
    backgroundColor: '#e6fcf8',
  },
  btn: {
    backgroundColor: '#0aa693', borderRadius: 30,
    paddingVertical: 16, alignItems: 'center', marginVertical: 20,
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
