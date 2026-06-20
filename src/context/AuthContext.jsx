// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

async function mapUser(authUser) {
  if (!authUser) return null;

  const metadata = authUser.user_metadata || {};
  const appMetadata = authUser.app_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    authUser.email?.split('@')[0] ||
    'User';
  const initials = name.charAt(0).toUpperCase();

  let role = metadata.role || appMetadata.role || appMetadata?.claims?.role || 'user';

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', authUser.email)
      .maybeSingle();

    if (!profileError && profileData?.role !== undefined && profileData?.role !== null) {
      role = String(profileData.role);
    }

    console.log('[AuthDebug] profile role lookup:', {
      email: authUser.email,
      roleFromProfile: profileData?.role ?? null,
      roleFromAuth: metadata.role || appMetadata.role || appMetadata?.claims?.role || null,
      profileError: profileError?.message || null,
    });
  } catch (error) {
    console.log('[AuthDebug] profile role lookup failed:', error);
  }

  const mappedUser = {
    id: authUser.id,
    name,
    email: authUser.email,
    role,
    avatar: initials,
  };

  console.log('[AuthDebug] mapped user:', mappedUser);
  console.log('[AuthDebug] resolved role:', role);

  return mappedUser;
}

async function resolveLoginEmail(identifier) {
  const normalized = identifier.trim();

  if (!normalized) {
    throw new Error('Vui lòng nhập username hoặc email');
  }

  if (normalized.includes('@')) {
    return normalized;
  }

  const possibleColumns = [
    'username',
    'user_name',
    'login_name',
    'display_name',
    'name',
  ];

  for (const column of possibleColumns) {
    const exactQuery = supabase
      .from('profiles')
      .select('email')
      .eq(column, normalized)
      .maybeSingle();

    const { data: exactData, error: exactError } = await exactQuery;

    if (!exactError && exactData?.email) {
      console.log('[AuthDebug] username lookup success:', {
        column,
        identifier: normalized,
        email: exactData.email,
      });
      return exactData.email;
    }

    const caseInsensitiveQuery = supabase
      .from('profiles')
      .select('email')
      .ilike(column, normalized)
      .maybeSingle();

    const { data: ciData, error: ciError } = await caseInsensitiveQuery;

    if (!ciError && ciData?.email) {
      console.log('[AuthDebug] username lookup success (case-insensitive):', {
        column,
        identifier: normalized,
        email: ciData.email,
      });
      return ciData.email;
    }

    console.log('[AuthDebug] username lookup attempt:', {
      column,
      identifier: normalized,
      exactError: exactError?.message || null,
      ciError: ciError?.message || null,
      exactData,
      ciData,
    });
  }

  throw new Error(
    'Không tìm thấy tài khoản với username này. Hãy kiểm tra lại tên cột trong bảng profiles hoặc quyền đọc (RLS) của bảng đó.'
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = sessionStorage.getItem('crm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        const safeUser = await mapUser(session.user);
        console.log('[AuthDebug] restored session role:', safeUser?.role);
        setUser(safeUser);
        sessionStorage.setItem('crm_user', JSON.stringify(safeUser));
      } else {
        console.log('[AuthDebug] no session found on restore');
        setUser(null);
        sessionStorage.removeItem('crm_user');
      }

      setLoading(false);
    }

    restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const safeUser = await mapUser(session.user);
        console.log('[AuthDebug] auth state changed role:', safeUser?.role);
        setUser(safeUser);
        sessionStorage.setItem('crm_user', JSON.stringify(safeUser));
      } else {
        console.log('[AuthDebug] auth state changed: signed out');
        setUser(null);
        sessionStorage.removeItem('crm_user');
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function login(identifier, password) {
    setLoading(true);
    setLoginError('');

    try {
      const email = await resolveLoginEmail(identifier);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = error.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
        setLoginError(message);
        setLoading(false);
        throw error;
      }

      if (data?.user) {
        const safeUser = await mapUser(data.user);
        console.log('[AuthDebug] login success role:', safeUser?.role);
        setUser(safeUser);
        sessionStorage.setItem('crm_user', JSON.stringify(safeUser));
        setLoading(false);
        return safeUser;
      }

      setLoading(false);
      throw new Error('Không thể đăng nhập');
    } catch (error) {
      const message =
        error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
      setLoginError(message);
      setLoading(false);
      throw error;
    }
  }

  async function logout() {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('crm_user');
    setLoading(false);
  }

  function updateProfile(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem('crm_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError, setLoginError, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
