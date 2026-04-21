import {SectionList, StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
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
import {getPendingTherapySessions} from '../../api/sesionTerapeutica';

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

  const loadData = async () => {
    setLoading(true);
    const local = await getStoredNotifications();
    setNotifications(local);

    try {
      const json = await getPendingTherapySessions();
      if (json && json.ok !== false) {
        const items = json.items || json.data || [];
        const flatItems = [];
        items.forEach(group => {
          if (group.items && Array.isArray(group.items)) {
            group.items.forEach(item => {
              flatItems.push({
                sesion_id: group.source_session_id,
                id: item.id,
                label: item.label,
                tipo: item.tipo,
              });
            });
          }
        });
        setPendientes(flatItems);
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

  const historialNotifications = useMemo(() => {
    const filtered = notifications.filter(n => !n.isDeleted && !n.isArchived);
    return groupByDate(filtered, dateFilter);
  }, [notifications, dateFilter]);

  const sections = useMemo(() => {
    const result = [];
    const news = notifications.filter(n => n.isNew && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion');
    result.push({title: `Nuevos mensajes (${news.length})`, data: news.length > 0 ? news : [{localId: 'empty_news', empty: true, tipo: 'new', mensaje: 'No hay nuevos mensajes'}]});

    const unread = notifications.filter(n => !n.isNew && !n.isRead && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion' && !n.isFavorite);
    result.push({title: `Mensajes sin leer (${unread.length})`, data: unread.length > 0 ? unread : [{localId: 'empty_unread', empty: true, tipo: 'unread', mensaje: 'No hay mensajes sin leer'}]});

    const favorites = notifications.filter(n => n.isFavorite && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion');
    result.push({title: `Favoritos (${favorites.length})`, data: favorites.length > 0 ? favorites : [{localId: 'empty_fav', empty: true, tipo: 'fav', mensaje: 'No hay favoritos'}]});

    const promos = notifications.filter(n => n.tipo === 'promocion' && !n.isDeleted && !n.isArchived);
    result.push({title: `Promociones y ofertas (${promos.length})`, data: promos.length > 0 ? promos : [{localId: 'empty_promo', empty: true, tipo: 'promocion', mensaje: 'No hay promociones'}]});

    result.push({
      title: 'Sesiones terapéuticas pendientes',
      data: pendientes.length > 0 ? pendientes.map(p => ({isPendienteApi: true, titulo: p.label || 'Sesión pendiente', id: p.sesion_id})) : [{localId: 'empty_pend', empty: true, isPendienteApi: true, titulo: 'No hay sesiones pendientes'}]
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

    if (item.isPendienteApi) {
      return (
        <View style={localStyles.itemContainer}>
          <CText type={'R14'} style={{color: colors.primary}}>{item.titulo}</CText>
        </View>
      );
    }

    return (
      <View style={localStyles.itemContainer}>
        <View style={styles.flex}>
          <CText type={'R14'} style={{color: item.tipo === 'promocion' ? 'red' : colors.primary}}>
            {item.mensaje || item.titulo}
          </CText>
        </View>
        <View style={localStyles.actionsRow}>
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isFavorite')} style={localStyles.actionBtn}>
            <Ionicons name={item.isFavorite ? "star" : "star-outline"} size={20} color={item.isFavorite ? "#FFD700" : colors.grayScale5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isRead')} style={localStyles.actionBtn}>
            <Ionicons name={item.isRead ? "mail-open-outline" : "mail-unread-outline"} size={20} color={colors.grayScale5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isArchived')} style={localStyles.actionBtn}>
            <Ionicons name="archive-outline" size={20} color={colors.grayScale5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleStatus(item.localId, 'isDeleted')} style={localStyles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
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
      <CHeader title="Notificaciones" rightIcon={<Ionicons name="notifications-outline" size={24} color={'red'} />} />

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
});
