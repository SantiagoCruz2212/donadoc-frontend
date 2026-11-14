import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { restablecerClave, solicitarCodigo } from '../../apis/clave-api';
import OlvideClaveView from './index';

jest.mock('../../apis/clave-api');
const pedirCodigo = solicitarCodigo as jest.MockedFunction<typeof solicitarCodigo>;
const restablecer = restablecerClave as jest.MockedFunction<typeof restablecerClave>;

async function pedirCodigoConCorreo() {
  await userEvent.type(screen.getByLabelText('Correo'), 'c@demo.local');
  await userEvent.click(screen.getByRole('button', { name: 'Enviar código' }));
}

describe('OlvideClaveView', () => {
  beforeEach(() => jest.resetAllMocks());

  it('valida el correo antes de pedir el código', async () => {
    renderConRutas(<OlvideClaveView />);
    await userEvent.type(screen.getByLabelText('Correo'), 'no-es-correo');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar código' }));
    expect(await screen.findByText('Ingrese un correo válido')).toBeInTheDocument();
    expect(pedirCodigo).not.toHaveBeenCalled();
  });

  it('pide el código y pasa al segundo paso con el aviso (sin revelar si la cuenta existe)', async () => {
    pedirCodigo.mockResolvedValue(true);
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    expect(await screen.findByText(/Si el correo está registrado/)).toBeInTheDocument();
    expect(pedirCodigo).toHaveBeenCalledWith('c@demo.local');
    expect(screen.getByLabelText('Código recibido por correo')).toBeInTheDocument();
  });

  it('si el envío falla muestra el error y se queda en el primer paso', async () => {
    pedirCodigo.mockRejectedValue(new ApiError('Demasiadas solicitudes', 429));
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiadas solicitudes');
    expect(screen.queryByLabelText('Código recibido por correo')).not.toBeInTheDocument();
  });

  it('valida el código de 6 dígitos, la política de la clave y que ambas claves coincidan', async () => {
    pedirCodigo.mockResolvedValue(true);
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    await userEvent.type(await screen.findByLabelText('Código recibido por correo'), '12');
    await userEvent.type(screen.getByLabelText('Nueva clave'), 'corta');
    await userEvent.type(screen.getByLabelText('Confirmar la nueva clave'), 'otra');
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer clave' }));
    expect(await screen.findByText('El código tiene 6 dígitos')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 10 caracteres, con letras y números')).toBeInTheDocument();
    expect(restablecer).not.toHaveBeenCalled();
  });

  it('con todo correcto restablece la clave y confirma', async () => {
    pedirCodigo.mockResolvedValue(true);
    restablecer.mockResolvedValue(true);
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    await userEvent.type(await screen.findByLabelText('Código recibido por correo'), '123456');
    await userEvent.type(screen.getByLabelText('Nueva clave'), 'ClaveNueva2026');
    await userEvent.type(screen.getByLabelText('Confirmar la nueva clave'), 'ClaveNueva2026');
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer clave' }));
    expect(await screen.findByText(/Su clave fue actualizada/)).toBeInTheDocument();
    expect(restablecer).toHaveBeenCalledWith({ correo: 'c@demo.local', codigo: '123456', nuevaClave: 'ClaveNueva2026' });
    expect(screen.getByRole('link', { name: 'Volver al ingreso' })).toBeInTheDocument();
  });

  it('un código inválido muestra el mensaje de la API y deja reintentar', async () => {
    pedirCodigo.mockResolvedValue(true);
    restablecer.mockRejectedValue(new ApiError('Código inválido o vencido', 400));
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    await userEvent.type(await screen.findByLabelText('Código recibido por correo'), '000000');
    await userEvent.type(screen.getByLabelText('Nueva clave'), 'ClaveNueva2026');
    await userEvent.type(screen.getByLabelText('Confirmar la nueva clave'), 'ClaveNueva2026');
    await userEvent.click(screen.getByRole('button', { name: 'Restablecer clave' }));
    const alertas = await screen.findAllByRole('alert');
    expect(alertas.some((a) => a.textContent?.includes('Código inválido o vencido'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Restablecer clave' })).toBeEnabled();
  });

  it('permite volver al primer paso para usar otro correo', async () => {
    pedirCodigo.mockResolvedValue(true);
    renderConRutas(<OlvideClaveView />);
    await pedirCodigoConCorreo();
    await userEvent.click(await screen.findByRole('button', { name: 'Usar otro correo' }));
    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeInTheDocument();
  });
});
