import axios, { AxiosError } from 'axios';

import { env } from '@/shared/config/env';
import { navigateTo } from '@/shared/config/session-handler';
import { RUTAS } from '@/shared/constants/constants';
import { ApiEnvelope, ApiError } from '@/shared/models/api-models';
import { useSessionStore } from '@/shared/state-manager';

/** Cliente HTTP único. Todo el acceso a la API pasa por aquí (vista → hook → api → api-client). */
export const apiClient = axios.create({ baseURL: env.apiBaseUrl, timeout: 60000 });

// Solicitud: adjunta el JWT de la sesión.
apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// Respuesta: normaliza errores y, ante un 401 con sesión iniciada, cierra la sesión y redirige al login.
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status ?? 0;
    const hadSession = Boolean(useSessionStore.getState().accessToken);
    if (status === 401 && hadSession) {
      useSessionStore.getState().cerrarSesion();
      navigateTo(RUTAS.login);
    }
    const cuerpo = error.response?.data;
    return Promise.reject(new ApiError(cuerpo?.message ?? 'Sin conexión con el servidor', status, cuerpo?.error ?? []));
  },
);

/** Desenvuelve la respuesta única de la API y devuelve el envelope tipado. */
export async function pedir<T>(promesa: Promise<{ data: ApiEnvelope<T> }>): Promise<ApiEnvelope<T>> {
  return (await promesa).data;
}
