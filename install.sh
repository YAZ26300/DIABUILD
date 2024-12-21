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

# Fonction pour nettoyer en cas d'interruption
cleanup() {
    if [ ! -z "$TMP_DIR" ]; then
        echo -e "\n${BLUE}Nettoyage...${NC}"
        rm -rf "$TMP_DIR"
    fi
    exit 1
}

# Capture des interruptions
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}Configuration de l'application IA Diagram Chat${NC}"
echo "----------------------------------------"

# Vérification des prérequis
command -v git >/dev/null 2>&1 || die "Git n'est pas installé. Veuillez installer Git avant de continuer."
command -v docker >/dev/null 2>&1 || die "Docker n'est pas installé. Veuillez installer Docker avant de continuer."
command -v docker-compose >/dev/null 2>&1 || die "Docker Compose n'est pas installé. Veuillez installer Docker Compose avant de continuer."
docker info >/dev/null 2>&1 || die "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker avant de continuer."

# Création d'un répertoire temporaire
TMP_DIR=$(mktemp -d)
echo -e "${BLUE}Utilisation du répertoire temporaire: $TMP_DIR${NC}"

# Clonage du projet dans le répertoire temporaire
echo -e "${BLUE}Clonage du projet...${NC}"
git clone https://github.com/YAZ26300/DIABUILD.git "$TMP_DIR" || die "Erreur lors du clonage du projet"

# Se déplacer dans le répertoire du projet
cd "$TMP_DIR" || die "Impossible d'accéder au répertoire temporaire"

# Vérification des fichiers nécessaires
[ ! -f "docker-compose.yml" ] && die "Fichier docker-compose.yml non trouvé"
[ ! -f "package.json" ] && die "Fichier package.json non trouvé"

# Installation dans le répertoire final
INSTALL_DIR="$HOME/ia-diagram-chat"
echo -e "${BLUE}Installation dans: $INSTALL_DIR${NC}"

# Création du répertoire d'installation
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Mise à jour de l'installation existante...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Copie des fichiers
mkdir -p "$INSTALL_DIR"
cp -r . "$INSTALL_DIR/"
cd "$INSTALL_DIR" || die "Impossible d'accéder au répertoire d'installation"

# Configuration des variables d'environnement
echo -e "${BLUE}Configuration des variables d'environnement...${NC}"
cat > .env << EOF
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GITHUB_CLIENT_ID=
EOF

# Demande des valeurs de configuration
echo -e "${GREEN}Configuration de l'application${NC}"
read -p "Entrez l'URL Supabase: " SUPABASE_URL
read -p "Entrez la clé Supabase: " SUPABASE_KEY
read -p "Entrez le Client ID GitHub: " GITHUB_CLIENT_ID

# Mise à jour du fichier .env
sed -i "s|VITE_SUPABASE_URL=|VITE_SUPABASE_URL=$SUPABASE_URL|" .env
sed -i "s|VITE_SUPABASE_ANON_KEY=|VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY|" .env
sed -i "s|VITE_GITHUB_CLIENT_ID=|VITE_GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID|" .env

# Lancement des conteneurs Docker
echo -e "${BLUE}Démarrage des conteneurs Docker...${NC}"
docker-compose up -d || die "Erreur lors du démarrage des conteneurs Docker"

# Installation des dépendances Node.js
echo -e "${BLUE}Installation des dépendances...${NC}"
npm install || die "Erreur lors de l'installation des dépendances npm"

# Démarrage de l'application
echo -e "${GREEN}Installation terminée!${NC}"
echo -e "${BLUE}Démarrage de l'application...${NC}"
exec npm run dev