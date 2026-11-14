import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { decidirSugerencia, listarExtracciones, solicitarExtraccion } from './extracciones-api';

describe('extracciones-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('solicitarExtraccion envía el documento y conserva el mensaje del servidor', async () => {
    mock.onPost('/casos/c1/extracciones-ia').reply((c) => [201, { success: true, message: 'Extracción procesada', data: { id: 'e1', recibido: JSON.parse(c.data) } }]);
    const r = await solicitarExtraccion('c1', 'd1');
    expect(r.mensaje).toBe('Extracción procesada');
    expect((r.extraccion as unknown as { recibido: unknown }).recibido).toEqual({ documentoOrigenId: 'd1' });
  });

  it('listarExtracciones devuelve el historial del caso', async () => {
    mock.onGet('/casos/c1/extracciones-ia').reply(200, { success: true, message: 'ok', data: [{ id: 'e1' }] });
    expect(await listarExtracciones('c1')).toEqual([{ id: 'e1' }]);
  });

  it('decidirSugerencia envía la decisión y el valor final', async () => {
    mock.onPatch('/sugerencias-ia/s1').reply((c) => [200, { success: true, message: 'ok', data: JSON.parse(c.data) }]);
    expect(await decidirSugerencia('s1', 'MODIFICADA', 'valor')).toEqual({ decision: 'MODIFICADA', valorFinal: 'valor' });
  });
});