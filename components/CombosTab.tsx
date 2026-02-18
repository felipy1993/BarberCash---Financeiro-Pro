import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  User as UserIcon, 
  Calendar, 
  Scissors, 
  CheckCircle2,
  Clock,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Combo } from '../types';

interface CombosTabProps {
  combos: Combo[];
  onSave: (combo: Combo) => void;
  onDelete: (id: string) => void;
  onUseCut: (id: string) => void;
}

export const CombosTab: React.FC<CombosTabProps> = ({ combos, onSave, onDelete, onUseCut }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    comboName: '',
    totalCuts: 4,
    price: ''
  });

  const filteredCombos = combos.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.status === 'FINALIZADO' ? 1 : -1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCombo: Combo = {
      id: Math.random().toString(36).substring(2, 11),
      clientName: formData.clientName.toUpperCase(),
      comboName: formData.comboName.toUpperCase(),
      totalCuts: Number(formData.totalCuts),
      usedCuts: 0,
      price: Number(formData.price) || 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      history: [],
      status: 'ATIVO'
    };
    onSave(newCombo);
    setIsModalOpen(false);
    setFormData({ clientName: '', comboName: '', totalCuts: 4, price: '' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GESTÃO DE COMBOS</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 text-white p-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-sky-500"
        >
          <UserPlus size={16} />
          <span className="text-[9px] font-black uppercase">NOVO COMBO</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
        <input 
          type="text" 
          placeholder="BUSCAR CLIENTE..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full bg-slate-900 border border-slate-800 rounded-[24px] py-5 pl-14 pr-6 text-sm text-white outline-none focus:border-sky-500 font-bold transition-all" 
        />
      </div>

      <div className="space-y-4">
        {filteredCombos.length > 0 ? filteredCombos.map((combo) => (
          <div key={combo.id} className={`bg-slate-900/40 border ${combo.status === 'FINALIZADO' ? 'border-slate-800/30 opacity-60' : 'border-slate-800/60'} p-6 rounded-[32px] space-y-4`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${combo.status === 'FINALIZADO' ? 'bg-slate-800 text-slate-500' : 'bg-sky-500/10 text-sky-500'}`}>
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase">{combo.clientName}</h3>
                  <p className="text-[10px] font-black text-sky-500 uppercase">{combo.comboName}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase mt-1">
                    {combo.purchaseDate.split('-').reverse().join('/')} • VALOR: R$ {combo.price?.toFixed(2) || '0,00'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onDelete(combo.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className="text-slate-500">PROGRESSO DO COMBO</span>
                <span className={combo.status === 'FINALIZADO' ? 'text-rose-400' : 'text-emerald-400'}>
                  {combo.usedCuts} / {combo.totalCuts} CORTES
                </span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full p-0.5 border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${combo.status === 'FINALIZADO' ? 'bg-slate-600' : 'bg-emerald-500'}`} 
                  style={{ width: `${(combo.usedCuts / combo.totalCuts) * 100}%` }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">RESTANTES</p>
                <p className="text-lg font-black text-white">{combo.totalCuts - combo.usedCuts}</p>
              </div>
              <button 
                onClick={() => onUseCut(combo.id)}
                disabled={combo.status === 'FINALIZADO'}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  combo.status === 'FINALIZADO' 
                  ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                }`}
              >
                <Scissors size={18} />
                <span className="text-[10px] font-black uppercase">USAR CORTE</span>
              </button>
            </div>

            {combo.history.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-3 px-1">ÚLTIMOS USOS</p>
                <div className="space-y-2">
                  {combo.history.slice(-3).reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[9px] font-bold text-slate-400 bg-slate-950/30 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock size={10} className="text-slate-600" />
                        <span>{h.date.split('-').reverse().join('/')}</span>
                      </div>
                      <span className="uppercase text-slate-500">{h.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
            <Clock size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest">NENHUM COMBO ATIVO</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-sm rounded-[40px] p-8 border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">VENDER COMBO</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400"><Trash2 className="rotate-45" size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4">NOME DO CLIENTE</label>
                <input 
                  autoFocus
                  required 
                  value={formData.clientName} 
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  placeholder="EX: JOÃO SILVA"
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-sky-500 uppercase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4">NOME DO COMBO</label>
                <input 
                  required 
                  value={formData.comboName} 
                  onChange={e => setFormData({...formData, comboName: e.target.value})}
                  placeholder="EX: COMBO MENSAL 4 CORTES"
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-sky-500 uppercase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4">VALOR PAGO (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0,00"
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-emerald-400 outline-none focus:border-sky-500 transition-all" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4">QUANTIDADE DE CORTES</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 5, 10].map(qty => (
                    <button 
                      key={qty}
                      type="button"
                      onClick={() => setFormData({...formData, totalCuts: qty})}
                      className={`py-3 rounded-xl border font-black text-xs transition-all ${formData.totalCuts === qty ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
                <div className="relative pt-2">
                  <input 
                    type="number"
                    min="1"
                    placeholder="OUTRA QUANTIDADE..."
                    value={formData.totalCuts}
                    onChange={e => setFormData({...formData, totalCuts: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-sky-500 transition-all"
                  />
                  <div className="absolute right-4 top-[65%] -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">CORTES</div>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all hover:bg-emerald-500 flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> ATIVAR COMBO AGORA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
