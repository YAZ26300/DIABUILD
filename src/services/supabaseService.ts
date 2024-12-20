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
    onProgress(1); // SQL preparation
    console.log('Step 1: Cleaning SQL script...');
    const commands = sqlScript
      .replace(/\r\n/g, '\n')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    onProgress(2); // Schema deployment
    console.log('Step 2: Executing SQL commands...');
    for (const command of commands) {
      if (!command) continue;
      
      console.log('Executing command:', command);
      const { data, error } = await supabase
        .rpc('execute_sql', {
          sql_command: command
        });

      if (error) {
        console.error('Error executing SQL:', error);
        throw error;
      }
    }

    onProgress(3); // Completion
    console.log('Step 3: All commands executed successfully');
    return { success: true };
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}; 