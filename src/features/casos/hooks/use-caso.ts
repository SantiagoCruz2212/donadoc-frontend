import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { obtenerCaso } from '../apis/casos-api';
import { Caso } from '../models/casos-models';

/** Carga un caso por identificador y permite volver a cargarlo (p. ej. tras cambiar su estado). */
export function useCaso(id: string) {
  const { t } = useTranslations();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    try {
      setCaso(await obtenerCaso(id));
      setError('');
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [id, t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { caso, error, recargar };
}
