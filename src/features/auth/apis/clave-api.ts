import { env } from '@/shared/config/env';
import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

const CABECERA_TENANT = { headers: { 'X-Tenant-Key': env.tenantKey } };

// Devuelven true al terminar bien: useAccion entrega undefined cuando falla, y así el hook distingue éxito de error.

/** «Olvidé mi clave»: la respuesta es siempre la misma (exista o no la cuenta), por diseño. */
export async function solicitarCodigo(correo: string): Promise<true> {
  await pedir(apiClient.post(ENDPOINTS.olvideClave, { correo }, CABECERA_TENANT));
  return true;
}

export async function restablecerClave(datos: { correo: string; codigo: string; nuevaClave: string }): Promise<true> {
  await pedir(apiClient.post(ENDPOINTS.restablecerClave, datos, CABECERA_TENANT));
  return true;
}

/** Con sesión iniciada: exige la clave actual. */
export async function cambiarClave(datos: { claveActual: string; nuevaClave: string }): Promise<true> {
  await pedir(apiClient.post(ENDPOINTS.cambiarClave, datos));
  return true;
}
