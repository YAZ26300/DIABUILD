import { motion } from 'framer-motion';
import { LandingPage } from './LandingPage';
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
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 rounded-full border-2 border-indigo-600"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage supabase={supabase} />;
  }

  return <>{children}</>;
}; 