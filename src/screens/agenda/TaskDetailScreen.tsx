import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateAgendaItem } from '../../api/sesionTerapeutica';

const DAYS = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mie' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sab' },
  { key: 'sun', label: 'Dom' },
];

export default function TaskDetailScreen({ navigation, route }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const item = route?.params?.item || {};
  const [form, setForm] = useState({
    id: item.id,
    custom_title: item.custom_title || item.titulo || '',
    frequency: item.frequency || 'semanal',
    times_per_day: String(item.times_per_day || 1),
    days_of_week: Array.isArray(item.days_of_week) ? item.days_of_week : [],
    time: item.time || '21:30',
    duration_minutes: String(item.duration_minutes || 10),
    start_date: item.start_date || '2026-01-12',
    end_date: item.end_date || '2026-02-12',
  });
  const [datePicker, setDatePicker] = useState<{ field: 'start_date' | 'end_date' } | null>(null);

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

  const canSave = useMemo(() => {
    return form.custom_title && form.time && form.start_date && form.end_date;
  }, [form]);

  const toggleDay = (key: string) => {
    setForm(prev => {
      const next = new Set(prev.days_of_week);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, days_of_week: Array.from(next) } as any;
    });
  };

  const onSave = async () => {
    try {
      const payload = {
        id: form.id,
        custom_title: form.custom_title,
        frequency: form.days_of_week.length >= 7 ? 'diaria' : 'semanal',
        times_per_day: Number(form.times_per_day || 1),
        days_of_week: form.days_of_week,
        time: form.time,
        duration_minutes: Number(form.duration_minutes || 0),
        start_date: form.start_date,
        end_date: form.end_date,
      };
      await updateAgendaItem(payload);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar.');
    }
  };

  return (
    <CSafeAreaView>
      <CHeader title={'Detalle de tarea'} />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 140 }]}> 
        <CText type={'B18'}>Editar tarea</CText>
        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Titulo personalizado</CText>
        <TextInput
          value={form.custom_title}
          onChangeText={(v) => setForm(s => ({ ...s, custom_title: v }))}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
        />

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Veces por dia</CText>
        <TextInput
          value={String(form.times_per_day)}
          onChangeText={(v) => setForm(s => ({ ...s, times_per_day: v }))}
          keyboardType={'numeric'}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
        />

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Dias de la semana</CText>
        <View style={[styles.rowStart, styles.wrap, { marginTop: 6 }]}> 
          {DAYS.map((d) => {
            const active = (form.days_of_week || []).includes(d.key);
            return (
              <TouchableOpacity
                key={d.key}
                onPress={() => toggleDay(d.key)}
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, marginRight: 6, marginBottom: 6, backgroundColor: active ? colors.primary : colors.inputBg }}
              >
                <CText color={active ? colors.white : colors.textColor}>{d.label}</CText>
              </TouchableOpacity>
            );
          })}
        </View>

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Hora</CText>
        <TextInput
          value={form.time}
          onChangeText={(v) => setForm(s => ({ ...s, time: v }))}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
        />

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Duracion (minutos)</CText>
        <TextInput
          value={String(form.duration_minutes)}
          onChangeText={(v) => setForm(s => ({ ...s, duration_minutes: v }))}
          keyboardType={'numeric'}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, color: colors.textColor, marginTop: 6 }}
        />

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Fecha inicio</CText>
        <TouchableOpacity
          onPress={() => setDatePicker({ field: 'start_date' })}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, marginTop: 6 }}
        >
          <CText color={colors.textColor}>{form.start_date}</CText>
        </TouchableOpacity>

        <CText type={'S14'} color={colors.labelColor} style={styles.mt10}>Fecha fin</CText>
        <TouchableOpacity
          onPress={() => setDatePicker({ field: 'end_date' })}
          style={{ borderWidth: 1, borderColor: colors.grayScale2, borderRadius: 8, padding: 10, marginTop: 6 }}
        >
          <CText color={colors.textColor}>{form.end_date}</CText>
        </TouchableOpacity>
      </ScrollView>

      {datePicker && (
        <DateTimePicker
          value={parseDate(form[datePicker.field])}
          mode="date"
          display={Platform.OS === 'ios' ? 'default' : 'calendar'}
          onChange={(event, selectedDate) => {
            if (event?.type === 'dismissed') {
              setDatePicker(null);
              return;
            }
            if (selectedDate) {
              setForm(s => ({ ...s, [datePicker.field]: formatDate(selectedDate) }));
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
          <CButton title={'Guardar cambios'} disabled={!canSave} onPress={onSave} />
        </View>
      )}
    </CSafeAreaView>
  );
}
