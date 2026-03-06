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
  cancelarSuscripcion
} from '../../api/auth';

export default function SubscriptionScreen({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [packages, setPackages] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);

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
      
      if (membresia_id) {
        try {
          setLoading(true);
          const confirm = await confirmarSuscripcion(membresia_id);
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
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const resPaquetes = await getMembresias();
      if (resPaquetes && resPaquetes.data) {
        setPackages(resPaquetes.data);
      }

      const resActual = await getSuscripcionActual();
      if (resActual && resActual.suscripcion) {
        setCurrentSub(resActual.suscripcion);
      } else {
        setCurrentSub(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
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

      const intent = await createSuscripcionIntent(pkg.id, successUrl, cancelUrl);
      
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
          `Se te cobrará la diferencia de $${intent.monto} USD para cambiar a ${pkg.nombre}. ¿Deseas continuar?`,
          [
            {text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false)},
            {text: 'Pagar con Stripe', onPress: () => processPayment(intent.checkout_url)}
          ]
        );
      } else {
        Alert.alert(
          'Nueva Suscripción',
          `El costo es de $${intent.monto} USD por ${pkg.nombre}. ¿Deseas continuar?`,
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
    
    return (
      <View key={pkg.id} style={[localStyles.packageCard, {backgroundColor: colors.secondary, borderColor: isCurrent ? colors.primary : 'transparent'}]}>
        
        {/* Encabezado: Título y Precio */}
        <View style={localStyles.cardHeader}>
          <CText type={"B22"} color={colors.textColor}>{pkg.nombre}</CText>
          <View style={localStyles.priceBox}>
            <CText type={"B24"} color={colors.primary}>${parseInt(pkg.precio)}</CText>
            <CText type={"M14"} color={colors.grayScale3}>/mes</CText>
          </View>
        </View>

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
              title="Elegir este plan"
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
            
            {packages.map(renderPackage)}

            {currentSub && (
              <TouchableOpacity style={localStyles.cancelBtn} onPress={handleCancel} disabled={loading}>
                <CText type={"B16"} color={colors.redAlert} align="center">
                  Cancelar Suscripción
                </CText>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
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
  cancelBtn: {
    ...styles.mt20,
    ...styles.p15,
    ...styles.mb30,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#F75555',
  }
});
