import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { EventoAuditoria, FiltrosAuditoria, PaginaAuditoria } from '../models/auditoria-models';

const aIso = (local: string): string | undefined => {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

/** Consulta la traza de auditoría de la institución con los filtros activos. */
export async function consultarAuditoria(filtros: FiltrosAuditoria, page: number): Promise<PaginaAuditoria> {
  const params = {
    page,
    pageSize: 20,
    entidad: filtros.entidad || undefined,
    accion: filtros.accion || undefined,
    desde: aIso(filtros.desde),
    hasta: aIso(filtros.hasta),
  };
  const r = await pedir<EventoAuditoria[]>(apiClient.get(ENDPOINTS.auditoria, { params }));
  return { items: r.data, page: r.meta?.page ?? page, totalPages: r.meta?.totalPages ?? 1, total: r.meta?.total ?? r.data.length };
}
