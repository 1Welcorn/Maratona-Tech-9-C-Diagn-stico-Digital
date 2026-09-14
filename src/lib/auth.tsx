import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Role = 'student' | 'teacher' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  setRoleImmediately: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  setRoleImmediately: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(() => {
    return localStorage.getItem('student_name') ? 'student' : null;
  });
  const [loading, setLoading] = useState(true);

  const wasPromotedRef = useRef(false);
  const fetchRoleCounter = useRef(0);

  const fetchRole = async (userId: string, currentCounter: number) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching role:', error);
        return;
      }
      
      // Prevent race conditions: don't override if counter is stale
      if (currentCounter !== fetchRoleCounter.current) return;
      
      // If locally promoted, don't overwrite back to student if DB is stale
      if (wasPromotedRef.current && data.role === 'student') return;

      if (data && data.role) {
        setRole(data.role);
      }
    } catch (err) {
      console.error('Unexpected error fetching role', err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Se já foi setado manualmente como estudante antes do supabase responder, libera
    if (role === 'student' && !wasPromotedRef.current) {
        setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const counter = ++fetchRoleCounter.current;
        fetchRole(session.user.id, counter);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const counter = ++fetchRoleCounter.current;
        fetchRole(session.user.id, counter).finally(() => setLoading(false));
      } else {
        setRole(null);
        wasPromotedRef.current = false;
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const setRoleImmediately = (newRole: Role) => {
    if (newRole === 'teacher') {
      wasPromotedRef.current = true;
    }
    setRole(newRole);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, setRoleImmediately }}>
      {children}
    </AuthContext.Provider>
  );
};
