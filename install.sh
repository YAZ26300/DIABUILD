#!/bin/bash

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé. Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installé. Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Cloner le projet
git clone https://github.com/your-username/ia-diagram-chat.git
cd ia-diagram-chat

# Demander les variables d'environnement
echo "Configuration de l'environnement..."
echo -n "Entrez votre URL Supabase: "
read supabase_url
echo -n "Entrez votre clé anonyme Supabase: "
read supabase_key
echo -n "Entrez votre GitHub Client ID: "
read github_client_id

# Créer le fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key
VITE_GITHUB_CLIENT_ID=$github_client_id
EOF

# Lancer Docker Compose
echo "Démarrage de l'application..."
docker-compose up --build -d

echo "
Installation terminée !
L'application est disponible sur http://localhost:5173

Pour voir les logs: docker-compose logs -f
Pour arrêter: docker-compose down
" 