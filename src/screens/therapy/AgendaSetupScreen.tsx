import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import ScreenTooltip from '../../components/common/ScreenTooltip';
import { styles } from '../../theme';
import { submitAgendaItems } from '../../api/sesionTerapeutica';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { normalizeTherapyNext } from './therapyUtils';
import {useSafeNavigation} from '../../navigation/safeNavigation';

const DAYS = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mie' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sab' },
  { key: 'sun', label: 'Dom' },
];

const getTodayDefaults = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addMonths = (d: Date, months: number) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const next = new Date(year, month + months, 1);
    const max = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, max));
    return next;
  };
  return {
    frequency: 'semanal',
    times_per_day: '1',
    time: '21:30',
    duration_minutes: '10',
    start_date: format(today),
    end_date: format(addMonths(today, 1)),
    day_of_month: String(today.getDate()),
    days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri'],
  };
};

const FREQUENCIES = [
  { key: 'diaria', label: 'Diario' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'quincenal', label: 'Quincenal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'bimestral', label: 'Bimestral' },
  { key: 'semestral', label: 'Semestral' },
];

export default function AgendaSetupScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const safeNavigation = useSafeNavigation(navigation);
  const nextPayload = route?.params?.next || null;
  const { data, sessionId: nextSessionId } = normalizeTherapyNext(nextPayload);
  const sessionId = route?.params?.sessionId ?? nextSessionId ?? null;
  const payloadExercises = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.exercises)
      ? data.exercises
      : [];
  const exercises = Array.isArray(route?.params?.exercises) && route.params.exercises.length
    ? route.params.exercises
    : payloadExercises;
  const [rows, setRows] = useState(() => {
    const base = getTodayDefaults();
    return exercises.map((ex: any) => ({
      ejercicio_id: ex.ejercicio_id,
      title: ex.title || 'Ejercicio',
      custom_title: ex.custom_title || '',
      ...base,
    }));
  });

  const [datePicker, setDatePicker] = useState<{ idx: number; field: 'start_date' | 'end_date' } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const formatDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const parseDate = (s?: string) => {
    if (s) {
      const parts = s.split('-').map(n => parseInt(n, 10));
      if (parts.length === 3 && parts.every(n => !Number.isNaN(n))) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date();
  };

  const addDays = (d: Date, days: number) => {
    const next = new Date(d);
    next.setDate(next.getDate() + days);
    return next;
  };

  const addMonths = (d: Date, months: number) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const next = new Date(year, month + months, 1);
    const max = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, max));
    return next;
  };

  const clampDay = (year: number, month: number, day: number) => {
    const max = new Date(year, month + 1, 0).getDate();
    return Math.min(Math.max(1, day), max);
  };

  const setDateDay = (dateStr: string, day: number) => {
    const parts = dateStr.split('-').map(n => parseInt(n, 10));
    if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return dateStr;
    const [y, m, d] = parts;
    const safeDay = clampDay(y, m - 1, day);
    const next = new Date(y, m - 1, safeDay);
    return formatDate(next);
  };

  const getMinEndDate = (row: any) => {
    const start = parseDate(row.start_date);
    if (!start) return null;
    const freq = row.frequency || 'semanal';
    if (freq === 'bimestral') return addMonths(start, 2);
    if (freq === 'semestral') return addMonths(start, 6);
    return addMonths(start, 1);
  };

  const isValidRange = (row: any) => {
    const start = parseDate(row.start_date);
    const end = parseDate(row.end_date);
    if (!start || !end) return false;
    const minEnd = getMinEndDate(row);
    if (!minEnd) return false;
    return end >= minEnd;
  };

  const canSave = useMemo(() => {
    if (!sessionId || rows.length === 0) return false;
    return rows.every((r: any) => r.time && r.duration_minutes && r.start_date && r.end_date && isValidRange(r));
  }, [rows, sessionId]);

  useEffect(() => {
    if (!sessionId) {
      console.log('[AgendaSetup] canSave=false: missing sessionId');
      return;
    }
    if (rows.length === 0) {
      console.log('[AgendaSetup] canSave=false: empty rows');
      return;
    }
    const details = rows.map((r: any, idx: number) => {
      const missing = [];
      if (!r.time) missing.push('time');
      if (!r.duration_minutes) missing.push('duration_minutes');
      if (!r.start_date) missing.push('start_date');
      if (!r.end_date) missing.push('end_date');
      const rangeOk = isValidRange(r);
      return {
        idx,
        frequency: r.frequency,
        days_of_week: r.days_of_week,
        missing,
        rangeOk,
      };
    });
    const firstBad = details.find(d => d.missing.length > 0 || !d.rangeOk);
    console.log('[AgendaSetup] canSave', {
      canSave,
      firstBad,
      details,
    });
  }, [rows, sessionId, canSave]);

  const updateRow = (idx: number, patch: any) => {
    setRows(prev =>
      prev.map((r: any, i: number) => {
        if (i !== idx) return r;
        const next = { ...r, ...patch };
        if (patch.frequency || patch.start_date) {
          const minEnd = getMinEndDate(next);
          if (minEnd) {
            const currentEnd = parseDate(next.end_date);
            if (!currentEnd || currentEnd < minEnd) {
              next.end_date = formatDate(minEnd);
            }
          }
        }
        return next;
      })
    );
  };

  const toggleDay = (idx: number, key: string) => {
    setRows(prev =>
      prev.map((r: any, i: number) => {
        if (i !== idx) return r;
        if (r.frequency !== 'semanal' && r.frequency !== 'diaria' && r.frequency !== 'quincenal') return r;
        const current = new Set<string>(r.days_of_week || []);
        if (current.has(key)) {
          current.delete(key);
        } else {
          current.add(key);
        }
        return { ...r, days_of_week: Array.from(current) };
      })
    );
  };

  const onSave = async () => {
    if (savingRef.current) {
      return;
    }
    let didNavigate = false;
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const invalid = rows.find(r => !isValidRange(r));
      if (invalid) {
        Alert.alert(
          'Error',
          'La fecha fin debe permitir al menos una ejecución según la periodicidad seleccionada.',
          [{ text: 'Cerrar', style: 'cancel' }]
        );
        return;
      }
      savingRef.current = true;
      setSaving(true);
      const items = rows.map((r: any) => ({
        ejercicio_id: r.ejercicio_id,
        custom_title: r.custom_title || r.title || '',
        frequency: r.frequency || 'semanal',
        times_per_day: Number(r.times_per_day || 1),
        days_of_week:
          r.frequency === 'semanal' || r.frequency === 'quincenal'
            ? r.days_of_week
            : r.frequency === 'diaria'
              ? DAYS.map(d => d.key)
              : [],
        day_of_month:
          r.frequency !== 'semanal' && r.frequency !== 'diaria' && r.frequency !== 'quincenal'
            ? Number(r.day_of_month || 1)
            : undefined,
        time: r.time,
        duration_minutes: Number(r.duration_minutes || 0),
        start_date: r.start_date,
        end_date: r.end_date,
      }));
      const resp = await submitAgendaItems({ sessionId, items });
      console.log('[THERAPY] agenda save response', resp);
      await createCalendarEvents(items);
      setSuccessMessage('Agenda registrada correctamente.');
      setTimeout(() => {
        savingRef.current = false;
        setSaving(false);
        safeNavigation.navigate('HomeRoot');
      }, 1200);
      didNavigate = true;
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar la agenda.');
    } finally {
      if (didNavigate) return;
      savingRef.current = false;
      setSaving(false);
    }
  };

  const createCalendarEvents = async (items: any[]) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') return;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const existing = calendars.find(c => c.title === 'CresiMotion');
      let calendarId = existing?.id;

      if (!calendarId) {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        const source = defaultCalendar?.source || calendars.find(c => c.source?.isLocalAccount)?.source || calendars[0]?.source;
        if (!source) return;
        calendarId = await Calendar.createCalendarAsync({
          title: 'CresiMotion',
          color: '#0aa693',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: source.id,
          source,
          name: 'CresiMotion',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          ownerAccount: source.name,
        });
      }
      console.log('[THERAPY] calendar id', calendarId);

      const dayMap: Record<string, number> = {
        mon: Calendar.Weekday.MONDAY,
        tue: Calendar.Weekday.TUESDAY,
        wed: Calendar.Weekday.WEDNESDAY,
        thu: Calendar.Weekday.THURSDAY,
        fri: Calendar.Weekday.FRIDAY,
        sat: Calendar.Weekday.SATURDAY,
        sun: Calendar.Weekday.SUNDAY,
      };

      for (const item of items) {
        const start = new Date(`${item.start_date}T${item.time}:00`);
        const end = new Date(start.getTime() + Number(item.duration_minutes || 0) * 60 * 1000);
        const recurrence =
          item.frequency === 'diaria'
            ? { frequency: Calendar.Frequency.DAILY }
            : item.frequency === 'semanal'
              ? {
                  frequency: Calendar.Frequency.WEEKLY,
                  daysOfWeek: (item.days_of_week || [])
                    .map((d: string) => dayMap[d])
                    .filter(Boolean),
                }
              : item.frequency === 'quincenal'
                ? {
                    frequency: Calendar.Frequency.WEEKLY,
                    interval: 2,
                    daysOfWeek: (item.days_of_week || [])
                      .map((d: string) => dayMap[d])
                      .filter(Boolean),
                  }
                : item.frequency === 'mensual'
                  ? { frequency: Calendar.Frequency.MONTHLY, interval: 1 }
                  : item.frequency === 'bimestral'
                    ? { frequency: Calendar.Frequency.MONTHLY, interval: 2 }
                    : { frequency: Calendar.Frequency.MONTHLY, interval: 6 };

        const eventId = await Calendar.createEventAsync(calendarId, {
          title: item.custom_title || 'Ejercicio',
          startDate: start,
          endDate: end,
          recurrenceRule: {
            ...recurrence,
            endDate: item.end_date ? new Date(`${item.end_date}T23:59:59`) : undefined,
          },
        });
        console.log('[THERAPY] calendar event created', eventId);
      }
    } catch (e) {
      console.log('[THERAPY] calendar create error', e);
    }
  };

  return (
    <CSafeAreaView>
      <TherapyHeader />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}>
        {!!successMessage && (
          <View style={{ backgroundColor: '#D1FAE5', borderRadius: 10, padding: 10, marginBottom: 12 }}>
            <CText type={'S14'} color={'#065F46'}>{successMessage}</CText>
          </View>
        )}
        <CText type={'B20'}>Programar ejercicios</CText>
        <CText type={'R14'} color={colors.labelColor} style={styles.mt10}>
          Define cuándo y cómo quieres realizar cada ejercicio.
        </CText>
        {rows.length === 0 && (
          <View style={styles.mt20}>
            <CText type={'S14'} color={colors.labelColor}>
              No hay ejercicios para programar en este momento. Vuelve a intentar desde la selección de hábitos.
            </CText>
            <View style={styles.mt10}>
              <CButton title={'Volver al inicio'} onPress={() => safeNavigation.navigate('HomeRoot')} />
            </View>
          </View>
        )}
        {rows.map((row: any, idx: number) => (
          <View key={String(row.ejercicio_id)} style={[styles.mt20, { borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 12, padding: 12 }]}>
            <CText type={'B16'}>{row.title}</CText>
            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Título personalizado</CText>
            <TextInput
              value={row.custom_title}
              onChangeText={(v) => updateRow(idx, { custom_title: v })}
              placeholder={'Opcional'}
              placeholderTextColor={colors.labelColor}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
            />

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Veces por día</CText>
            <TextInput
              value={String(row.times_per_day)}
              onChangeText={(v) => updateRow(idx, { times_per_day: v })}
              keyboardType={'numeric'}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
            />

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Días de la semana</CText>
            <View style={[styles.rowStart, styles.wrap, { marginTop: 6 }]}> 
              {DAYS.map((d) => {
                const active = (row.days_of_week || []).includes(d.key);
                return (
                  <TouchableOpacity
                    key={d.key}
                    onPress={() => toggleDay(idx, d.key)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 14,
                      marginRight: 6,
                      marginBottom: 6,
                      backgroundColor: active ? colors.primary : colors.inputBg,
                      opacity: row.frequency === 'semanal' || row.frequency === 'diaria' || row.frequency === 'quincenal' ? 1 : 0.4,
                    }}
                  >
                    <CText color={active ? colors.white : colors.textColor}>{d.label}</CText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Periodicidad</CText>
            <View style={[styles.rowStart, styles.wrap, { marginTop: 6 }]}>
              {FREQUENCIES.map((f) => {
                const active = row.frequency === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() =>
                      updateRow(idx, {
                        frequency: f.key,
                        days_of_week:
                          f.key === 'semanal' || f.key === 'quincenal'
                            ? ['mon']
                            : f.key === 'diaria'
                              ? (row.days_of_week && row.days_of_week.length ? row.days_of_week : DAYS.map(d => d.key))
                              : [],
                      })
                    }
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 14,
                      marginRight: 6,
                      marginBottom: 6,
                      backgroundColor: active ? colors.primary : colors.inputBg,
                    }}
                  >
                    <CText color={active ? colors.white : colors.textColor}>{f.label}</CText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {row.frequency !== 'semanal' && row.frequency !== 'diaria' && (
              <>
                <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Día del mes</CText>
                <View style={[styles.rowStart, styles.wrap, { marginTop: 6 }]}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const active = Number(row.day_of_month || 1) === day;
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          updateRow(idx, {
                            day_of_month: String(day),
                            start_date: setDateDay(row.start_date, day),
                            end_date: setDateDay(row.end_date, day),
                          });
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 14,
                          marginRight: 6,
                          marginBottom: 6,
                          backgroundColor: active ? colors.primary : colors.inputBg,
                        }}
                      >
                        <CText color={active ? colors.white : colors.textColor}>{day}</CText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Hora</CText>
            <TextInput
              value={row.time}
              onChangeText={(v) => updateRow(idx, { time: v })}
              placeholder={'21:30'}
              placeholderTextColor={colors.labelColor}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
            />

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Duración (minutos)</CText>
            <TextInput
              value={String(row.duration_minutes)}
              onChangeText={(v) => updateRow(idx, { duration_minutes: v })}
              keyboardType={'numeric'}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
            />

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Fecha inicio</CText>
            <TouchableOpacity
              onPress={() => setDatePicker({ idx, field: 'start_date' })}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, marginTop: 6 }}
            >
              <CText color={colors.textColor}>{row.start_date}</CText>
            </TouchableOpacity>

            <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Fecha fin</CText>
            <TouchableOpacity
              onPress={() => setDatePicker({ idx, field: 'end_date' })}
              style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, marginTop: 6 }}
            >
              <CText color={colors.textColor}>{row.end_date}</CText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {datePicker && (
        <DateTimePicker
          value={parseDate(rows[datePicker.idx]?.[datePicker.field])}
          mode="date"
          display={Platform.OS === 'ios' ? 'default' : 'calendar'}
          onChange={(event, selectedDate) => {
            if (event?.type === 'dismissed') {
              setDatePicker(null);
              return;
            }
            if (selectedDate) {
              updateRow(datePicker.idx, { [datePicker.field]: formatDate(selectedDate) });
            }
            setDatePicker(null);
          }}
        />
      )}
      {!datePicker && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            backgroundColor: colors.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: colors.grayScale2,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <CButton title={'Guardar agenda'} disabled={!canSave || saving} loading={saving} onPress={onSave} />
        </View>
      )}
      <ScreenTooltip />
    </CSafeAreaView>
  );
}
