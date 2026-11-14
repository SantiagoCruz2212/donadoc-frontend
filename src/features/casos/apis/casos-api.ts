import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Caso, Componente, ComponenteForm, CrearCasoForm } from '../models/casos-models';

export async function cambiarEstado(id: string, estado: string, causaContraindicacion?: string): Promise<Caso> {
  return (await pedir<Caso>(apiClient.post(ENDPOINTS.casoEstado(id), { estado, causaContraindicacion }))).data;
}

/** Borrado lógico: el backend solo lo permite a ADMIN_ORG y en borrador o contraindicado. */
export async function eliminarCaso(id: string): Promise<true> {
  await pedir(apiClient.delete(ENDPOINTS.caso(id)));
  return true;
}

export async function listarComponentes(casoId: string): Promise<Componente[]> {
  return (await pedir<Componente[]>(apiClient.get(ENDPOINTS.componentes(casoId)))).data;
}

export async function agregarComponente(casoId: string, datos: ComponenteForm): Promise<Componente> {
  const cuerpo = { ...datos, causaNoRescate: datos.rescatado ? undefined : datos.causaNoRescate };
  return (await pedir<Componente>(apiClient.post(ENDPOINTS.componentes(casoId), cuerpo))).data;
}

export async function listarCasos(): Promise<Caso[]> {
  return (await pedir<Caso[]>(apiClient.get(ENDPOINTS.casos, { params: { pageSize: 50 } }))).data;
}

export async function obtenerCaso(id: string): Promise<Caso> {
  return (await pedir<Caso>(apiClient.get(ENDPOINTS.caso(id)))).data;
}

/** El donante viaja anidado; el tipo de donante y la muerte violenta toman valores por defecto del MVP. */
export async function crearCaso(datos: CrearCasoForm): Promise<Caso> {
  const cuerpo = { donante: datos, tipoDonante: 'TOTIPOTENCIAL', muerteViolenta: false };
  return (await pedir<Caso>(apiClient.post(ENDPOINTS.casos, cuerpo))).data;
}