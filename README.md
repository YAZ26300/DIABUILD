# IA Diagram Chat

A web application that generates database schemas from natural language descriptions, with direct deployment to Supabase.

## Prerequisites

### Windows Users
1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Enable WSL 2 integration in Docker Desktop settings
3. Make sure Docker Desktop is running before installation

### Option 1: Local Installation
1. **Supabase**
   - Create an account on [Supabase](https://supabase.com)
   - Create a new project
   - Get the project URL and anon key from project settings
   - In Supabase Auth settings:
     * Enable GitHub provider
     * In "URL Configuration", set:
       - Site URL: http://localhost:5173
       - Redirect URLs: http://localhost:5173/auth/callback
   - In "SQL Editor", create a new RPC function:
     ```sql
     CREATE OR REPLACE FUNCTION execute_sql(sql_command text)
     RETURNS void
     LANGUAGE plpgsql
     SECURITY DEFINER
     AS $$
     BEGIN
       EXECUTE sql_command;
     END;
     $$;
     ```

2. **GitHub OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the information:
     * Application name: IA Diagram Chat (or any name)
     * Homepage URL: http://localhost:5173 (for development)
     * Authorization callback URL: http://localhost:5173/auth/callback
   - Note down the Client ID and generate a Client Secret
   - In Supabase > Authentication > Providers > GitHub:
     * Add the GitHub Client ID and Client Secret
     * Save changes

3. **Ollama**
   - Install [Ollama](https://ollama.ai)
   - Install the llama3.2 model:
     ```bash
     ollama pull llama3.2
     ```

### Option 2: Using Docker
- Install [Docker](https://docs.docker.com/get-docker/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)
- Create a `.env` file (see Environment Variables section)

## Setup

### Option 0: One-Line Installation (Linux/MacOS)
```bash
curl -fsSL https://raw.githubusercontent.com/JOBOYA/ia-diagram-chat/main/install.sh | bash
```
This will:
- Install Docker if needed
- Install Docker Compose if needed
- Clone the project
- Set up environment variables
- Start the application

### Option 1: Local Setup
1. Clone the project:
   ```bash
   git clone https://github.com/your-username/ia-diagram-chat.git
   cd ia-diagram-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   ```

4. Start Ollama locally:
   ```bash
   ollama serve
   ```

5. Launch the application:
   ```bash
   npm run dev
   ```

### Option 2: Docker Setup
1. Clone and start the project:
   ```bash
   git clone https://github.com/your-username/ia-diagram-chat.git
   cd ia-diagram-chat
   docker-compose up --build
   ```

The application will be available at http://localhost:5173

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## Features

- AI-powered database schema generation
- Interactive diagram visualization
- Field and relationship editing
- Automatic SQL generation
- Direct deployment to Supabase
- GitHub authentication

## Architecture

- Frontend: React + TypeScript + Vite
- AI: Ollama (llama3.2)
- Database: Supabase (PostgreSQL)
- Visualization: ReactFlow
- Auth: GitHub OAuth via Supabase

## Contributing

Contributions are welcome! Feel free to:
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
