/** Variables de entorno de Vite (públicas: nunca van secretos aquí). En pruebas se sustituye por src/test/env.ts. */
export const env = {
  tenantKey: (import.meta.env.VITE_TENANT_KEY as string | undefined) ?? 'pk_demo_clinica',
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1',
};
