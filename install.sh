#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Configuration de l'application IA Diagram Chat${NC}"
echo "----------------------------------------"

# Vérification de Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git n'est pas installé. Veuillez installer Git avant de continuer.${NC}"
    exit 1
fi

# Création du répertoire de travail
WORK_DIR="ia-diagram-chat"
if [ ! -d "$WORK_DIR" ]; then
    echo -e "${BLUE}Clonage du projet...${NC}"
    git clone https://github.com/YAZ26300/DIABUILD.git "$WORK_DIR"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erreur lors du clonage du projet${NC}"
        exit 1
    fi
fi

# Se déplacer dans le répertoire du projet
cd "$WORK_DIR" || exit 1

# Fonction pour demander une valeur avec une valeur par défaut
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

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker n'est pas installé. Veuillez installer Docker avant de continuer.${NC}"
    exit 1
fi

# Vérification de Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose n'est pas installé. Veuillez installer Docker Compose avant de continuer.${NC}"
    exit 1
fi

# Vérification que Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Docker n'est pas en cours d'exécution. Veuillez démarrer Docker avant de continuer.${NC}"
    exit 1
fi

# Lancement des conteneurs Docker
echo -e "${BLUE}Démarrage des conteneurs Docker...${NC}"
docker-compose up -d

# Installation des dépendances Node.js
echo -e "${BLUE}Installation des dépendances...${NC}"
npm install

# Démarrage de l'application
echo -e "${GREEN}Installation terminée!${NC}"
echo -e "${BLUE}Démarrage de l'application...${NC}"
npm run dev