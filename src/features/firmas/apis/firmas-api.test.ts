import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { comprobarIntegridad, crearFirmante, enviarCodigoFirma, listarFirmas, verificarFirma } from './firmas-api';

describe('firmas-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('lista y crea firmantes de un documento del caso', async () => {
    mock.onGet('/casos/c1/documentos/d1/firmas').reply(200, { success: true, message: 'ok', data: [{ id: 'f1' }] });
    expect(await listarFirmas('c1', 'd1')).toEqual([{ id: 'f1' }]);
    mock.onPost('/casos/c1/documentos/d1/firmas').reply(201, { success: true, message: 'ok', data: { id: 'f2' } });
    const datos = { firmanteNombre: 'Ana', firmanteRol: 'FAMILIAR' as const, firmanteCorreo: 'a@x.test' };
    expect(await crearFirmante('c1', 'd1', datos)).toEqual({ id: 'f2' });
    expect(JSON.parse(mock.history.post[0].data)).toEqual(datos);
  });

  it('envía el código, verifica con el código y comprueba la integridad', async () => {
    mock.onPost('/firmas/f1/enviar-codigo').reply(200, { success: true, message: 'ok' });
    expect(await enviarCodigoFirma('f1')).toBe(true);
    mock.onPost('/firmas/f1/verificar').reply(200, { success: true, message: 'ok', data: { id: 'f1', estado: 'FIRMADA' } });
    expect(await verificarFirma('f1', '123456')).toEqual({ id: 'f1', estado: 'FIRMADA' });
    expect(JSON.parse(mock.history.post[1].data)).toEqual({ codigo: '123456' });
    mock.onGet('/firmas/f1/verificacion').reply(200, { success: true, message: 'ok', data: { valida: true, motivos: [] } });
    expect(await comprobarIntegridad('f1')).toEqual({ valida: true, motivos: [] });
  });
});
