import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';
import { useSessionStore } from '@/shared/state-manager';

import MainLayout from './main-layout';
import PublicLayout from './public-layout';

const usuario = { id: 'u1', nombre: 'Coordinación Demo', correo: 'c@demo.local', rol: 'ADMIN_ORG', perfil: null };

function app(inicial: string) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[inicial]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<p>PANTALLA LOGIN</p>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/casos" element={<p>PANTALLA CASOS</p>} />
            <Route path="/red" element={<p>PANTALLA RED</p>} />
            <Route path="/informes" element={<p>PANTALLA INFORMES</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe('guardias de ruta', () => {
  beforeEach(() => useSessionStore.getState().cerrarSesion());

  it('sin sesión, una ruta privada redirige al login', () => {
    app('/casos');
    expect(screen.getByText('PANTALLA LOGIN')).toBeInTheDocument();
  });

  it('con sesión, la ruta privada muestra el encabezado con el usuario', () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/casos');
    expect(screen.getByText('PANTALLA CASOS')).toBeInTheDocument();
    expect(screen.getByText('Coordinación Demo')).toBeInTheDocument();
  });

  it('con sesión, el login redirige a los casos', () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/login');
    expect(screen.getByText('PANTALLA CASOS')).toBeInTheDocument();
  });

  it('el administrador ve la navegación completa, con la auditoría', () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/casos');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(nav).toHaveTextContent('CasosRed de trasplantesInformesAuditoríaCambiar clave');
    expect(screen.getByRole('button', { name: 'Casos' })).toHaveAttribute('aria-current', 'page');
  });

  it('un operador no ve el enlace de auditoría', () => {
    useSessionStore.getState().iniciarSesion('jwt', { ...usuario, rol: 'OPERADOR' });
    app('/casos');
    expect(screen.queryByRole('button', { name: 'Auditoría' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Red de trasplantes' })).toBeInTheDocument();
  });

  it('el operador y el administrador ven el enlace de informes; el súper administrador no', () => {
    useSessionStore.getState().iniciarSesion('jwt', { ...usuario, rol: 'OPERADOR' });
    const operador = app('/casos');
    expect(screen.getByRole('button', { name: 'Informes' })).toBeInTheDocument();
    operador.unmount();
    useSessionStore.getState().iniciarSesion('jwt', { ...usuario, rol: 'SUPER_ADMIN' });
    app('/casos');
    expect(screen.queryByRole('button', { name: 'Informes' })).not.toBeInTheDocument();
  });

  it('el enlace de informes navega a la lista de informes', async () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/casos');
    await userEvent.click(screen.getByRole('button', { name: 'Informes' }));
    expect(screen.getByText('PANTALLA INFORMES')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Informes' })).toHaveAttribute('aria-current', 'page');
  });

  it('los enlaces de la barra navegan a su ruta', async () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/casos');
    await userEvent.click(screen.getByRole('button', { name: 'Red de trasplantes' }));
    expect(screen.getByText('PANTALLA RED')).toBeInTheDocument();
  });

  it('cerrar sesión limpia el token y vuelve al login', async () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario);
    app('/casos');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(screen.getByText('PANTALLA LOGIN')).toBeInTheDocument();
  });
});