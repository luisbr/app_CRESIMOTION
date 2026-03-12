import {SectionList, StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
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
import {authFetch, safeJson} from '../../api/auth';

export default function Notification() {
  const colors = useSelector(state => state.theme.theme);
  const navigation = useNavigation();
  
  const [notifications, setNotifications] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    // Load local storage
    const local = await getStoredNotifications();
    setNotifications(local);

    // Fetch pendientes API
    try {
       const res = await authFetch('/api/app/sesion-terapeutica/pendientes');
       const json = await safeJson(res);
       if(res.ok && json.ok) {
           setPendientes(json.data || []);
       }
    } catch(e) {
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
    const updated = notifications.map(n => n.localId === id ? { ...n, [field]: !n[field] } : n);
    setNotifications(updated);
    await saveStoredNotifications(updated);
  };

  // Build sections
  const sections = [];
  
  const news = notifications.filter(n => n.isNew && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion');
  if(news.length > 0) sections.push({title: `Nuevos mensajes (${news.length})`, data: news});

  const unread = notifications.filter(n => !n.isNew && !n.isRead && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion' && !n.isFavorite);
  if(unread.length > 0) sections.push({title: `Mensajes sin leer (${unread.length})`, data: unread});

  const favorites = notifications.filter(n => n.isFavorite && !n.isDeleted && !n.isArchived && n.tipo !== 'promocion');
  if(favorites.length > 0) sections.push({title: 'Favoritos', data: favorites});

  const promos = notifications.filter(n => n.tipo === 'promocion' && !n.isDeleted && !n.isArchived);
  if(promos.length > 0) sections.push({title: 'Promociones y ofertas', data: promos});

  if(pendientes.length > 0) {
      sections.push({title: 'Sesiones terapéuticas pendientes', data: pendientes.map(p => ({isPendienteApi: true, titulo: p.label || 'Sesión pendiente', id: p.sesion_id}))});
  }

  const RenderHeader = ({title}) => {
    return (
      <CText type="B16" style={[styles.mt20, styles.mb10, {color: colors.textColor}]}>
        {title}
      </CText>
    );
  };

  const RenderItem = ({item}) => {
    if(item.isPendienteApi) {
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

  return (
    <CSafeAreaView style={{backgroundColor: '#EAF4E8'}}>
      <CHeader title="Notificaciones" rightIcon={<Ionicons name="notifications-outline" size={24} color={'red'} />} />
      
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.localId ? item.localId : index.toString()}
        renderItem={({item}) => <RenderItem item={item} />}
        renderSectionHeader={({section: {title}}) => <RenderHeader title={title} />}
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
});
