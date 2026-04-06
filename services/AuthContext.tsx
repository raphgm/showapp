
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthChange, signOut, type User } from './firebase';

interface AuthContextType {
  /** The Firebase user object, or null when signed out */
  firebaseUser: User | null;
  /** True while the initial auth state is being resolved */
  loading: boolean;
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  /** Sign out of Firebase */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        loading,
        isAuthenticated: !!firebaseUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
