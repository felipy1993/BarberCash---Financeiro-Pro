
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  User, 
  Scissors, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Save, 
  DollarSign 
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';

interface AgendaTabProps {
  appointments: Appointment[];
  services: Record<string, { price: number }>;
  onSave: (app: Appointment) => void;
  onDelete: (id: string) => void;
  onComplete: (app: Appointment) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS_NAMES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  // Add empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export const AgendaTab: React.FC<AgendaTabProps> = ({ 
  appointments, 
  services, 
  onSave, 
  onDelete, 
  onComplete 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    time: '',
    price: '',
    phone: '',
    notes: ''
  });

  const dailyAppointments = useMemo(() => {
    return appointments.filter(a => a.date === selectedDate);
  }, [appointments, selectedDate]);

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    const newDateStr = date.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setCurrentMonth(date); // Sync calendar view
  };

  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setIsCalendarOpen(false);
  };

  const hasAppointmentOnDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.some(a => a.date === dateStr && a.status !== 'CANCELADO');
  };

  const handleOpenModal = (time?: string, app?: Appointment) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        clientName: app.clientName,
        service: app.service,
        time: app.time,
        price: app.price.toString(),
        phone: app.phone || '',
        notes: app.notes || ''
      });
    } else {
      setEditingApp(null);
      setFormData({
        clientName: '',
        service: Object.keys(services)[0] || '',
        time: time || '09:00',
        price: ((Object.values(services)[0] as any)?.price || 0).toString(),
        phone: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: Appointment = {
      id: editingApp?.id || Math.random().toString(36).substring(2, 11),
      date: selectedDate,
      status: editingApp?.status || 'AGENDADO',
      clientName: formData.clientName.toUpperCase(),
      service: formData.service,
      time: formData.time,
      price: Number(formData.price),
      phone: formData.phone,
      notes: formData.notes
    };
    onSave(newApp);
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-24">
      {/* HEADER DA DATA */}
      {/* HEADER DA DATA */}
      <div className="bg-slate-900 border border-white/5 p-4 rounded-[32px] shadow-lg sticky top-0 z-20 backdrop-blur-xl bg-opacity-95">
        <div className="flex items-center justify-between">
          <button onClick={() => isCalendarOpen ? changeMonth(-1) : handleDateChange(-1)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-all hover:text-white">
            <ChevronLeft size={20} />
          </button>
          
          <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="text-center group active:scale-95 transition-transform">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-sky-500 transition-colors">
              {isCalendarOpen ? 'SELECIONAR DIA' : 'DATA SELECIONADA'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} className="text-sky-500" />
              <span className="text-lg font-black text-white uppercase">
                {isCalendarOpen 
                  ? `${MONTHS_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
                  : new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })
                }
              </span>
            </div>
          </button>

          <button onClick={() => isCalendarOpen ? changeMonth(1) : handleDateChange(1)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-all hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* CALENDÁRIO MENSAL EXPANDÍVEL */}
        {isCalendarOpen && (
          <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-7 gap-1 mb-2">
               {WEEKDAYS.map(d => (
                 <div key={d} className="text-center text-[10px] font-black text-slate-600 py-2">{d}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 gap-2">
               {getDaysInMonth(currentMonth).map((date, i) => {
                 if (!date) return <div key={`empty-${i}`} />;
                 
                 const dateStr = date.toISOString().split('T')[0];
                 const isSelected = dateStr === selectedDate;
                 const isToday = dateStr === new Date().toISOString().split('T')[0];
                 const hasApp = hasAppointmentOnDay(date);

                 return (
                   <button
                     key={dateStr}
                     onClick={() => handleDayClick(date)}
                     className={`
                       h-10 rounded-xl flex items-center justify-center text-xs font-bold relative transition-all active:scale-90
                       ${isSelected 
                         ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30' 
                         : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}
                       ${isToday && !isSelected ? 'border border-sky-500/50 text-sky-500' : ''}
                     `}
                   >
                     {date.getDate()}
                     {hasApp && !isSelected && (
                       <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                     )}
                   </button>
                 );
               })}
             </div>
          </div>
        )}
      </div>

      {/* GRID DE HORÁRIOS */}
      <div className="space-y-3">
        {(() => {
          // Calcula quais horários exibir: padrão (8-20) + horários dos agendamentos do dia
          const standardHours = Array.from({ length: 13 }, (_, i) => i + 8);
          const appointmentHours = dailyAppointments.map(a => parseInt(a.time.split(':')[0]));
          const allHours = Array.from(new Set([...standardHours, ...appointmentHours])).sort((a, b) => a - b);

          return allHours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            // Procura agendamentos dentro desta hora (ex: 09:00, 09:30, 09:45)
            const app = dailyAppointments.find(a => {
              const appHour = parseInt(a.time.split(':')[0]);
              return appHour === hour && a.status !== 'CANCELADO';
            });
            
            return (
              <div key={hour} className="flex gap-4 group">
                <div className="w-16 py-4 flex flex-col items-center justify-start pt-2">
                  <span className="text-sm font-black text-slate-500">{timeStr}</span>
                </div>

                <div className="flex-1 min-h-[80px]">
                  {app ? (
                  <div 
                    onClick={() => handleOpenModal(undefined, app)}
                    className={`
                      w-full p-4 rounded-[24px] border transition-all active:scale-95 cursor-pointer
                      ${app.status === 'CONCLUÍDO' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-black uppercase flex items-center gap-2 ${app.status === 'CONCLUÍDO' ? 'text-emerald-500' : 'text-sky-500'}`}>
                          {app.clientName}
                          {app.status === 'CONCLUÍDO' && <CheckCircle2 size={14} />}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
                          <Scissors size={10} /> {app.service}
                        </p>
                      </div>
                      <span className="font-black text-white">{formatCurrency(app.price)}</span>
                    </div>

                    {app.status === 'AGENDADO' && (
                       <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onComplete(app); }}
                           className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1 shadow-lg active:scale-90 hover:bg-emerald-600 transition-all"
                         >
                           <DollarSign size={12} /> RECEBER / CONCLUIR
                         </button>
                       </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleOpenModal(timeStr)}
                    className="w-full h-full min-h-[80px] rounded-[24px] border-2 border-dashed border-slate-800 flex items-center justify-center gap-2 group-hover:border-slate-700 group-hover:bg-slate-900/50 transition-all active:scale-95"
                  >
                    <Plus size={20} className="text-slate-700 group-hover:text-slate-500" />
                    <span className="text-[10px] font-black text-slate-700 group-hover:text-slate-500 uppercase">AGENDAR</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        )()}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                {editingApp ? 'EDITAR AGENDAMENTO' : 'NOVO AGENDAMENTO'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">CLIENTE</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required 
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    placeholder="NOME DO CLIENTE" 
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-3xl text-sm font-bold text-white outline-none focus:border-sky-500 uppercase transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">HORÁRIO</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="time"
                      required 
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-3xl text-sm font-bold text-white outline-none focus:border-sky-500 transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">VALOR R$</label>
                  <input 
                    type="number"
                    step="0.01"
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-3xl text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">SERVIÇO</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(services).map(([name, config]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({...formData, service: name, price: (config as any).price.toString()})}
                      className={`
                        p-3 rounded-2xl border text-[9px] font-black uppercase transition-all
                        ${formData.service === name 
                          ? 'bg-sky-500 border-sky-500 text-white shadow-lg scale-105' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}
                      `}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {editingApp && (
                  <button 
                    type="button"
                    onClick={() => {
                       if(confirm('CANCELAR AGENDAMENTO?')) {
                         onDelete(editingApp.id);
                         setIsModalOpen(false);
                       }
                    }}
                    className="flex-1 bg-rose-500/10 text-rose-500 font-black py-4 rounded-3xl uppercase text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-rose-500/20 hover:bg-rose-500/20"
                  >
                    <Trash2 size={16} /> CANCELAR
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-[2] bg-sky-600 text-white font-black py-4 rounded-3xl uppercase text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-500"
                >
                  <Save size={16} /> {editingApp ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR AGENDAMENTO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
