import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          
          if (response.success) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Login failed' 
            });
            return { success: false, error: response.message };
          }
        } catch (error) {
          const errorMessage = error.message || 'Network error during login';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Register action
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({ name, email, password });
          
          if (response.success) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Registration failed' 
            });
            return { success: false, error: response.message };
          }
        } catch (error) {
          const errorMessage = error.message || 'Network error during registration';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Logout action
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        }
      },
      
      // Get current user (for auto-login)
      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getCurrentUser();
          
          if (response.success) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
            return { success: false };
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
          return { success: false };
        }
      },
      
      // Refresh token
      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken();
          return response.success;
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout user
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
