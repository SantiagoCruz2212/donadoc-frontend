import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { Acceso, CrearAccesoForm } from '../models/accesos-models';

export async function listarAccesos(): Promise<Acceso[]> {
  return (await pedir<Acceso[]>(apiClient.get(ENDPOINTS.accesos))).data;
}

/** La clave la genera el servidor y se envía por correo: nunca vuelve en la respuesta. */
export async function crearAcceso(datos: CrearAccesoForm): Promise<Acceso> {
  const cuerpo = { correo: datos.correo, nombre: datos.nombre, rol: datos.rol, ...(datos.perfil ? { perfil: datos.perfil } : {}) };
  return (await pedir<Acceso>(apiClient.post(ENDPOINTS.accesos, cuerpo))).data;
}

export async function restablecerAcceso(id: string): Promise<Acceso> {
  return (await pedir<Acceso>(apiClient.post(ENDPOINTS.accesoRestablecer(id)))).data;
}
