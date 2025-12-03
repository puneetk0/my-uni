import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin, apiMe, apiRegister } from '@/lib/apiClient';

interface LocalUser { id: string; email: string; name?: string; avatarUrl?: string; role?: 'user' | 'faculty' | 'admin' }

interface AuthContextType {
  user: LocalUser | null;
  session: null;
  userRole: 'user' | 'faculty' | 'admin' | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session] = useState<null>(null);
  const [userRole, setUserRole] = useState<'user' | 'faculty' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // On mount, attempt to load user from stored token
    const init = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const { user } = await apiMe();
          setUser({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role });
          setUserRole(user.role || 'user');
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (e) {
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchUserRole = async (_userId: string, role?: 'user' | 'faculty' | 'admin') => {
    if (role) setUserRole(role);
    else setUserRole('user');
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const res = await apiRegister({ email, password, name });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      setUser({ id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role });
      await fetchUserRole(res.user.id, res.user.role);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiLogin({ email, password });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      setUser({ id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role });
      await fetchUserRole(res.user.id, res.user.role);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setUserRole(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
