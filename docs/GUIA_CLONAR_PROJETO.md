# 🔄 GUIA COMPLETO: Clonar Projeto para Novo Cliente

Este guia explica como criar uma cópia do BarberCash para vender para outro cliente, com banco de dados Firebase separado.

---

## 📋 ÍNDICE
1. [Preparação](#1-preparação)
2. [Criar Novo Projeto Firebase](#2-criar-novo-projeto-firebase)
3. [Clonar o Código](#3-clonar-o-código)
4. [Configurar Firebase do Novo Cliente](#4-configurar-firebase-do-novo-cliente)
5. [Personalizar para o Cliente](#5-personalizar-para-o-cliente)
6. [Deploy e Entrega](#6-deploy-e-entrega)

---

## 1. PREPARAÇÃO

### O que você vai precisar:
- ✅ Conta Google do cliente (ou criar uma nova)
- ✅ Nome da barbearia do cliente
- ✅ Logo do cliente (opcional)
- ✅ Acesso ao Firebase Console
- ✅ Git instalado no computador

---

## 2. CRIAR NOVO PROJETO FIREBASE

### Passo 1: Acessar Firebase Console
1. Acesse: https://console.firebase.google.com/
2. **IMPORTANTE**: Use a conta Google do CLIENTE (não a sua)
3. Clique em **"Adicionar projeto"**

### Passo 2: Configurar o Projeto
1. **Nome do projeto**: `barbercash-[nome-do-cliente]`
   - Exemplo: `barbercash-barbearia-style`
2. **Google Analytics**: Pode desabilitar (opcional)
3. Clique em **"Criar projeto"**

### Passo 3: Configurar Firestore Database
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo: **"Produção"**
4. Escolha a localização: **"southamerica-east1 (São Paulo)"**
5. Clique em **"Ativar"**

### Passo 4: Configurar Regras de Segurança
1. Clique na aba **"Regras"**
2. Cole o seguinte código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita em todas as coleções
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

### Passo 5: Obter Credenciais do Firebase
1. Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Clique em **"Configurações do projeto"**
3. Role até **"Seus aplicativos"**
4. Clique no ícone **"Web"** `</>`
5. **Nome do app**: `BarberCash - [Nome do Cliente]`
6. Clique em **"Registrar app"**
7. **COPIE** as credenciais que aparecem (você vai precisar!)

Exemplo do que você vai copiar:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "barbercash-cliente.firebaseapp.com",
  projectId: "barbercash-cliente",
  storageBucket: "barbercash-cliente.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 3. CLONAR O CÓDIGO

### Opção A: Criar Nova Pasta (Recomendado)

```powershell
# Navegue até a pasta onde quer criar o novo projeto
cd P:\BARBEARIA_FINANCEIRO

# Clone o repositório com um novo nome
git clone https://github.com/felipy1993/BarberCash---Financeiro-Pro.git BarberCash-[NomeCliente]

# Exemplo:
git clone https://github.com/felipy1993/BarberCash---Financeiro-Pro.git BarberCash-BarbeariaStyle

# Entre na nova pasta
cd BarberCash-[NomeCliente]

# Remova a conexão com o repositório original
Remove-Item -Recurse -Force .git

# Inicialize um novo repositório Git (opcional)
git init
```

### Opção B: Copiar Pasta Manualmente

1. Copie a pasta `BarberCash---Financeiro-Pro`
2. Renomeie para `BarberCash-[NomeCliente]`
3. Delete a pasta `.git` dentro da nova pasta
4. Abra a nova pasta no VS Code

---

## 4. CONFIGURAR FIREBASE DO NOVO CLIENTE

### Passo 1: Abrir o Projeto no VS Code
```powershell
cd P:\BARBEARIA_FINANCEIRO\BarberCash-[NomeCliente]
code .
```

### Passo 2: Atualizar Credenciais do Firebase

Abra o arquivo: `services/firebase.ts`

**ANTES** (suas credenciais):
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBOZLs...",  // ← Suas credenciais antigas
  authDomain: "barbercash-...",
  projectId: "barbercash-...",
  // ...
};
```

**DEPOIS** (credenciais do cliente):
```typescript
const firebaseConfig = {
  apiKey: "AIza...",  // ← Credenciais do NOVO cliente
  authDomain: "barbercash-cliente.firebaseapp.com",
  projectId: "barbercash-cliente",
  storageBucket: "barbercash-cliente.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Passo 3: Limpar Dados Locais (Importante!)

Abra o arquivo: `App.tsx`

Procure por todas as inicializações de `localStorage` e adicione um prefixo único:

**ANTES**:
```typescript
const saved = localStorage.getItem('barber_users');
```

**DEPOIS**:
```typescript
const saved = localStorage.getItem('barbercash_cliente_users');
// Substitua 'cliente' pelo nome do cliente
```

**OU MELHOR**: Crie uma constante no início do arquivo:

```typescript
// No topo do App.tsx, após os imports
const STORAGE_PREFIX = 'barbercash_[nomecliente]_';

// Depois use assim:
const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
```

---

## 5. PERSONALIZAR PARA O CLIENTE

### Passo 1: Atualizar Nome da Barbearia

**Arquivo**: `App.tsx`

Procure por "BARBERCASH" e substitua pelo nome do cliente:

```typescript
// Linha ~848
<h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
  [NOME DA BARBEARIA]<span className="text-sky-400 bg-clip-text">CASH</span>
</h1>

// Linha ~923
<h1 className="text-lg font-black text-white uppercase leading-none">
  [NOME]<span className="text-sky-500">CASH</span>
</h1>
```

### Passo 2: Atualizar Logo (Opcional)

1. Substitua o arquivo: `public/assets/logo.png`
2. Use o logo do cliente
3. Mantenha o mesmo nome de arquivo

### Passo 3: Atualizar Usuário Padrão

**Arquivo**: `App.tsx` (linha ~105)

```typescript
const [users, setUsers] = useState<User[]>(() => {
  const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
  if (!saved) return [{
    id: 'admin-1',
    name: 'ADMINISTRADOR',  // ← Pode mudar para o nome do dono
    username: 'admin',       // ← Pode mudar o usuário
    password: '123',         // ← MUDE A SENHA!
    role: 'ADMIN'
  }];
  return JSON.parse(saved);
});
```

**IMPORTANTE**: Mude a senha padrão para algo seguro!

### Passo 4: Atualizar package.json

```json
{
  "name": "barbercash-[nomecliente]",
  "version": "1.0.0",
  "description": "Sistema Financeiro - [Nome da Barbearia]"
}
```

---

## 6. DEPLOY E ENTREGA

### Opção 1: Deploy no Vercel (Recomendado)

1. Acesse: https://vercel.com
2. Faça login com a conta do CLIENTE (ou sua conta)
3. Clique em **"Add New Project"**
4. Conecte ao GitHub ou faça upload da pasta
5. Configure:
   - **Project Name**: `barbercash-[nomecliente]`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique em **"Deploy"**
7. Copie a URL gerada (ex: `barbercash-cliente.vercel.app`)

### Opção 2: Deploy no Firebase Hosting

```powershell
# Instale o Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Faça login com a conta do CLIENTE
firebase login

# Inicialize o Firebase Hosting
firebase init hosting

# Selecione o projeto do cliente
# Build directory: dist
# Single-page app: Yes
# GitHub deploys: No

# Faça o build
npm run build

# Deploy
firebase deploy
```

### Passo Final: Entregar ao Cliente

Forneça ao cliente:

1. ✅ **URL do sistema**: `https://barbercash-cliente.vercel.app`
2. ✅ **Usuário padrão**: `admin` (ou o que você configurou)
3. ✅ **Senha padrão**: `123` (ou a que você configurou)
4. ✅ **Acesso ao Firebase Console**: https://console.firebase.google.com
5. ✅ **Documentação**: Este guia + manual do usuário

---

## 🔒 CHECKLIST DE SEGURANÇA

Antes de entregar, verifique:

- [ ] Credenciais do Firebase foram trocadas
- [ ] Senha padrão foi alterada
- [ ] localStorage usa prefixo único
- [ ] Logo foi atualizado (se aplicável)
- [ ] Nome da barbearia foi atualizado
- [ ] Sistema está funcionando no Firebase do cliente
- [ ] Deploy foi feito com sucesso
- [ ] Testou login e funcionalidades básicas

---

## 📞 SUPORTE

Se tiver dúvidas durante o processo:
1. Verifique se seguiu todos os passos
2. Confira se as credenciais do Firebase estão corretas
3. Limpe o cache do navegador (Ctrl + Shift + Delete)
4. Teste em uma aba anônima

---

## 🎯 RESUMO RÁPIDO

```
1. Criar projeto Firebase do cliente
2. Copiar pasta do projeto
3. Trocar credenciais em services/firebase.ts
4. Mudar prefixo do localStorage
5. Personalizar nome/logo
6. Fazer deploy
7. Entregar ao cliente
```

**PRONTO!** Agora você tem um projeto completamente independente para o novo cliente! 🚀
