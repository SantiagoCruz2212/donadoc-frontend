import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/shared/constants/constants';
import { sessionStorageAdapter } from '@/shared/storage/session-storage-adapter';

import { SessionStore } from './session-types';

/** Sesión del personal: se persiste en sessionStorage y alimenta al cliente HTTP y a las guardias de ruta. */
export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      accessToken: null,
      usuario: null,
      iniciarSesion: (accessToken, usuario) => set({ accessToken, usuario }),
      cerrarSesion: () => set({ accessToken: null, usuario: null }),
    }),
    {
      name: STORAGE_KEYS.sesion,
      storage: createJSONStorage(() => sessionStorageAdapter),
      partialize: (s) => ({ accessToken: s.accessToken, usuario: s.usuario }),
    },
  ),
);
