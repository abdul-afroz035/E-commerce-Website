import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { authApi, addressApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  addresses: Address[];
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Partial<Address>) => Promise<Address>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('zapkart_token'));
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          setUser(res.user);
          fetchAddresses();
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const res = await addressApi.getAddresses();
      setAddresses(res.addresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('zapkart_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    fetchAddresses();
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await authApi.register(name, email, password, phone);
    localStorage.setItem('zapkart_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    fetchAddresses();
  };

  const logout = () => {
    localStorage.removeItem('zapkart_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const addAddress = async (addrData: Partial<Address>) => {
    const res = await addressApi.addAddress(addrData);
    setAddresses((prev) => [res.address, ...prev]);
    return res.address;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        addresses,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        fetchAddresses,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
