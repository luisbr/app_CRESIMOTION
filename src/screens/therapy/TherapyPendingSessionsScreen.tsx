import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {useDrawer} from '../../navigation/DrawerContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {continuePendingTherapy, getPendingTherapySessions} from '../../api/sesionTerapeutica';

export default function TherapyPendingSessionsScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const drawer = useDrawer();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [continuingId, setContinuingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPendingTherapySessions();
        if (!mounted) return;
        const list = data?.items || data?.data || data || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'No se pudieron cargar las sesiones pendientes.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatLocalDate = (value: string) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const onContinue = async (sourceSessionId: number) => {
    if (!sourceSessionId) return;
    setContinuingId(sourceSessionId);
    try {
      const next = await continuePendingTherapy({source_session_id: sourceSessionId});
      navigation.replace('TherapyFlowRouter', {initialNext: next, entrypoint: 'pending'});
    } catch (e: any) {
      setError(e?.message || 'No se pudo continuar la sesión.');
    } finally {
      setContinuingId(null);
    }
  };

  return (
    <CSafeAreaView>
      <CHeader
        isHideBack
        centerAccessory={
          <CText type={'B18'} color={colors.textColor}>
            Sesiones terapéuticas
          </CText>
        }
        isLeftIcon={
          <TouchableOpacity onPress={drawer.open} style={{padding: 6, marginLeft: -8}}>
            <Ionicons name={'menu-outline'} size={moderateScale(24)} color={colors.textColor} />
          </TouchableOpacity>
        }
      />
      <View style={[styles.p20, {flex: 1}]}>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: {width: 0, height: 3},
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <CText type={'B18'}>Sesiones terapéuticas pendientes</CText>
          <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
            Recuerda terminarlas para avanzar en tu proceso. Cada paso suma a tu bienestar.
          </CText>
        </View>
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
                No tienes sesiones pendientes por ahora.
              </CText>
            )}
            {items.map((item: any, idx: number) => {
              const sourceSessionId = Number(item?.source_session_id);
              const createdAt = item?.source_created_at;
              const isContinuing = continuingId === sourceSessionId;
              return (
                <TouchableOpacity
                  key={String(sourceSessionId || idx)}
                  onPress={() => onContinue(sourceSessionId)}
                  disabled={isContinuing}
                  style={[
                    styles.p15,
                    styles.mb10,
                    {
                      backgroundColor: colors.white,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.grayScale2,
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowOffset: {width: 0, height: 3},
                      shadowRadius: 8,
                      elevation: 4,
                      opacity: isContinuing ? 0.6 : 1,
                    },
                  ]}
                >
                  <CText type={'S16'}>{`Sesión ${String(sourceSessionId || '')}`}</CText>
                  {!!createdAt && (
                    <CText type={'S12'} color={colors.labelColor}>
                      {formatLocalDate(createdAt)}
                    </CText>
                  )}
                  {isContinuing && (
                    <CText type={'S12'} color={colors.primary} style={styles.mt5}>
                      Continuando...
                    </CText>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </CSafeAreaView>
  );
}
