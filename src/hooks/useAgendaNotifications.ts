import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { getAgendaItems } from '../api/sesionTerapeutica';
import { addNotification } from '../utils/notificationStorage';
import { getSession } from '../api/auth';

export const useAgendaNotifications = () => {
  const syncAgendaNotifications = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session || !session.token) return;

      const agendaItems = await getAgendaItems();
      if (!agendaItems || !Array.isArray(agendaItems)) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun

      for (const item of agendaItems) {
        // Generar id unico basado en el agenda_id + fecha actual (para que sea 1 por dia)
        const dateStr = now.toISOString().split('T')[0];
        const pushId = `agenda-${item.id}-${dateStr}`;

        // Verificaciones básicas de fecha
        if (item.start_date && new Date(item.start_date) > now) continue;
        if (item.end_date && new Date(item.end_date) < now) continue;

        // Verificación de días de la semana si aplica
        if (item.frequency === 'custom' && item.days_of_week) {
          if (!item.days_of_week.includes(currentDay)) continue;
        }

        // Programar Notificación Local si no está vencida y tiene hora
        if (item.time) {
          const [h, m] = item.time.split(':').map(Number);
          const exerciseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
          
          if (exerciseDate > now) {
            // Aún no ha pasado, programar localmente
            await Notifications.scheduleNotificationAsync({
              identifier: pushId,
              content: {
                title: 'Recordatorio CresiMotion',
                body: item.custom_title || item.titulo || 'Es hora de tu ejercicio programado.',
                data: { tipo: 'agenda', id: pushId },
              },
              trigger: { date: exerciseDate },
            });
          } else {
             // Si ya pasó la hora, lo añadimos al storage local como notificación si no existe
             await addNotification({
                id: pushId,
                titulo: 'Recordatorio CresiMotion',
                mensaje: item.custom_title || item.titulo || 'Tenías un ejercicio programado hoy.',
                tipo: 'agenda',
             });
          }
        } else {
           // Si no tiene hora específica pero le toca hoy
           await addNotification({
              id: pushId,
              titulo: 'Recordatorio CresiMotion',
              mensaje: item.custom_title || item.titulo || 'Recuerda hacer tu ejercicio de hoy.',
              tipo: 'agenda',
           });
        }
      }
    } catch (e) {
      console.log('Error syncing agenda notifications:', e);
    }
  }, []);

  useEffect(() => {
    syncAgendaNotifications();
  }, [syncAgendaNotifications]);

  return { syncAgendaNotifications };
};
