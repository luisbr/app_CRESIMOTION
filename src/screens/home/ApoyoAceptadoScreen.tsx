import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CText from '../../components/common/CText';
import CMainAppBar from '../../components/common/CMainAppBar';
import {validarCodigoApoyo} from '../../api/apoyoFinanciero';
import {StackNav, TabNav} from '../../navigation/NavigationKey';

export default function ApoyoAceptadoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {solicitudData} = route.params ?? {};

  const yaAprobado = solicitudData?.estatus === 'aprobada';
  const codigoInfo = solicitudData?.codigo;
  const membresia   = codigoInfo?.membresia;
  const descuento   = codigoInfo?.porcentaje_descuento ?? solicitudData?.porcentaje_descuento ?? 0;
  const fechaExp    = codigoInfo?.fecha_expiracion ?? null;

  const [codigoInput, setCodigoInput] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState<{success: boolean; message?: string} | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  useEffect(() => {
    if (fechaExp) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const exp = new Date(fechaExp + 'T00:00:00');
      const diff = Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      setDiasRestantes(diff > 0 ? diff : 0);
    }
  }, [fechaExp]);

  const formatFecha = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-MX', {day: '2-digit', month: 'long', year: 'numeric'});
  };

  const copiarCodigo = async () => {
    if (codigoInfo?.codigo) {
      await Clipboard.setStringAsync(codigoInfo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const onValidarCodigo = async () => {
    const cod = codigoInput.trim().toUpperCase();
    if (!cod) return;
    try {
      setValidando(true);
      setResultado(null);
      const res = await validarCodigoApoyo(cod);
      setResultado(res);
    } catch (e) {
      setResultado({success: false, message: 'Error de conexión. Intenta de nuevo.'});
    } finally {
      setValidando(false);
    }
  };

  const onSuscribirse = () => {
    navigation.navigate(StackNav.Subscription);
  };

  const onContinuar = () => {
    navigation.reset({
      index: 0,
      routes: [{ 
        name: StackNav.TabNavigation, 
        state: { 
          routes: [{ name: TabNav.HomeTab }] 
        } 
      }]
    });
  };

  const onNuevaSolicitud = () => {
    navigation.navigate(StackNav.ApoyoFinanciero);
  };

  const estaRechazado = solicitudData?.estatus === 'rechazada';

  // Si la solicitud está rechazada
  if (estaRechazado) {
    return (
      <View style={localStyles.container}>
        <CMainAppBar mode="sub" title="Apoyo financiero" />
        <View style={localStyles.center}>
          <View style={[localStyles.iconWrap, {backgroundColor: '#ffebee'}]}>
            <Ionicons name="close-circle-outline" size={48} color="#c62828" />
          </View>
          <CText type="B22" style={localStyles.pendingTitle}>Solicitud rechazada</CText>
          <CText type="R15" style={localStyles.pendingDesc}>
            Tu solicitud de apoyo financiero fue rechazada. Puedes intentar nuevamente cuando tu situación cambie.
          </CText>
          <TouchableOpacity style={localStyles.btnPrimario} onPress={onNuevaSolicitud}>
            <CText type="S16" color="#fff">Nueva solicitud</CText>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.btnSecundario} onPress={onContinuar}>
            <CText type="S16" color="#0aa693">Continuar con el plan actual</CText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Si la solicitud está pendiente (aún no aprobada por el admin)
  if (!yaAprobado) {
    return (
      <View style={localStyles.container}>
        <CMainAppBar mode="sub" title="Apoyo financiero" />
        <View style={localStyles.center}>
          <View style={localStyles.iconWrap}>
            <Ionicons name="time-outline" size={48} color="#f59e0b" />
          </View>
          <CText type="B22" style={localStyles.pendingTitle}>¡Solicitud enviada!</CText>
          <CText type="R15" style={localStyles.pendingDesc}>
            Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos pronto con el resultado.
          </CText>
          <TouchableOpacity style={localStyles.btnSecundario} onPress={onContinuar}>
            <CText type="S16" color="#0aa693">Continuar con el plan actual</CText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <CMainAppBar mode="sub" title="Apoyo financiero" />
      <ScrollView contentContainerStyle={localStyles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header de aprobación */}
        <View style={localStyles.approvedCard}>
          <View style={localStyles.checkCircle}>
            <Ionicons name="checkmark-circle" size={48} color="#0aa693" />
          </View>
          <CText type="B24" style={localStyles.approvedTitle}>¡Felicidades!</CText>
          <CText type="S16" style={localStyles.approvedSubtitle}>
            ¡Tu apoyo económico ha sido aprobado!
          </CText>
        </View>

        {/* Detalle del descuento */}
        {membresia && (
          <View style={localStyles.membresiaCard}>
            <CText type="S14" style={localStyles.cardLabel}>Membresía con descuento</CText>
            <CText type="B20" style={localStyles.membresiaName}>{membresia.nombre}</CText>
            <View style={localStyles.preciosRow}>
              <View style={localStyles.precioItem}>
                <CText type="R13" style={localStyles.precioLabel}>Precio regular</CText>
                <CText type="R16" style={localStyles.precioOriginal}>
                  ${membresia.precio_original?.toFixed(2)}/mes
                </CText>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#0aa693" />
              <View style={localStyles.precioItem}>
                <CText type="R13" style={localStyles.precioLabel}>Con {descuento}% desc.</CText>
                <CText type="B20" style={localStyles.precioFinal}>
                  ${membresia.precio_descuento?.toFixed(2)}/mes
                </CText>
              </View>
            </View>
            {fechaExp && (
              <View style={localStyles.expWrap}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <CText type="R13" style={localStyles.expText}>
                  Este beneficio aplica hasta el {formatFecha(fechaExp)}
                </CText>
              </View>
            )}
          </View>
        )}

        {/* Card de cupón mejorado */}
        {codigoInfo && !codigoInfo.usado && (
          <View style={localStyles.couponCard}>
            <View style={localStyles.couponHeader}>
              <View style={localStyles.couponBadge}>
                <CText type="B12" color="#fff">{descuento}% DESC</CText>
              </View>
              {diasRestantes !== null && diasRestantes > 0 && (
                <View style={localStyles.diasBadge}>
                  <Ionicons name="time-outline" size={14} color="#f59e0b" />
                  <CText type="M12" color="#f59e0b" style={{marginLeft: 4}}>
                    {diasRestantes} día{diasRestantes !== 1 ? 's' : ''} restantes
                  </CText>
                </View>
              )}
            </View>
            
            <View style={localStyles.couponBody}>
              <CText type="R13" style={{color: '#666'}}>Tu código de descuento</CText>
              <View style={localStyles.codigoDisplay}>
                <CText type="B24" style={localStyles.codigoTexto}>{codigoInfo.codigo}</CText>
                <TouchableOpacity onPress={copiarCodigo} style={localStyles.btnCopiar}>
                  {copiado ? (
                    <Ionicons name="checkmark" size={20} color="#0aa693" />
                  ) : (
                    <Ionicons name="copy-outline" size={20} color="#0aa693" />
                  )}
                </TouchableOpacity>
              </View>
              {copiado && (
                <CText type="R12" color="#0aa693" style={{marginTop: 4}}>¡Código copiado!</CText>
              )}
            </View>
            
            <View style={localStyles.couponFooter}>
              <CText type="R12" style={{color: '#888', textAlign: 'center'}}>
                Este código se aplicará automáticamente al suscribirte
              </CText>
            </View>
          </View>
        )}

        {codigoInfo?.usado && (
          <View style={localStyles.codigoUsadoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#f59e0b" />
            <CText type="R14" color="#b45309" style={{marginLeft: 8}}>
              Este código ya fue utilizado.
            </CText>
          </View>
        )}

        {/* Botones de acción */}
        <TouchableOpacity style={localStyles.btnPrimario} onPress={onSuscribirse} activeOpacity={0.8}>
          <CText type="S17" color="#fff">Suscribirme ahora</CText>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.btnSecundario} onPress={onContinuar} activeOpacity={0.8}>
          <CText type="S15" color="#0aa693">Continuar con el plan actual</CText>
        </TouchableOpacity>

        <View style={{height: 30}} />
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32},
  scroll: {padding: 20},

  // Pending
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff9e6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  pendingTitle: {textAlign: 'center', marginBottom: 12, color: '#1a1a2e'},
  pendingDesc: {textAlign: 'center', color: '#555', lineHeight: 22, marginBottom: 32},

  // Approved header
  approvedCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  checkCircle: {marginBottom: 12},
  approvedTitle: {color: '#1a1a2e', marginBottom: 6},
  approvedSubtitle: {color: '#0aa693', textAlign: 'center'},

  // Membresía card
  membresiaCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardLabel: {color: '#888', marginBottom: 4},
  membresiaName: {color: '#1a1a2e', marginBottom: 16},
  preciosRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  precioItem: {alignItems: 'center'},
  precioLabel: {color: '#888', marginBottom: 2},
  precioOriginal: {color: '#aaa', textDecorationLine: 'line-through'},
  precioFinal: {color: '#0aa693'},
  expWrap: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  expText: {color: '#666', marginLeft: 6},

  // Coupon card mejorado
  couponCard: {
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0aa693',
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    elevation: 5,
    borderWidth: 2,
    borderColor: '#0aa693',
  },
  couponHeader: {
    backgroundColor: '#0aa693',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  diasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponBody: {
    padding: 20,
    alignItems: 'center',
  },
  codigoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  codigoTexto: {
    color: '#1a1a2e',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  btnCopiar: {
    marginLeft: 12,
    padding: 8,
  },
  couponFooter: {
    backgroundColor: '#f9f9f9',
    padding: 12,
  },
  
  // Old code card (kept for reference)
  codigoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  codigoLabel: {color: '#444', marginBottom: 12, lineHeight: 20},
  codigoInputRow: {flexDirection: 'row', gap: 8, marginBottom: 10},
  codigoInput: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10,
    paddingHorizontal: 14, height: 44, fontSize: 16,
    fontFamily: 'monospace', letterSpacing: 2, color: '#1a1a2e',
  },
  btnValidar: {
    backgroundColor: '#0aa693', borderRadius: 10,
    paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center',
  },
  resultadoBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, padding: 10,
  },
  codigoUsadoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16,
  },

  // Botones
  btnPrimario: {
    backgroundColor: '#0aa693', borderRadius: 30, paddingVertical: 16,
    paddingHorizontal: 24, alignItems: 'center', marginBottom: 14,
    marginHorizontal: 20,
    shadowColor: '#0aa693', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnSecundario: {
    borderWidth: 2, borderColor: '#0aa693', borderRadius: 30,
    paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center',
    marginHorizontal: 20,
  },
});
