#!/bin/bash
# Script pour pousser le code sur GitHub
# Usage: ./scripts/git-push.sh "message du commit"

TOKEN=$(grep GITHUB_TOKEN /home/z/my-project/.env 2>/dev/null | cut -d'=' -f2)

if [ -z "$TOKEN" ]; then
    echo "❌ Token GitHub non trouvé dans .env"
    exit 1
fi

cd /home/z/my-project

# Configurer le remote avec le token
git remote set-url origin https://${TOKEN}@github.com/topmuch/domelia.git

# Ajouter tous les fichiers modifiés
git add .

# Commit avec le message fourni ou un message par défaut
MESSAGE="${1:-Mise à jour $(date '+%Y-%m-%d %H:%M')}"
git commit -m "$MESSAGE"

# Pousser sur GitHub
git push origin main

echo "✅ Code poussé sur GitHub !"
