import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Firma, NuevoFirmanteForm, Verificacion } from '../models/firmas-models';

export async function listarFirmas(casoId: string, documentoId: string): Promise<Firma[]> {
  return (await pedir<Firma[]>(apiClient.get(ENDPOINTS.firmasDeDocumento(casoId, documentoId)))).data;
}

export async function crearFirmante(casoId: string, documentoId: string, datos: NuevoFirmanteForm): Promise<Firma> {
  return (await pedir<Firma>(apiClient.post(ENDPOINTS.firmasDeDocumento(casoId, documentoId), datos))).data;
}

/** El backend envía al correo del firmante un código de un solo uso. */
export async function enviarCodigoFirma(firmaId: string): Promise<true> {
  await pedir(apiClient.post(ENDPOINTS.firmaEnviarCodigo(firmaId)));
  return true;
}

export async function verificarFirma(firmaId: string, codigo: string): Promise<Firma> {
  return (await pedir<Firma>(apiClient.post(ENDPOINTS.firmaVerificar(firmaId), { codigo }))).data;
}

export async function comprobarIntegridad(firmaId: string): Promise<Verificacion> {
  return (await pedir<Verificacion>(apiClient.get(ENDPOINTS.firmaVerificacion(firmaId)))).data;
}
