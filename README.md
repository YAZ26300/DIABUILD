# IA Diagram Chat

A web application for creating database diagrams using AI.

## Prerequisites

### 1. Ollama Installation
1. Download and install [Ollama](https://ollama.ai)
2. Open a terminal and run:
   ```bash
   ollama pull llama3.2
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```

## Installation

### 1. Clone the project
```bash
git clone https://github.com/your-username/ia-diagram-chat.git
cd ia-diagram-chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configuration

#### a. GitHub OAuth Configuration
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New OAuth App"
3. Fill in the information:
   - Application name: `IA Diagram Chat`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback`
4. Note the generated `Client ID`

#### b. Supabase Configuration
1. Create an account on [Supabase](https://supabase.com)
2. Create a new project
3. In Authentication > Providers > GitHub:
   - Enable GitHub provider
   - Add the GitHub Client ID
4. In SQL Editor, create the following RPC function:
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
5. In project settings, note down:
   - Project URL
   - Project API keys (anon/public)
   - Connection string (Database URL)

#### c. Environment File Configuration
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DATABASE_URL=your_database_url
```

### 4. Launch the application
```bash
npm run dev
```

The application will be available at: http://localhost:5173

## Features
- AI-powered database diagram creation
- SQL script generation
- Supabase authentication
- Diagram export
- Intuitive interface

## Technologies Used
- React + TypeScript
- Vite
- Supabase (PostgreSQL)
- Ollama (llama3.2)
- React Flow
- Tailwind CSS
- Radix UI

## License
MIT
