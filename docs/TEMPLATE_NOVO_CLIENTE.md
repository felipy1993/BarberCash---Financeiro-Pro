# 🔧 TEMPLATE DE CONFIGURAÇÃO - NOVO CLIENTE

## Informações do Cliente

**Nome da Barbearia**: ___________________________

**Nome do Projeto Firebase**: barbercash-___________________________

**Usuário Admin Padrão**: ___________________________

**Senha Admin Padrão**: ___________________________

---

## Credenciais Firebase

Copie as credenciais do Firebase Console e cole aqui:

```typescript
const firebaseConfig = {
  apiKey: "___________________________",
  authDomain: "___________________________.firebaseapp.com",
  projectId: "___________________________",
  storageBucket: "___________________________.appspot.com",
  messagingSenderId: "___________________________",
  appId: "___________________________"
};
```

---

## Prefixo do LocalStorage

**Prefixo único**: `barbercash_[nomecliente]_`

Exemplo: `barbercash_stylebarber_`

---

## Personalização

### Nome no Sistema
- [ ] Atualizado em `App.tsx` linha ~848 (tela de login)
- [ ] Atualizado em `App.tsx` linha ~923 (header)

### Logo
- [ ] Substituído `public/assets/logo.png`
- [ ] Dimensões: 512x512px (recomendado)

### Usuário Padrão
- [ ] Nome atualizado em `App.tsx` linha ~105
- [ ] Username atualizado
- [ ] Senha alterada (IMPORTANTE!)

### Package.json
- [ ] Nome do projeto atualizado
- [ ] Descrição atualizada

---

## Deploy

### URL do Sistema
**Vercel**: https://___________________________

**Firebase Hosting**: https://___________________________

---

## Checklist Final

- [ ] Firebase criado e configurado
- [ ] Credenciais atualizadas em `services/firebase.ts`
- [ ] Prefixo do localStorage alterado
- [ ] Nome da barbearia personalizado
- [ ] Logo substituído
- [ ] Senha padrão alterada
- [ ] `npm install` executado
- [ ] `npm run dev` testado localmente
- [ ] Build realizado (`npm run build`)
- [ ] Deploy feito com sucesso
- [ ] Login testado no sistema em produção
- [ ] Funcionalidades básicas testadas

---

## Entrega ao Cliente

**Data da Entrega**: ___/___/______

**Informações Fornecidas**:
- [ ] URL do sistema
- [ ] Usuário e senha padrão
- [ ] Acesso ao Firebase Console
- [ ] Manual do usuário
- [ ] Contato para suporte

---

## Observações

_____________________________________________________________________

_____________________________________________________________________

_____________________________________________________________________

_____________________________________________________________________
