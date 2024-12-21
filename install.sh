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

# Vérification de Git
command -v git >/dev/null 2>&1 || die "Git n'est pas installé. Veuillez installer Git avant de continuer."

# Vérification de Docker
command -v docker >/dev/null 2>&1 || die "Docker n'est pas installé. Veuillez installer Docker avant de continuer."

# Vérification de Docker Compose
command -v docker-compose >/dev/null 2>&1 || die "Docker Compose n'est pas installé. Veuillez installer Docker Compose avant de continuer."

# Vérification que Docker est en cours d'exécution
docker info >/dev/null 2>&1 || die "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker avant de continuer."

# Création et déplacement dans le répertoire de travail
WORK_DIR="$HOME/ia-diagram-chat"
if [ ! -d "$WORK_DIR" ]; then
    echo -e "${BLUE}Création du répertoire de travail...${NC}"
    mkdir -p "$WORK_DIR" || die "Impossible de créer le répertoire $WORK_DIR"
    echo -e "${BLUE}Clonage du projet...${NC}"
    git clone https://github.com/YAZ26300/DIABUILD.git "$WORK_DIR" || die "Erreur lors du clonage du projet"
elif [ -d "$WORK_DIR/.git" ]; then
    echo -e "${BLUE}Mise à jour du projet existant...${NC}"
    cd "$WORK_DIR" || die "Impossible d'accéder au répertoire $WORK_DIR"
    git pull || die "Erreur lors de la mise à jour du projet"
fi

# Se déplacer dans le répertoire du projet
cd "$WORK_DIR" || die "Impossible d'accéder au répertoire $WORK_DIR"

# Fonction pour demander une valeur
ask_value() {
    local prompt=$1
    local default=$2
    local value

    echo -e "${GREEN}$prompt${NC}"
    if [ ! -z "$default" ]; then
        echo -n "[$default]: "
    fi
    read value
    echo

    if [ -z "$value" ] && [ ! -z "$default" ]; then
        echo "$default"
    else
        echo "$value"
    fi
}

# Création du fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "Configuration des variables d'environnement..."
    
    SUPABASE_URL=$(ask_value "Entrez l'URL Supabase")
    SUPABASE_KEY=$(ask_value "Entrez la clé Supabase")
    GITHUB_CLIENT_ID=$(ask_value "Entrez le Client ID GitHub")

    cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
VITE_GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
EOF

    echo -e "${GREEN}Fichier .env créé avec succès!${NC}"
else
    echo -e "${BLUE}Fichier .env existant détecté${NC}"
fi

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