import {SectionList, StyleSheet, View, TouchableOpacity, Alert, Modal, ScrollView} from 'react-native';
import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import CDivider from '../../components/common/CDivider';
import {getStoredNotifications, saveStoredNotifications} from '../../utils/notificationStorage';
import {getPendingTherapySessions, continuePendingTherapy, getSessionDetails, getResumenMensual} from '../../api/sesionTerapeutica';
import {getSuscripcionActual, getMembresias} from '../../api/auth';
import SuccessPopup from '../../components/model/SuccessPopup';

const DATE_FILTERS = [
  {key: 'day', label: 'Día'},
  {key: 'month', label: 'Mes'},
  {key: 'year', label: 'Año'},
];

const formatDateKey = (dateStr, filter) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fullMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const month = months[date.getMonth()];
  const fullMonth = fullMonths[date.getMonth()];
  const year = date.getFullYear();

  switch (filter) {
    case 'day':
      return `${day} ${month} ${year}`;
    case 'month':
      return `${fullMonth} ${year}`;
    case 'year':
      return `${year}`;
    default:
      return `${day} ${month} ${year}`;
  }
};

const groupByDate = (notifications, filter) => {
  const groups = {};
  notifications.forEach(n => {
    const key = formatDateKey(n.createdAt || n.date || Date.now(), filter);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return Object.entries(groups).map(([title, items]) => ({title, data: items}));
};

export default function Notification() {
  const colors = useSelector(state => state.theme.theme);
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('day');
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Modal deshabilitado en favor de la expansión
  // const [modalVisible, setModalVisible] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const local = await getStoredNotifications();
    setNotifications(local);

    try {
      const json = await getPendingTherapySessions();
      if (json && json.ok !== false) {
        const items = json.items || json.data || [];
        const sessionItems = [];

        // Fetch details for each pending session to get the motive
        for (const group of items) {
          if (group.items && Array.isArray(group.items)) {
            const sourceSessionId = group.source_session_id;
            
            // Get pending emotion from the pendientes list
            const emocionItem = group.items.find(i => i.tipo === 'emocion');
            const emocionLabel = emocionItem?.label || '';
            
            // Fetch session details to get the motive (may already be completed)
            let motivoLabel = '';
            try {
              const sessionDetails = await getSessionDetails(sourceSessionId);
              motivoLabel = sessionDetails?.motivo || '';
            } catch (err) {
              console.log('Error fetching session details:', err);
            }
            
            // Format as "Motivo/Emocion"
            const displayLabel = motivoLabel && emocionLabel 
              ? `${motivoLabel}/${emocionLabel}`
              : (motivoLabel || emocionLabel || 'Sesión pendiente');
            
            sessionItems.push({
              sesion_id: sourceSessionId,
              id: sourceSessionId,
              label: displayLabel,
              motivo: motivoLabel,
              emocion: emocionLabel,
            });
          }
        }
        setPendientes(sessionItems);
      }
    } catch (e) {
      console.log('Error fetching pendientes:', e);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleStatus = async (id, field) => {
    const updated = notifications.map(n => n.localId === id ? {...n, [field]: !n[field]} : n);
    setNotifications(updated);
    await saveStoredNotifications(updated);
  };

  const checkTherapyLimit = async () => {
    try {
      const resumen = await getResumenMensual();
      const sesionesUsadas = resumen?.sesiones_realizadas?.count ?? 0;
      const suscripcionId = resumen?.period?.suscripcion_id;
      const membresiaId = resumen?.period?.membresia_id;

      let limite = 0;

      if (suscripcionId) {
        const suscripcion = await getSuscripcionActual();
        const conceptos = suscripcion?.conceptos ?? [];
        const emotionConcept = conceptos.find(c => c.concepto_id === 1);
        limite = emotionConcept?.cantidad_asignada ?? 0;

        if (limite === 0 && membresiaId) {
          const membresias = await getMembresias();
          const membresia = membresias?.data?.find(m => String(m.id) === String(membresiaId));
          const conceptoPlan = membresia?.conceptos?.find(c => String(c.conceptos_id) === '1');
          limite = parseInt(conceptoPlan?.cantidad ?? 0, 10);
        }
      }

      if (sesionesUsadas >= limite && limite > 0) {
        Alert.alert(
          'Límite alcanzado',
          `Has alcanzado el límite de sesiones de tu plan actual (${sesionesUsadas} de ${limite}). Mejora tu plan para desbloquear más sesiones terapéuticas.`
        );
        return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  };

  const addMockNotificationsSet = async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const mockSet = [
      {
        localId: `mock_new_${now}_1`,
        mensaje: 'Haz una pausa activa (Nueva)',
        isNew: true,
        isRead: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now,
      },
      {
        localId: `mock_new_${now}_2`,
        mensaje: 'Recuerda llamar a un familiar (Nueva)',
        isNew: true,
        isRead: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now,
      },
      {
        localId: `mock_unread_${now}_1`,
        mensaje: 'Haz ejercicio (Sin leer)',
        isNew: false,
        isRead: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now - oneDay,
      },
      {
        localId: `mock_fav_${now}_1`,
        mensaje: 'Recuerda poner límites (Favorito)',
        isNew: false,
        isRead: true,
        isFavorite: true,
        isArchived: false,
        isDeleted: false,
        createdAt: now - (2 * oneDay),
      },
      {
        localId: `mock_promo_${now}_1`,
        mensaje: 'Aprovecha la promoción ofertas exclusivas',
        tipo: 'promocion',
        isNew: true,
        isRead: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now,
      },
      {
        localId: `mock_sesion_${now}_1`,
        mensaje: 'Separación de pareja/Tristeza (Notificación Push)',
        tipo: 'sesion_pendiente',
        data: { sesion_id: 12345 },
        isNew: true,
        isRead: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now,
      },
      {
        localId: `mock_historial_${now}_1`,
        mensaje: 'Mensaje antiguo para el historial',
        isNew: false,
        isRead: true,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: now - (40 * oneDay),
      }
    ];

    const updated = [...mockSet, ...notifications];
    setNotifications(updated);
    await saveStoredNotifications(updated);
    setSuccessPopupMessage('Set de notificaciones de prueba agregado');
    setSuccessPopupVisible(true);
  };

  const historialNotifications = useMemo(() => {
    const filtered = notifications.filter(n => !n.isDeleted && !n.isArchived);
    return groupByDate(filtered, dateFilter);
  }, [notifications, dateFilter]);

  const sections = useMemo(() => {
    const result = [];
    const news = notifications.filter(n => n.isNew && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion' && n.tipo !== 'sesion_pendiente');
    result.push({title: `Nuevos mensajes (${news.length})`, data: news.length > 0 ? news : [{localId: 'empty_news', empty: true, tipo: 'new', mensaje: 'No hay nuevos mensajes'}]});

    const unread = notifications.filter(n => !n.isNew && !n.isRead && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion' && n.tipo !== 'sesion_pendiente' && !n.isFavorite);
    result.push({title: `Mensajes sin leer (${unread.length})`, data: unread.length > 0 ? unread : [{localId: 'empty_unread', empty: true, tipo: 'unread', mensaje: 'No hay mensajes sin leer'}]});

    const favorites = notifications.filter(n => n.isFavorite && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion' && n.tipo !== 'sesion_pendiente');
    result.push({title: `Favoritos (${favorites.length})`, data: favorites.length > 0 ? favorites : [{localId: 'empty_fav', empty: true, tipo: 'fav', mensaje: 'No hay favoritos'}]});

    const promos = notifications.filter(n => n.tipo === 'promocion' && !n.isDeleted && !n.isArchived);
    result.push({title: `Promociones y ofertas (${promos.length})`, data: promos.length > 0 ? promos : [{localId: 'empty_promo', empty: true, tipo: 'promocion', mensaje: 'No hay promociones'}]});

    const pendientesPush = notifications.filter(n => n.tipo === 'sesion_pendiente' && !n.isDeleted && !n.isArchived);
    const pendientesCombinadas = [
      ...pendientes.map(p => ({
        isPendienteApi: true, 
        titulo: p.label || 'Sesión pendiente', 
        id: p.sesion_id, 
        sesion_id: p.sesion_id,
        localId: `api_${p.sesion_id}`
      })),
      ...pendientesPush.map(n => ({
        ...n,
        isPushPendiente: true
      }))
    ];

    result.push({
      title: 'Sesiones terapéuticas pendientes',
      data: pendientesCombinadas.length > 0 
        ? pendientesCombinadas 
        : [{localId: 'empty_pend', empty: true, isPendienteApi: true, mensaje: 'No hay sesiones pendientes'}]
    });

    if (historialNotifications.length > 0) {
      result.push({title: 'Historial de notificaciones', data: historialNotifications, isHistorial: true});
    } else {
      result.push({title: 'Historial de notificaciones', data: [{localId: 'empty_historial', empty: true, mensaje: 'No hay historial'}]});
    }

    return result;
  }, [notifications, pendientes, historialNotifications]);

  const RenderHeader = ({title}) => (
    <CText type="B16" style={[styles.mt20, styles.mb10, {color: colors.textColor}]}>
      {title}
    </CText>
  );

  const RenderSubHeader = ({title}) => (
    <View style={localStyles.subHeaderContainer}>
      <CText type="M14" style={{color: colors.labelColor}}>
        {title}
      </CText>
    </View>
  );

  const RenderItem = ({item}) => {
    if (item.empty) {
      return (
        <View style={localStyles.itemContainer}>
          <CText type={'R14'} style={{color: colors.grayScale4}}>{item.mensaje}</CText>
        </View>
      );
    }

    const isPushPendiente = item.isPushPendiente || item.tipo === 'sesion_pendiente';

    if (item.isPendienteApi || isPushPendiente) {
      if (item.empty) {
        return (
          <View style={localStyles.itemContainer}>
            <CText type={'R14'} style={{color: colors.grayScale4}}>{item.mensaje || item.titulo}</CText>
          </View>
        );
      }
      
      const sessionKey = String(item.sesion_id || item.data?.sesion_id || item.localId);
      const isExpanded = expandedId === sessionKey;
      
      return (
        <TouchableOpacity
          key={sessionKey}
          style={[
            styles.p15,
            styles.mb10,
            {
              backgroundColor: colors.inputBg,
              borderRadius: 12,
            },
          ]}
          onPress={() => setExpandedId(isExpanded ? null : sessionKey)}
        >
          <CText type={'S16'}>
            Sesión terapéutica pendiente
          </CText>
          <CText type={'S12'} color={colors.labelColor}>
            Toca para ver detalles
          </CText>
          {isExpanded && (
            <View style={[styles.mt10]}>
              {!!item.motivo && (
                <View style={styles.mb10}>
                  <CText type={'S14'} style={styles.mb5}>
                    Motivo
                  </CText>
                  <View style={[styles.mb10, {padding: 10, borderRadius: 10, backgroundColor: colors.backgroundColor}]}>
                    <CText type={'S12'} style={{marginRight: 8}}>
                      {item.motivo}
                    </CText>
                  </View>
                </View>
              )}
              {!!item.emocion && (
                <View style={styles.mb10}>
                  <CText type={'S14'} style={styles.mb5}>
                    Emoción
                  </CText>
                  <View style={[styles.mb10, {padding: 10, borderRadius: 10, backgroundColor: colors.backgroundColor}]}>
                    <CText type={'S12'} style={{marginRight: 8}}>
                      {item.emocion}
                    </CText>
                  </View>
                </View>
              )}
              {(!item.motivo && !item.emocion) && (
                <CText type={'S12'} color={colors.labelColor}>
                  {item.titulo || item.mensaje || 'Sesión pendiente'}
                </CText>
              )}
              <View style={[styles.rowEnd, styles.mt10]}>
                <TouchableOpacity
                  onPress={async () => {
                    const sId = item.sesion_id || item.data?.sesion_id;
                    if (!sId) {
                      Alert.alert('Aviso', 'Esta notificación no tiene un ID de sesión válido.');
                      return;
                    }
                    const canProceed = await checkTherapyLimit();
                    if (!canProceed) return;
                    try {
                      const next = await continuePendingTherapy({source_session_id: sId});
                      navigation.navigate('TherapyFlowRouter', {initialNext: next, entrypoint: 'pending'});
                    } catch (e) {
                      console.log('Error continuing session:', e);
                      Alert.alert('Error', 'No se pudo continuar la sesión.');
                    }
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 15,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <CText type={'S12'} color={colors.white}>Sesión terapeutica</CText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={localStyles.itemContainer}>
        <TouchableOpacity 
          style={styles.flex}
          onPress={() => handleNotificationPress(item, isPushPendiente)}
        >
          <CText type={'R14'} style={{color: item.tipo === 'promocion' ? 'red' : colors.primary}}>
            {item.mensaje || item.titulo}
          </CText>
        </TouchableOpacity>
        <View style={localStyles.actionsRow}>
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isFavorite')} style={localStyles.actionBtn}>
            <Ionicons name={item.isFavorite ? "star" : "star-outline"} size={20} color={item.isFavorite ? "#FFD700" : colors.grayScale5} />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isRead')} style={localStyles.actionBtn}>
            <Ionicons name={item.isRead ? "mail-open-outline" : "mail-unread-outline"} size={20} color={colors.grayScale5} />
          </TouchableOpacity> */}
          {/* <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isArchived')} style={localStyles.actionBtn}>
            <Ionicons name="archive-outline" size={20} color={colors.grayScale5} />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isDeleted')} style={localStyles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleNotificationPress = async (item, isPushPendiente) => {
    // Si es sesión pendiente ya es manejada por RenderItem
    if (isPushPendiente) return;
    
    // Si es otro tipo de notificación, la marcamos como leída y mostramos el popup
    if (item.localId && !item.isRead) {
      toggleStatus(item.localId, 'isRead');
    }
    setSelectedNotification(item);
    // setModalVisible(true); // Deshabilitamos modal temporalmente para usar la expansión, si es necesario lo podemos reactivar para otras notificaciones
  };

  const RenderHistorialSection = ({section}) => {
    if (section.data.length === 1 && section.data[0].empty) {
      return (
        <View>
          <RenderHeader title={section.title} />
          <View style={localStyles.filterContainer}>
            {DATE_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setDateFilter(filter.key)}
                style={[
                  localStyles.filterBtn,
                  dateFilter === filter.key ? localStyles.filterBtnActive : null,
                  {borderColor: colors.primary}
                ]}>
                <CText
                  type="M12"
                  style={[
                    {color: dateFilter === filter.key ? colors.white : colors.primary}
                  ]}>
                  {filter.label}
                </CText>
              </TouchableOpacity>
            ))}
          </View>
          <RenderItem item={section.data[0]} />
        </View>
      );
    }

    return (
      <View>
        <RenderHeader title={section.title} />
        <View style={localStyles.filterContainer}>
          {DATE_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setDateFilter(filter.key)}
              style={[
                localStyles.filterBtn,
                dateFilter === filter.key ? localStyles.filterBtnActive : null,
                {borderColor: colors.primary}
              ]}>
              <CText
                type="M12"
                style={[
                  {color: dateFilter === filter.key ? colors.white : colors.primary}
                ]}>
                {filter.label}
              </CText>
            </TouchableOpacity>
          ))}
        </View>
        {section.data.map(group => (
          <View key={group.title}>
            <RenderSubHeader title={group.title} />
            {group.data.map(item => <RenderItem key={item.localId} item={item} />)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <CSafeAreaView style={{backgroundColor: '#EAF4E8'}}>
      <CHeader 
        title="Notificaciones" 
        rightAccessory={
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/*<TouchableOpacity onPress={addMockNotificationsSet} style={{marginRight: 15}}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={'red'} /> */}

          </View>
        } 
      />

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.localId ? item.localId : index.toString()}
        renderItem={({item}) => <RenderItem item={item} />}
        renderSectionHeader={({section}) => {
          if (section.isHistorial) {
            return <RenderHistorialSection section={section} />;
          }
          return <RenderHeader title={section.title} />;
        }}
        contentContainerStyle={localStyles.contentContainer}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <CText type={'R14'} style={styles.center} color={colors.grayScale5}>No tienes notificaciones en este momento.</CText>
        }
      />

      {/* Eliminamos temporalmente el modal si ya no lo usaremos, o podemos conservarlo. Vamos a comentar el código para que no de error si reactivamos modalVisible:
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        ...
      </Modal> */}

      <SuccessPopup
        visible={successPopupVisible}
        title="Éxito"
        desc={successPopupMessage}
        onClose={() => setSuccessPopupVisible(false)}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },
  actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  actionBtn: {
      marginLeft: moderateScale(10),
  },
  subHeaderContainer: {
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(4),
    backgroundColor: '#f0f0f0',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(4),
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: moderateScale(12),
  },
  filterBtn: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    marginRight: moderateScale(8),
  },
  filterBtnActive: {
    backgroundColor: '#0aa693',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(20),
  },
  modalFooter: {
    alignItems: 'center',
  },
  closeBtn: {
    width: '50%',
    height: moderateScale(40),
  }
});
