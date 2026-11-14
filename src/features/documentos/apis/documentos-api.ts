import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Documento } from '../models/documentos-models';

export async function listarDocumentos(casoId: string): Promise<Documento[]> {
  return (await pedir<Documento[]>(apiClient.get(ENDPOINTS.documentos(casoId)))).data;
}

export async function subirTexto(casoId: string, texto: string): Promise<Documento> {
  return (await pedir<Documento>(apiClient.post(ENDPOINTS.documentosTexto(casoId), { texto }))).data;
}

/** Carga un .pdf o .txt como multipart (campo "archivo"). El backend valida tipo y tamaño. */
export async function subirArchivo(casoId: string, archivo: File): Promise<Documento> {
  const cuerpo = new FormData();
  cuerpo.append('archivo', archivo);
  return (await pedir<Documento>(apiClient.post(ENDPOINTS.documentos(casoId), cuerpo))).data;
}