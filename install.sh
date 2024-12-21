#!/bin/bash

# Check environment and Docker status in WSL
if grep -qi microsoft /proc/version; then
    echo "WSL Environment detected!"
    
    # Check if Docker is actually running and accessible
    if docker info &> /dev/null; then
        echo "Docker Desktop is running and accessible ✓"
    else
        echo "Error: Docker is not accessible in WSL."
        echo "Please ensure Docker Desktop is running and WSL integration is enabled"
        exit 1
    fi
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

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ia-diagram-chat",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

# Get Supabase URL from user
echo "Please enter your Supabase URL:"
read -p "> " SUPABASE_URL

# Use default values for other variables
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYXZiY2Z1a2hmY3Boa3J1ZnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzkwMDEsImV4cCI6MjA1MDIxNTAwMX0.z2VY3RdV5YmZojehSpQWX5kfZWVwiZx6LssDkOAxpzk"
GITHUB_CLIENT_ID="Ov23li3oU9zgcAdD0xMe"

# Create .env file
echo "Creating environment file..."
cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
VITE_GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
EOF

echo "Environment file created ✓"

# Launch Docker Compose
echo "Starting the application..."
docker-compose up --build -d

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