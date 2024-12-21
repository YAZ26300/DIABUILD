#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Configuration de l'application IA Diagram Chat${NC}"
echo "----------------------------------------"

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
    echo "Docker n'est pas installé. Veuillez installer Docker avant de continuer."
    exit 1
fi

# Vérification de Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installé. Veuillez installer Docker Compose avant de continuer."
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