/** Rutas de la aplicación, endpoints de la API y claves de almacenamiento: nada de textos «mágicos» sueltos. */
export const RUTAS = {
  login: '/login',
  olvideClave: '/olvide-clave',
  cambiarClave: '/cambiar-clave',
  casos: '/casos',
  caso: (id: string) => `/casos/${id}`,
  red: '/red',
  auditoria: '/auditoria',
  accesos: '/accesos',
  informes: '/informes',
  informe: (codigo: string, periodo: string) => `/informes/${codigo}/${periodo}`,
} as const;

export const ENDPOINTS = {
  login: '/auth/login',
  olvideClave: '/auth/olvide-clave',
  restablecerClave: '/auth/restablecer-clave',
  cambiarClave: '/auth/cambiar-clave',
  casos: '/casos',
  caso: (id: string) => `/casos/${id}`,
  casoEstado: (id: string) => `/casos/${id}/estado`,
  componentes: (casoId: string) => `/casos/${casoId}/componentes`,
  documentos: (casoId: string) => `/casos/${casoId}/documentos`,
  documentosTexto: (casoId: string) => `/casos/${casoId}/documentos/texto`,
  extracciones: (casoId: string) => `/casos/${casoId}/extracciones-ia`,
  sugerencia: (id: string) => `/sugerencias-ia/${id}`,
  formatos: '/formatos',
  formulario: (casoId: string, codigo: string) => `/casos/${casoId}/formularios/${codigo}`,
  formularioPdf: (casoId: string, codigo: string) => `/casos/${casoId}/formularios/${codigo}/pdf`,
  firmasDeDocumento: (casoId: string, documentoId: string) => `/casos/${casoId}/documentos/${documentoId}/firmas`,
  firmaEnviarCodigo: (firmaId: string) => `/firmas/${firmaId}/enviar-codigo`,
  firmaVerificar: (firmaId: string) => `/firmas/${firmaId}/verificar`,
  firmaVerificacion: (firmaId: string) => `/firmas/${firmaId}/verificacion`,
  red: '/red/trasplantes-vigentes',
  auditoria: '/auditoria',
  accesos: '/accesos',
  accesoRestablecer: (id: string) => `/accesos/${id}/restablecer`,
  informesPlantillas: '/informes/plantillas',
  informes: '/informes',
  informe: (codigo: string, periodo: string) => `/informes/${codigo}/${periodo}`,
  informePdf: (codigo: string, periodo: string) => `/informes/${codigo}/${periodo}/pdf`,
} as const;

/** Estados siguientes permitidos desde cada estado de un caso (espejo de las transiciones del backend). */
export const TRANSICIONES_CASO: Record<string, string[]> = {
  BORRADOR: ['EN_CURSO', 'CONTRAINDICADO'],
  EN_CURSO: ['FIRMADO', 'CONTRAINDICADO'],
  FIRMADO: ['CERRADO'],
  CERRADO: [],
  CONTRAINDICADO: [],
};

export const TIPOS_COMPONENTE = ['RINON', 'HIGADO', 'CORAZON', 'PULMON', 'PANCREAS', 'INTESTINO', 'CORNEA', 'PIEL', 'HUESO', 'VALVULA_CARDIACA'] as const;
export const ROLES_FIRMANTE = ['PACIENTE', 'FAMILIAR', 'TESTIGO', 'MEDICO', 'COORDINADOR'] as const;

export const STORAGE_KEYS = { sesion: 'donadoc.sesion', idioma: 'donadoc.idioma' } as const;

export const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PA', 'RC'] as const;
export const UMBRAL_CONFIANZA = 0.7;
