import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Login action
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          const mockUser = {
            id: '1',
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
          
          setTimeout(() => {
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }, 1000);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Register action
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          const mockUser = {
            id: '1',
            email,
            name,
            createdAt: new Date().toISOString()
          };
          
          setTimeout(() => {
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }, 1000);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Logout action
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      // Check auth status
      checkAuth: () => {
        const { user } = get();
        return !!user;
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

export default useAuthStore;
