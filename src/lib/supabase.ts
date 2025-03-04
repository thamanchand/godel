import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

console.log('Supabase URL:', supabaseUrl); // Debug log
console.log('Supabase Key exists:', !!supabaseAnonKey); // Debug log (don't log the actual key)
console.log('Site URL:', siteUrl); // Debug log

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('Successfully signed out'); // Debug log
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('getCurrentUser result:', user); // Debug log
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  console.log('Setting up auth state change listener'); // Debug log
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    console.log('Auth state changed:', { event: _event, user: !!user }); // Debug log
    callback(user);
  });
};

// Social login functions
export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/dashboard`,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${siteUrl}/dashboard`,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log('Starting sign up process with email:', email);
    console.log('Using redirect URL:', `${siteUrl}/dashboard`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/dashboard`,
        data: {
          email: email,
        },
      },
    });

    if (error) {
      console.error('Sign up error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log('Sign up successful. User data:', {
      id: data.user?.id,
      email: data.user?.email,
      emailConfirmed: data.user?.email_confirmed_at,
      createdAt: data.user?.created_at,
    });

    return data;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};
