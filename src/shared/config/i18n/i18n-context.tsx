import { createContext, ReactNode, useCallback, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/constants';

import { en } from './en';
import { es } from './es';
import { Idioma, Translations } from './types';

export interface I18nValue {
  idioma: Idioma;
  t: Translations;
  cambiarIdioma: (idioma: Idioma) => void;
}

const DICCIONARIOS: Record<Idioma, Translations> = { es, en };

function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(STORAGE_KEYS.idioma);
    if (guardado === 'es' || guardado === 'en') return guardado;
  } catch {
    /* almacenamiento no disponible: se usa el idioma del navegador */
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export const I18nContext = createContext<I18nValue>({ idioma: 'es', t: es, cambiarIdioma: () => undefined });

/** Proveedor de traducciones; se registra en app/App.tsx por encima del router. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial);

  const cambiarIdioma = useCallback((nuevo: Idioma) => {
    setIdioma(nuevo);
    try {
      localStorage.setItem(STORAGE_KEYS.idioma, nuevo);
    } catch {
      /* si no se puede guardar, el cambio vale solo para esta sesión */
    }
    document.documentElement.lang = nuevo;
  }, []);

  const value = useMemo<I18nValue>(() => ({ idioma, t: DICCIONARIOS[idioma], cambiarIdioma }), [idioma, cambiarIdioma]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
