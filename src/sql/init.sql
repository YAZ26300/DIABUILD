-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create deployment queue table
CREATE TABLE IF NOT EXISTS public.deployment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sql_command TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    error TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.deployment_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own deployment commands"
ON public.deployment_queue
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deployment commands"
ON public.deployment_queue
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployment commands"
ON public.deployment_queue
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create function to process SQL commands
CREATE OR REPLACE FUNCTION public.process_sql_command(command TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE command;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.deployment_queue TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_sql_command TO authenticated;

-- Create a function to execute SQL commands
CREATE OR REPLACE FUNCTION public.execute_sql_command(sql_command TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE sql_command;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'SQL Error: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql_command TO authenticated; 