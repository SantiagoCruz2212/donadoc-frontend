import { STORAGE_KEYS } from '@/shared/constants/constants';

import { useSessionStore } from './session-store';

const usuario = { id: 'u1', nombre: 'Coordinación Demo', correo: 'c@demo.local', rol: 'ADMIN_ORG', perfil: 'COORDINADOR' };

describe('useSessionStore', () => {
  beforeEach(() => useSessionStore.getState().cerrarSesion());

  it('inicia sesión y la persiste en sessionStorage', () => {
    useSessionStore.getState().iniciarSesion('token-123', usuario);
    expect(useSessionStore.getState().accessToken).toBe('token-123');
    const guardado = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.sesion) as string);
    expect(guardado.state.accessToken).toBe('token-123');
    expect(guardado.state.usuario.nombre).toBe('Coordinación Demo');
  });

  it('cierra la sesión y limpia token y usuario', () => {
    useSessionStore.getState().iniciarSesion('token-123', usuario);
    useSessionStore.getState().cerrarSesion();
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useSessionStore.getState().usuario).toBeNull();
  });
});