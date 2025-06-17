#!/bin/bash

echo "========== INICIANDO DEPLOY BACK =========="

# Moverse al directorio del backend (ajusta la ruta si es necesario)
cd /ruta/a/tu/backend || { echo "❌ Error: No se pudo acceder al directorio del backend"; exit 1; }

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
pm2 delete 0 || echo "ℹ️ No hay proceso 0 corriendo (se ignora)"

echo "🚀 Iniciando backend con PM2..."
pm2 start index.js --name star-back

echo "✅ DEPLOY BACK COMPLETADO"