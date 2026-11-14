import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { useSessionStore } from '@/shared/state-manager';
import { renderConRutas } from '@/test/render';

import { login } from '../../apis/login-api';
import LoginView from './index';

jest.mock('../../apis/login-api');
const loginMock = login as jest.MockedFunction<typeof login>;

const sesion = { accessToken: 'jwt-1', usuario: { id: 'u1', nombre: 'Coordinación Demo', correo: 'c@demo.local', rol: 'ADMIN_ORG', perfil: 'COORDINADOR' } };

describe('LoginView', () => {
  beforeEach(() => {
    loginMock.mockReset();
    useSessionStore.getState().cerrarSesion();
  });

  it('con datos válidos inicia sesión, guarda el token y navega a los casos', async () => {
    loginMock.mockResolvedValue(sesion);
    renderConRutas(<LoginView />, { otras: { '/casos': 'PANTALLA CASOS' } });
    await userEvent.type(screen.getByLabelText('Correo'), 'c@demo.local');
    await userEvent.type(screen.getByLabelText('Clave'), 'secreta');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('PANTALLA CASOS')).toBeInTheDocument();
    expect(loginMock).toHaveBeenCalledWith({ correo: 'c@demo.local', clave: 'secreta' });
    expect(useSessionStore.getState().accessToken).toBe('jwt-1');
  });

  it('con campos vacíos muestra los errores de validación y no llama a la API', async () => {
    renderConRutas(<LoginView />);
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findAllByText('Este campo es obligatorio')).toHaveLength(2);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', async () => {
    renderConRutas(<LoginView />);
    await userEvent.type(screen.getByLabelText('Correo'), 'no-es-correo');
    await userEvent.type(screen.getByLabelText('Clave'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Ingrese un correo válido')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('si las credenciales son incorrectas muestra el mensaje de la API y no inicia sesión', async () => {
    loginMock.mockRejectedValue(new ApiError('Credenciales inválidas', 401));
    renderConRutas(<LoginView />);
    await userEvent.type(screen.getByLabelText('Correo'), 'c@demo.local');
    await userEvent.type(screen.getByLabelText('Clave'), 'mala');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas'));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});