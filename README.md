# BarberCash - Financeiro Pro

Sistema de gestão financeira para barbearias desenvolvido com React, TypeScript e Firebase.

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Firebase](https://firebase.google.com)
- API Key do Google Gemini (opcional, para funcionalidades de IA)

### Passos para Deploy

1. **Instale o Vercel CLI (opcional)**
   ```bash
   npm install -g vercel
   ```

2. **Configure as variáveis de ambiente no Vercel**
   
   No painel do Vercel, vá em **Settings > Environment Variables** e adicione:
   
   - `GEMINI_API_KEY` - Sua chave da API do Google Gemini
   
   **Importante:** As configurações do Firebase já estão no código. Se você quiser usar variáveis de ambiente para o Firebase, adicione:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Deploy via GitHub (Recomendado)**
   
   a. Faça push do código para o GitHub:
   ```bash
   git add .
   git commit -m "Preparado para deploy no Vercel"
   git push origin main
   ```
   
   b. No Vercel:
   - Clique em "Add New Project"
   - Importe seu repositório do GitHub
   - O Vercel detectará automaticamente que é um projeto Vite
   - Configure as variáveis de ambiente
   - Clique em "Deploy"

4. **Deploy via Vercel CLI**
   ```bash
   vercel
   ```
   
   Siga as instruções no terminal. Na primeira vez, você precisará fazer login.

### 🔧 Configurações

O projeto já está configurado com:
- ✅ `vercel.json` - Configuração de build e rotas
- ✅ `vite.config.ts` - Configuração do Vite otimizada
- ✅ `.gitignore` - Arquivos ignorados incluindo `.vercel`

### 📦 Build Local

Para testar o build localmente antes do deploy:

```bash
npm install
npm run build
npm run preview
```

### 🌐 Após o Deploy

1. Acesse a URL fornecida pelo Vercel
2. Configure o Firebase Authentication para aceitar o domínio do Vercel
3. Teste todas as funcionalidades

### 🔐 Segurança

- Nunca commite arquivos `.env` com credenciais
- Use as variáveis de ambiente do Vercel para dados sensíveis
- Configure as regras de segurança do Firebase adequadamente

## 📱 Tecnologias

- React 19
- TypeScript
- Vite
- Firebase (Auth + Firestore)
- TailwindCSS
- Recharts
- jsPDF
- Google Gemini AI

## 📄 Licença

Privado - Todos os direitos reservados
