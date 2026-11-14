import { ENDPOINTS } from '@/shared/constants/constants';
import { apiClient, pedir } from '@/shared/data-sources/api-client';

import { ListaRed, TrasplanteVigente } from '../models/red-models';

export async function listarTrasplantesVigentes(): Promise<ListaRed> {
  const r = await pedir<TrasplanteVigente[]>(apiClient.get(ENDPOINTS.red, { params: { pageSize: 50 } }));
  return { items: r.data, total: r.meta?.total ?? r.data.length };
}
