# 🚀 COMO CLONAR O PROJETO PARA UM NOVO CLIENTE

## Método Rápido (Usando Script Automatizado)

### 1. Abra o PowerShell como Administrador

```powershell
# Navegue até a pasta de scripts
cd P:\BARBEARIA_FINANCEIRO\BarberCash---Financeiro-Pro\scripts

# Execute o script
.\clonar-projeto.ps1 -NomeCliente "Nome da Barbearia"

# Exemplo:
.\clonar-projeto.ps1 -NomeCliente "Barbearia Style"
```

### 2. O script vai:
- ✅ Copiar todo o projeto
- ✅ Remover o histórico Git
- ✅ Limpar node_modules
- ✅ Criar a pasta com o nome do cliente
- ✅ Mostrar os próximos passos

### 3. Depois do script:
1. Criar projeto Firebase do cliente
2. Abrir o novo projeto no VS Code
3. Seguir o guia: `docs/GUIA_CLONAR_PROJETO.md`

---

## Método Manual

Se preferir fazer manualmente, siga o guia completo:

📖 **[GUIA_CLONAR_PROJETO.md](./GUIA_CLONAR_PROJETO.md)**

---

## Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `docs/GUIA_CLONAR_PROJETO.md` | Guia completo passo a passo |
| `docs/TEMPLATE_NOVO_CLIENTE.md` | Checklist para cada cliente |
| `scripts/clonar-projeto.ps1` | Script automatizado |

---

## Exemplo Completo

```powershell
# 1. Clonar projeto
cd P:\BARBEARIA_FINANCEIRO\BarberCash---Financeiro-Pro\scripts
.\clonar-projeto.ps1 -NomeCliente "Barbearia Style"

# 2. Abrir no VS Code (o script pergunta se quer abrir)
# Ou manualmente:
code P:\BARBEARIA_FINANCEIRO\BarberCash-BarbeariaStyle

# 3. Editar credenciais Firebase
# Arquivo: services/firebase.ts

# 4. Instalar dependências
npm install

# 5. Testar
npm run dev

# 6. Build
npm run build

# 7. Deploy
# Vercel, Firebase Hosting, etc.
```

---

## ⚠️ IMPORTANTE

**Antes de entregar ao cliente**:
- [ ] Teste o sistema completamente
- [ ] Verifique se as credenciais Firebase estão corretas
- [ ] Confirme que o localStorage usa prefixo único
- [ ] Altere a senha padrão do admin

---

## 📞 Dúvidas?

Consulte o guia completo em `docs/GUIA_CLONAR_PROJETO.md`
