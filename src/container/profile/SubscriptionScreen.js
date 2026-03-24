import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import * as Linking from 'expo-linking';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {
  getMembresias,
  getSuscripcionActual,
  createSuscripcionIntent,
  confirmarSuscripcion,
  cancelarSuscripcion,
  getPaymentMethod,
  getPaymentHistory,
  createSetupIntent
} from '../../api/auth';
import { obtenerEstadoApoyo } from '../../api/apoyoFinanciero';

export default function SubscriptionScreen({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [packages, setPackages] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [codigoApoyoInfo, setCodigoApoyoInfo] = useState(null);

  useEffect(() => {
    loadData();

    // Listen to Deep Links for Stripe redirect returns
    const subscription = Linking.addEventListener('url', handleDeepLink);
    // Also check initial URL if app was closed
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (event) => {
    const { url } = event;
    if (url.includes('stripe/success')) {
      const parsedUrl = Linking.parse(url);
      const { queryParams } = parsedUrl;
      const membresia_id = queryParams?.membresia_id;
      const session_id = queryParams?.session_id;
      
      if (membresia_id) {
        try {
          setLoading(true);
          const confirm = await confirmarSuscripcion(membresia_id, session_id);
          if (confirm.success) {
            Alert.alert('¡Éxito!', 'Pago realizado y suscripción actualizada correctamente.');
            loadData();
          } else {
            Alert.alert('Error', 'El pago se procesó pero hubo un error al actualizar la suscripción.');
          }
        } catch (e) {
          Alert.alert('Error', 'Error de red.');
        } finally {
          setLoading(false);
        }
      }
    } else if (url.includes('stripe/cancel')) {
      Alert.alert('Cancelado', 'El proceso de pago fue cancelado.');
    } else if (url.includes('stripe/setup_success')) {
      Alert.alert('¡Éxito!', 'Método de pago actualizado correctamente.');
      loadData();
    } else if (url.includes('stripe/setup_cancel')) {
      Alert.alert('Cancelado', 'El cambio de método de pago fue cancelado.');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const resPaquetes = await getMembresias();
      let fetchedPackages = [];
      if (resPaquetes && resPaquetes.data) {
        fetchedPackages = resPaquetes.data;
        setPackages(fetchedPackages);
      }

      const resActual = await getSuscripcionActual();
      if (resActual && resActual.suscripcion) {
        setCurrentSub(resActual.suscripcion);
      } else {
        setCurrentSub(null);
        
        // Auto-assign basic plan if no subscription
        if (fetchedPackages.length > 0) {
          const basicPlan = fetchedPackages.find(p => p.precio == 0 || (p.nombre && (p.nombre.toLowerCase().includes('básic') || p.nombre.toLowerCase().includes('basic'))));
          if (basicPlan) {
            const confirm = await confirmarSuscripcion(basicPlan.id);
            if (confirm.success) {
              const resActualNew = await getSuscripcionActual();
              if (resActualNew && resActualNew.suscripcion) {
                setCurrentSub(resActualNew.suscripcion);
              }
              Alert.alert('¡Plan Asignado!', `Se te ha asignado automáticamente el plan ${basicPlan.nombre}.`);
            }
          }
        }
      }

      const resPM = await getPaymentMethod();
      if (resPM && resPM.success && resPM.metodo_pago) {
        setPaymentMethod(resPM.metodo_pago);
      } else {
        setPaymentMethod(null);
      }

      const resHistory = await getPaymentHistory();
      if (resHistory && resHistory.success && resHistory.historial) {
        setPaymentHistory(resHistory.historial);
      } else {
        setPaymentHistory([]);
      }

      // Obtener código de apoyo financiero activo
      try {
        const estadoApoyo = await obtenerEstadoApoyo();
        if (estadoApoyo.success && estadoApoyo.tiene_solicitud && 
            estadoApoyo.estatus === 'aprobada' && estadoApoyo.codigo && !estadoApoyo.codigo.usado) {
          setCodigoApoyoInfo(estadoApoyo.codigo);
        } else {
          setCodigoApoyoInfo(null);
        }
      } catch (e) {
        console.log('Error obteniendo estado de apoyo:', e);
        setCodigoApoyoInfo(null);
      }

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePaymentMethod = async () => {
    try {
      setLoading(true);
      const successUrl = Linking.createURL('stripe/setup_success');
      const cancelUrl = Linking.createURL('stripe/setup_cancel');
      
      const intent = await createSetupIntent(successUrl, cancelUrl);
      if (intent && intent.success && intent.checkout_url) {
        Linking.openURL(intent.checkout_url).catch(err => {
          Alert.alert('Error', 'No se pudo abrir el navegador para actualizar el método de pago.');
          setLoading(false);
        });
        // We do not unset loading here because they leave the app to browser, 
        // it will be reset on focus or handleDeepLink if they return
        setTimeout(() => setLoading(false), 2000); 
      } else {
        Alert.alert('Error', intent?.message || 'No se pudo iniciar la configuración.');
        setLoading(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Ocurrió un problema al procesar.');
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg) => {
    try {
      setLoading(true);
      
      // Use expo-linking to dynamically generate the return URLs. 
      // This ensures it works seamlessly in Expo Go (exp://) and standalone apps (cresimotion://).
      const successUrl = Linking.createURL('stripe/success', { queryParams: { membresia_id: pkg.id.toString() } });
      const cancelUrl = Linking.createURL('stripe/cancel');

      const intent = await createSuscripcionIntent(pkg.id, successUrl, cancelUrl, codigoApoyoInfo?.codigo);
      
      if (!intent.success) {
        Alert.alert('Error', intent.message || 'No se pudo procesar la solicitud');
        setLoading(false);
        return;
      }

      if (intent.skip_stripe || intent.monto === 0) {
        let alertTitle = 'Nueva Suscripción';
        let alertMessage = `Estás eligiendo el paquete ${pkg.nombre} sin costo. ¿Deseas continuar?`;
        
        if (intent.tipo === 'downgrade') {
          alertTitle = 'Cambio de paquete';
          alertMessage = `Estás bajando a ${pkg.nombre}. No hay reembolsos por la diferencia. ¿Deseas continuar?`;
        }

        Alert.alert(
          alertTitle,
          alertMessage,
          [
            {text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false)},
            {text: 'Continuar', onPress: () => handleDirectConfirmation(pkg.id)}
          ]
        );
      } else if (intent.tipo === 'upgrade') {
        Alert.alert(
          'Mejorar paquete',
          `Se te cobrará la diferencia de $${intent.monto} MXN para cambiar a ${pkg.nombre}. ¿Deseas continuar?`,
          [
            {text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false)},
            {text: 'Pagar con Stripe', onPress: () => processPayment(intent.checkout_url)}
          ]
        );
      } else {
        Alert.alert(
          'Nueva Suscripción',
          `El costo es de $${intent.monto} MXN por ${pkg.nombre}. ¿Deseas continuar?`,
          [
            {text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false)},
            {text: 'Pagar con Stripe', onPress: () => processPayment(intent.checkout_url)}
          ]
        );
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Ocurrió un problema al procesar.');
    }
  };

  const handleDirectConfirmation = async (membresia_id) => {
    try {
      const confirm = await confirmarSuscripcion(membresia_id);
      if (confirm.success) {
        Alert.alert('¡Éxito!', 'Suscripción actualizada correctamente.');
        loadData();
      } else {
        Alert.alert('Error', 'Hubo un error al actualizar la suscripción.');
      }
    } catch (e) {
      Alert.alert('Error', 'Error de red.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (checkoutUrl) => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl).catch(err => {
        Alert.alert('Error', 'No se pudo abrir el navegador para el pago.');
        setLoading(false);
      });
    } else {
      Alert.alert('Error', 'URL de checkout no disponible.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentSub) return;
    
    const fechaFin = new Date(currentSub.fecha_fin);
    const hoy = new Date();
    const dif = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    const diasRestantes = dif > 0 ? dif : 0;

    Alert.alert(
      '¿Estás seguro?',
      `Si cancelas, perderás el acceso al terminar tu ciclo actual. Te restan ${diasRestantes} días de tu paquete. ¿Confirmas la cancelación?`,
      [
        {text: 'No', style: 'cancel'},
        {text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
          setLoading(true);
          const res = await cancelarSuscripcion();
          if (res.success) {
            Alert.alert('Cancelada', 'Tu suscripción ha sido cancelada.');
            loadData();
          } else {
            Alert.alert('Error', res.message || 'No se pudo cancelar');
          }
          setLoading(false);
        }}
      ]
    );
  };

  const renderPackage = (pkg) => {
    const isCurrent = currentSub && parseInt(currentSub.membresia_id) === parseInt(pkg.id);
    const hasConcepts = pkg.conceptos && pkg.conceptos.length > 0;
    
    // Verificar si este paquete tiene descuento de apoyo financiero
    const tieneDescuentoApoyo = codigoApoyoInfo && codigoApoyoInfo.membresia && 
      parseInt(codigoApoyoInfo.membresia.id) === parseInt(pkg.id);
    
    const precioBase = parseFloat(pkg.precio);
    const descuento = tieneDescuentoApoyo ? codigoApoyoInfo.porcentaje_descuento : 0;
    const precioFinal = tieneDescuentoApoyo 
      ? (precioBase * (1 - descuento / 100)).toFixed(2) 
      : precioBase;
    
    return (
      <View key={pkg.id} style={[localStyles.packageCard, {backgroundColor: colors.secondary, borderColor: isCurrent ? colors.primary : 'transparent', borderWidth: isCurrent ? 3 : 2}]}>
        {isCurrent && (
          <View style={[localStyles.currentBadge, {backgroundColor: colors.primary}]}>
            <CText type={"B12"} color={colors.white}>TU PLAN ACTUAL</CText>
          </View>
        )}

        {/* Badge de Apoyo Financiero */}
        {tieneDescuentoApoyo && (
          <View style={[localStyles.apoyoBadge, {backgroundColor: colors.primary, alignSelf: 'flex-start', marginTop: 4}]}>
            <CText type={"B10"} color={colors.white}>🎉 APOYO FINANCIERO -{descuento}%</CText>
          </View>
        )}
        
        {/* Encabezado: Título y Precio */}
        <View style={localStyles.cardHeader}>
          <View style={styles.flex}>
            <CText type={"B22"} color={colors.textColor}>{pkg.nombre}</CText>
          </View>
          <View style={localStyles.priceBox}>
            {tieneDescuentoApoyo ? (
              <View style={{alignItems: 'flex-end'}}>
                <CText type={"B14"} style={{textDecorationLine: 'line-through', color: colors.grayScale3}}>${precioBase}</CText>
                <CText type={"B24"} color={colors.primary}>${precioFinal}</CText>
                <CText type={"M12"} color={colors.primary}>/mes</CText>
              </View>
            ) : (
              <>
                <CText type={"B24"} color={colors.primary}>${parseInt(pkg.precio)}</CText>
                <CText type={"M14"} color={colors.grayScale3}>/mes</CText>
              </>
            )}
          </View>
        </View>

        {/* Info del descuento de apoyo financiero */}
        {tieneDescuentoApoyo && (
          <View style={[localStyles.apoyoInfoBox, {backgroundColor: colors.primary + '15', borderColor: colors.primary}]}>
            <CText type={"M12"} color={colors.primary}>
              Código: <CText type={"B12"} color={colors.primary}>{codigoApoyoInfo.codigo}</CText>
              {codigoApoyoInfo.fecha_expiracion && (
                <> • Vence: {new Date(codigoApoyoInfo.fecha_expiracion + 'T00:00:00').toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})}</>
              )}
            </CText>
          </View>
        )}

        {/* Separador */}
        <View style={[localStyles.divider, {backgroundColor: colors.dark ? colors.dividerColor : colors.grayScale2}]} />

        {/* Contenido: Conceptos o Descripción */}
        <View style={localStyles.featuresContainer}>
          {hasConcepts ? (
            pkg.conceptos.map((c, i) => (
              <View key={i} style={localStyles.featureItem}>
                <CText type={"B16"} color={colors.primary}>✓ </CText>
                <CText type={"M14"} color={colors.grayScale3} style={styles.flex}>
                  <CText type={"B14"} color={colors.textColor}>{c.cantidad > 1 ? `${c.cantidad}x ` : ''}</CText>
                  {c.nombre}
                </CText>
              </View>
            ))
          ) : (
            <CText type={"M14"} color={colors.grayScale3} style={localStyles.descriptionText}>{pkg.descripcion}</CText>
          )}
        </View>

        {/* Pie: Botón o Estado */}
        <View style={localStyles.cardFooter}>
          {isCurrent ? (
            <View style={[localStyles.activeBadgeFull, {backgroundColor: colors.primary}]}>
              <CText type={"B16"} color={colors.white}>Plan Actual</CText>
            </View>
          ) : (
            <CButton
              title={tieneDescuentoApoyo ? `Elegir con ${descuento}% dto.` : "Elegir este plan"}
              onPress={() => handleSelectPackage(pkg)}
              containerStyle={localStyles.btnSelectFull}
              bgColor={colors.primary}
            />
          )}
        </View>

      </View>
    );
  };

  return (
    <CSafeAreaView>
      <CHeader title={"Suscripción"} />
      <ScrollView contentContainerStyle={styles.p20} showsVerticalScrollIndicator={false}>
        {loading && packages.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.mt20} />
        ) : (
          <>
            <CText type={"B20"} color={colors.textColor} style={styles.mb20}>Elige tu paquete</CText>
            
            {[...packages].sort((a, b) => {
              if (!currentSub) return 0;
              const aIsCurrent = parseInt(currentSub.membresia_id) === parseInt(a.id);
              const bIsCurrent = parseInt(currentSub.membresia_id) === parseInt(b.id);
              if (aIsCurrent) return -1;
              if (bIsCurrent) return 1;
              return 0;
            }).map(renderPackage)}

            {/* Promociones / Payment Info */}
            {currentSub && (
              <View style={localStyles.infoSection}>
                <View style={localStyles.sectionBlock}>
                  <CText type={"B18"} color={colors.textColor} style={styles.mb10}>Método de pago</CText>
                  {paymentMethod ? (
                    <View style={localStyles.paymentDetails}>
                      <CText type={"B14"} color={colors.textColor}>
                        Tarjeta registrada: <CText type={"M14"} color={colors.grayScale3}>**** {paymentMethod.last4}</CText>
                      </CText>
                      <CText type={"B14"} color={colors.textColor}>
                        Vencimiento: <CText type={"M14"} color={colors.grayScale3}>{String(paymentMethod.exp_month).padStart(2, '0')}/{String(paymentMethod.exp_year).slice(-2)}</CText>
                      </CText>
                      <TouchableOpacity onPress={handleChangePaymentMethod} style={styles.mt10}>
                        <CText type={"M14"} color={colors.primary}>✏️ Cambiar método de pago</CText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <CText type={"M14"} color={colors.grayScale3}>No hay tarjeta registrada.</CText>
                  )}
                </View>

                <View style={localStyles.sectionBlock}>
                  <CText type={"B18"} color={colors.textColor} style={styles.mb10}>Historial de pagos</CText>
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((item, index) => (
                      <View key={index} style={localStyles.historyItem}>
                        <CText type={"M14"} color={colors.textColor}>
                          • {item.fecha} — ${parseFloat(item.monto).toFixed(2)} {item.moneda} — {item.estado}
                        </CText>
                        {item.descuento_aplicado && (
                          <CText type={"M12"} color={colors.primary} style={styles.mt5}>
                            🎉 Cupón aplicado: {item.descuento_aplicado}
                            {item.porcentaje_descuento && ` (${item.porcentaje_descuento}% desc.)`}
                          </CText>
                        )}
                        {item.receipt_url && (
                          <TouchableOpacity onPress={() => Linking.openURL(item.receipt_url)} style={styles.mt5}>
                            <CText type={"M14"} color={colors.primary}>🔍 Ver más detalles</CText>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  ) : (
                    <CText type={"M14"} color={colors.grayScale3}>No hay historial de pagos disponible.</CText>
                  )}
                </View>

                <TouchableOpacity style={localStyles.cancelBtn} onPress={handleCancel} disabled={loading}>
                  <CText type={"B16"} color={colors.redAlert} align="center">
                    Cancelar Suscripción
                  </CText>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  currentBadge: {
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(15),
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  packageCard: {
    ...styles.p20,
    ...styles.mb20,
    borderRadius: moderateScale(20),
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardHeader: {
    ...styles.flexRow,
    ...styles.justifyBetween,
    ...styles.itemsCenter,
    ...styles.mb15,
  },
  priceBox: {
    ...styles.itemsEnd,
  },
  divider: {
    height: 1,
    width: '100%',
    ...styles.mb15,
    opacity: 0.5,
  },
  featuresContainer: {
    ...styles.mb20,
  },
  featureItem: {
    ...styles.flexRow,
    ...styles.itemsStart,
    ...styles.mb10,
    paddingRight: moderateScale(15),
  },
  descriptionText: {
    lineHeight: moderateScale(22),
  },
  cardFooter: {
    ...styles.center,
  },
  btnSelectFull: {
    width: '100%',
    height: moderateScale(45),
    borderRadius: moderateScale(25),
  },
  activeBadgeFull: {
    width: '100%',
    height: moderateScale(45),
    borderRadius: moderateScale(25),
    ...styles.center,
  },
  infoSection: {
    ...styles.mt10,
    ...styles.p10,
    ...styles.mb20,
  },
  sectionBlock: {
    ...styles.mb20,
    padding: moderateScale(15),
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: moderateScale(15),
  },
  paymentDetails: {
    paddingLeft: moderateScale(10),
  },
  historyItem: {
    ...styles.mb15,
    paddingLeft: moderateScale(10),
  },
  cancelBtn: {
    ...styles.mt10,
    ...styles.p15,
    ...styles.mb30,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#F75555',
  },
  couponBadgeCard: {
    borderRadius: moderateScale(16),
    borderWidth: 2,
    marginBottom: moderateScale(15),
    overflow: 'hidden',
  },
  couponBadgeHeader: {
    backgroundColor: '#0aa693',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
  },
  couponBadgeContent: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(12),
  },
  couponPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(8),
    flexWrap: 'wrap',
  },
  discountBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(12),
    marginLeft: moderateScale(8),
  },
  apoyoBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(10),
    marginRight: moderateScale(8),
  },
  apoyoInfoBox: {
    marginTop: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  promoItem: {
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: moderateScale(10),
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  promoBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(10),
  },
  promoPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
