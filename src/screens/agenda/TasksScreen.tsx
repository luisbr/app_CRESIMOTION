import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { getAgendaItems } from '../../api/sesionTerapeutica';
import CMainAppBar from '../../components/common/CMainAppBar';
import { StackNav, TabNav } from '../../navigation/NavigationKey';

const daysHeader = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const WEEK_DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const toDateKey = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatMonth = (d: Date) => {
  const raw = d.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
  return capitalizeFirst(raw);
};

type AgendaEvent = {
  id: string;
  title: string;
  dateKey: string;
  time?: string;
  durationMinutes?: number;
  originalItem: any;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMins = h * 60 + m + minutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  if (value.includes('T')) {
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const parts = value.split('-').map(n => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

const expandAgendaEvents = (items: any[]) => {
  const map = new Map<string, AgendaEvent[]>();
  const timeCountMap = new Map<string, number>();
  items.forEach(item => {
    const startDate = parseLocalDate(item?.start_date);
    if (!startDate) return;
    const endDate = parseLocalDate(item?.end_date) || startDate;
    const freq = item?.frequency;
    const daysOfWeek = Array.isArray(item?.days_of_week) ? item.days_of_week.map((d: string) => d.toLowerCase()) : [];
    const timesPerDay = Number(item?.times_per_day) || 1;
    const time = item?.time ?? '';
    const durationMinutes = item?.duration_minutes ?? 0;
    const title = item?.custom_title || item?.titulo || item?.title || 'Tarea';

    let current = startDate;
    const allowWeekDay = (date: Date) => {
      if (!daysOfWeek.length) return true;
      const weekDayKey = Object.entries(WEEK_DAY_MAP).find(([, num]) => num === date.getDay())?.[0];
      return weekDayKey ? daysOfWeek.includes(weekDayKey) : false;
    };

    while (current <= endDate) {
      let shouldInclude = false;
      if (!freq || freq === 'diaria') {
        shouldInclude = allowWeekDay(current);
      } else if (freq === 'semanal') {
        shouldInclude = allowWeekDay(current);
      } else {
        shouldInclude = true;
      }

      if (shouldInclude) {
        for (let repeat = 0; repeat < timesPerDay; repeat += 1) {
          const dateKey = toDateKey(current);
          const timeSlotKey = `${dateKey}-${time}`;
          const count = timeCountMap.get(timeSlotKey) || 0;
          const offsetMinutes = count * 15;
          const displayTime = offsetMinutes > 0 ? addMinutesToTime(time, offsetMinutes) : time;
          timeCountMap.set(timeSlotKey, count + 1);
          const event: AgendaEvent = {
            id: `${item?.id ?? title}-${dateKey}-${repeat}`,
            title,
            dateKey,
            time: displayTime,
            durationMinutes,
            originalItem: item,
          };
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)?.push(event);
        }
      }
      current = addDays(current, 1);
    }
  });
  return map;
};

export default function TasksScreen({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const dispatch = useDispatch();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view] = useState<'calendar'>('calendar');
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const sheetRef = useRef<any>(null);

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

  const eventsByDate = useMemo(() => expandAgendaEvents(items), [items]);

  const dateMarkers = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const datesSorted = useMemo(() => Array.from(eventsByDate.keys()).sort(), [eventsByDate]);

  const sortEventsByTime = (list: AgendaEvent[]) =>
    [...list].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

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

  const openTaskDetail = (item: any) => {
    setSelectedTask(item);
    sheetRef.current?.show();
  };

  const goToEditTask = (item: any) => {
    sheetRef.current?.hide();
    navigation.navigate(StackNav.TabNavigation, {
      screen: TabNav.HomeTab,
      params: {
        screen: 'TaskDetail',
        params: { item },
      },
    });
  };

  const renderList = () => (
    <ScrollView contentContainerStyle={[styles.p20, { paddingBottom: 140 }]}> 
      {datesSorted.length === 0 ? (
        <CText type={'S14'} color={colors.labelColor} align="left" style={{}}>No hay tareas registradas.</CText>
      ) : (
        datesSorted.map((dateKey, idx) => {
          const date = new Date(dateKey);
          const monthLabel = date.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
          const prevDate = idx > 0 ? new Date(datesSorted[idx - 1]) : null;
          const showMonth = !prevDate || prevDate.getMonth() !== date.getMonth();
          return (
            <View key={dateKey} style={styles.mb15}>
              {showMonth && (
                <CText type={'B16'} style={styles.mb5} align="left" color={colors.textColor}>{monthLabel}</CText>
              )}
              <CText type={'S14'} color={colors.labelColor} style={styles.mb5} align="left">{dateKey}</CText>
              {sortEventsByTime(eventsByDate.get(dateKey) || []).map((event: AgendaEvent) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => openTaskDetail(event.originalItem)}
                  style={[styles.rowSpaceBetween, { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grayScale2 }]}
                >
                  <View style={{ flex: 1 }}>
                    <CText type={'S16'} align="left" color={colors.textColor} style={{}}>{event.title}</CText>
                    {event.originalItem?.info && (
                      <CText type={'R12'} color={colors.gray} style={styles.mt2} align="left">{event.originalItem.info}</CText>
                    )}
                    <CText type={'R12'} color={colors.labelColor} align="left" style={{}}>
                      {!!event.time ? `${event.time}` : 'Horario libre'}
                      {event.durationMinutes ? ` · ${event.durationMinutes} min` : ''}
                    </CText>
                  </View>
                  <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  const renderCalendar = () => {
    const selectedItems = selectedDate ? sortEventsByTime(eventsByDate.get(selectedDate) || []) : [];
    const weeks: Array<typeof monthDays> = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }
    return (
      <ScrollView contentContainerStyle={[styles.p20, { paddingBottom: 140 }]}> 
        <View style={[styles.rowSpaceBetween, styles.mb10]}>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <CText type="R14" align="center" color={colors.textColor} style={{}}>{'<'} </CText>
          </TouchableOpacity>
          <CText type={'B16'} align="center" color={colors.textColor} style={{}}>{formatMonth(month)}</CText>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <CText type="R14" align="center" color={colors.textColor} style={{}}>{'>'} </CText>
          </TouchableOpacity>
        </View>
        <View style={[styles.rowSpaceBetween, { marginBottom: 6 }]}> 
          {daysHeader.map(day => (
            <CText key={day} type={'S12'} color={colors.labelColor} style={{ flex: 1, textAlign: 'center' }} align="center">{day}</CText>
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
                    <CText color={isSelected ? colors.white : colors.textColor} type="R14" align="center" style={{}}>{cell.day || ''}</CText>
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
          <CText type={'B16'} align="left" color={colors.textColor} style={{}}>Tareas</CText>
          {selectedItems.length === 0 ? (
            <CText type={'S14'} color={colors.labelColor} style={styles.mt10} align="left">Selecciona un día con tareas.</CText>
          ) : (
            selectedItems.map((event: AgendaEvent) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => openTaskDetail(event.originalItem)}
                style={[styles.rowSpaceBetween, { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grayScale2 }]}
              >
                <View style={{ flex: 1 }}>
                  <CText type={'S16'} align="left" color={colors.textColor} style={{}}>{event.title}</CText>
                  {event.originalItem?.info && (
                    <CText type={'R12'} color={colors.gray} style={styles.mt2} align="left">{event.originalItem.info}</CText>
                  )}
                  <CText type={'R12'} color={colors.labelColor} align="left" style={{}}>
                    {!!event.time ? `${event.time}` : 'Horario libre'}
                    {event.durationMinutes ? ` · ${event.durationMinutes} min` : ''}
                  </CText>
                </View>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <CSafeAreaView>
      <CMainAppBar mode="main" />
      <View style={styles.p20}>
        <View style={[styles.rowSpaceBetween, styles.mb10]}>
          <CText type={'B20'} align="left" color={colors.textColor} style={{}}>Tareas</CText>
        </View>
      </View>
      {loading ? (
        <View style={[styles.flex, styles.center]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.flex, styles.center, styles.ph20]}>
          <CText type="R14" color={colors.textColor} align="center" style={{}}>{error}</CText>
        </View>
      ) : (
        renderCalendar()
      )}
      <ActionSheet
        ref={sheetRef}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: colors.backgroundColor,
          padding: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        {selectedTask && (
          <View style={styles.pb30}>
            <View style={[styles.rowSpaceBetween, styles.mb15]}>
              <CText type="B20" color={colors.textColor} align="left" style={{ flex: 1 }}>
                {selectedTask.titulo || selectedTask.title || 'Tarea'}
              </CText>
              <TouchableOpacity onPress={() => sheetRef.current?.hide()}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {selectedTask.custom_title && selectedTask.custom_title !== selectedTask.titulo && (
              <CText type="S16" color={colors.labelColor} align="left" style={styles.mb10}>
                {selectedTask.custom_title}
              </CText>
            )}

            {(selectedTask.info || selectedTask.descripcion || selectedTask.detalle || selectedTask.description) && (
              <CText type="R16" color={colors.textColor} align="left" style={styles.mb20}>
                {selectedTask.info || selectedTask.descripcion || selectedTask.detalle || selectedTask.description}
              </CText>
            )}

            <View style={[styles.rowStart, styles.mb20]}>
              <View style={[styles.mr20]}>
                <CText type="S12" color={colors.labelColor} align="left" style={{}}>Hora</CText>
                <CText type="S16" color={colors.textColor} align="left" style={{}}>
                  {selectedTask.time || 'Horario libre'}
                </CText>
              </View>
              <View>
                <CText type="S12" color={colors.labelColor} align="left" style={{}}>Duración</CText>
                <CText type="S16" color={colors.textColor} align="left" style={{}}>
                  {selectedTask.duration_minutes ? `${selectedTask.duration_minutes} min` : 'Sin duración'}
                </CText>
              </View>
            </View>

            <CButton
              title="Editar Tarea"
              type="B16"
              color={colors.white}
              containerStyle={{}}
              textStyle={{}}
              style={{}}
              bgColor={colors.primary}
              borderColor={colors.primary}
              frontIcon={null}
              icon={null}
              leftIconStyle={{}}
              children={null}
              onPress={() => goToEditTask(selectedTask)}
            />
          </View>
        )}
      </ActionSheet>
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
