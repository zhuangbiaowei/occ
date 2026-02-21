import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 用户状态接口
interface UserState {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: UserState['user']) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

// 应用状态接口
interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
}

// 创建用户状态 store
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      set => ({
        user: null,
        token: null,
        isAuthenticated: false,
        setUser: user => set({ user, isAuthenticated: !!user }),
        setToken: token => set({ token }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
      }),
      {
        name: 'user-storage',
        partialize: state => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// 创建应用状态 store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      set => ({
        sidebarCollapsed: false,
        theme: 'light',
        language: 'zh-CN',
        toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setTheme: theme => set({ theme }),
        setLanguage: language => set({ language }),
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
