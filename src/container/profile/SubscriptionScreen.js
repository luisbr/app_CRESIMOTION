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

// Importar badges de planes
import BadgeBasico from '../../assets/images/badges/CM_Badge__Basico_icn.svg';
import BadgePlata from '../../assets/images/badges/CM_Badge__Plata_icn.svg';
import BadgeOro from '../../assets/images/badges/CM_Badge__Oro_icn.svg';
import ConfirmCancelModal from '../../components/model/ConfirmCancelModal';
import SuccessPopup from '../../components/model/SuccessPopup';
import ErrorPopup from '../../components/model/ErrorPopup';
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

const PLAN_FEATURES = {
  1: [ // Básico
    { pre: "1 sanación emocional", checked: true },
    { pre: "1 enfoque positivo", checked: true },
    { pre: "1 recomendación para sanar", checked: true },
    { pre: "1 ejercicio automatizado", checked: true },
    { pre: "Soporte por ", bold: "email", checked: true },
    { pre: "Soporte por chat", checked: false, strikethrough: true },
    { pre: "Beneficios adicionales", checked: false, strikethrough: true },
  ],
  2: [ // Plata
    { pre: "Beneficios mensuales:", title: true },
    { pre: "4 sanaciones emocionales", checked: true },
    { pre: "2 enfoques positivos", checked: true },
    { pre: "3 recomendaciones", checked: true },
    { pre: "4 ejercicios automatizados", checked: true },
    { bold: "Soporte por chat", checked: true },
    { pre: "Beneficios adicionales", checked: false, strikethrough: true },
  ],
  3: [ // Oro
    { pre: "Beneficios mensuales:", title: true },
    { pre: "8 sanaciones emocionales", checked: true },
    { pre: "4 enfoques positivos", checked: true },
    { pre: "10 recomendaciones", checked: true },
    { pre: "10 ejercicios automatizados", checked: true },
    { bold: "Soporte por chat", checked: true },
    { pre: "Beneficios adicionales: contenidos exclusivos, recompensas", checked: false, strikethrough: true },
  ],
  4: [ // Platinum
    { pre: "Beneficios mensuales:", title: true },
    { pre: "sanaciones emocionales ", bold: "ilimitadas", checked: true },
    { pre: "enfoques positivos ", bold: "ilimitados", checked: true },
    { pre: "recomendaciones ", bold: "ilimitadas", checked: true },
    { pre: "ejercicios automatizados ", bold: "ilimitados", checked: true },
    { bold: "Soporte telefónico", checked: true },
    { bold: "Beneficios adicionales: contenidos exclusivos, recompensas", checked: false },
  ]
};

export default function SubscriptionScreen({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [packages, setPackages] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [codigoApoyoInfo, setCodigoApoyoInfo] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalConfig, setActionModalConfig] = useState(null);
  const [isAnnualPlan, setIsAnnualPlan] = useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState('');

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
      const is_annual_from_url = queryParams?.is_annual === 'true';
      
      if (membresia_id) {
        try {
          setLoading(true);
          const confirm = await confirmarSuscripcion(membresia_id, session_id, is_annual_from_url);
          if (confirm.success) {
            setSuccessPopupMessage('Pago realizado y suscripción actualizada correctamente.');
            setSuccessPopupVisible(true);
            setIsAnnualPlan(is_annual_from_url); // Sincronizar el toggle visual
            loadData();
          } else {
            setErrorPopupMessage('El pago se procesó pero hubo un error al actualizar la suscripción.');
            setErrorPopupVisible(true);
          }
        } catch (e) {
          setErrorPopupMessage('Error de red.');
          setErrorPopupVisible(true);
        } finally {
            setLoading(false);
          }
      }
    } else if (url.includes('stripe/cancel')) {
      Alert.alert('Cancelado', 'El proceso de pago fue cancelado.');
    } else if (url.includes('stripe/setup_success')) {
      setSuccessPopupMessage('Método de pago actualizado correctamente.');
      setSuccessPopupVisible(true);
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
              setSuccessPopupMessage(`Se te ha asignado automáticamente el plan ${basicPlan.nombre}.`);
              setSuccessPopupVisible(true);
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
          setErrorPopupMessage('No se pudo abrir el navegador para actualizar el método de pago.');
          setErrorPopupVisible(true);
          setLoading(false);
        });
        // We do not unset loading here because they leave the app to browser, 
        // it will be reset on focus or handleDeepLink if they return
        setTimeout(() => setLoading(false), 2000); 
      } else {
        setErrorPopupMessage(intent?.message || 'No se pudo iniciar la configuración.');
        setErrorPopupVisible(true);
        setLoading(false);
      }
    } catch (e) {
      setErrorPopupMessage('Ocurrió un problema al procesar.');
      setErrorPopupVisible(true);
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg) => {
    try {
      setLoading(true);
      
      // Use expo-linking to dynamically generate the return URLs. 
      // This ensures it works seamlessly in Expo Go (exp://) and standalone apps (cresimotion://).
      const successUrl = Linking.createURL('stripe/success', { queryParams: { membresia_id: pkg.id.toString(), is_annual: isAnnualPlan ? 'true' : 'false' } });
      const cancelUrl = Linking.createURL('stripe/cancel');

      const intent = await createSuscripcionIntent(pkg.id, successUrl, cancelUrl, codigoApoyoInfo?.codigo, isAnnualPlan);
      
      if (!intent.success) {
        setErrorPopupMessage(intent.message || 'No se pudo procesar la solicitud');
        setErrorPopupVisible(true);
        setLoading(false);
        return;
      }

      if (intent.skip_stripe || intent.monto === 0) {
        let alertTitle = 'Nueva Suscripción';
        let alertMessage = `Estás eligiendo el paquete ${pkg.nombre} sin costo. ¿Deseas continuar?`;
        let confirmText = 'Continuar';
        let iconName = 'checkmark-circle';
        let iconColor = colors.primary;
        
        if (intent.tipo === 'downgrade') {
          alertTitle = 'Cambio de paquete';
          alertMessage = `Estás bajando a ${pkg.nombre}. No hay reembolsos por la diferencia. ¿Deseas continuar?`;
          iconName = 'warning';
          iconColor = colors.redAlert;
        }

        setActionModalConfig({
          title: alertTitle,
          message: alertMessage,
          confirmText: confirmText,
          cancelText: 'Cancelar',
          confirmColor: colors.primary,
          iconName: iconName,
          iconColor: iconColor,
          onConfirm: () => {
            setActionModalVisible(false);
            handleDirectConfirmation(pkg.id);
          },
          onCancel: () => {
            setActionModalVisible(false);
            setLoading(false);
          }
        });
        setActionModalVisible(true);
      } else if (intent.tipo === 'upgrade') {
        setActionModalConfig({
          title: 'Mejorar paquete',
          message: `Se te cobrará la diferencia de $${intent.monto} MXN para cambiar a ${pkg.nombre}. ¿Deseas continuar?`,
          confirmText: 'Pagar con Stripe',
          cancelText: 'Cancelar',
          confirmColor: colors.primary,
          iconName: 'arrow-up-circle',
          iconColor: colors.primary,
          onConfirm: () => {
            setActionModalVisible(false);
            processPayment(intent.checkout_url);
          },
          onCancel: () => {
            setActionModalVisible(false);
            setLoading(false);
          }
        });
        setActionModalVisible(true);
      } else {
        setActionModalConfig({
          title: 'Nueva Suscripción',
          message: `El costo es de $${intent.monto} MXN por ${pkg.nombre}. ¿Deseas continuar?`,
          confirmText: 'Pagar con Stripe',
          cancelText: 'Cancelar',
          confirmColor: colors.primary,
          iconName: 'card',
          iconColor: colors.primary,
          onConfirm: () => {
            setActionModalVisible(false);
            processPayment(intent.checkout_url);
          },
          onCancel: () => {
            setActionModalVisible(false);
            setLoading(false);
          }
        });
        setActionModalVisible(true);
      }
    } catch (e) {
      setErrorPopupMessage('Ocurrió un problema al procesar.');
      setErrorPopupVisible(true);
      setLoading(false);
    }
  };

  const handleDirectConfirmation = async (membresia_id) => {
    try {
      const confirm = await confirmarSuscripcion(membresia_id, null, isAnnualPlan);
      if (confirm.success) {
        setSuccessPopupMessage('Suscripción actualizada correctamente.');
        setSuccessPopupVisible(true);
        loadData();
      } else {
        setErrorPopupMessage('Hubo un error al actualizar la suscripción.');
        setErrorPopupVisible(true);
      }
    } catch (e) {
      setErrorPopupMessage('Error de red.');
      setErrorPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (checkoutUrl) => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl).catch(err => {
        setErrorPopupMessage('No se pudo abrir el navegador para el pago.');
        setErrorPopupVisible(true);
        setLoading(false);
      });
    } else {
      setErrorPopupMessage('URL de checkout no disponible.');
      setErrorPopupVisible(true);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentSub) return;

    const currentPkg = packages.find(p => parseInt(p.id) === parseInt(currentSub.membresia_id));
    const isBasic = currentPkg && (parseFloat(currentPkg.precio) === 0 ||
      (currentPkg.nombre && currentPkg.nombre.toLowerCase().includes('básic')));

    if (isBasic) {
      setCancelMessage('Si cancelas, perderás el acceso a tu plan actual. ¿Confirmas la cancelación?');
    } else {
      const fechaFin = new Date(currentSub.fecha_fin);
      const hoy = new Date();
      const dif = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
      const diasRestantes = dif > 0 ? dif : 0;
      setCancelMessage(`Si cancelas, perderás el acceso al terminar tu ciclo actual. Te restan ${diasRestantes} días de tu paquete. ¿Confirmas la cancelación?`);
    }
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    setCancelModalVisible(false);
    setLoading(true);
    const res = await cancelarSuscripcion();
    if (res.success) {
      setSuccessPopupMessage('Tu suscripción ha sido cancelada.');
      setSuccessPopupVisible(true);
      loadData();
    } else {
      setErrorPopupMessage(res.message || 'No se pudo cancelar');
      setErrorPopupVisible(true);
    }
    setLoading(false);
  };

  // Función para obtener el badge correspondiente al plan
  const getPlanBadge = (nombrePlan) => {
    if (!nombrePlan) return null;
    const nombre = nombrePlan.toLowerCase();
    if (nombre.includes('básic') || nombre.includes('basic')) {
      return BadgeBasico;
    } else if (nombre.includes('plata') || nombre.includes('silver')) {
      return BadgePlata;
    } else if (nombre.includes('oro') || nombre.includes('gold')) {
      return BadgeOro;
    }
    return null;
  };

  const renderPackage = (pkg) => {
    // Verificar si es el plan actual, considerando mensual vs anual
    const isCurrent = currentSub &&
                      parseInt(currentSub.membresia_id) === parseInt(pkg.id) &&
                      (currentSub.is_annual === isAnnualPlan);
    const hasConcepts = pkg.conceptos && pkg.conceptos.length > 0;
    
    // Obtener el badge del plan
    const PlanBadge = getPlanBadge(pkg.nombre);

    const isAnnual = pkg.duracion_meses === 10;
    
    // Verificar si este paquete tiene descuento de apoyo financiero
    // Solo se aplica para planes mensuales (no anuales)
    const tieneDescuentoApoyo = !isAnnualPlan && codigoApoyoInfo && codigoApoyoInfo.membresia &&
      parseInt(codigoApoyoInfo.membresia.id) === parseInt(pkg.id);

    const precioBase = isAnnualPlan ? parseFloat(pkg.precio) * 10 : parseFloat(pkg.precio);
    const descuento = tieneDescuentoApoyo ? codigoApoyoInfo.porcentaje_descuento : 0;
    const precioFinal = tieneDescuentoApoyo 
      ? (precioBase * (1 - descuento / 100)).toFixed(2) 
      : precioBase;

    let subtitulo = "";
    if (pkg.nombre.toLowerCase().includes('básic') || pkg.nombre.toLowerCase().includes('basic')) {
      subtitulo = "Ideal para empezar";
    } else if (pkg.nombre.toLowerCase().includes('plata') || pkg.nombre.toLowerCase().includes('silver')) {
      subtitulo = "Expande tus recursos";
    } else if (pkg.nombre.toLowerCase().includes('oro') || pkg.nombre.toLowerCase().includes('gold')) {
      subtitulo = "Eleva tu experiencia";
    } else if (pkg.nombre.toLowerCase().includes('platinum')) {
      subtitulo = "Crece mientras guías";
    }
    
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
        
        {/* Encabezado: Badge, Título y Precio */}
        <View style={localStyles.cardHeader}>
          <View style={[styles.flex, styles.flexRow, styles.itemsCenter]}>
            {PlanBadge && <PlanBadge width={moderateScale(28)} height={moderateScale(28)} style={{marginRight: moderateScale(8)}} />}
            <View>
              <CText type={"B22"} color={colors.textColor}>{pkg.nombre}</CText>
              {subtitulo ? <CText type={"M12"} color={colors.grayScale3}>{subtitulo}</CText> : null}
            </View>
          </View>
          <View style={localStyles.priceBox}>
            {tieneDescuentoApoyo ? (
              <View style={{alignItems: 'flex-end'}}>
                <CText type={"B14"} style={{textDecorationLine: 'line-through', color: colors.grayScale3}}>${precioBase}</CText>
                <CText type={"B24"} color={colors.primary}>${precioFinal}</CText>
                <CText type={"M12"} color={colors.primary}>{isAnnualPlan ? '/año' : '/mes'}</CText>
              </View>
            ) : (
              <View style={{alignItems: 'flex-end'}}>
                {isAnnualPlan && (
                  <CText type={"B14"} style={{textDecorationLine: 'line-through', color: colors.grayScale3}}>
                    ${parseFloat(pkg.precio) * 12}
                  </CText>
                )}
                <CText type={"B24"} color={colors.primary}>${precioBase}</CText>
                <CText type={"M14"} color={colors.grayScale3}>{isAnnualPlan ? '/año' : '/mes'}</CText>
              </View>
            )}
          </View>
        </View>

        {/* Info del descuento de 1er mes y anual*/}
        <View style={[localStyles.apoyoInfoBox, {backgroundColor: colors.primary + '15', borderColor: colors.primary, marginBottom: 15}]}>
          {isAnnualPlan ? (
            <CText type={"M12"} color={colors.primary} align="center">
              <CText type={"B12"} color={colors.primary}>2 meses gratis.</CText> Paga 10 meses en lugar de 12 (Ahorras ${parseFloat(pkg.precio) * 2})
            </CText>
          ) : (
            <CText type={"M12"} color={colors.primary} align="center">
              🎉 <CText type={"B12"} color={colors.primary}>50% de descuento</CText> en tu primer mes
            </CText>
          )}
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
          {PLAN_FEATURES[pkg.id] ? (
            PLAN_FEATURES[pkg.id].map((f, i) => (
              <View key={i} style={localStyles.featureItem}>
                {!f.title && f.checked && (
                  <CText type={"B16"} color={colors.textColor} style={{marginRight: 4}}>
                    √
                  </CText>
                )}
                <CText 
                  type={f.title ? "M16" : "M16"} 
                  color={colors.textColor} 
                  style={[
                    styles.flex, 
                    f.strikethrough && {textDecorationLine: 'line-through'}
                  ]}
                >
                  {f.pre && <CText type={f.title ? "M16" : "M16"} style={f.strikethrough ? {textDecorationLine: 'line-through'} : undefined}>{f.pre}</CText>}
                  {f.bold && <CText type={"B16"} style={f.strikethrough ? {textDecorationLine: 'line-through'} : undefined}>{f.bold}</CText>}
                </CText>
              </View>
            ))
          ) : hasConcepts ? (
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
              <CText type={"B16"} color={colors.white}>Plan actual</CText>
            </View>
          ) : (
            <CButton
              title={tieneDescuentoApoyo ? `Elegir con ${descuento}% de descuento.` : "Elegir este plan"}
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
      <CHeader title={"Membresía"} />
      <ScrollView contentContainerStyle={styles.p20} showsVerticalScrollIndicator={true}>
        {loading && packages.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.mt20} />
        ) : (
          <>
            <CText type={"B20"} color={colors.textColor} style={styles.mb20}>Elige tu paquete</CText>

            {/* Toggle Mensual/Anual */}
            <View style={[localStyles.toggleContainer, {backgroundColor: colors.dark ? colors.inputBg : colors.grayScale2}]}>
              <TouchableOpacity
                style={[localStyles.toggleBtn, !isAnnualPlan && [localStyles.toggleBtnActive, {backgroundColor: colors.primary}]]}
                onPress={() => setIsAnnualPlan(false)}
              >
                <CText type={"B14"} color={!isAnnualPlan ? colors.white : colors.grayScale3}>Mensual</CText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.toggleBtn, isAnnualPlan && [localStyles.toggleBtnActive, {backgroundColor: colors.primary}]]}
                onPress={() => setIsAnnualPlan(true)}
              >
                <CText type={"B14"} color={isAnnualPlan ? colors.white : colors.grayScale3}>Anual</CText>
              </TouchableOpacity>
            </View>
            
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
                    Cancelar suscripción
                  </CText>
                </TouchableOpacity>

                <View style={localStyles.noteContainer}>
                  <CText type={"M12"} color={colors.grayScale3} align="center">
                    Nota: Todos los planes cuentan con renovación automática {isAnnualPlan ? 'anual' : 'mensual'}.
                  </CText>
                </View>
              </View>
            )}
          </>
)}
          </ScrollView>

          <ConfirmCancelModal
            visible={cancelModalVisible}
            title="¿Deseas cancelar?"
            message={cancelMessage}
            onCancel={() => setCancelModalVisible(false)}
            onConfirm={handleConfirmCancel}
          />
          
          <ConfirmCancelModal
            visible={actionModalVisible}
            title={actionModalConfig?.title}
            message={actionModalConfig?.message}
            confirmText={actionModalConfig?.confirmText}
            cancelText={actionModalConfig?.cancelText}
            confirmColor={actionModalConfig?.confirmColor}
            iconName={actionModalConfig?.iconName}
            iconColor={actionModalConfig?.iconColor}
            onCancel={actionModalConfig?.onCancel}
            onConfirm={actionModalConfig?.onConfirm}
          />

          <SuccessPopup
            visible={successPopupVisible}
            title="¡Éxito!"
            desc={successPopupMessage}
            onClose={() => setSuccessPopupVisible(false)}
          />

          <ErrorPopup
            visible={errorPopupVisible}
            title="Error"
            message={errorPopupMessage}
            onClose={() => setErrorPopupVisible(false)}
          />
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
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: moderateScale(25),
    padding: moderateScale(4),
    marginBottom: moderateScale(20),
    alignSelf: 'center',
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: moderateScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noteContainer: {
    marginTop: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  }
});
