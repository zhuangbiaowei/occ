import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  REVIEWER = 'reviewer',
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,

      login: (data: LoginResponse) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          permissions: data.user?.roles?.flatMap(role => role.permissions) || [],
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          permissions: [],
          isAuthenticated: false,
        });
      },

      refreshToken: (accessToken: string) => {
        set({ accessToken });
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export function hasPermission(resource: string, action: string): boolean {
  const { permissions } = useAuthStore.getState();
  return permissions.some(p => p.resource === resource && p.actions.includes(action));
}

export function hasRole(role: UserRole): boolean {
  const { user } = useAuthStore.getState();
  return user?.role === role || false;
}

export function hasAnyRole(...roles: UserRole[]): boolean {
  const { user } = useAuthStore.getState();
  return user ? roles.includes(user.role) : false;
}

export function isSuperAdmin(): boolean {
  return hasRole(UserRole.SUPER_ADMIN);
}

export function isAdmin(): boolean {
  return hasRole(UserRole.ADMIN) || isSuperAdmin();
}

export function isLawyer(): boolean {
  return hasRole(UserRole.LAWYER);
}

export function isReviewer(): boolean {
  return hasRole(UserRole.REVIEWER);
}

export const PermissionGuard: React.FC<{
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ resource, action, fallback = null, children }) => {
  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};

export const RoleGuard: React.FC<{
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ allowedRoles, fallback = null, children }) => {
  return hasAnyRole(...allowedRoles) ? <>{children}</> : <>{fallback}</>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },
};

export function useAuth() {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.login(data);
      navigate('/home');
    },
  });

  const logout = () => {
    authStore.logout();
    navigate('/login');
  };

  const { mutateAsync: register, isPending: isRegistering } = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      authStore.login(data);
      navigate('/home');
    },
  });

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoggingIn,
    isRegistering,
    login,
    logout,
    register,
    hasPermission,
    hasRole,
    hasAnyRole,
  };
}
