/** Contrato común de la API: { success, message, data, error, meta }. */
export interface ApiErrorDetail {
  property: string;
  constraints: Record<string, string>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, number>;
  error?: ApiErrorDetail[];
}

/** Error normalizado: la UI solo conoce este tipo, nunca los errores crudos de Axios. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detalle: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
