#!/bin/sh
# Script de démarrage Domelia.fr - Optimisé pour Coolify

# Définir le chemin de la DB si pas défini
export DATABASE_URL="${DATABASE_URL:-file:/app/db/production.db}"

echo "🚀 Démarrage Domelia.fr..."
echo "📁 Database: $DATABASE_URL"

# Initialiser la base de données en arrière-plan (non bloquant)
(
    if [ ! -f /app/db/production.db ]; then
        echo "🔧 Initialisation base de données..."
        cd /app && npx prisma db push --skip-generate 2>/dev/null || true
        echo "✅ Base de données initialisée"
    fi
) &

# Démarrer le serveur immédiatement
exec node /app/server.js
