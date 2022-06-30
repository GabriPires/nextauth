import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';
import { setCookie, parseCookies } from 'nookies';
import { api } from '../services/api';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  user?: User;
  isAuthenticated: boolean;
};

export const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  const { push } = useRouter();

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api
        .get('/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({
            email,
            permissions,
            roles,
          });
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email: email,
        permissions,
        roles,
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};
