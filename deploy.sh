#!/bin/bash

echo "========== INICIANDO DEPLOY BACK =========="

# Actualización del repositorio
echo "📥 Ejecutando git fetch..."
git fetch

echo "📥 Ejecutando git pull..."
git pull

# Instalación de dependencias
echo "📦 Ejecutando npm install..."
npm install

# Reinicio del proceso con PM2
echo "🧼 Eliminando proceso PM2 existente..."
pm2 delete star-back || echo "ℹ️ No hay proceso star-back corriendo (se ignora)"

echo "🚀 Iniciando backend con PM2..."
pm2 start index.js --name star-back

echo "✅ DEPLOY BACK COMPLETADO"