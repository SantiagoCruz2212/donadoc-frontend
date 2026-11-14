import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { descargarPdf, guardarInforme, listarInformes, listarPlantillas, obtenerInforme } from './informes-api';

describe('informes-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('lista las plantillas disponibles', async () => {
    mock.onGet('/informes/plantillas').reply(200, { success: true, message: 'ok', data: [{ codigo: 'INF-DEMO' }] });
    expect(await listarPlantillas()).toEqual([{ codigo: 'INF-DEMO' }]);
  });

  it('lista los informes con página, tamaño y filtro, y lee la paginación del meta', async () => {
    mock.onGet('/informes').reply(200, { success: true, message: 'ok', data: [{ id: 'i1' }], meta: { page: 2, pageSize: 20, total: 31, totalPages: 2 } });
    const p = await listarInformes('INF-DEMO', 2);
    expect(p).toEqual({ items: [{ id: 'i1' }], page: 2, totalPages: 2, total: 31 });
    expect(mock.history.get[0].params).toEqual({ codigo: 'INF-DEMO', page: 2, pageSize: 20 });
  });

  it('sin meta usa valores por defecto y no envía el filtro vacío', async () => {
    mock.onGet('/informes').reply(200, { success: true, message: 'ok', data: [{ id: 'i1' }, { id: 'i2' }] });
    expect(await listarInformes('', 1)).toEqual({ items: [{ id: 'i1' }, { id: 'i2' }], page: 1, totalPages: 1, total: 2 });
    expect(mock.history.get[0].params.codigo).toBeUndefined();
  });

  it('obtiene el informe de un periodo', async () => {
    mock.onGet('/informes/INF-DEMO/2026-10').reply(200, { success: true, message: 'ok', data: { estado: 'BORRADOR' } });
    expect(await obtenerInforme('INF-DEMO', '2026-10')).toEqual({ estado: 'BORRADOR' });
  });

  it('guarda enviando los datos y si es completo (PUT)', async () => {
    mock.onPut('/informes/INF-DEMO/2026-10').reply(200, { success: true, message: 'ok', data: { estado: 'COMPLETO' } });
    await guardarInforme('INF-DEMO', '2026-10', { responsable: 'Ana', mensual: [{ recibidos: 1 }] }, true);
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ datos: { responsable: 'Ana', mensual: [{ recibidos: 1 }] }, completo: true });
  });

  it('descarga el PDF como Blob', async () => {
    mock.onGet('/informes/INF-DEMO/2026-10/pdf').reply(200, new Blob(['%PDF-1.4']));
    expect(await descargarPdf('INF-DEMO', '2026-10')).toBeInstanceOf(Blob);
    expect(mock.history.get[0].responseType).toBe('blob');
  });
});
