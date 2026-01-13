import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import type {ModuleKey} from '../types';
import {getHistory} from '../api/sessionsApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../../common/constants';
import {useDrawer} from '../../../navigation/DrawerContext';

const MODULES: ModuleKey[] = ['motivos', 'sintomas_fisicos', 'sintomas_emocionales'];

export default function DiagnosticoHistoryScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const drawer = useDrawer();
  const [moduleKey] = useState<ModuleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHistory(moduleKey, 20, 0);
        if (!mounted) return;
        const list = data?.items || data?.data || data || [];
        const rawItems = Array.isArray(list) ? list : [];
        const grouped = new Map<string, any>();
        rawItems.forEach((item: any) => {
          const groupId = String(item?.group_id ?? item?.session_id ?? item?.id ?? '');
          if (!grouped.has(groupId)) {
            grouped.set(groupId, {
              group_id: item?.group_id ?? null,
              items: [item],
            });
          } else {
            grouped.get(groupId).items.push(item);
          }
        });
        const groupedList = Array.from(grouped.values()).map(group => {
          const sorted = [...group.items].sort((a: any, b: any) => {
            return String(b?.completed_at || '').localeCompare(String(a?.completed_at || ''));
          });
          return {
            group_id: group.group_id,
            items: sorted,
            latest: sorted[0],
          };
        });
        setItems(groupedList);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.body?.message || e?.message || 'No se pudo cargar el historial.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  const formatLocalDate = (value: string) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <CSafeAreaView>
      <CHeader
        isHideBack
        centerAccessory={
          <Image
            source={require('../../../../assets/logo.png')}
            style={{width: moderateScale(110), height: moderateScale(28)}}
            resizeMode="contain"
          />
        }
        isLeftIcon={
          <TouchableOpacity onPress={drawer.open} style={{padding: 6, marginLeft: -8}}>
            <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
          </TouchableOpacity>
        }
        rightAccessory={
          <View style={[styles.rowStart, styles.g10]}>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'call-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={{width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name={'notifications-outline'} size={moderateScale(22)} color={colors.textColor} />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.p20}>
        <CText type={'S24'} style={styles.mb10}>
          Mis evaluaciones
        </CText>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {!items.length && (
              <CText type={'S14'} align={'center'} color={colors.labelColor}>
                Aun no tienes evaluaciones.
              </CText>
            )}
            {items.map((item: any, idx: number) => {
              const latest = item?.latest || {};
              const sessionId = latest?.session_id ?? latest?.id;
              const groupId = item?.group_id ?? latest?.group_id;
              return (
              <TouchableOpacity
                key={String(groupId ?? sessionId ?? idx)}
                style={[styles.p15, styles.mb10, {backgroundColor: colors.inputBg, borderRadius: 12}]}
                onPress={() => navigation.navigate('DiagnosticoHistoryDetail', {groupItems: item?.items || []})}
              >
                <CText type={'S16'}>
                  {groupId ? `Sesion #${String(groupId)}` : `Sesion #${String(sessionId || '')}`}
                </CText>
                {!!latest?.completed_at && (
                  <CText type={'S12'} color={colors.labelColor}>
                    {formatLocalDate(latest.completed_at)}
                  </CText>
                )}
              </TouchableOpacity>
            );})}
          </ScrollView>
        )}
      </View>
    </CSafeAreaView>
  );
}
