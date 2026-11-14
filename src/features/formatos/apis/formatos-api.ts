import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Formulario, Plantilla, ValorCampo } from '../models/formatos-models';

export async function listarFormatos(): Promise<Plantilla[]> {
  return (await pedir<Plantilla[]>(apiClient.get(ENDPOINTS.formatos))).data;
}

export async function obtenerFormulario(casoId: string, codigo: string): Promise<Formulario> {
  return (await pedir<Formulario>(apiClient.get(ENDPOINTS.formulario(casoId, codigo)))).data;
}

/** Guarda el formulario como borrador, o como completo (valida los obligatorios y genera el PDF). */
export async function guardarFormulario(casoId: string, codigo: string, datos: Record<string, ValorCampo>, completo: boolean): Promise<Formulario> {
  return (await pedir<Formulario>(apiClient.put(ENDPOINTS.formulario(casoId, codigo), { datos, completo }))).data;
}

export async function descargarPdf(casoId: string, codigo: string): Promise<Blob> {
  return (await apiClient.get<Blob>(ENDPOINTS.formularioPdf(casoId, codigo), { responseType: 'blob' })).data;
}
