import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { useDocumentoSeleccionadoStore } from '@/shared/state-manager';
import { mensajeDeError } from '@/shared/utils/utils';

import { listarDocumentos } from '../apis/documentos-api';
import { Documento } from '../models/documentos-models';

/** Lista los documentos del caso y mantiene la selección del documento a procesar con IA. */
export function useDocumentos(casoId: string) {
  const { t } = useTranslations();
  const documentoId = useDocumentoSeleccionadoStore((s) => s.documentoId);
  const seleccionar = useDocumentoSeleccionadoStore((s) => s.seleccionar);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    try {
      const lista = await listarDocumentos(casoId);
      setDocumentos(lista);
      if (!useDocumentoSeleccionadoStore.getState().documentoId && lista[0]) seleccionar(lista[0].id);
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [casoId, seleccionar, t]);

  useEffect(() => {
    useDocumentoSeleccionadoStore.getState().limpiar(); // al cambiar de caso no se arrastra la selección anterior
    void recargar();
  }, [recargar]);

  return { documentos, documentoId, seleccionar, recargar, error };
}