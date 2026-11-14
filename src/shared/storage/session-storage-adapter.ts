import { StateStorage } from 'zustand/middleware';

/**
 * Adaptador de almacenamiento para los stores persistidos. Usa sessionStorage (la sesión se pierde al cerrar la pestaña)
 * y no falla si el navegador lo bloquea: en ese caso el estado vive solo en memoria.
 */
export const sessionStorageAdapter: StateStorage = {
  getItem: (nombre) => {
    try {
      return sessionStorage.getItem(nombre);
    } catch {
      return null;
    }
  },
  setItem: (nombre, valor) => {
    try {
      sessionStorage.setItem(nombre, valor);
    } catch {
      /* sin almacenamiento: el estado queda en memoria */
    }
  },
  removeItem: (nombre) => {
    try {
      sessionStorage.removeItem(nombre);
    } catch {
      /* nada que borrar */
    }
  },
};
