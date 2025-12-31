'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setRole(user.user_metadata?.role || null);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      } finally {
        setLoading(false);
      }
    };

    getRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const canUpload = role && ['Lecturer', 'Class Rep'].includes(role);
  const isStudent = role === 'Student';

  return { role, loading, user, canUpload, isStudent };
}

