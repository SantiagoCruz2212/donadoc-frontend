import { useCallback } from 'react';

import { useAccion } from '@/shared/ui/hooks/use-accion';

import { decidirSugerencia } from '../apis/extracciones-api';
import { Decision } from '../models/extracciones-models';

/** Registra la decisión humana sobre una sugerencia de la IA y refresca la lista. */
export function useDecidirSugerencia(onDecidida: () => Promise<void> | void) {
  const accion = useAccion((id: string, decision: Exclude<Decision, 'PENDIENTE'>, valorFinal?: string) => decidirSugerencia(id, decision, valorFinal));

  const decidir = useCallback(
    async (id: string, decision: Exclude<Decision, 'PENDIENTE'>, valorFinal?: string) => {
      const r = await accion.ejecutar(id, decision, valorFinal);
      if (r) await onDecidida();
    },
    [accion, onDecidida],
  );

  return { decidir, error: accion.error };
}