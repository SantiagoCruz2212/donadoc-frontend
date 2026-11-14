import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { listarTrasplantesVigentes } from './red-api';

describe('red-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('devuelve los elementos y el total que informa la paginación', async () => {
    mock.onGet('/red/trasplantes-vigentes').reply(200, { success: true, message: 'ok', data: [{ codigo: 'TX-1' }], meta: { total: 120 } });
    expect(await listarTrasplantesVigentes()).toEqual({ items: [{ codigo: 'TX-1' }], total: 120 });
    expect(mock.history.get[0].params).toEqual({ pageSize: 50 });
  });

  it('sin meta usa la cantidad de elementos', async () => {
    mock.onGet('/red/trasplantes-vigentes').reply(200, { success: true, message: 'ok', data: [{ codigo: 'TX-1' }, { codigo: 'TX-2' }] });
    expect((await listarTrasplantesVigentes()).total).toBe(2);
  });
});
