import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import TherapyHeader from './TherapyHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { submitAgendaItems } from '../../api/sesionTerapeutica';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';

const DAYS = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mie' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sab' },
  { key: 'sun', label: 'Dom' },
];

const DEFAULTS = {
  times_per_day: '1',
  time: '21:30',
  duration_minutes: '10',
  start_date: '2026-01-12',
  end_date: '2026-02-12',
  days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri'],
};

export default function AgendaSetupScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const sessionId = route?.params?.sessionId || null;
  const exercises = Array.isArray(route?.params?.exercises) ? route.params.exercises : [];
  const [rows, setRows] = useState(() =>
    exercises.map((ex: any) => ({
      ejercicio_id: ex.ejercicio_id,
      title: ex.title || 'Ejercicio',
      custom_title: ex.custom_title || '',
      ...DEFAULTS,
    }))
  );

  const [datePicker, setDatePicker] = useState<{ idx: number; field: 'start_date' | 'end_date' } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const canSave = useMemo(() => {
    if (!sessionId || rows.length === 0) return false;
    return rows.every((r: any) => r.time && r.duration_minutes && r.start_date && r.end_date);
  }, [rows, sessionId]);

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

  const updateRow = (idx: number, patch: any) => {
    setRows(prev => prev.map((r: any, i: number) => (i === idx ? { ...r, ...patch } : r)));
  };

  const toggleDay = (idx: number, key: string) => {
    setRows(prev =>
      prev.map((r: any, i: number) => {
        if (i !== idx) return r;
        const next = new Set(r.days_of_week || []);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return { ...r, days_of_week: Array.from(next) };
      })
    );
  };

  const onSave = async () => {
    try {
      if (!sessionId) throw new Error('No se encontró la sesión.');
      const items = rows.map((r: any) => ({
        ejercicio_id: r.ejercicio_id,
        custom_title: r.custom_title || r.title || '',
        frequency: (r.days_of_week || []).length >= 7 ? 'diaria' : 'semanal',
        times_per_day: Number(r.times_per_day || 1),
        days_of_week: r.days_of_week,
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
        navigation.navigate('HomeRoot');
      }, 1200);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar la agenda.');
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
        const recurrence = item.frequency === 'diaria'
          ? { frequency: Calendar.Frequency.DAILY }
          : {
              frequency: Calendar.Frequency.WEEKLY,
              daysOfWeek: (item.days_of_week || [])
                .map((d: string) => dayMap[d])
                .filter(Boolean),
            };

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
                    style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, marginRight: 6, marginBottom: 6, backgroundColor: active ? colors.primary : colors.inputBg }}
                  >
                    <CText color={active ? colors.white : colors.textColor}>{d.label}</CText>
                  </TouchableOpacity>
                );
              })}
            </View>

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
          <CButton title={'Guardar agenda'} disabled={!canSave} onPress={onSave} />
        </View>
      )}
    </CSafeAreaView>
  );
}
