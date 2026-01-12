import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import type {ModuleKey} from '../types';
import {getHistory} from '../api/sessionsApi';

const MODULES: ModuleKey[] = ['motivos', 'sintomas_fisicos', 'sintomas_emocionales'];

export default function DiagnosticoHistoryScreen({navigation}: any) {
  const colors = useSelector(state => state.theme.theme);
  const [moduleKey, setModuleKey] = useState<ModuleKey>('motivos');
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
        setItems(Array.isArray(list) ? list : []);
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

  return (
    <CSafeAreaView>
      <CHeader />
      <View style={styles.p20}>
        <CText type={'S24'} style={styles.mb10}>
          Mis evaluaciones
        </CText>
        <View style={[styles.rowSpaceBetween, styles.mb15]}>
          {MODULES.map(m => (
            <TouchableOpacity key={m} onPress={() => setModuleKey(m)}>
              <CText type={'S14'} color={m === moduleKey ? colors.primary : colors.labelColor}>
                {m.replace('_', ' ')}
              </CText>
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <CText type={'S14'} align={'center'} color={colors.redAlert}>
            {error}
          </CText>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((item: any, idx: number) => {
              const sessionId = item?.session_id ?? item?.id;
              return (
              <TouchableOpacity
                key={String(sessionId ?? idx)}
                style={[styles.p15, styles.mb10, {backgroundColor: colors.inputBg, borderRadius: 12}]}
                onPress={() => navigation.navigate('DiagnosticoHistoryDetail', {sessionId, module_key: moduleKey})}
              >
                <CText type={'S16'}>Sesion #{String(sessionId || '')}</CText>
                {!!item?.completed_at && (
                  <CText type={'S12'} color={colors.labelColor}>
                    {item.completed_at}
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
