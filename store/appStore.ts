'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from '@/types';

interface AppStore extends AppState {
  toggleDarkMode: () => void;
  setConnected: (connected: boolean) => void;
  setSessionId: (sessionId: string | undefined) => void;
  setTyping: (typing: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isConnected: false,
      sessionId: undefined,
      isTyping: false,
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setConnected: (connected) => set({ isConnected: connected }),
      setSessionId: (sessionId) => set({ sessionId }),
      setTyping: (typing) => set({ isTyping: typing }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);