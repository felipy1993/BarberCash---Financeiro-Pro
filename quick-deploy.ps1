# Script de Deploy Rápido para Vercel (PowerShell)
# Execute: .\quick-deploy.ps1

Write-Host "🚀 BarberCash - Deploy Rápido no Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se há mudanças não commitadas
$status = git status -s
if ($status) {
    Write-Host "📝 Commitando mudanças..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy: $timestamp"
} else {
    Write-Host "✅ Nenhuma mudança para commitar" -ForegroundColor Green
}

# Push para GitHub
Write-Host "📤 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Código enviado para GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse https://vercel.com"
Write-Host "2. Importe seu repositório"
Write-Host "3. Configure a variável GEMINI_API_KEY"
Write-Host "4. Clique em Deploy"
Write-Host ""
Write-Host "Ou use o Vercel CLI:" -ForegroundColor Yellow
Write-Host "  npm install -g vercel"
Write-Host "  vercel"
Write-Host ""
Write-Host "🎉 Boa sorte com o deploy!" -ForegroundColor Green
