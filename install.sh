#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour arrêter le script en cas d'erreur
die() {
    echo -e "${RED}$1${NC}" >&2
    exit 1
}

echo -e "${BLUE}Configuration de l'application IA Diagram Chat${NC}"
echo "----------------------------------------"

# Vérification des prérequis
command -v git >/dev/null 2>&1 || die "Git n'est pas installé. Veuillez installer Git avant de continuer."
command -v docker >/dev/null 2>&1 || die "Docker n'est pas installé. Veuillez installer Docker avant de continuer."
command -v docker-compose >/dev/null 2>&1 || die "Docker Compose n'est pas installé. Veuillez installer Docker Compose avant de continuer."
docker info >/dev/null 2>&1 || die "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker avant de continuer."

# Définition du répertoire d'installation
INSTALL_DIR="$HOME/ia-diagram-chat"
echo -e "${BLUE}Installation dans: $INSTALL_DIR${NC}"

# Suppression de l'installation existante si nécessaire
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Suppression de l'installation existante...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Clonage du projet
echo -e "${BLUE}Clonage du projet...${NC}"
git clone https://github.com/YAZ26300/DIABUILD.git "$INSTALL_DIR" || die "Erreur lors du clonage du projet"

# Se déplacer dans le répertoire d'installation
cd "$INSTALL_DIR" || die "Impossible d'accéder au répertoire d'installation"

# Vérification des fichiers nécessaires
[ ! -f "docker-compose.yml" ] && die "Fichier docker-compose.yml non trouvé"
[ ! -f "package.json" ] && die "Fichier package.json non trouvé"

# Configuration des variables d'environnement
echo -e "${BLUE}Configuration des variables d'environnement...${NC}"
echo -e "${GREEN}Configuration de l'application${NC}"

# Demande des valeurs de configuration
read -p "Entrez l'URL Supabase: " SUPABASE_URL
read -p "Entrez la clé Supabase: " SUPABASE_KEY
read -p "Entrez le Client ID GitHub: " GITHUB_CLIENT_ID

# Création du fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
VITE_GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
EOF

echo -e "${GREEN}Fichier .env créé avec succès!${NC}"

# Création d'un nouveau Dockerfile avec --legacy-peer-deps
cat > Dockerfile << EOF
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
EOF

echo -e "${GREEN}Dockerfile créé avec succès!${NC}"

# Lancement des conteneurs Docker
echo -e "${BLUE}Démarrage des conteneurs Docker...${NC}"
docker-compose up -d || die "Erreur lors du démarrage des conteneurs Docker"

# Installation des dépendances Node.js localement
echo -e "${BLUE}Installation des dépendances...${NC}"
npm install --legacy-peer-deps || die "Erreur lors de l'installation des dépendances npm"

# Démarrage de l'application
echo -e "${GREEN}Installation terminée!${NC}"
echo -e "${BLUE}Démarrage de l'application...${NC}"
exec npm run dev