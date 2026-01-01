import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GlobalLoader } from '../components/ui/GlobalLoader';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const activeFetchRef = React.useRef<{ id: string, promise: Promise<Profile | null> } | null>(null);

  const fetchProfile = async (userId: string) => {
    // Return existing promise if already fetching for this user
    if (activeFetchRef.current && activeFetchRef.current.id === userId) {
        return activeFetchRef.current.promise;
    }

    const fetchPromise = (async () => {
        try {
          
          const queryPromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          );

          // Race against 5s timeout
          const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

          if (error) {
            console.error('Error fetching profile:', error);
            // If error is timeout or connection, maybe we should return null but NOT cache it as "done" if we want to retry?
            // For now, let's return null.
            return null;
          }
          return data as Profile;
        } catch (err) {
          console.error('Error fetching profile:', err);
          return null;
        } finally {
           // Clear cache when done? Or keep it?
           // If we keep it, we won't refetch on subsequent calls (like sign in after session check).
           // But if we want to support 'refreshProfile', we need to be able to bypass this.
           // However, for the initial load storm, we want to cache.
           if (activeFetchRef.current?.id === userId) {
               activeFetchRef.current = null;
           }
        }
    })();

    activeFetchRef.current = { id: userId, promise: fetchPromise };
    return fetchPromise;
  };

  const refreshProfile = async () => {
    if (user) {
       // Force new fetch by clearing ref
       if (activeFetchRef.current?.id === user.id) {
           activeFetchRef.current = null;
       }
      const profile = await fetchProfile(user.id);
      setProfile(profile);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout to prevent infinite loading
    // Increased to 8000ms to allow for the 5000ms profile fetch timeout to resolve first
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out after 8000ms. Forcing loading=false.');
        setLoading(false);
      }
    }, 8000);

    const initializeAuth = async () => {
      try {
        // Add a race condition check - if timeout happens first, we still want to set data but not toggle loading if already done
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          const profile = await fetchProfile(initialSession.user.id);
          if (mounted) setProfile(profile);
        } else {
          // If no session, we are done loading
          if (mounted) {
             setLoading(false);
             clearTimeout(safetyTimeout);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
           setLoading(false);
           clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Always sync session/user state
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          activeFetchRef.current = null;
          setProfile(null);
          setLoading(false);
          clearTimeout(safetyTimeout);
        } else if (session?.user) {
           if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
             const profile = await fetchProfile(session.user.id);
             if (mounted) {
               setProfile(profile);
               setLoading(false);
             }
           }
        } else if (event === 'INITIAL_SESSION' && !session) {
           setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error };
      }
      
      await supabase.from('activity_logs').insert({
        action: 'login',
        entity_type: 'auth',
        metadata: { email }
      });
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'client'
        });
        
        await supabase.from('activity_logs').insert({
          user_id: data.user.id,
          action: 'signup',
          entity_type: 'auth',
          metadata: { email, fullName }
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (user) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'logout',
        entity_type: 'auth'
      });
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
