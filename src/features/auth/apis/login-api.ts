import { env } from '@/shared/config/env';
import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { LoginForm, SesionResponse } from '../models/auth-models';

/** Inicia sesión: la clave de organización (X-Tenant-Key, pública) solo selecciona el tenant. */
export async function login(datos: LoginForm): Promise<SesionResponse> {
  const r = await pedir<SesionResponse>(apiClient.post(ENDPOINTS.login, datos, { headers: { 'X-Tenant-Key': env.tenantKey } }));
  return r.data;
}