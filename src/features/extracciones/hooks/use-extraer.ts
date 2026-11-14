import { useCallback, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { useDocumentoSeleccionadoStore } from '@/shared/state-manager';
import { useAccion } from '@/shared/ui/hooks/use-accion';

import { solicitarExtraccion } from '../apis/extracciones-api';

export interface AvisoExtraccion {
  tipo: 'ok' | 'aviso';
  texto: string;
}

/** Pide la extracción con IA del documento seleccionado y resume el resultado para la persona. */
export function useExtraer(casoId: string, onTerminada: () => Promise<void> | void) {
  const { t } = useTranslations();
  const documentoId = useDocumentoSeleccionadoStore((s) => s.documentoId);
  const [aviso, setAviso] = useState<AvisoExtraccion | null>(null);
  const accion = useAccion((docId: string) => solicitarExtraccion(casoId, docId));

  const extraer = useCallback(async () => {
    if (!documentoId) return;
    setAviso(null);
    const r = await accion.ejecutar(documentoId);
    if (!r) return;
    await onTerminada();
    const { extraccion } = r;
    setAviso({
      tipo: extraccion.estado === 'PROCESADA' ? 'ok' : 'aviso',
      texto: `${r.mensaje} (${t.extracciones.resultSummary}: ${extraccion.estado}, ${t.extracciones.provider}: ${extraccion.proveedor}, ${extraccion.intentos} ${t.extracciones.attempts}).`,
    });
  }, [documentoId, accion, onTerminada, t]);

  return { extraer, puedeExtraer: Boolean(documentoId), cargando: accion.cargando, error: accion.error, aviso };
}