import React, { useState, useEffect, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Appointment } from '../types';
import { playNotificationSound } from '../utils/notificationSound';

interface AppointmentNotificationProps {
  appointments: Appointment[];
  onNotificationClick: () => void;
}

export const AppointmentNotification: React.FC<AppointmentNotificationProps> = ({ 
  appointments, 
  onNotificationClick 
}) => {
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Calcular agendamentos próximos (próximos 30 minutos)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return appointments.filter(app => {
      if (app.date !== todayStr || app.status !== 'AGENDADO') return false;

      const [hours, minutes] = app.time.split(':').map(Number);
      const appMinutes = hours * 60 + minutes;
      const diff = appMinutes - currentMinutes;

      // Notificar entre 15 e 30 minutos antes
      return diff > 0 && diff <= 30;
    });
  }, [appointments]);

  // Verificar novos agendamentos e tocar som
  useEffect(() => {
    upcomingAppointments.forEach(app => {
      if (!notifiedIds.has(app.id)) {
        playNotificationSound();
        setNotifiedIds(prev => new Set(prev).add(app.id));
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    });
  }, [upcomingAppointments, notifiedIds]);

  // Limpar IDs notificados quando não há mais agendamentos próximos
  useEffect(() => {
    if (upcomingAppointments.length === 0) {
      setNotifiedIds(new Set());
    }
  }, [upcomingAppointments]);

  const count = upcomingAppointments.length;

  return (
    <button
      onClick={onNotificationClick}
      className={`
        relative p-3 rounded-2xl transition-all
        ${count > 0 
          ? 'bg-sky-500/20 text-sky-500 hover:bg-sky-500/30' 
          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}
        ${isAnimating ? 'animate-bounce' : ''}
      `}
      title={count > 0 ? `${count} agendamento(s) próximo(s)` : 'Sem agendamentos próximos'}
    >
      <Bell size={20} className={isAnimating ? 'animate-pulse' : ''} />
      
      {count > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-[10px] font-black text-white">{count}</span>
        </div>
      )}
    </button>
  );
};
