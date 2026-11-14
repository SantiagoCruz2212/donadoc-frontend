import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { listarDocumentos, subirArchivo, subirTexto } from './documentos-api';

describe('documentos-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('lista los documentos de un caso', async () => {
    mock.onGet('/casos/c1/documentos').reply(200, { success: true, message: 'ok', data: [{ id: 'd1' }] });
    expect(await listarDocumentos('c1')).toEqual([{ id: 'd1' }]);
  });

  it('subirTexto envía el texto como JSON', async () => {
    mock.onPost('/casos/c1/documentos/texto').reply((c) => [201, { success: true, message: 'ok', data: JSON.parse(c.data) }]);
    expect(await subirTexto('c1', 'hola')).toEqual({ texto: 'hola' });
  });

  it('subirArchivo envía el archivo como multipart en el campo «archivo»', async () => {
    mock.onPost('/casos/c1/documentos').reply((c) => [201, { success: true, message: 'ok', data: { esFormData: c.data instanceof FormData, nombre: (c.data as FormData).get('archivo') instanceof File } }]);
    const r = await subirArchivo('c1', new File(['x'], 'h.txt', { type: 'text/plain' }));
    expect(r).toEqual({ esFormData: true, nombre: true });
  });
});