
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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

// Função de teste de conexão
export const testFirebaseConnection = async () => {
  try {
    console.log("Iniciando teste de conexão com Firebase (Firestore)...");
    
    // Tenta acessar uma coleção de teste (não precisa existir previamente)
    const testCollectionRef = collection(db, "_connection_test_barbercash");
    
    // Tenta adicionar um documento simples para verificar permissão de escrita
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
