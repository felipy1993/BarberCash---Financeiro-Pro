# Script PowerShell para Clonar Projeto BarberCash
# Execute este script para criar uma cópia do projeto para um novo cliente

param(
    [Parameter(Mandatory=$true)]
    [string]$NomeCliente,
    
    [Parameter(Mandatory=$false)]
    [string]$PastaDestino = "P:\BARBEARIA_FINANCEIRO"
)

Write-Host "🚀 INICIANDO CLONAGEM DO BARBERCASH" -ForegroundColor Cyan
Write-Host "Cliente: $NomeCliente" -ForegroundColor Yellow
Write-Host ""

# Criar nome da pasta sem espaços
$NomePasta = "BarberCash-$($NomeCliente -replace ' ','')"
$CaminhoCompleto = Join-Path $PastaDestino $NomePasta

# Verificar se a pasta já existe
if (Test-Path $CaminhoCompleto) {
    Write-Host "❌ ERRO: A pasta $NomePasta já existe!" -ForegroundColor Red
    Write-Host "Caminho: $CaminhoCompleto" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Criando pasta: $NomePasta" -ForegroundColor Green

# Copiar projeto atual
Write-Host "📋 Copiando arquivos..." -ForegroundColor Yellow
$ProjetoOriginal = "P:\BARBEARIA_FINANCEIRO\BarberCash---Financeiro-Pro"

if (-not (Test-Path $ProjetoOriginal)) {
    Write-Host "❌ ERRO: Projeto original não encontrado em $ProjetoOriginal" -ForegroundColor Red
    exit 1
}

Copy-Item -Path $ProjetoOriginal -Destination $CaminhoCompleto -Recurse

# Remover pasta .git
Write-Host "🗑️  Removendo histórico Git..." -ForegroundColor Yellow
$GitPath = Join-Path $CaminhoCompleto ".git"
if (Test-Path $GitPath) {
    Remove-Item -Path $GitPath -Recurse -Force
}

# Remover node_modules se existir
Write-Host "🗑️  Limpando node_modules..." -ForegroundColor Yellow
$NodeModulesPath = Join-Path $CaminhoCompleto "node_modules"
if (Test-Path $NodeModulesPath) {
    Remove-Item -Path $NodeModulesPath -Recurse -Force
}

Write-Host ""
Write-Host "✅ PROJETO CLONADO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Localização: $CaminhoCompleto" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Criar projeto Firebase para o cliente" -ForegroundColor White
Write-Host "2. Abrir o projeto: code `"$CaminhoCompleto`"" -ForegroundColor White
Write-Host "3. Editar services/firebase.ts com as novas credenciais" -ForegroundColor White
Write-Host "4. Atualizar prefixo do localStorage em App.tsx" -ForegroundColor White
Write-Host "5. Personalizar nome e logo" -ForegroundColor White
Write-Host "6. Instalar dependências: npm install" -ForegroundColor White
Write-Host "7. Testar: npm run dev" -ForegroundColor White
Write-Host "8. Deploy: npm run build" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte: docs/GUIA_CLONAR_PROJETO.md para detalhes" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer abrir no VS Code
$Resposta = Read-Host "Deseja abrir o projeto no VS Code agora? (S/N)"
if ($Resposta -eq "S" -or $Resposta -eq "s") {
    Write-Host "🚀 Abrindo VS Code..." -ForegroundColor Green
    code $CaminhoCompleto
}

Write-Host ""
Write-Host "✨ Concluído!" -ForegroundColor Green
