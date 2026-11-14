import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { InformeResumen, InformeVista, PaginaInformes, PlantillaInforme, TAMANO_PAGINA, ValorCampo } from '../models/informes-models';

/** Informes periódicos disponibles (con su estructura). */
export async function listarPlantillas(): Promise<PlantillaInforme[]> {
  return (await pedir<PlantillaInforme[]>(apiClient.get(ENDPOINTS.informesPlantillas))).data;
}

/** Informes de la organización, del periodo más reciente al más antiguo; `codigo` filtra por informe. */
export async function listarInformes(codigo: string, page: number): Promise<PaginaInformes> {
  const params = { codigo: codigo || undefined, page, pageSize: TAMANO_PAGINA };
  const r = await pedir<InformeResumen[]>(apiClient.get(ENDPOINTS.informes, { params }));
  return { items: r.data, page: r.meta?.page ?? page, totalPages: r.meta?.totalPages ?? 1, total: r.meta?.total ?? r.data.length };
}

export async function obtenerInforme(codigo: string, periodo: string): Promise<InformeVista> {
  return (await pedir<InformeVista>(apiClient.get(ENDPOINTS.informe(codigo, periodo)))).data;
}

/** Guarda el informe como borrador, o como completo (valida los obligatorios y genera el PDF). */
export async function guardarInforme(codigo: string, periodo: string, datos: Record<string, ValorCampo>, completo: boolean): Promise<InformeVista> {
  return (await pedir<InformeVista>(apiClient.put(ENDPOINTS.informe(codigo, periodo), { datos, completo }))).data;
}

export async function descargarPdf(codigo: string, periodo: string): Promise<Blob> {
  return (await apiClient.get<Blob>(ENDPOINTS.informePdf(codigo, periodo), { responseType: 'blob' })).data;
}
