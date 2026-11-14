import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { mensajeDeError } from '@/shared/utils/utils';

import { consultarAuditoria } from '../apis/auditoria-api';
import { FILTROS_VACIOS, FiltrosAuditoria, PaginaAuditoria } from '../models/auditoria-models';

/** Filtros + paginación de la auditoría. Los filtros se aplican al pulsar «Filtrar» (no en cada tecla). */
export function useAuditoria() {
  const { t } = useTranslations();
  const [borrador, setBorrador] = useState<FiltrosAuditoria>(FILTROS_VACIOS);
  const [aplicados, setAplicados] = useState<FiltrosAuditoria>(FILTROS_VACIOS);
  const [pagina, setPagina] = useState<PaginaAuditoria>({ items: [], page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    consultarAuditoria(aplicados, page)
      .then((p) => activo && setPagina(p))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [aplicados, page, t]);

  const cambiar = useCallback((campo: keyof FiltrosAuditoria, valor: string) => setBorrador((f) => ({ ...f, [campo]: valor })), []);
  const filtrar = useCallback(() => {
    setPage(1);
    setAplicados(borrador);
  }, [borrador]);
  const limpiar = useCallback(() => {
    setBorrador(FILTROS_VACIOS);
    setPage(1);
    setAplicados(FILTROS_VACIOS);
  }, []);

  return {
    filtros: borrador,
    cambiar,
    filtrar,
    limpiar,
    pagina,
    cargando,
    error,
    anterior: () => setPage((p) => Math.max(1, p - 1)),
    siguiente: () => setPage((p) => Math.min(pagina.totalPages, p + 1)),
  };
}
