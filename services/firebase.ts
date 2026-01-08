
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  where,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import type { Transaction, Product, User } from '../types';

// Configuração fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyByxf1pxdGdiZ8Htz5NBR5jZAhMfVqme4o",
  authDomain: "financeiro-barbearia-782e9.firebaseapp.com",
  projectId: "financeiro-barbearia-782e9",
  storageBucket: "financeiro-barbearia-782e9.firebasestorage.app",
  messagingSenderId: "417248232470",
  appId: "1:417248232470:web:69c56bd76cbc6cac246137"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore (Banco de Dados)
export const db = getFirestore(app);

// ============================================
// COLEÇÕES DO FIRESTORE
// ============================================
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  PRODUCTS: 'products',
  SERVICE_CONFIG: 'service_config',
  CARD_FEES: 'card_fees',
  SYSTEM_CONFIG: 'system_config',
  APPOINTMENTS: 'appointments'
};

// ============================================
// AGENDAMENTOS
// ============================================

export const saveAppointment = async (appointment: any): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointment.id), appointment);
    console.log('✅ Agendamento salvo:', appointment.clientName);
  } catch (error) {
    console.error('❌ Erro ao salvar agendamento:', error);
    throw error;
  }
};

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
    console.log('✅ Agendamento removido:', id);
  } catch (error) {
    console.error('❌ Erro ao remover agendamento:', error);
    throw error;
  }
};

export const subscribeToAppointments = (callback: (appointments: any[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.APPOINTMENTS), (snapshot) => {
    const apps: any[] = [];
    snapshot.forEach((doc) => {
      apps.push(doc.data());
    });
    console.log(`🔄 Real-time: ${apps.length} agendamentos recebidos`);
    callback(apps);
  }, (error) => {
    console.error("❌ Erro no listener de agendamentos:", error);
  });
};

// ============================================
// USUÁRIOS
// ============================================

export const saveUser = async (user: User): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
    console.log('✅ Usuário salvo:', user.username);
  } catch (error) {
    console.error('❌ Erro ao salvar usuário:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    console.log(`✅ ${users.length} usuários carregados`);
    return users;
  } catch (error) {
    console.error('❌ Erro ao carregar usuários:', error);
    return [];
  }
};

export const updateUser = async (user: User): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { ...user });
    console.log('✅ Usuário atualizado:', user.username);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    console.log('✅ Usuário removido:', userId);
  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error);
    throw error;
  }
};

// ============================================
// TRANSAÇÕES
// ============================================

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, transaction.id), transaction);
    console.log('✅ Transação salva:', transaction.description);
  } catch (error) {
    console.error('❌ Erro ao salvar transação:', error);
    throw error;
  }
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });
    console.log(`✅ ${transactions.length} transações carregadas`);
    return transactions;
  } catch (error) {
    console.error('❌ Erro ao carregar transações:', error);
    return [];
  }
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId));
    console.log('✅ Transação removida:', transactionId);
  } catch (error) {
    console.error('❌ Erro ao remover transação:', error);
    throw error;
  }
};

// ============================================
// PRODUTOS
// ============================================

export const saveProduct = async (product: Product): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
    console.log('✅ Produto salvo:', product.name);
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data() as Product);
    });
    console.log(`✅ ${products.length} produtos carregados`);
    return products;
  } catch (error) {
    console.error('❌ Erro ao carregar produtos:', error);
    return [];
  }
};

export const updateProduct = async (product: Product): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), { ...product });
    console.log('✅ Produto atualizado:', product.name);
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
    console.log('✅ Produto removido:', productId);
  } catch (error) {
    console.error('❌ Erro ao remover produto:', error);
    throw error;
  }
};

// ============================================
// CONFIGURAÇÕES
// ============================================

export const saveServiceConfig = async (config: Record<string, { price: number }>): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.SERVICE_CONFIG, 'default'), { config });
    console.log('✅ Configuração de serviços salva');
  } catch (error) {
    console.error('❌ Erro ao salvar configuração de serviços:', error);
    throw error;
  }
};

export const getServiceConfig = async (): Promise<Record<string, { price: number }> | null> => {
  try {
    const docSnap = await getDocs(collection(db, COLLECTIONS.SERVICE_CONFIG));
    if (!docSnap.empty) {
      const data = docSnap.docs[0].data();
      console.log('✅ Configuração de serviços carregada');
      return data.config;
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao carregar configuração de serviços:', error);
    return null;
  }
};

export const saveCardFees = async (fees: { debit: number; credit: number }): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CARD_FEES, 'default'), fees);
    console.log('✅ Taxas de cartão salvas');
  } catch (error) {
    console.error('❌ Erro ao salvar taxas de cartão:', error);
    throw error;
  }
};

export const getCardFees = async (): Promise<{ debit: number; credit: number } | null> => {
  try {
    const docSnap = await getDocs(collection(db, COLLECTIONS.CARD_FEES));
    if (!docSnap.empty) {
      const data = docSnap.docs[0].data();
      console.log('✅ Taxas de cartão carregadas');
      return data as { debit: number; credit: number };
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao carregar taxas de cartão:', error);
    return null;
  }
};

// ============================================
// SINCRONIZAÇÃO COMPLETA
// ============================================

export const syncAllDataToFirebase = async (data: {
  users: User[];
  transactions: Transaction[];
  products: Product[];
  serviceConfig: Record<string, { price: number }>;
  cardFees: { debit: number; credit: number };
}): Promise<void> => {
  try {
    console.log('🔄 Iniciando sincronização completa com Firebase...');
    
    // Salvar usuários
    for (const user of data.users) {
      await saveUser(user);
    }
    
    // Salvar transações
    for (const transaction of data.transactions) {
      await saveTransaction(transaction);
    }
    
    // Salvar produtos
    for (const product of data.products) {
      await saveProduct(product);
    }
    
    // Salvar configurações
    await saveServiceConfig(data.serviceConfig);
    await saveCardFees(data.cardFees);
    
    console.log('✅ Sincronização completa concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    throw error;
  }
};

export const loadAllDataFromFirebase = async (): Promise<{
  users: User[];
  transactions: Transaction[];
  products: Product[];
  serviceConfig: Record<string, { price: number }> | null;
  cardFees: { debit: number; credit: number } | null;
}> => {
  try {
    console.log('📥 Carregando dados do Firebase...');
    
    const [users, transactions, products, serviceConfig, cardFees] = await Promise.all([
      getAllUsers(),
      getAllTransactions(),
      getAllProducts(),
      getServiceConfig(),
      getCardFees()
    ]);
    
    console.log('✅ Todos os dados carregados do Firebase!');
    
    return { users, transactions, products, serviceConfig, cardFees };
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    throw error;
  }
};

// ============================================
// LISTENERS EM TEMPO REAL (REAL-TIME)
// ============================================

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    console.log(`🔄 Real-time: ${users.length} usuários recebidos`);
    callback(users);
  }, (error) => {
    console.error("❌ Erro no listener de usuários:", error);
  });
};

export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.TRANSACTIONS), (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });
    console.log(`🔄 Real-time: ${transactions.length} transações recebidas`);
    callback(transactions);
  }, (error) => {
    console.error("❌ Erro no listener de transações:", error);
  });
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.PRODUCTS), (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push(doc.data() as Product);
    });
    console.log(`🔄 Real-time: ${products.length} produtos recebidos`);
    callback(products);
  }, (error) => {
    console.error("❌ Erro no listener de produtos:", error);
  });
};

export const subscribeToServiceConfig = (callback: (config: Record<string, { price: number }>) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.SERVICE_CONFIG), (snapshot) => {
    let config = {};
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        if (doc.data().config) config = doc.data().config;
      });
    }
    console.log(`🔄 Real-time: Configuração de serviços recebida`);
    callback(config);
  }, (error) => {
    console.error("❌ Erro no listener de serviços:", error);
  });
};

export const subscribeToCardFees = (callback: (fees: { debit: number; credit: number }) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.CARD_FEES), (snapshot) => {
    let fees = { debit: 0, credit: 0 };
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
         // Assumindo que o primeiro ou os documentos têm os campos debit e credit
         const data = doc.data();
         if (data.debit !== undefined) fees = data as { debit: number; credit: number };
      });
    }
    console.log(`🔄 Real-time: Taxas de cartão recebidas`);
    callback(fees);
  }, (error) => {
    console.error("❌ Erro no listener de taxas:", error);
  });
};

// ============================================
// FUNÇÃO DE TESTE
// ============================================

export const testFirebaseConnection = async () => {
  try {
    console.log("Iniciando teste de conexão com Firebase (Firestore)...");
    
    const testCollectionRef = collection(db, "_connection_test_barbercash");
    
    const docRef = await addDoc(testCollectionRef, {
      timestamp: new Date(),
      status: "connected",
      app: "BarberCash Pro"
    });
    
    console.log("✅ Conexão bem-sucedida! Documento escrito com ID:", docRef.id);
    alert(`Conexão com Firebase bem-sucedida!\nProjeto: ${firebaseConfig.projectId}\nID do documento de teste: ${docRef.id}`);
    return true;
  } catch (error: any) {
    console.error("❌ Erro ao conectar com Firebase:", error);
    let errorMsg = "Erro desconhecido";
    if (error.code === 'permission-denied') {
      errorMsg = "Permissão negada. Verifique as Regras de Segurança do Firestore no console do Firebase.";
    } else if (error.code === 'unavailable') {
      errorMsg = "Serviço indisponível ou você está offline.";
    } else {
      errorMsg = error.message;
    }
    alert(`Falha na conexão com Firebase:\n${errorMsg}`);
    return false;
  }
};
