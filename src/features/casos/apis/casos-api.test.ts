import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { agregarComponente, cambiarEstado, crearCaso, eliminarCaso, listarCasos, listarComponentes, obtenerCaso } from './casos-api';

describe('casos-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('crearCaso envía el donante anidado con los valores por defecto del MVP', async () => {
    mock.onPost('/casos').reply((c) => [201, { success: true, message: 'Caso creado', data: { id: 'c1', recibido: JSON.parse(c.data) } }]);
    const r = (await crearCaso({ tipoDocumento: 'CC', numeroDocumento: '1000000001', nombres: 'Juan', apellidos: 'Pérez' })) as unknown as { recibido: unknown };
    expect(r.recibido).toEqual({
      donante: { tipoDocumento: 'CC', numeroDocumento: '1000000001', nombres: 'Juan', apellidos: 'Pérez' },
      tipoDonante: 'TOTIPOTENCIAL',
      muerteViolenta: false,
    });
  });

  it('listarCasos pide la página de 50 y devuelve los datos', async () => {
    mock.onGet('/casos').reply((c) => [200, { success: true, message: 'ok', data: [{ id: 'c1' }], visto: c.params }]);
    expect(await listarCasos()).toEqual([{ id: 'c1' }]);
  });

  it('obtenerCaso consulta por identificador', async () => {
    mock.onGet('/casos/c1').reply(200, { success: true, message: 'ok', data: { id: 'c1' } });
    expect(await obtenerCaso('c1')).toEqual({ id: 'c1' });
  });

  it('cambiarEstado envía el estado nuevo y la causa de contraindicación', async () => {
    mock.onPost('/casos/c1/estado').reply((c) => [200, { success: true, message: 'ok', data: { recibido: JSON.parse(c.data) } }]);
    const r = (await cambiarEstado('c1', 'CONTRAINDICADO', 'Sepsis')) as unknown as { recibido: unknown };
    expect(r.recibido).toEqual({ estado: 'CONTRAINDICADO', causaContraindicacion: 'Sepsis' });
  });

  it('eliminarCaso usa DELETE y devuelve true', async () => {
    mock.onDelete('/casos/c1').reply(200, { success: true, message: 'Caso eliminado' });
    expect(await eliminarCaso('c1')).toBe(true);
  });

  it('componentes: lista y alta (la causa solo viaja si no se rescató)', async () => {
    mock.onGet('/casos/c1/componentes').reply(200, { success: true, message: 'ok', data: [{ id: 'k1' }] });
    expect(await listarComponentes('c1')).toEqual([{ id: 'k1' }]);
    mock.onPost('/casos/c1/componentes').reply((c) => [201, { success: true, message: 'ok', data: { recibido: JSON.parse(c.data) } }]);
    const r = (await agregarComponente('c1', { tipoComponente: 'RINON', rescatado: true, causaNoRescate: 'ignorada' })) as unknown as { recibido: unknown };
    expect(r.recibido).toEqual({ tipoComponente: 'RINON', rescatado: true });
  });
});