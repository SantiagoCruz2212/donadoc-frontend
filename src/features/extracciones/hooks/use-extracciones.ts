import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarExtracciones } from '../apis/extracciones-api';
import { Extraccion } from '../models/extracciones-models';

/** Historial de extracciones de un caso (la más reciente primero). */
export function useExtracciones(casoId: string) {
  const { t } = useTranslations();
  const [extracciones, setExtracciones] = useState<Extraccion[]>([]);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    try {
      setExtracciones(await listarExtracciones(casoId));
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [casoId, t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { extracciones, recargar, error };
}