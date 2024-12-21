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

# Create src directory
mkdir -p src

# Create App.tsx
cat > src/App.tsx << 'EOF'
import React from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            IA Diagram Chat
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-4">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Décrivez votre schéma de base de données..."
            rows={4}
          />
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Générer
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IA Diagram Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Create main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Get Supabase URL from user
echo "Please enter your Supabase URL:"
exec < /dev/tty
read -p "> " SUPABASE_URL

# Vérifier si l'URL est vide
while [ -z "$SUPABASE_URL" ]; do
  echo "URL cannot be empty. Please enter your Supabase URL:"
  read -p "> " SUPABASE_URL
done

# Get Supabase Anon Key from user
echo "Please enter your Supabase Anon Key:"
read -p "> " SUPABASE_ANON_KEY

# Vérifier si la clé est vide
while [ -z "$SUPABASE_ANON_KEY" ]; do
  echo "Anon Key cannot be empty. Please enter your Supabase Anon Key:"
  read -p "> " SUPABASE_ANON_KEY
done

# Get GitHub Client ID from user
echo "Please enter your GitHub Client ID:"
read -p "> " GITHUB_CLIENT_ID

# Vérifier si l'ID est vide
while [ -z "$GITHUB_CLIENT_ID" ]; do
  echo "Client ID cannot be empty. Please enter your GitHub Client ID:"
  read -p "> " GITHUB_CLIENT_ID
done

# Restaurer l'entrée standard
exec <&-

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