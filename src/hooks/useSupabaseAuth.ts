import { useState, useEffect } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

export const useSupabaseAuth = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      setIsAuthLoading(false);
      return;
    }

    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(supabaseClient);
      
      const checkAuth = async () => {
        try {
          const { data: { user }, error } = await supabaseClient.auth.getUser();
          if (error) throw error;
          setIsAuthenticated(!!user);
        } catch (error) {
          console.error('Error checking auth:', error);
          setIsAuthenticated(false);
        } finally {
          setIsAuthLoading(false);
        }
      };

      checkAuth();
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setIsAuthLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    supabase,
    isAuthenticated,
    isAuthLoading,
    handleLogout
  };
}; 