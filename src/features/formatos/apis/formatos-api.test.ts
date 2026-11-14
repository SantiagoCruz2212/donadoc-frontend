import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { descargarPdf, guardarFormulario, listarFormatos, obtenerFormulario } from './formatos-api';

describe('formatos-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('lista los formatos y obtiene el formulario de un caso', async () => {
    mock.onGet('/formatos').reply(200, { success: true, message: 'ok', data: [{ codigo: 'HC-DONANTE' }] });
    expect(await listarFormatos()).toEqual([{ codigo: 'HC-DONANTE' }]);
    mock.onGet('/casos/c1/formularios/HC-DONANTE').reply(200, { success: true, message: 'ok', data: { estado: 'BORRADOR' } });
    expect(await obtenerFormulario('c1', 'HC-DONANTE')).toEqual({ estado: 'BORRADOR' });
  });

  it('guarda enviando los datos y si es completo (PUT)', async () => {
    mock.onPut('/casos/c1/formularios/HC-DONANTE').reply(200, { success: true, message: 'ok', data: { estado: 'COMPLETO' } });
    await guardarFormulario('c1', 'HC-DONANTE', { nombres: 'Ana', autoriza: true }, true);
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ datos: { nombres: 'Ana', autoriza: true }, completo: true });
  });

  it('descarga el PDF como Blob', async () => {
    mock.onGet('/casos/c1/formularios/HC-DONANTE/pdf').reply(200, new Blob(['%PDF-1.4']));
    const blob = await descargarPdf('c1', 'HC-DONANTE');
    expect(blob).toBeInstanceOf(Blob);
    expect(mock.history.get[0].responseType).toBe('blob');
  });
});
