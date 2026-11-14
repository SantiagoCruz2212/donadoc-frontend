import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { consultarAuditoria } from './auditoria-api';

describe('auditoria-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('no envía los filtros vacíos y convierte las fechas locales a ISO', async () => {
    mock.onGet('/auditoria').reply(200, { success: true, message: 'ok', data: [{ id: 'e1' }], meta: { page: 2, totalPages: 5, total: 90 } });
    const r = await consultarAuditoria({ entidad: 'casos', accion: '', desde: '2026-11-08T10:00', hasta: '' }, 2);
    expect(r).toEqual({ items: [{ id: 'e1' }], page: 2, totalPages: 5, total: 90 });
    const params = mock.history.get[0].params;
    expect(params).toMatchObject({ page: 2, pageSize: 20, entidad: 'casos' });
    expect(params.accion).toBeUndefined();
    expect(params.hasta).toBeUndefined();
    expect(params.desde).toBe(new Date('2026-11-08T10:00').toISOString());
  });

  it('ignora una fecha inválida y sin meta asume una sola página', async () => {
    mock.onGet('/auditoria').reply(200, { success: true, message: 'ok', data: [] });
    const r = await consultarAuditoria({ entidad: '', accion: '', desde: 'no-es-fecha', hasta: '' }, 1);
    expect(mock.history.get[0].params.desde).toBeUndefined();
    expect(r).toEqual({ items: [], page: 1, totalPages: 1, total: 0 });
  });
});
