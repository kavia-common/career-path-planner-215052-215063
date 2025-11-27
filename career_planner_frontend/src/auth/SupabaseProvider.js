import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { apiClient } from '../services/apiClient';

const SupabaseCtx = createContext(null);

// PUBLIC_INTERFACE
export function useSupabase() {
  /** Access Supabase auth context with session, profile, and helper methods. */
  return useContext(SupabaseCtx);
}

// PUBLIC_INTERFACE
export function SupabaseProvider({ url, anonKey, children }) {
  /**
   * Provides a configured Supabase client, tracks auth session, fetches user profile (RBAC),
   * and exposes auth actions (sign in, sign up, sign out).
   */
  const client = useMemo(() => {
    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, [url, anonKey]);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!client);

  useEffect(() => {
    if (!client) return;
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const { data: { session } } = await client.auth.getSession();
      if (!mounted) return;
      setSession(session || null);

      if (session?.access_token) {
        apiClient.setAuthToken(session.access_token);
        try {
          const me = await apiClient.get('/me'); // expects { email, is_admin, full_name, ... }
          if (mounted) setProfile(me);
        } catch (_e) {
          if (mounted) setProfile(null);
        }
      } else {
        apiClient.setAuthToken(null);
        setProfile(null);
      }
      setLoading(false);
    };

    const { data: authListener } = client.auth.onAuthStateChange((_event, sess) => {
      setSession(sess || null);
      if (sess?.access_token) {
        apiClient.setAuthToken(sess.access_token);
        apiClient.get('/me').then(setProfile).catch(() => setProfile(null));
      } else {
        apiClient.setAuthToken(null);
        setProfile(null);
      }
    });

    init();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [client]);

  const ctxValue = useMemo(() => ({
    client,
    session,
    profile,
    loading,
    // PUBLIC_INTERFACE
    async signInWithPassword(email, password) {
      /** Sign in using email/password against Supabase. */
      if (!client) throw new Error('Supabase not configured');
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error };
      return { session: data.session };
    },
    // PUBLIC_INTERFACE
    async signUpWithPassword(email, password, siteUrl) {
      /** Sign up user; use emailRedirectTo as per instruction with SITE_URL. */
      if (!client) throw new Error('Supabase not configured');
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: siteUrl }
      });
      if (error) return { error };
      return { user: data.user };
    },
    // PUBLIC_INTERFACE
    async signOut() {
      /** Sign out of Supabase session. */
      if (!client) return;
      await client.auth.signOut();
    }
  }), [client, session, profile, loading]);

  return (
    <SupabaseCtx.Provider value={ctxValue}>
      {children}
    </SupabaseCtx.Provider>
  );
}
