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

# Mise à jour du package.json pour résoudre les conflits de dépendances
echo -e "${BLUE}Mise à jour des dépendances...${NC}"
cat > package.json << EOF
{
  "name": "ia-diagram-chat",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/themes": "^2.0.3",
    "@supabase/supabase-js": "^2.39.1",
    "framer-motion": "^10.13.1",
    "prismjs": "^1.29.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/prismjs": "^1.26.3",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "8.18.1",
    "@typescript-eslint/parser": "8.18.1",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

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

# Création d'un nouveau Dockerfile
cat > Dockerfile << EOF
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
EOF

echo -e "${GREEN}Dockerfile créé avec succès!${NC}"

# Création du docker-compose.yml
cat > docker-compose.yml << EOF
services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_SUPABASE_URL=\${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY}
      - VITE_GITHUB_CLIENT_ID=\${VITE_GITHUB_CLIENT_ID}
EOF

echo -e "${GREEN}docker-compose.yml créé avec succès!${NC}"

# Création du .dockerignore
cat > .dockerignore << EOF
node_modules
npm-debug.log
EOF

echo -e "${GREEN}.dockerignore créé avec succès!${NC}"

# Construction et démarrage des conteneurs Docker
echo -e "${BLUE}Construction et démarrage des conteneurs Docker...${NC}"
docker-compose build --no-cache || die "Erreur lors de la construction des conteneurs Docker"
docker-compose up -d || die "Erreur lors du démarrage des conteneurs Docker"

# Démarrage de l'application
echo -e "${GREEN}Installation terminée!${NC}"
echo -e "${BLUE}L'application est en cours de démarrage...${NC}"
echo -e "${GREEN}L'application sera accessible sur http://localhost:5173${NC}"
echo -e "${BLUE}Utilisez 'docker-compose logs -f' pour voir les logs${NC}"