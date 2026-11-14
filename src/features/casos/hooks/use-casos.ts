import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarCasos } from '../apis/casos-api';
import { Caso } from '../models/casos-models';

/** Carga la lista de casos de la organización. */
export function useCasos() {
  const { t } = useTranslations();
  const [casos, setCasos] = useState<Caso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setCasos(await listarCasos());
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    } finally {
      setCargando(false);
    }
  }, [t]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { casos, cargando, error, recargar };
}