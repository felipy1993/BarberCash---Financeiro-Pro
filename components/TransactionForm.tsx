
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryState, PaymentMethod } from '../types';
import { X, ArrowUpCircle, ArrowDownCircle, Calendar, Tag, PlusCircle } from 'lucide-react';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  onClose: () => void;
  initialData?: Transaction | null;
  categories: CategoryState;
}

const PAYMENT_METHODS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'DÉBITO', 'CRÉDITO', 'OUTRO'];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, initialData, categories }) => {
  const [type, setType] = useState<TransactionType>('INCOME');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDescription(initialData.description.toUpperCase());
      setAmount(initialData.amount.toString());
      setCategory(initialData.category.toUpperCase());
      setPaymentMethod(initialData.paymentMethod || 'DINHEIRO');
      setDate(initialData.date);
    } else {
      setCategory(type === 'INCOME' ? categories.INCOME[0] : categories.EXPENSE[0]);
    }
  }, [initialData, categories, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Forçando conversão para garantir que não haja concatenação de strings futuramente
    const val = Number(parseFloat(amount).toFixed(2));
    
    if (!description || isNaN(val) || val <= 0 || !category) {
        alert('POR FAVOR, INSIRA UM VALOR VÁLIDO E DESCRIÇÃO!');
        return;
    }

    onSave({
      id: initialData?.id,
      description: description.toUpperCase().trim(),
      amount: val,
      type,
      category: category.toUpperCase(),
      paymentMethod,
      date
    });
    onClose();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCategories = newType === 'INCOME' ? categories.INCOME : categories.EXPENSE;
    setCategory(validCategories[0]);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500 border-t border-white/5 overflow-y-auto max-h-[95vh] hide-scrollbar">
        
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{initialData ? 'EDITAR LANÇAMENTO' : 'NOVO LANÇAMENTO'}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">BARBERCASH PRO</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`flex items-center justify-center gap-2 p-5 rounded-[24px] border-2 transition-all active:scale-95 ${
                type === 'INCOME' 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                  : 'border-slate-800 bg-slate-800/20 text-slate-500'
              }`}
            >
              <ArrowUpCircle size={18} className={`transition-transform duration-500 ${type === 'INCOME' ? 'scale-125' : 'scale-100'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">ENTRADA</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`flex items-center justify-center gap-2 p-5 rounded-[24px] border-2 transition-all active:scale-95 ${
                type === 'EXPENSE' 
                  ? 'border-rose-500 bg-rose-500/10 text-rose-400' 
                  : 'border-slate-800 bg-slate-800/20 text-slate-500'
              }`}
            >
              <ArrowDownCircle size={18} className={`transition-transform duration-500 ${type === 'EXPENSE' ? 'scale-125' : 'scale-100'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">SAÍDA</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">DESCRIÇÃO</label>
              <div className="flex items-center bg-slate-800/40 rounded-2xl px-4 border border-slate-700/50 focus-within:border-sky-500 transition-all">
                <input
                  required
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.toUpperCase())}
                  placeholder="EX: CORTE DEGRADÊ"
                  className="w-full bg-transparent p-4 text-sm font-bold text-white outline-none placeholder:text-slate-700 uppercase transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">VALOR R$</label>
                <input
                  required
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-base font-black text-emerald-400 outline-none focus:border-sky-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">CATEGORIA</label>
                <div className="relative">
                   <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-[11px] font-bold text-white outline-none focus:border-sky-500 appearance-none pr-10 uppercase transition-all"
                  >
                    {(type === 'INCOME' ? categories.INCOME : categories.EXPENSE).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 block tracking-widest">PAGAMENTO / ORIGEM</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-xl border text-[9px] font-black transition-all active:scale-90 ${
                        paymentMethod === method 
                          ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10' 
                          : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800/50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
            </div>

            <div className="relative">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">DATA</label>
              <div className="flex items-center bg-slate-800/40 rounded-2xl px-4 border border-slate-700/50 group focus-within:border-sky-500 transition-all">
                <Calendar size={16} className="text-slate-600 transition-transform group-focus-within:scale-110" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent p-4 text-sm font-bold text-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-active:translate-y-0 transition-transform duration-300" />
              <PlusCircle size={24} className="group-active:rotate-90 transition-transform duration-300" />
              <span className="uppercase tracking-[0.2em] text-xs font-black relative z-10">{initialData ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR LANÇAMENTO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};