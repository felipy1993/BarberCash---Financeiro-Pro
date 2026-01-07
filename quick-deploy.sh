#!/bin/bash
# Script de Deploy Rápido para Vercel
# Execute: bash quick-deploy.sh

echo "🚀 BarberCash - Deploy Rápido no Vercel"
echo "========================================"
echo ""

# Verifica se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo "📝 Commitando mudanças..."
    git add .
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
else
    echo "✅ Nenhuma mudança para commitar"
fi

# Push para GitHub
echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ Código enviado para GitHub!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Importe seu repositório"
echo "3. Configure a variável GEMINI_API_KEY"
echo "4. Clique em Deploy"
echo ""
echo "Ou use o Vercel CLI:"
echo "  npm install -g vercel"
echo "  vercel"
echo ""
echo "🎉 Boa sorte com o deploy!"
