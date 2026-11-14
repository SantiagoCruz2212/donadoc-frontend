import { useCallback, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { cambiarEstado, eliminarCaso } from '../apis/casos-api';

/** Cambiar el estado del caso (solo transiciones válidas) y eliminarlo (borrado lógico). */
export function useCasoAcciones(casoId: string, alCambiar: () => Promise<void>, alEliminar: () => void) {
  const { t } = useTranslations();
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cambiar = useCallback(
    async (estado: string, causa?: string) => {
      setOcupado(true);
      setError('');
      setAviso('');
      try {
        await cambiarEstado(casoId, estado, causa);
        setAviso(t.casos.stateChanged);
        await alCambiar();
      } catch (e) {
        setError(mensajeDeError(e, t.common.unexpectedError));
      } finally {
        setOcupado(false);
      }
    },
    [casoId, alCambiar, t],
  );

  const eliminar = useCallback(async () => {
    setOcupado(true);
    setError('');
    try {
      await eliminarCaso(casoId);
      alEliminar();
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
      setOcupado(false);
    }
  }, [casoId, alEliminar, t]);

  return { cambiar, eliminar, error, aviso, ocupado };
}
