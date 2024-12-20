import { Button } from '@radix-ui/themes';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuthWrapperProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  supabase: SupabaseClient | null;
  children: React.ReactNode;
}

export const AuthWrapper = ({
  isLoading,
  isAuthenticated,
  supabase,
  children
}: AuthWrapperProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#121212] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Authentication Required</h1>
        <p className="text-gray-400 mb-6">Please sign in to access the chat</p>
        <Button 
          onClick={() => supabase?.auth.signInWithOAuth({ 
            provider: 'github',
            options: {
              redirectTo: window.location.origin
            }
          })}
          className="bg-[#333] hover:bg-[#444] text-white px-6 py-2 rounded"
        >
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}; 