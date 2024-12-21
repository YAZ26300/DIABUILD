#!/bin/bash

# Check environment
if grep -qi microsoft /proc/version; then
    echo "WSL Environment detected!"
    echo "For WSL, please:"
    echo "1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    echo "2. Enable WSL integration in Docker Desktop"
    echo "3. Restart this script once Docker Desktop is installed and configured"
    echo ""
    read -p "Have you already installed and configured Docker Desktop? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please install Docker Desktop and restart the script"
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

# Clone the project
git clone https://github.com/YAZ26300/DIABUILD.git
cd DIABUILD

# Request environment variables
echo "Environment Configuration..."
echo -n "Enter your Supabase URL: "
read supabase_url
echo -n "Enter your Supabase Anon Key: "
read supabase_key
echo -n "Enter your GitHub Client ID: "
read github_client_id

# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key
VITE_GITHUB_CLIENT_ID=$github_client_id
EOF

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
" 