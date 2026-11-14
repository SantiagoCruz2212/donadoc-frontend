export interface EventoAuditoria {
  id: string;
  fecha: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  entidad: string;
  entidadId: string | null;
  accion: string;
  metodo: string | null;
  ruta: string | null;
  estadoHttp: number | null;
  ip: string | null;
}

export interface FiltrosAuditoria {
  entidad: string;
  accion: string;
  /** Valor de un input datetime-local (hora local); se convierte a ISO al consultar. */
  desde: string;
  hasta: string;
}

export const FILTROS_VACIOS: FiltrosAuditoria = { entidad: '', accion: '', desde: '', hasta: '' };

export interface PaginaAuditoria {
  items: EventoAuditoria[];
  page: number;
  totalPages: number;
  total: number;
}

/** Acciones y registros más comunes para el filtro (el backend acepta cualquier texto). */
export const ACCIONES_AUDITORIA = ['CONSULTAR', 'CREAR', 'EDITAR', 'ELIMINAR', 'LOGIN', 'LOGIN_FALLIDO', 'FIRMAR', 'CLAVE_CAMBIADA', 'CLAVE_RESTABLECIDA'];
export const ENTIDADES_AUDITORIA = ['casos', 'documentos', 'formularios', 'firmas', 'red', 'auditoria', 'caso', 'formato', 'firma', 'sesion'];
