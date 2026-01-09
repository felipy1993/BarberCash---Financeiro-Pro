
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Force Update
import { 
  testFirebaseConnection,
  syncAllDataToFirebase,
  loadAllDataFromFirebase,
  saveUser,
  saveTransaction,
  saveProduct,
  saveServiceConfig,
  saveCardFees,
  deleteUser as deleteUserFromFirebase,
  deleteProduct as deleteProductFromFirebase,
  deleteTransaction as deleteTransactionFromFirebase,
  subscribeToUsers,
  subscribeToTransactions,
  subscribeToProducts,
  subscribeToServiceConfig,
  subscribeToCardFees,
  saveAppointment,
  deleteAppointment as deleteAppointmentFromFirebase,
  subscribeToAppointments
} from './services/firebase';
import { Transaction, TransactionType, CategoryState, INITIAL_CATEGORIES, Product, PaymentMethod, User, UserRole, Appointment } from './types';
import { TransactionForm, AutocompleteItem } from './components/TransactionForm';
import { AgendaTab } from './components/AgendaTab';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  History, 
  Trash2,
  Search,
  Scissors,
  User as UserIcon,
  Package,
  Settings,
  X,
  Sparkles,
  BarChart3,
  Edit3,
  CheckCircle2,
  LogIn,
  LogOut,
  Users,
  UserPlus,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Check,
  Save,
  ShoppingCart,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp as TrendingUpIcon,
  Percent,
  FileText,
  Printer,
  CalendarDays,
  Download,
  PlusCircle,
  Pencil,
  CreditCard,
  Lock,
  Fingerprint,
  Cloud,
  RefreshCw,
  Maximize2,
  Minimize2,
  Smartphone,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Legend,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const LOGO_URL = "/assets/logo.png?v=2";

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonthStr = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const App: React.FC = () => {
  // --- AUTH STATES ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('barber_users');
    if (!saved) return [{ id: 'admin-1', name: 'ADMINISTRADOR', username: 'admin', password: '123', role: 'ADMIN' }];
    return JSON.parse(saved);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const persistent = localStorage.getItem('barber_session');
    if (persistent) return JSON.parse(persistent);
    const session = sessionStorage.getItem('barber_session');
    return session ? JSON.parse(session) : null;
  });

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isServiceManagementOpen, setIsServiceManagementOpen] = useState(false);
  const [isFeesManagementOpen, setIsFeesManagementOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'USER' as UserRole });

  // --- PASSWORD CHANGE STATE ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({ current: '', new: '', confirm: '' });

  // --- CONFIG TAXAS CARTÃO ---
  const [cardFees, setCardFees] = useState<{ debit: number; credit: number }>(() => {
    const saved = localStorage.getItem('barber_card_fees');
    return saved ? JSON.parse(saved) : { debit: 0, credit: 0 };
  });

  // --- FINANCIAL & PRODUCT STATES ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('barber_transactions');
    return saved ? JSON.parse(saved).map((t: any) => ({ ...t, amount: Number(t.amount) })) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('barber_products');
    return saved ? JSON.parse(saved) : [];
  });



  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('barber_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<CategoryState>(INITIAL_CATEGORIES);

  const [serviceConfig, setServiceConfig] = useState<Record<string, { price: number }>>(() => {
    const saved = localStorage.getItem('barber_service_config');
    return saved ? JSON.parse(saved) : {
        'CORTE DE CABELO': { price: 45 },
        'BARBA': { price: 35 },
        'COMBO': { price: 75 }
    };
  });

  const autocompleteItems = useMemo<AutocompleteItem[]>(() => {
    const items: AutocompleteItem[] = [];

    // Add Services
    Object.entries(serviceConfig).forEach(([name, config]) => {
      let category = 'CORTE DE CABELO';
      if (name.includes('BARBA')) category = 'BARBA';
      else if (name.includes('COMBO')) category = 'COMBO';

      items.push({
        label: name,
        amount: (config as { price: number }).price,
        category,
        type: 'SERVICE'
      });
    });

    // Add Products
    products.forEach(p => {
      items.push({
        label: p.name,
        amount: p.price,
        category: 'PRODUTOS',
        type: 'PRODUCT'
      });
    });

    return items;
  }, [serviceConfig, products]);

  const [monthlyGoal] = useState<number>(5000);

  // --- FILTER STATES ---
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Filtros específicos da aba Caixa
  const [historyStartDate, setHistoryStartDate] = useState<string>(getFirstDayOfMonthStr());
  const [historyEndDate, setHistoryEndDate] = useState<string>(getTodayStr());

  // UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'inventory' | 'reports' | 'agenda'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Estados para Gestão de Serviços
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({ oldName: '', name: '', price: '' });
  const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);

  // Estados temporários para o formulário de produto
  const [prodPurchasePrice, setProdPurchasePrice] = useState<string>('');
  const [prodProfitMargin, setProdProfitMargin] = useState<string>('');
  const [prodPrice, setProdPrice] = useState<string>('');

  // --- FIREBASE SYNC STATES ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('barber_sync_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  // --- PWA & FULLSCREEN STATES ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar:\n\nNo Android: Toque em menu (3 pontos) -> "Adicionar à tela inicial"\n\nNo iPhone: Toque em Compartilhar -> "Adicionar à Tela de Início"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // Sincronização em tempo real (Real-time Listeners)
  useEffect(() => {
    if (!syncEnabled) return;

    console.log('� Iniciando ouvintes em tempo real...');

    const unsubscribeUsers = subscribeToUsers((data) => {
      setUsers(data);
    });

    const unsubscribeTransactions = subscribeToTransactions((data) => {
      setTransactions(data);
    });

    const unsubscribeProducts = subscribeToProducts((data) => {
      setProducts(data);
    });

    const unsubscribeService = subscribeToServiceConfig((data) => {
      setServiceConfig(data);
    });

    const unsubscribeFees = subscribeToCardFees((data) => {
      setCardFees(data);
    });

    const unsubscribeAppointments = subscribeToAppointments((data) => {
      setAppointments(data);
    });

    return () => {
      console.log('🔌 Desconectando ouvintes...');
      unsubscribeUsers();
      unsubscribeTransactions();
      unsubscribeProducts();
      unsubscribeService();
      unsubscribeFees();
      unsubscribeAppointments();
    };
  }, [syncEnabled]);

  useEffect(() => {
    if (editingProduct) {
      setProdPurchasePrice(editingProduct.purchasePrice.toString());
      setProdProfitMargin(editingProduct.profitMargin?.toString() || '');
      setProdPrice(editingProduct.price.toString());
    } else {
      setProdPurchasePrice('');
      setProdProfitMargin('');
      setProdPrice('');
    }
  }, [editingProduct, isProductModalOpen]);

  const updatePriceByMargin = (cost: string, margin: string) => {
    const c = parseFloat(cost);
    const m = parseFloat(margin);
    if (!isNaN(c) && !isNaN(m)) {
      const price = c * (1 + m / 100);
      setProdPrice(price.toFixed(2));
    }
  };

  const updateMarginByPrice = (cost: string, price: string) => {
    const c = parseFloat(cost);
    const p = parseFloat(price);
    if (!isNaN(c) && !isNaN(p) && c > 0) {
      const margin = ((p / c) - 1) * 100;
      setProdProfitMargin(margin.toFixed(0));
    }
  };

  // Salvar no localStorage e Firebase
  useEffect(() => {
    localStorage.setItem('barber_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('barber_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('barber_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('barber_service_config', JSON.stringify(serviceConfig));
  }, [serviceConfig]);

  useEffect(() => {
    localStorage.setItem('barber_card_fees', JSON.stringify(cardFees));
  }, [cardFees]);

  useEffect(() => {
    localStorage.setItem('barber_sync_enabled', JSON.stringify(syncEnabled));
  }, [syncEnabled]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username.toLowerCase() === loginData.username.toLowerCase() && u.password === loginData.password);
    if (foundUser) {
      setCurrentUser(foundUser);
      if (rememberMe) localStorage.setItem('barber_session', JSON.stringify(foundUser));
      else sessionStorage.setItem('barber_session', JSON.stringify(foundUser));
      showToast(`BEM-VINDO, ${foundUser.name}!`);
    } else alert('USUÁRIO OU SENHA INCORRETOS');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('barber_session');
    sessionStorage.removeItem('barber_session');
  };

  const handleSaveTransaction = useCallback((data: Omit<Transaction, 'id'> & { id?: string }) => {
    let amount = Number(data.amount);
    
    // Aplicar taxas de cartão se for uma entrada
    if (data.type === 'INCOME') {
      if (data.paymentMethod === 'DÉBITO' && cardFees.debit > 0) {
        amount = amount * (1 - cardFees.debit / 100);
      } else if (data.paymentMethod === 'CRÉDITO' && cardFees.credit > 0) {
        amount = amount * (1 - cardFees.credit / 100);
      }
    }

    const transactionToSave: Transaction = {
      ...data,
      amount,
      id: data.id || Math.random().toString(36).substring(2, 11)
    };

    if (syncEnabled) {
      saveTransaction(transactionToSave).catch(console.error);
    }

    setTransactions(prev => {
      if (data.id) return prev.map(t => t.id === data.id ? transactionToSave : t);
      return [transactionToSave, ...prev];
    });
    setIsFormOpen(false);
    setEditingTransaction(null);
    showToast('REGISTRO SALVO!');
  }, [cardFees, syncEnabled]);

  const handleDeleteTransaction = (id: string) => {
    if (confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE LANÇAMENTO?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (syncEnabled) {
        deleteTransactionFromFirebase(id).catch(console.error);
      }
      showToast('LANÇAMENTO EXCLUÍDO!');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newProd: Product = {
      id: editingProduct?.id || Math.random().toString(36).substring(2, 9),
      name: (formData.get('name') as string).toUpperCase(),
      category: 'PRODUTOS',
      purchasePrice: Number(prodPurchasePrice) || 0,
      price: Number(prodPrice) || 0,
      stock: Number(formData.get('stock')),
      profitMargin: Number(prodProfitMargin) || 0
    };

    if (syncEnabled) {
      saveProduct(newProd).catch(console.error);
    }

    setProducts(prev => {
      if (editingProduct) return prev.map(p => p.id === editingProduct.id ? newProd : p);
      return [...prev, newProd];
    });
    
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(editingProduct ? 'PRODUTO ATUALIZADO!' : 'PRODUTO SALVO!');
  };

  const handleManualSync = async () => {
    if (!currentUser || !syncEnabled) return;
    
    try {
      setIsSyncing(true);
      showToast('SINCRONIZANDO COM A NUVEM...');
      
      await syncAllDataToFirebase({
        users,
        transactions,
        products,
        serviceConfig,
        cardFees
      });
      
      setLastSyncTime(new Date());
      showToast('SINCRONIZAÇÃO CONCLUÍDA!');
    } catch (error) {
      console.error(error);
      showToast('ERRO NA SINCRONIZAÇÃO');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE PRODUTO?')) {
      const prodToDelete = products.find(p => p.id === id);
      setProducts(prev => prev.filter(p => p.id !== id));
      
      if (syncEnabled && prodToDelete) {
        deleteProductFromFirebase(id).catch(console.error);
      }
      
      showToast('PRODUTO EXCLUÍDO!');
    }
  };

  const handleSellProduct = (product: Product) => {
    if (product.stock <= 0) return alert('ESTOQUE ESGOTADO!');
    
    const updatedProduct = { ...product, stock: product.stock - 1 };
    
    if (syncEnabled) {
      saveProduct(updatedProduct).catch(console.error);
    }
    
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    handleSaveTransaction({
      description: product.name,
      amount: product.price,
      type: 'INCOME',
      category: 'PRODUTOS',
      paymentMethod: 'PIX',
      date: getTodayStr()
    });
    showToast('VENDA REALIZADA!');
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.price) return;
    
    const newConfig = { ...serviceConfig };
    if (serviceFormData.oldName && serviceFormData.oldName !== serviceFormData.name) {
      delete newConfig[serviceFormData.oldName];
    }
    newConfig[serviceFormData.name.toUpperCase()] = { price: Number(serviceFormData.price) };

    if (syncEnabled) {
      saveServiceConfig(newConfig).catch(console.error);
    }

    setServiceConfig(newConfig);
    
    setIsServiceFormOpen(false);
    setServiceFormData({ oldName: '', name: '', price: '' });
    showToast('SERVIÇO ATUALIZADO!');
  };

  const handleDeleteService = (name: string) => {
    if (confirm(`DESEJA EXCLUIR O SERVIÇO "${name}"?`)) {
      const next = { ...serviceConfig };
      delete next[name];
      if (syncEnabled) {
        saveServiceConfig(next).catch(console.error);
      }
      setServiceConfig(next);
      showToast('SERVIÇO EXCLUÍDO!');
    }
  };

  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncEnabled) {
      saveCardFees(cardFees).catch(console.error);
    }
    setIsFeesManagementOpen(false);
    showToast('TAXAS ATUALIZADAS!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert('POR FAVOR, PREENCHA TODOS OS CAMPOS!');
      return;
    }
    const user: User = {
      id: Math.random().toString(36).substring(2, 11),
      name: newUser.name.toUpperCase(),
      username: newUser.username.toLowerCase(),
      password: newUser.password,
      role: newUser.role
    };
    
    if (syncEnabled) {
      saveUser(user).catch(console.error);
    }

    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', username: '', password: '', role: 'USER' });
    showToast('USUÁRIO CADASTRADO!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('TEM CERTEZA QUE DESEJA REMOVER ESTE FUNCIONÁRIO?')) {
      setUsers(prev => prev.filter(usr => usr.id !== userId));
      if (syncEnabled) {
        deleteUserFromFirebase(userId).catch(console.error);
      }
      showToast('USUÁRIO REMOVIDO!');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (newPasswordData.current !== currentUser.password) {
      alert('SENHA ATUAL INCORRETA!');
      return;
    }
    if (newPasswordData.new !== newPasswordData.confirm) {
      alert('AS SENHAS NÃO CONFEREM!');
      return;
    }
    if (newPasswordData.new.length < 3) {
      alert('SENHA MUITO CURTA! MÍNIMO 3 CARACTERES.');
      return;
    }

    // Atualiza a lista de usuários
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPasswordData.new } : u);
    setUsers(updatedUsers);
    
    // Atualiza o usuário atual
    const updatedUser = { ...currentUser, password: newPasswordData.new };
    setCurrentUser(updatedUser);
    
    // Atualiza ambos os storages para garantir que a sessão seja mantida
    localStorage.setItem('barber_session', JSON.stringify(updatedUser));
    sessionStorage.setItem('barber_session', JSON.stringify(updatedUser));

    if (syncEnabled) {
      saveUser(updatedUser).catch(console.error);
    }

    setIsPasswordModalOpen(false);
    setNewPasswordData({ current: '', new: '', confirm: '' });
    showToast('SENHA ATUALIZADA COM SUCESSO!');
  };

  // --- AGENDA HANDLERS ---
  const handleSaveAppointment = (app: Appointment) => {
    if (syncEnabled) {
      saveAppointment(app).catch(console.error);
    }
    setAppointments(prev => {
      const exists = prev.find(a => a.id === app.id);
      if (exists) return prev.map(a => a.id === app.id ? app : a);
      return [...prev, app];
    });
    showToast('AGENDAMENTO SALVO!');
  };

  const handleDeleteAppointment = (id: string) => {
    if (syncEnabled) {
      deleteAppointmentFromFirebase(id).catch(console.error);
    }
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('AGENDAMENTO CANCELADO!');
  };

  const handleCompleteAppointment = (app: Appointment) => {
    // 1. Marcar como concluído
    const completedApp = { ...app, status: 'CONCLUÍDO' as const };
    handleSaveAppointment(completedApp);

    // 2. Lançar no financeiro
    handleSaveTransaction({
      description: app.service,
      amount: app.price,
      type: 'INCOME',
      category: 'CORTE DE CABELO', // Poderia mapear pelo serviço
      paymentMethod: 'DINHEIRO', // Default, depois o user pode editar no caixa se quiser
      date: app.date
    });
    
    showToast('SERVIÇO CONCLUÍDO E LANÇADO NO CAIXA!');
  };

  // --- ANALYTICS CALCULATIONS ---
  const summary = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amt = Number(t.amount);
      const tDate = new Date(t.date + 'T12:00:00');
      const isSelectedMonth = tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
      
      if (t.type === 'INCOME') {
        acc.totalIncome += amt;
        if (isSelectedMonth) acc.monthIncome += amt;
      } else {
        acc.totalExpense += amt;
        if (isSelectedMonth) acc.monthExpense += amt;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0, monthIncome: 0, monthExpense: 0 });
  }, [transactions, selectedMonth, selectedYear]);

  const monthAnalytics = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && t.type === 'INCOME';
    });

    const services: Record<string, number> = {};
    const items: Record<string, number> = {};

    monthTransactions.forEach(t => {
      const desc = t.description.toUpperCase();
      if (t.category === 'PRODUTOS') {
        items[desc] = (items[desc] || 0) + 1;
      } else {
        services[desc] = (services[desc] || 0) + 1;
      }
    });

    const topServices = Object.entries(services)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const topProducts = Object.entries(items)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return { topServices, topProducts };
  }, [transactions, selectedMonth, selectedYear]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toUpperCase().includes(searchQuery.toUpperCase());
      const matchesDateRange = t.date >= historyStartDate && t.date <= historyEndDate;
      return matchesSearch && matchesDateRange;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchQuery, historyStartDate, historyEndDate]);

  const historyAnalytics = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  // --- PDF EXPORTS ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const monthName = MONTHS[selectedMonth].toUpperCase();
    const year = selectedYear;

    doc.setFillColor(2, 6, 23); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('BARBERCASH', 15, 25);
    doc.setTextColor(14, 165, 233); doc.setFontSize(10); doc.text(`RELATÓRIO DE PERFORMANCE - ${monthName} / ${year}`, 15, 33);
    doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.text('RESUMO DO PERÍODO', 15, 55);

    const summaryData = [
      ['ENTRADAS', `R$ ${summary.monthIncome.toFixed(2)}`],
      ['SAÍDAS', `R$ ${summary.monthExpense.toFixed(2)}`],
      ['SALDO LÍQUIDO', `R$ ${(summary.monthIncome - summary.monthExpense).toFixed(2)}`],
    ];

    (doc as any).autoTable({
      startY: 60,
      head: [['CATEGORIA', 'VALOR']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    doc.text('SERVIÇOS MAIS REALIZADOS', 15, (doc as any).lastAutoTable.finalY + 15);
    const servicesData = monthAnalytics.topServices.map(s => [s.name, s.count.toString()]);
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['SERVIÇO', 'QUANTIDADE']],
      body: servicesData.length > 0 ? servicesData : [['SEM DADOS', '0']],
      theme: 'striped', headStyles: { fillColor: [51, 65, 85] }
    });

    doc.text('PRODUTOS MAIS VENDIDOS', 15, (doc as any).lastAutoTable.finalY + 15);
    const productsData = monthAnalytics.topProducts.map(p => [p.name, p.count.toString()]);
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['PRODUTO', 'QUANTIDADE']],
      body: productsData.length > 0 ? productsData : [['SEM DADOS', '0']],
      theme: 'striped', headStyles: { fillColor: [249, 115, 22] }
    });

    doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} - BarberCash Pro`, 15, 285);
    doc.save(`Relatorio_BarberCash_${monthName}_${year}.pdf`);
    showToast('PDF GERADO COM SUCESSO!');
  };

  const handleExportHistoryPDF = () => {
    const doc = new jsPDF();
    const startFmt = historyStartDate.split('-').reverse().join('/');
    const endFmt = historyEndDate.split('-').reverse().join('/');

    doc.setFillColor(2, 6, 23); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('BARBERCASH', 15, 25);
    doc.setTextColor(14, 165, 233); doc.setFontSize(10); doc.text(`FLUXO DE CAIXA: ${startFmt} ATÉ ${endFmt}`, 15, 33);
    
    const tableData = filteredTransactions.map(t => [
      t.date.split('-').reverse().join('/'),
      t.description,
      t.category,
      t.paymentMethod,
      t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA',
      `R$ ${t.amount.toFixed(2)}`
    ]);

    const totalIn = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    (doc as any).autoTable({
      startY: 50,
      head: [['DATA', 'DESCRIÇÃO', 'CATEGORIA', 'PAG.', 'TIPO', 'VALOR']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.text(`TOTAL ENTRADAS: R$ ${totalIn.toFixed(2)}`, 15, finalY);
    doc.text(`TOTAL SAÍDAS: R$ ${totalOut.toFixed(2)}`, 15, finalY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`SALDO NO PERÍODO: R$ ${(totalIn - totalOut).toFixed(2)}`, 15, finalY + 14);

    doc.save(`Fluxo_Caixa_BarberCash_${historyStartDate}_a_${historyEndDate}.pdf`);
    showToast('FLUXO DE CAIXA EXPORTADO!');
  };

  // --- UI COMPONENTS ---
  if (!currentUser) {
    return (
      <div className="fixed inset-0 h-[100dvh] mesh-bg flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Background Accents - Optimized for non-overflow */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-4 sm:space-y-8 animate-in fade-in zoom-in duration-700 relative z-10 max-h-full">
          <div className="text-center space-y-2">
             {/* Logo limpa e centralizada sem o contorno azul claro */}
             <div className="w-28 h-28 sm:w-48 sm:h-48 mx-auto flex items-center justify-center overflow-hidden">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
               <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
                 BARBER<span className="text-sky-400 bg-clip-text">CASH</span>
               </h1>
               <div className="h-1 w-10 bg-sky-500 mx-auto mt-2 rounded-full opacity-50" />
               <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">SISTEMA FINANCEIRO</p>
             </div>
          </div>

          <form onSubmit={handleLogin} className="glass-card w-full p-6 sm:p-8 rounded-[36px] sm:rounded-[48px] shadow-2xl space-y-4 relative overflow-hidden">
             <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-black text-white">BEM-VINDO!</h2>
                <p className="text-[10px] text-slate-400 font-medium">Faça login para gerenciar o caixa.</p>
             </div>

             <div className="space-y-3">
               <div>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input type="text" placeholder="USUÁRIO" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/50 p-3.5 pl-12 rounded-2xl text-xs sm:text-sm font-bold text-white outline-none focus:border-sky-500 focus:bg-slate-950 transition-all placeholder:text-slate-600" />
                  </div>
               </div>
               
               <div>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} placeholder="SENHA" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800/50 p-3.5 pl-12 rounded-2xl text-xs sm:text-sm font-bold text-white outline-none focus:border-sky-500 focus:bg-slate-950 transition-all placeholder:text-slate-600" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
               </div>
             </div>

             <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-sky-500 border-sky-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                   {rememberMe && <Check size={10} className="text-white" />}
                 </div>
                 <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                 <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase">LEMBRAR-ME</span>
               </label>
             </div>

             <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group">
               <span className="uppercase text-[10px] sm:text-xs tracking-widest">ENTRAR NO SISTEMA</span>
               <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </form>

          <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] opacity-50">
            BARBERCASH PRO • v2.5.0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 max-w-lg mx-auto bg-slate-950 flex flex-col font-sans overflow-x-hidden">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top duration-300">
          <div className="bg-sky-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
          </div>
        </div>
      )}

      <header className="px-6 pt-10 pb-4 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-40 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              <Scissors size={20} className="text-white hidden" />
           </div>
           <div>
             <h1 className="text-lg font-black text-white uppercase leading-none">BARBER<span className="text-sky-500">CASH</span></h1>
             <p className="text-[8px] font-black text-slate-500 uppercase mt-1 flex items-center gap-1">{currentUser.role === 'ADMIN' && <ShieldCheck size={8} className="text-emerald-500" />}{currentUser.name}</p>
           </div>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-slate-400 active:scale-90 transition-all hover:bg-slate-800"><Settings size={20} /></button>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto hide-scrollbar">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] border border-white/5 text-white shadow-2xl">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SALDO ATUAL</p>
               <h2 className="text-4xl font-black tracking-tighter mb-8">{summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
               <div className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase"><span>META MENSAL</span><span>{Math.round((summary.monthIncome / monthlyGoal) * 100)}%</span></div>
                 <div className="h-3 w-full bg-slate-950/80 rounded-full p-0.5 border border-white/5">
                   <div className="h-full bg-sky-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((summary.monthIncome / monthlyGoal) * 100, 100)}%` }} />
                 </div>
               </div>
            </div>

            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LANÇAMENTO RÁPIDO</h3>
                <button 
                  onClick={() => setIsEditingShortcuts(!isEditingShortcuts)} 
                  className={`p-1.5 rounded-lg transition-colors ${isEditingShortcuts ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-500'}`}
                >
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(serviceConfig) as [string, { price: number }][]).map(([cat, config]) => (
                  <div key={cat} className="relative group">
                    <button onClick={() => {
                      if (!isEditingShortcuts) {
                        handleSaveTransaction({ description: cat, amount: config.price, type: 'INCOME', category: cat, paymentMethod: 'PIX', date: getTodayStr() });
                      }
                    }} className={`w-full bg-slate-900 border border-slate-800 p-4 rounded-[32px] flex flex-col items-center gap-2 active:scale-90 transition-all hover:bg-slate-800 ${isEditingShortcuts ? 'opacity-70 cursor-default' : ''}`}>
                      <div className="w-10 h-10 bg-slate-950 rounded-2xl text-sky-500 transition-colors overflow-hidden border border-white/5 flex items-center justify-center p-0.5">
                         <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase text-center truncate w-full">{cat}</span>
                      <span className="text-[10px] font-black text-white">R$ {config.price}</span>
                    </button>
                    {isEditingShortcuts && (
                      <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10 animate-in zoom-in">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteService(cat); }}
                          className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg active:scale-75 transition-transform"
                        >
                          <Trash2 size={10} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setServiceFormData({ oldName: cat, name: cat, price: config.price.toString() }); setIsServiceFormOpen(true); }}
                          className="bg-sky-500 text-white p-1.5 rounded-full shadow-lg active:scale-75 transition-transform"
                        >
                          <Pencil size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isEditingShortcuts && (
                  <button 
                    onClick={() => { setServiceFormData({ oldName: '', name: '', price: '' }); setIsServiceFormOpen(true); }}
                    className="bg-emerald-500/10 border border-emerald-500/20 border-dashed p-4 rounded-[32px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-all hover:bg-emerald-500/20"
                  >
                    <Plus size={20} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase">NOVO</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FLUXO DE CAIXA</h2>
                 <div className="flex items-center gap-2">
                   <button onClick={handleExportHistoryPDF} className="bg-sky-600/20 text-sky-500 p-2 rounded-lg border border-sky-500/30 active:scale-90 transition-all hover:bg-sky-600/30">
                     <Printer size={16} />
                   </button>
                   <button onClick={handleExportHistoryPDF} className="bg-emerald-500/20 text-emerald-500 p-2 rounded-lg border border-emerald-500/30 active:scale-90 transition-all hover:bg-emerald-500/30">
                     <Download size={16} />
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase ml-3">DATA INICIAL</label>
                    <input 
                      type="date" 
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-[10px] font-black text-white outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase ml-3">DATA FINAL</label>
                    <input 
                      type="date" 
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-[10px] font-black text-white outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
               </div>

               <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input type="text" placeholder="BUSCAR NA LISTA..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-[24px] py-5 pl-14 pr-6 text-sm text-white outline-none focus:border-sky-500 font-bold transition-all" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[28px] shadow-lg">
                   <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">ENTRADAS</p>
                   <p className="text-lg font-black text-white">R$ {historyAnalytics.income.toFixed(2)}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[28px] shadow-lg">
                   <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">SAÍDAS</p>
                   <p className="text-lg font-black text-white">R$ {historyAnalytics.expense.toFixed(2)}</p>
                </div>
                <div className="col-span-2 bg-slate-800/50 border border-white/5 p-5 rounded-[28px] flex items-center justify-between shadow-lg">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RESULTADO</p>
                   <div className={`text-lg font-black ${historyAnalytics.income - historyAnalytics.expense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      R$ {(historyAnalytics.income - historyAnalytics.expense).toFixed(2)}
                   </div>
                </div>
             </div>

             <div className="space-y-3 pb-24">
              {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                <div key={t.id} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[32px] flex items-center justify-between group transition-all hover:bg-slate-900/60">
                  <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <div className={`p-3.5 rounded-2xl ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-100 text-sm uppercase truncate">{t.description}</p>
                      <p className="text-[9px] text-slate-500 font-black mt-1 uppercase truncate">{t.date.split('-').reverse().join('/')} • {t.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-black text-base flex-shrink-0 ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}</p>
                      <p className="text-[8px] font-black text-slate-700 uppercase mt-1">{t.paymentMethod}</p>
                    </div>
                    
                      <div className="flex flex-col gap-2 pl-3 border-l border-slate-800 ml-2">
                        <button 
                          onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }}
                          className="p-2 text-slate-500 hover:text-sky-500 active:scale-75 transition-all bg-slate-950 rounded-xl"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-2 text-slate-500 hover:text-rose-500 active:scale-75 transition-all bg-slate-950 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <History size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest">NADA NESTE PERÍODO</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <AgendaTab 
            appointments={appointments}
            services={serviceConfig}
            onSave={handleSaveAppointment}
            onDelete={handleDeleteAppointment}
            onComplete={handleCompleteAppointment}
          />
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CONTROLE DE ESTOQUE</h2>
              <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-sky-600 text-white p-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-sky-500"><Plus size={16} /><span className="text-[9px] font-black uppercase">NOVO ITEM</span></button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pb-20">
              {products.length > 0 ? products.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] flex flex-col gap-4 transition-all hover:bg-slate-900/80">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-slate-950 rounded-2xl text-sky-500"><Package size={20} /></div>
                         <div>
                            <p className="font-black text-sm text-white uppercase">{p.name}</p>
                            <p className={`text-[9px] font-black uppercase flex items-center gap-1 ${p.stock < 5 ? 'text-rose-500' : 'text-slate-500'}`}>
                              {p.stock < 5 && <AlertTriangle size={8} />}
                              ESTOQUE: {p.stock} UNID.
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-emerald-400">R$ {p.price.toFixed(2)}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button onClick={() => handleSellProduct(p)} className="flex-1 bg-emerald-500/10 text-emerald-500 py-3 rounded-xl text-[9px] font-black uppercase border border-emerald-500/20 active:scale-90 transition-all flex items-center justify-center gap-1 hover:bg-emerald-500/20">
                        <ShoppingCart size={12} /> VENDER
                      </button>
                      <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-sky-500 active:scale-90 transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-rose-500 active:scale-90 transition-all">
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <Package size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest">ESTOQUE VAZIO</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-20">
            <div className="flex flex-col gap-6 px-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ANÁLISE DE PERFORMANCE</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportPDF} className="bg-sky-600/20 text-sky-500 p-2 rounded-lg border border-sky-500/30 active:scale-90 transition-all hover:bg-sky-600/30">
                    <Printer size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="relative">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-[10px] font-black text-white outline-none appearance-none pr-10 uppercase focus:border-sky-500 transition-colors"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                 </div>
                 <div className="relative">
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-[10px] font-black text-white outline-none appearance-none pr-10 uppercase focus:border-sky-500 transition-colors"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <TrendingUpIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                 </div>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-white/5 p-6 rounded-[40px] relative shadow-lg" style={{ minHeight: '260px', height: '260px' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'ENTRADAS', value: summary.monthIncome, fill: '#10b981' },
                        { name: 'SAÍDAS', value: summary.monthExpense, fill: '#f43f5e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {[
                        { name: 'ENTRADAS', value: summary.monthIncome, fill: '#10b981' },
                        { name: 'SAÍDAS', value: summary.monthExpense, fill: '#f43f5e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '10px'}} />
                  </PieChart>
               </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6 shadow-lg transition-all hover:bg-slate-900/80">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg"><Award size={18} /></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">SERVIÇOS EM ALTA</h3>
                  </div>
                  <TrendingUpIcon size={16} className="text-emerald-500" />
               </div>
               <div className="space-y-4">
                  {monthAnalytics.topServices.length > 0 ? monthAnalytics.topServices.map((item, i) => (
                    <div key={item.name} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-slate-400">{i + 1}. {item.name}</span>
                          <span className="text-white">{item.count} VEZES</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${(item.count / (monthAnalytics.topServices[0]?.count || 1)) * 100}%` }} />
                       </div>
                    </div>
                  )) : (
                    <p className="text-[9px] font-bold text-slate-600 uppercase text-center py-4">SEM REGISTROS NO PERÍODO</p>
                  )}
               </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6 shadow-lg transition-all hover:bg-slate-900/80">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><ShoppingCart size={18} /></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">PRODUTOS VENDIDOS</h3>
                  </div>
                  <ChevronRight size={16} className="text-slate-700" />
               </div>
               <div className="space-y-4">
                  {monthAnalytics.topProducts.length > 0 ? monthAnalytics.topProducts.map((item, i) => (
                    <div key={item.name} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-slate-400">{i + 1}. {item.name}</span>
                          <span className="text-white">{item.count} UNID.</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${(item.count / (monthAnalytics.topProducts[0]?.count || 1)) * 100}%` }} />
                       </div>
                    </div>
                  )) : (
                    <p className="text-[9px] font-bold text-slate-600 uppercase text-center py-4">SEM VENDAS NO PERÍODO</p>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] shadow-lg transition-all active:scale-95">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">FATURAMENTO</p>
                  <p className="text-xl font-black text-white">R$ {summary.monthIncome.toFixed(0)}</p>
               </div>
               <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[32px] shadow-lg transition-all active:scale-95">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">DESPESAS</p>
                  <p className="text-xl font-black text-white">R$ {summary.monthExpense.toFixed(0)}</p>
               </div>
            </div>

            <button onClick={handleExportPDF} className="w-full bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl hover:bg-slate-800 hover:text-white">
              <FileText size={18} /> EXPORTAR RELATÓRIO PDF
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-10 pt-4 z-50 flex justify-around items-center px-6 h-28 max-w-lg mx-auto rounded-t-[40px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { id: 'dashboard', label: 'INÍCIO', icon: Wallet },
          { id: 'agenda', label: 'AGENDA', icon: Calendar },
          { id: 'history', label: 'CAIXA', icon: History },
          { id: 'reports', label: 'DADOS', icon: BarChart3 },
          { id: 'inventory', label: 'ESTOQUE', icon: Package }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-2 flex-1 transition-all ${activeTab === item.id ? 'text-sky-500 scale-110' : 'text-slate-600 opacity-60 hover:opacity-100'}`}>
            <item.icon size={22} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {(activeTab === 'dashboard' || activeTab === 'history') && !isFormOpen && (
        <button onClick={() => setIsFormOpen(true)} className="fixed bottom-32 right-6 w-16 h-16 bg-sky-600 text-white rounded-[24px] shadow-2xl flex items-center justify-center active:scale-90 z-50 ring-8 ring-slate-950 fab-animate hover:bg-sky-500 transition-all"><Plus size={36} strokeWidth={3} /></button>
      )}

      {isFormOpen && (
        <TransactionForm 
          onSave={handleSaveTransaction} 
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
          categories={categories} 
          initialData={editingTransaction} 
          autocompleteItems={autocompleteItems}
        />
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 animate-in fade-in backdrop-blur-sm">
           <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-white uppercase">{editingProduct ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h2>
                 <button onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }} className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">NOME DO PRODUTO</label>
                    <input name="name" defaultValue={editingProduct?.name || ''} placeholder="EX: POMADA MODELADORA" required className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-white outline-none focus:border-sky-500 uppercase transition-all" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">CUSTO R$</label>
                       <input 
                         name="purchasePrice" 
                         type="number" 
                         step="0.01" 
                         value={prodPurchasePrice} 
                         onChange={(e) => {
                           const val = e.target.value;
                           setProdPurchasePrice(val);
                           if (prodProfitMargin) updatePriceByMargin(val, prodProfitMargin);
                         }} 
                         placeholder="0,00" 
                         required 
                         className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-rose-400 outline-none focus:border-sky-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">MARGEM (%)</label>
                       <div className="relative">
                          <input 
                            name="profitMargin" 
                            type="number" 
                            value={prodProfitMargin} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setProdProfitMargin(val);
                              updatePriceByMargin(prodPurchasePrice, val);
                            }} 
                            placeholder="%" 
                            className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-sky-400 outline-none focus:border-sky-500 pr-12 transition-all" 
                          />
                          <Percent size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">PREÇO VENDA R$</label>
                       <input 
                         name="price" 
                         type="number" 
                         step="0.01" 
                         value={prodPrice} 
                         onChange={(e) => {
                           const val = e.target.value;
                           setProdPrice(val);
                           updateMarginByPrice(prodPurchasePrice, val);
                         }} 
                         placeholder="0,00" 
                         required 
                         className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-emerald-400 outline-none focus:border-sky-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">ESTOQUE QTD</label>
                       <input name="stock" type="number" defaultValue={editingProduct?.stock || ''} placeholder="0" required className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-white outline-none focus:border-sky-500 transition-all" />
                    </div>
                 </div>
                 
                 <button type="submit" className="w-full bg-sky-600 text-white font-black py-6 rounded-[32px] uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 active:scale-95 transition-all hover:bg-sky-500">
                   <Save size={18} /> {editingProduct ? 'ATUALIZAR PRODUTO' : 'CADASTRAR PRODUTO'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">SISTEMA</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <button onClick={() => setIsUserManagementOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-3xl flex items-center gap-4 transition-all shadow-md active:scale-95">
                <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl transition-all group-active:scale-110"><Users size={24} /></div>
                <div className="text-left"><p className="font-black text-sm uppercase">{currentUser.role === 'ADMIN' ? 'GERENCIAR EQUIPE' : 'EQUIPE & MEU ACESSO'}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{currentUser.role === 'ADMIN' ? 'Cadastrar e remover funcionários' : 'Ver equipe e trocar senha'}</p></div>
              </button>

              <button onClick={() => setIsServiceManagementOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-3xl flex items-center gap-4 transition-all shadow-md active:scale-95">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl transition-all group-active:scale-110"><Scissors size={24} /></div>
                <div className="text-left"><p className="font-black text-sm uppercase">GERENCIAR SERVIÇOS</p><p className="text-[10px] text-slate-500 font-bold uppercase">Personalizar atalhos do dashboard</p></div>
              </button>

              <button onClick={() => setIsFeesManagementOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-3xl flex items-center gap-4 transition-all shadow-md active:scale-95">
                <div className="p-3 bg-sky-600/10 text-sky-600 rounded-2xl transition-all group-active:scale-110"><CreditCard size={24} /></div>
                <div className="text-left"><p className="font-black text-sm uppercase">TAXAS DE CARTÃO</p><p className="text-[10px] text-slate-500 font-bold uppercase">Configurar descontos de maquininha</p></div>
              </button>

              <button onClick={() => { setIsSettingsOpen(false); setIsPasswordModalOpen(true); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-3xl flex items-center gap-4 transition-all shadow-md active:scale-95">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl transition-all group-active:scale-110"><Lock size={24} /></div>
                <div className="text-left"><p className="font-black text-sm uppercase">ALTERAR SENHA</p><p className="text-[10px] text-slate-500 font-bold uppercase">Trocar minha senha de acesso</p></div>
              </button>

              <div className="p-6 bg-slate-950 rounded-[32px] border border-white/5 space-y-4 shadow-inner">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">APLICATIVO</p>
                 
                 <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                       {isFullscreen ? <Minimize2 size={18} className="text-sky-500" /> : <Maximize2 size={18} className="text-slate-600" />}
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">TELA CHEIA</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase">{isFullscreen ? 'Modo Imersivo Ativo' : 'Modo Janela'}</p>
                       </div>
                    </div>
                    <button 
                      onClick={toggleFullscreen} 
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${isFullscreen ? 'bg-sky-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isFullscreen ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <button 
                   onClick={handleInstallClick}
                   disabled={!deferredPrompt}
                   className={`w-full bg-slate-900 border border-slate-800 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${!deferredPrompt ? 'text-slate-600 opacity-50 cursor-not-allowed' : 'text-emerald-500 hover:bg-slate-800'}`}
                 >
                    <Smartphone size={14} /> 
                    {deferredPrompt ? 'INSTALAR NO CELULAR / PC' : 'JÁ INSTALADO / NAVEGADOR'}
                 </button>
              </div>

              <div className="p-6 bg-slate-950 rounded-[32px] border border-white/5 space-y-4 shadow-inner">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NUVEM & SINCRONIZAÇÃO</p>
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${syncEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase">{syncEnabled ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                       <Cloud size={18} className={syncEnabled ? "text-sky-500" : "text-slate-600"} />
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">SYNC AUTOMÁTICO</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase">Backup em tempo real</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSyncEnabled(!syncEnabled)} 
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${syncEnabled ? 'bg-sky-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${syncEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <button 
                   onClick={handleManualSync}
                   disabled={isSyncing || !syncEnabled}
                   className="w-full bg-slate-900 border border-slate-800 text-sky-500 hover:bg-slate-800 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> 
                    {isSyncing ? 'SINCRONIZANDO...' : 'FORÇAR SINCRONIZAÇÃO AGORA'}
                 </button>
                 
                 {lastSyncTime && (
                   <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-widest">
                     Última sincronização: {lastSyncTime.toLocaleTimeString()}
                   </p>
                 )}
              </div>

              <div className="p-6 bg-slate-950 rounded-[32px] border border-white/5 space-y-4 shadow-inner">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MINHA CONTA</p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-sky-500"><UserIcon size={24} /></div>
                    <div><p className="font-black text-white uppercase">{currentUser.name}</p><p className="text-[10px] text-slate-600 font-black uppercase">NÍVEL: {currentUser.role}</p></div>
                 </div>
              </div>
              <button onClick={handleLogout} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black py-6 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg border border-rose-500/10"><LogOut size={20} /><span className="uppercase text-[10px] tracking-widest">SAIR DO SISTEMA</span></button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTÃO DE TAXAS */}
      {isFeesManagementOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">TAXAS DE CARTÃO</h2>
                 <button onClick={() => setIsFeesManagementOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveFees} className="space-y-6">
                 <div className="bg-slate-950/50 p-6 rounded-[32px] border border-white/5 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest block">TAXA DÉBITO (%)</label>
                      <div className="relative">
                        <input type="number" step="0.01" placeholder="0.00" value={cardFees.debit} onChange={e => setCardFees(prev => ({ ...prev, debit: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-sky-400 outline-none focus:border-sky-500 pr-12 transition-all" />
                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      </div>
                      <p className="text-[8px] font-black text-slate-600 uppercase ml-4">Descontado automaticamente de entradas Débito</p>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest block">TAXA CRÉDITO (%)</label>
                      <div className="relative">
                        <input type="number" step="0.01" placeholder="0.00" value={cardFees.credit} onChange={e => setCardFees(prev => ({ ...prev, credit: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500 pr-12 transition-all" />
                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      </div>
                      <p className="text-[8px] font-black text-slate-600 uppercase ml-4">Descontado automaticamente de entradas Crédito</p>
                   </div>
                 </div>

                 <button type="submit" className="w-full bg-sky-600 text-white font-black py-6 rounded-[32px] uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 active:scale-95 transition-all hover:bg-sky-500">
                    <Save size={18} /> SALVAR CONFIGURAÇÕES
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL GESTÃO DE SERVIÇOS OU FORMULÁRIO DE EDIÇÃO DE ATALHO */}
      {(isServiceManagementOpen || isServiceFormOpen) && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">{isServiceFormOpen ? 'SERVIÇO' : 'SERVIÇOS'}</h2>
                 <button onClick={() => { setIsServiceManagementOpen(false); setIsServiceFormOpen(false); }} className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={18} /></button>
              </div>

              {isServiceFormOpen ? (
                <form onSubmit={handleSaveService} className="space-y-4 mb-6 animate-in slide-in-from-top">
                  <input placeholder="NOME DO SERVIÇO" required value={serviceFormData.name} onChange={e => setServiceFormData(p => ({...p, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-emerald-500 uppercase" />
                  <input type="number" step="0.01" placeholder="PREÇO R$" required value={serviceFormData.price} onChange={e => setServiceFormData(p => ({...p, price: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsServiceFormOpen(false)} className="flex-1 bg-slate-800 text-slate-400 font-black py-4 rounded-2xl uppercase text-[10px] active:scale-95">CANCELAR</button>
                    <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] active:scale-95 shadow-lg">SALVAR</button>
                  </div>
                </form>
              ) : (
                <>
                <button onClick={() => { setServiceFormData({ oldName: '', name: '', price: '' }); setIsServiceFormOpen(true); }} className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black py-5 rounded-3xl flex items-center justify-center gap-3 mb-6 active:scale-95 transition-all shadow-md">
                   <PlusCircle size={18} /> <span className="uppercase text-[10px] tracking-widest">NOVO SERVIÇO</span>
                </button>

                <div className="space-y-3">
                   {(Object.entries(serviceConfig) as [string, { price: number }][]).map(([name, config]) => (
                     <div key={name} className="flex items-center justify-between bg-slate-950 p-5 rounded-3xl border border-white/5 transition-all hover:bg-slate-950/80">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center p-0.5 bg-slate-900">
                              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
                           </div>
                           <div>
                             <p className="text-[11px] font-black text-white uppercase">{name}</p>
                             <p className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5">R$ {config.price.toFixed(2)}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setServiceFormData({ oldName: name, name, price: config.price.toString() }); setIsServiceFormOpen(true); }} className="p-2 text-slate-500 hover:text-sky-500 active:scale-75 transition-all"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteService(name)} className="p-2 text-slate-500 hover:text-rose-500 active:scale-75 transition-all"><Trash2 size={16} /></button>
                        </div>
                     </div>
                   ))}
                </div>
                </>
              )}
           </div>
        </div>
      )}

      {isUserManagementOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[120] flex items-center justify-center p-6 overflow-y-auto animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-[48px] p-8 border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">USUÁRIOS</h2>
                 <button onClick={() => setIsUserManagementOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={18} /></button>
              </div>

              {currentUser.role === 'ADMIN' && (
                <form onSubmit={handleAddUser} className="space-y-4 mb-10 bg-slate-950/50 p-6 rounded-[32px] border border-white/5">
                   <p className="text-[9px] font-black text-emerald-500 uppercase ml-4 tracking-[0.2em] mb-2">CADASTRAR NOVO FUNCIONÁRIO</p>
                   <input placeholder="NOME COMPLETO" required value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-sky-500 transition-all" />
                   <input placeholder="NOME DE USUÁRIO" required value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-sky-500 transition-all" />
                   <input type="password" placeholder="SENHA INICIAL" required value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-sky-500 transition-all" />
                   <button type="submit" className="w-full bg-sky-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 shadow-lg active:scale-95 transition-all hover:bg-sky-500"><UserPlus size={16} /><span className="uppercase text-[10px]">CADASTRAR</span></button>
                </form>
              )}

              <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-[0.2em] mb-2">EQUIPE BARBERCASH</p>
                 {users.map(u => (
                   <div key={u.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${u.id === currentUser.id ? 'bg-sky-500/10 border-sky-500/30' : 'bg-slate-950 border-white/5 hover:bg-slate-950/80'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${u.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>{u.role === 'ADMIN' ? <ShieldCheck size={14} /> : <UserIcon size={14} />}</div>
                         <div>
                           <p className="text-[11px] font-black text-white uppercase">{u.name} {u.id === currentUser.id && <span className="text-[8px] text-sky-500 ml-1">(VOCÊ)</span>}</p>
                           <p className="text-[8px] text-slate-600 font-bold uppercase">@{u.username} • {u.role}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {u.id === currentUser.id && (
                          <button onClick={() => setIsPasswordModalOpen(true)} className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-xl active:scale-75 transition-all" title="Alterar minha senha">
                            <Lock size={16} />
                          </button>
                        )}
                        {currentUser.role === 'ADMIN' && u.id !== currentUser.id && (
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-700 hover:text-rose-500 active:scale-75 transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODAL ALTERAR SENHA (USUÁRIO LOGADO) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[300] flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-slate-900 w-full max-w-sm rounded-[48px] p-8 border border-white/10 shadow-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">ALTERAR SENHA</h2>
              <button onClick={() => { setIsPasswordModalOpen(false); setNewPasswordData({ current: '', new: '', confirm: '' }); }} className="p-2 bg-slate-800 rounded-full text-slate-400 active:scale-75 transition-all"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">SENHA ATUAL</label>
                   <input type="password" required value={newPasswordData.current} onChange={e => setNewPasswordData(p => ({...p, current: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">NOVA SENHA</label>
                   <input type="password" required value={newPasswordData.new} onChange={e => setNewPasswordData(p => ({...p, new: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-4 mb-2 block tracking-widest">CONFIRMAR NOVA SENHA</label>
                   <input type="password" required value={newPasswordData.confirm} onChange={e => setNewPasswordData(p => ({...p, confirm: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-sky-500" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-sky-600 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><Save size={18} /><span className="uppercase text-[10px] tracking-widest">SALVAR NOVA SENHA</span></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
