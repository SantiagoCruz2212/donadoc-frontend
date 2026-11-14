import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Decision, Extraccion, ResultadoExtraccion, Sugerencia } from '../models/extracciones-models';

export async function solicitarExtraccion(casoId: string, documentoOrigenId: string): Promise<ResultadoExtraccion> {
  const r = await pedir<Extraccion>(apiClient.post(ENDPOINTS.extracciones(casoId), { documentoOrigenId }));
  return { mensaje: r.message, extraccion: r.data };
}

export async function listarExtracciones(casoId: string): Promise<Extraccion[]> {
  return (await pedir<Extraccion[]>(apiClient.get(ENDPOINTS.extracciones(casoId)))).data;
}

export async function decidirSugerencia(id: string, decision: Exclude<Decision, 'PENDIENTE'>, valorFinal?: string): Promise<Sugerencia> {
  return (await pedir<Sugerencia>(apiClient.patch(ENDPOINTS.sugerencia(id), { decision, valorFinal }))).data;
}