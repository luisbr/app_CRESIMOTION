import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { getAgendaItems } from '../../api/sesionTerapeutica';
import TherapyHeader from '../therapy/TherapyHeader';

const daysHeader = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const toDateKey = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatMonth = (d: Date) =>
  d.toLocaleString('es-MX', { month: 'long', year: 'numeric' });

export default function TasksScreen({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAgendaItems();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la agenda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    items.forEach(item => {
      const key = item?.start_date || '';
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    });
    return map;
  }, [items]);

  const dateMarkers = useMemo(() => new Set(items.map(it => it?.start_date).filter(Boolean)), [items]);

  const datesSorted = useMemo(() => Array.from(groupedByDate.keys()).sort(), [groupedByDate]);

  const monthDays = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay();
    const total = new Date(year, m + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateKey?: string }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null });
    for (let d = 1; d <= total; d++) {
      const dateKey = toDateKey(new Date(year, m, d));
      cells.push({ day: d, dateKey });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return cells;
  }, [month]);

  const onSelectDate = (dateKey?: string) => {
    if (!dateKey) return;
    setSelectedDate(dateKey);
  };

  const renderList = () => (
    <ScrollView contentContainerStyle={[styles.p20, { paddingBottom: 140 }]}> 
      {datesSorted.length === 0 ? (
        <CText type={'S14'} color={colors.labelColor}>No hay tareas registradas.</CText>
      ) : (
        datesSorted.map((dateKey, idx) => {
          const date = new Date(dateKey);
          const monthLabel = date.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
          const prevDate = idx > 0 ? new Date(datesSorted[idx - 1]) : null;
          const showMonth = !prevDate || prevDate.getMonth() !== date.getMonth();
          return (
            <View key={dateKey} style={styles.mb15}>
              {showMonth && (
                <CText type={'B16'} style={styles.mb5}>{monthLabel}</CText>
              )}
              <CText type={'S14'} color={colors.labelColor} style={styles.mb5}>{dateKey}</CText>
              {(groupedByDate.get(dateKey) || []).map((item: any) => (
                <TouchableOpacity
                  key={String(item.id)}
                  onPress={() => navigation.navigate('TaskDetail', { item })}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grayScale2 }}
                >
                  <CText type={'S16'}>{item?.custom_title || item?.titulo || item?.title || 'Tarea'}</CText>
                  <CText type={'R12'} color={colors.labelColor}>{item?.time || ''}</CText>
                </TouchableOpacity>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  const renderCalendar = () => {
    const selectedItems = selectedDate ? groupedByDate.get(selectedDate) || [] : [];
    const weeks: Array<typeof monthDays> = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }
    return (
      <ScrollView contentContainerStyle={[styles.p20, { paddingBottom: 140 }]}> 
        <View style={[styles.rowSpaceBetween, styles.mb10]}>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <CText>{'<'} </CText>
          </TouchableOpacity>
          <CText type={'B16'}>{formatMonth(month)}</CText>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <CText>{'>'} </CText>
          </TouchableOpacity>
        </View>
        <View style={[styles.rowSpaceBetween, { marginBottom: 6 }]}> 
          {daysHeader.map(day => (
            <CText key={day} type={'S12'} color={colors.labelColor} style={{ flex: 1, textAlign: 'center' }}>{day}</CText>
          ))}
        </View>
        {weeks.map((week, widx) => (
          <View key={String(widx)} style={[styles.rowSpaceBetween, { marginBottom: 4 }]}>
            {week.map((cell, idx) => {
              const isSelected = cell.dateKey && cell.dateKey === selectedDate;
              const hasItems = cell.dateKey && dateMarkers.has(cell.dateKey);
              return (
                <TouchableOpacity
                  key={String(idx)}
                  onPress={() => onSelectDate(cell.dateKey)}
                  style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}
                  disabled={!cell.day}
                >
                  <View style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                  }}>
                    <CText color={isSelected ? colors.white : colors.textColor}>{cell.day || ''}</CText>
                  </View>
                  {hasItems && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 2 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={styles.mt20}>
          <CText type={'B16'}>Tareas</CText>
          {selectedItems.length === 0 ? (
            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Selecciona un dia con tareas.</CText>
          ) : (
            selectedItems.map((item: any) => (
              <TouchableOpacity
                key={String(item.id)}
                onPress={() => navigation.navigate('TaskDetail', { item })}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grayScale2 }}
              >
                <CText type={'S16'}>{item?.custom_title || item?.titulo || item?.title || 'Tarea'}</CText>
                <CText type={'R12'} color={colors.labelColor}>{item?.time || ''}</CText>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <View style={styles.p20}>
        <View style={[styles.rowSpaceBetween, styles.mb10]}>
          <CText type={'B20'}>Tareas</CText>
          <View style={styles.rowStart}>
            <TouchableOpacity
              onPress={() => setView('list')}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 16,
                marginRight: 8,
                backgroundColor: view === 'list' ? colors.primary : colors.inputBg,
              }}
            >
              <CText color={view === 'list' ? colors.white : colors.textColor}>Lista</CText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('calendar')}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 16,
                backgroundColor: view === 'calendar' ? colors.primary : colors.inputBg,
              }}
            >
              <CText color={view === 'calendar' ? colors.white : colors.textColor}>Calendario</CText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {loading ? (
        <View style={[styles.flex, styles.center]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.flex, styles.center, styles.ph20]}>
          <CText>{error}</CText>
        </View>
      ) : view === 'list' ? (
        renderList()
      ) : (
        renderCalendar()
      )}
    </CSafeAreaView>
  );
}
