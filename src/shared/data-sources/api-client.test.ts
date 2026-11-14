import MockAdapter from 'axios-mock-adapter';

import { registerNavigationHandler } from '@/shared/config/session-handler';
import { ApiError } from '@/shared/models/api-models';
import { useSessionStore } from '@/shared/state-manager';

import { apiClient, pedir } from './api-client';

const usuario = { id: 'u1', nombre: 'N', correo: 'c@d.co', rol: 'ADMIN_ORG', perfil: null };

describe('apiClient (interceptores)', () => {
  const mock = new MockAdapter(apiClient);
  const navegar = jest.fn();

  beforeEach(() => {
    mock.reset();
    navegar.mockReset();
    registerNavigationHandler(navegar);
    useSessionStore.getState().cerrarSesion();
  });
  afterAll(() => {
    mock.restore();
    registerNavigationHandler(null);
  });

  it('adjunta el JWT de la sesión a cada solicitud', async () => {
    useSessionStore.getState().iniciarSesion('jwt-abc', usuario);
    mock.onGet('/casos').reply((config) => [200, { success: true, message: 'ok', data: [], auth: config.headers?.Authorization }]);
    const r = await apiClient.get('/casos');
    expect(r.data.auth).toBe('Bearer jwt-abc');
  });

  it('no envía Authorization si no hay sesión', async () => {
    mock.onGet('/health').reply((config) => [200, { success: true, message: 'ok', data: null, auth: config.headers?.Authorization ?? null }]);
    expect((await apiClient.get('/health')).data.auth).toBeNull();
  });

  it('ante un 401 con sesión iniciada cierra la sesión y redirige al login', async () => {
    useSessionStore.getState().iniciarSesion('jwt-vencido', usuario);
    mock.onGet('/casos').reply(401, { success: false, message: 'Sesión inválida o vencida' });
    await expect(apiClient.get('/casos')).rejects.toBeInstanceOf(ApiError);
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(navegar).toHaveBeenCalledWith('/login');
  });

  it('un 401 sin sesión (login fallido) no redirige y conserva el mensaje', async () => {
    mock.onPost('/auth/login').reply(401, { success: false, message: 'Credenciales inválidas' });
    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({ message: 'Credenciales inválidas', status: 401 });
    expect(navegar).not.toHaveBeenCalled();
  });

  it('normaliza el detalle de validación del backend', async () => {
    const detalle = [{ property: 'nombres', constraints: { isNotEmpty: 'vacío' } }];
    mock.onPost('/casos').reply(400, { success: false, message: 'Datos inválidos', error: detalle });
    await expect(apiClient.post('/casos', {})).rejects.toMatchObject({ status: 400, detalle });
  });

  it('sin conexión devuelve un ApiError de estado 0', async () => {
    mock.onGet('/casos').networkError();
    await expect(apiClient.get('/casos')).rejects.toMatchObject({ status: 0, message: 'Sin conexión con el servidor' });
  });

  it('pedir devuelve el envelope de la respuesta', async () => {
    mock.onGet('/casos').reply(200, { success: true, message: 'Casos consultados', data: [1] });
    const r = await pedir<number[]>(apiClient.get('/casos'));
    expect(r.data).toEqual([1]);
    expect(r.message).toBe('Casos consultados');
  });
});