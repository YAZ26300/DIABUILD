import { SupabaseClient, createClient } from '@supabase/supabase-js'

interface SupabaseConfig {
  projectUrl: string;
  anonKey: string;
}

export const initSupabase = ({ projectUrl, anonKey }: SupabaseConfig) => {
  return createClient(projectUrl, anonKey);
};

export const deployToSupabase = async (sqlScript: string, supabase: SupabaseClient, onProgress: (step: number) => void) => {
  try {
    // Get current user and session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No active session');

    onProgress(1); // SQL preparation
    console.log('Step 1: Cleaning SQL script...');
    const commands = sqlScript
      .replace(/\r\n/g, '\n')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    onProgress(2); // Commands preparation
    console.log('Step 2: Preparing commands...');
    
    onProgress(3); // Executing commands
    console.log('Step 3: Executing commands...');

    for (const command of commands) {
      if (!command) continue;
      
      try {
        const { error: execError } = await supabase
          .rpc('execute_sql', {
            sql_command: command
          });

        if (execError) {
          console.error('Execution error:', execError);
          throw execError;
        }
      } catch (error: any) {
        console.error('Command execution failed:', error);
        throw new Error(`Command execution failed: ${error.message || 'Unknown error'}`);
      }
    }

    onProgress(4); // Completion
    console.log('Step 4: All commands executed successfully');
    return { success: true };
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}; 