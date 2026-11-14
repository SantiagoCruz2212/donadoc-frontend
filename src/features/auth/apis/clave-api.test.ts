import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '@/shared/data-sources/api-client';

import { cambiarClave, restablecerClave, solicitarCodigo } from './clave-api';

describe('clave-api', () => {
  const mock = new MockAdapter(apiClient);
  afterEach(() => mock.reset());
  afterAll(() => mock.restore());

  it('solicitarCodigo envía el correo con la clave pública de la organización', async () => {
    mock.onPost('/auth/olvide-clave').reply((c) => [200, { success: true, message: 'ok', visto: { cuerpo: JSON.parse(c.data), tenant: c.headers?.['X-Tenant-Key'] } }]);
    expect(await solicitarCodigo('c@demo.local')).toBe(true);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ correo: 'c@demo.local' });
    expect(mock.history.post[0].headers?.['X-Tenant-Key']).toBe('pk_test'); // valor de src/test/env.ts
  });

  it('restablecerClave envía correo, código y clave nueva', async () => {
    mock.onPost('/auth/restablecer-clave').reply(200, { success: true, message: 'ok' });
    expect(await restablecerClave({ correo: 'c@demo.local', codigo: '123456', nuevaClave: 'ClaveNueva2026' })).toBe(true);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ correo: 'c@demo.local', codigo: '123456', nuevaClave: 'ClaveNueva2026' });
  });

  it('cambiarClave usa la sesión (sin clave de organización) y envía ambas claves', async () => {
    mock.onPost('/auth/cambiar-clave').reply(200, { success: true, message: 'ok' });
    expect(await cambiarClave({ claveActual: 'a', nuevaClave: 'b' })).toBe(true);
    expect(mock.history.post[0].headers?.['X-Tenant-Key']).toBeUndefined();
  });
});
