import { useCallback, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

export interface UseAccion<A extends unknown[], R> {
  ejecutar: (...args: A) => Promise<R | undefined>;
  cargando: boolean;
  error: string;
  limpiarError: () => void;
}

/**
 * Envuelve una acción asíncrona (llamada a la API) con estado de carga y mensaje de error legible.
 * Las vistas nunca manejan promesas ni errores: usan hooks de feature construidos sobre este.
 */
export function useAccion<A extends unknown[], R>(accion: (...args: A) => Promise<R>): UseAccion<A, R> {
  const { t } = useTranslations();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const ejecutar = useCallback(
    async (...args: A) => {
      setCargando(true);
      setError('');
      try {
        return await accion(...args);
      } catch (e) {
        setError(mensajeDeError(e, t.common.unexpectedError));
        return undefined;
      } finally {
        setCargando(false);
      }
    },
    [accion, t],
  );

  const limpiarError = useCallback(() => setError(''), []);
  return { ejecutar, cargando, error, limpiarError };
}
