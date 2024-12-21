#!/bin/bash

# Check environment and Docker status in WSL
if grep -qi microsoft /proc/version; then
    echo "WSL Environment detected!"
    
    # Check if Docker is actually running and accessible
    if docker info &> /dev/null; then
        echo "Docker Desktop is running and accessible ✓"
    else
        echo "Error: Docker is not accessible in WSL."
        echo "Please ensure:"
        echo "1. Docker Desktop is installed and running"
        echo "2. WSL integration is enabled in Docker Desktop settings"
        echo "3. You've restarted your WSL terminal after enabling integration"
        echo ""
        echo "To fix:"
        echo "1. Open Docker Desktop"
        echo "2. Go to Settings > Resources > WSL Integration"
        echo "3. Enable integration for your WSL distribution"
        echo "4. Click Apply & Restart"
        echo "5. Open a new WSL terminal and try again"
        exit 1
    fi
else
    # Docker installation for native Linux
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
fi

# Check if Docker is accessible
if ! docker info &> /dev/null; then
    echo "Error: Docker is not accessible."
    echo "If you're using WSL, make sure that:"
    echo "1. Docker Desktop is running"
    echo "2. WSL integration is enabled in Docker Desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

# Create necessary files
echo "Creating project files..."

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5173:5173"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - ollama
    command: sh -c "npm run dev -- --host"

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    command: sh -c "ollama pull llama3.2 && ollama serve"

volumes:
  ollama_data:
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
EOF

# Request environment variables with validation
echo "Environment Configuration..."

while true; do
    echo -n "Enter your Supabase URL: "
    read supabase_url
    [[ -n "$supabase_url" ]] && break
    echo "Error: Supabase URL cannot be empty"
done

while true; do
    echo -n "Enter your Supabase Anon Key: "
    read supabase_key
    [[ -n "$supabase_key" ]] && break
    echo "Error: Supabase Anon Key cannot be empty"
done

while true; do
    echo -n "Enter your GitHub Client ID: "
    read github_client_id
    [[ -n "$github_client_id" ]] && break
    echo "Error: GitHub Client ID cannot be empty"
done

# Create .env file
echo "Creating environment file..."
cat > .env << EOF
VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key
VITE_GITHUB_CLIENT_ID=$github_client_id
EOF

# Launch Docker Compose
echo "Starting the application..."
docker-compose up --build -d || {
    echo "Error: Failed to start Docker Compose"
    exit 1
}

echo "
Installation completed!
The application is available at http://localhost:5173

To access the application:
1. Open http://localhost:5173 in your browser
2. Login with GitHub
3. Start creating your database schemas!

To view logs: docker-compose logs -f
To stop: docker-compose down

Project installed in: $TEMP_DIR
" 