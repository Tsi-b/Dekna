import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { AuthContext, type Order, type ShippingAddress, type UserProfile } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

// Backward-compatible re-export (prefer importing from @/hooks/use-auth or @/hooks).
export { useAuth } from "@/hooks/use-auth";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const addressesCacheKey = useCallback((userId: string) => `shipping_addresses:${userId}`, []);
  const ordersCacheKey = useCallback((userId: string) => `orders:${userId}`, []);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fetchOrders = useCallback(async (userId: string) => {
    // Prime from cache
    try {
      const cached = localStorage.getItem(ordersCacheKey(userId));
      if (cached) {
        const parsed = JSON.parse(cached) as Order[];
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch {
      // ignore cache errors
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id,status,is_mock,metadata,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { error };
    }

    const rows = (data ?? []) as Order[];
    setOrders(rows);

    try {
      localStorage.setItem(ordersCacheKey(userId), JSON.stringify(rows));
    } catch {
      // ignore localStorage quota errors
    }

    return { error: null };
  }, [ordersCacheKey]);

  const fetchAddresses = useCallback(async (userId: string) => {
    try {
      const cached = localStorage.getItem(addressesCacheKey(userId));
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ShippingAddress[];
          if (Array.isArray(parsed)) {
            setAddresses(parsed);
          }
        } catch {
          // ignore cache parse errors
        }
      }
    } catch {
      // ignore localStorage errors
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return { error };
    }

    const rows = (data ?? []) as ShippingAddress[];
    setAddresses(rows);

    try {
      localStorage.setItem(addressesCacheKey(userId), JSON.stringify(rows));
    } catch {
      // ignore localStorage quota errors
    }

    return { error: null };
  }, [addressesCacheKey]);

  // Fetch user data
  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch each domain independently so a missing table (e.g. wishlists)
    // doesn't prevent addresses from loading.

    // Profile
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(profileData ?? null);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }

    // Addresses (critical for /account/addresses)
    try {
      await fetchAddresses(userId);
    } catch (error) {
      console.error('Unexpected error fetching addresses:', error);
    }

    // Orders
    try {
      await fetchOrders(userId);
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
    }

    // Wishlist (optional: table may not exist yet)
    try {
      const { data: wishlistData, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', userId);

      // If the table does not exist in Supabase, PostgREST returns 404.
      // Don't let that break the account bootstrap.
      if (error) {
        const status = (error as any).status;
        const code = (error as any).code;
        if (status === 404 || code === '42P01') {
          setWishlistIds([]);
        } else {
          console.error('Error fetching wishlist:', error);
        }
      } else {
        setWishlistIds((wishlistData ?? []).map(w => w.product_id));
      }
    } catch (error) {
      console.error('Unexpected error fetching wishlist:', error);
    }
  }, [fetchAddresses, fetchOrders]);

  const lastUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    lastUserIdRef.current = user?.id ?? null;
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Auth is now known; unblock UI.
      setLoading(false);

      if (session?.user) {
        // Prime addresses + orders from cache immediately (helps prevent flicker on refresh)
        try {
          const cachedAddresses = localStorage.getItem(addressesCacheKey(session.user.id));
          if (cachedAddresses) {
            const parsed = JSON.parse(cachedAddresses) as ShippingAddress[];
            if (Array.isArray(parsed)) {
              setAddresses(parsed);
            }
          }
        } catch {
          // ignore cache errors
        }

        try {
          const cachedOrders = localStorage.getItem(ordersCacheKey(session.user.id));
          if (cachedOrders) {
            const parsed = JSON.parse(cachedOrders) as Order[];
            if (Array.isArray(parsed)) {
              setOrders(parsed);
            }
          }
        } catch {
          // ignore cache errors
        }

        // Fetch in background; do not block auth loading.
        fetchUserData(session.user.id).catch((e) => console.error('Error fetching user data:', e));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch in background so UI isn't stuck in a loading state.
          fetchUserData(session.user.id).catch((e) => console.error('Error fetching user data:', e));
        } else if (event === 'SIGNED_OUT') {
          // Only clear user data on an explicit sign-out.
          setProfile(null);
          setAddresses([]);
          setOrders([]);
          setWishlistIds([]);

          // Clear caches (per-user keys) when we know who the user was.
          try {
            const lastUserId = lastUserIdRef.current;
            if (lastUserId) {
              localStorage.removeItem(addressesCacheKey(lastUserId));
              localStorage.removeItem(ordersCacheKey(lastUserId));
            }
          } catch {
            // ignore
          }

          setSigningOut(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [addressesCacheKey, ordersCacheKey, fetchUserData]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (!error && data.user) {
        // Create profile row immediately after sign-up
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName
        });
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      return { error: err };
    }
  }, []);

  // Sign in with timeout
  const signIn = useCallback(async (email: string, password: string) => {
    const start = performance.now();

    try {
      if (signingIn) {
        return { error: null };
      }

      setSigningIn(true);

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Add 6 second timeout to prevent hanging
      const timeoutPromise = new Promise<{ error: any }>((resolve) =>
        setTimeout(
          () => resolve({ error: new Error('Sign in request timed out') }),
          6000
        )
      );

      const { error } = await Promise.race([signInPromise, timeoutPromise]);
      return { error };
    } catch (err: any) {
      console.error('Unexpected sign in error:', err);
      return { error: err };
    } finally {
      // Ensure signingIn stays true for at least 2 seconds for consistent UX
      const elapsed = performance.now() - start;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        setTimeout(() => setSigningIn(false), remaining);
      } else {
        setSigningIn(false);
      }
    }
  }, [signingIn]);

  // Sign out with robust error handling and state management
  const signOut = useCallback(async () => {
    const start = performance.now();

    try {
      // Prevent multiple simultaneous sign-out attempts
      if (signingOut) {
        return { error: null };
      }

      setSigningOut(true);

      // Add a safety timeout so we never hang forever if Supabase
      // fails to resolve the promise for some reason.
      const signOutPromise = supabase.auth.signOut({
        scope: 'global', // Sign out from all sessions across all devices
      });

      const timeoutPromise = new Promise<{ error: any }>((resolve) =>
        setTimeout(
          () => resolve({ error: new Error('Sign out request timed out') }),
          6000 // 6s timeout
        )
      );

      const { error } = await Promise.race([signOutPromise, timeoutPromise]);

      // If the only issue is that our timeout fired, treat it as a
      // soft success: clear local state so the user is effectively
      // signed out in this app, but log a warning for debugging.
      if (error && error.message === 'Sign out request timed out') {
        console.warn(
          'Supabase sign out timed out; clearing local auth state anyway.'
        );
      } else if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      // Immediately clear local auth-related state so the UI reflects
      // the signed-out status even if the auth event is delayed/missing.
      setSession(null);
      setUser(null);
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      setWishlistIds([]);

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected sign out error:', err);
      return { error: err };
    } finally {
      // Ensure signingOut stays true for at least 2 seconds for consistent UX
      const elapsed = performance.now() - start;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        setTimeout(() => setSigningOut(false), remaining);
      } else {
        setSigningOut(false);
      }
    }
  }, [signingOut]);

  function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  }

  // Update profile
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }

    return { error };
  }, [user]);

  const refreshAddresses = useCallback(async () => {
    if (!user) return { error: new Error('Not authenticated') };
    return fetchAddresses(user.id);
  }, [fetchAddresses, user]);

  // Add address
  const addAddress = useCallback(async (address: Omit<ShippingAddress, 'id' | 'user_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    // NOTE: We enforce "single default address" at the database level (trigger + partial unique index).
    // This avoids needing a second network request here (which can hang on some environments).
    try {
      const insertPayload = { ...address, user_id: user.id };
      const { data, error } = await withTimeout(
        supabase
          .from('shipping_addresses')
          .insert(insertPayload)
          .select()
          .single(),
        6000,
        'Saving address timed out'
      );

      if (error) {
        console.error('Supabase insert shipping_addresses failed:', {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
          payload: insertPayload,
        });
      }

      // Always reconcile with DB to avoid stale UI (e.g. timeouts, triggers)
      if (!error) {
        await fetchAddresses(user.id);
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected addAddress error:', err);
      return { error: err };
    }
  }, [fetchAddresses, user]);

  // Update address
  const updateAddress = useCallback(async (id: string, address: Partial<ShippingAddress>) => {
    if (!user) return { error: new Error('Not authenticated') };

    let error: any = null;
    try {
      const res = await withTimeout(
        supabase
          .from('shipping_addresses')
          .update({ ...address, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id),
        6000,
        'Updating address timed out'
      );
      error = (res as any).error;
    } catch (err: any) {
      console.error('Unexpected updateAddress error:', err);
      return { error: err };
    }

    if (!error) {
      await fetchAddresses(user.id);
    }

    return { error };
  }, [fetchAddresses, user]);

  // Delete address
  const deleteAddress = useCallback(async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    let error: any = null;
    try {
      const res = await withTimeout(
        supabase
          .from('shipping_addresses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id),
        6000,
        'Deleting address timed out'
      );
      error = (res as any).error;
    } catch (err: any) {
      console.error('Unexpected deleteAddress error:', err);
      return { error: err };
    }

    if (!error) {
      await fetchAddresses(user.id);
    }

    return { error };
  }, [fetchAddresses, user]);

  // Set default address
  const setDefaultAddress = useCallback(async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // NOTE: The DB trigger unsets other defaults automatically.
      const { error } = await withTimeout(
        supabase
          .from('shipping_addresses')
          .update({ is_default: true })
          .eq('id', id)
          .eq('user_id', user.id),
        6000,
        'Setting default address timed out'
      );

      if (!error) {
        await fetchAddresses(user.id);
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected setDefaultAddress error:', err);
      return { error: err };
    }
  }, [fetchAddresses, user]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });

      if (!error) {
        setWishlistIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  }, [user]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (!error) {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  }, [user]);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    if (!user) return { error: new Error('Not authenticated') };
    return fetchOrders(user.id);
  }, [fetchOrders, user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      addresses,
      orders,
      wishlistIds,
      loading,
      signUp,
      signIn,
      signOut,
      signingIn,
      signingOut,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      addToWishlist,
      removeFromWishlist,
      refreshOrders,
      refreshAddresses,
    }),
    [
      user,
      session,
      profile,
      addresses,
      orders,
      wishlistIds,
      loading,
      signUp,
      signIn,
      signOut,
      signingIn,
      signingOut,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      addToWishlist,
      removeFromWishlist,
      refreshOrders,
      refreshAddresses,
    ]
  );

  return (
    <AuthContext.Provider value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};
