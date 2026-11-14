import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { cambiarClave } from '../../apis/clave-api';
import CambiarClaveView from './index';

jest.mock('../../apis/clave-api');
const cambiar = cambiarClave as jest.MockedFunction<typeof cambiarClave>;

async function escribir(etiqueta: RegExp, texto: string) {
  const campo = screen.getByLabelText(etiqueta);
  await userEvent.clear(campo);
  if (texto) await userEvent.type(campo, texto);
}

// Las etiquetas se buscan por prefijo: cuando hay un error, su mensaje forma parte del texto de la etiqueta.
async function llenar(actual: string, nueva: string, confirmar: string) {
  await escribir(/^Clave actual/, actual);
  await escribir(/^Nueva clave/, nueva);
  await escribir(/^Confirmar la nueva clave/, confirmar);
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar clave' }));
}

describe('CambiarClaveView', () => {
  beforeEach(() => jest.resetAllMocks());

  it('exige la clave actual y valida la política y la confirmación', async () => {
    renderConRutas(<CambiarClaveView />);
    await llenar('', 'corta', 'distinta');
    expect(await screen.findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 10 caracteres, con letras y números')).toBeInTheDocument();
    expect(cambiar).not.toHaveBeenCalled();
  });

  it('rechaza una nueva clave sin números y confirmaciones que no coinciden', async () => {
    renderConRutas(<CambiarClaveView />);
    await llenar('actual', 'SoloLetrasLargas', 'OtraDistinta1234');
    expect(await screen.findByText('Mínimo 10 caracteres, con letras y números')).toBeInTheDocument();
    expect(cambiar).not.toHaveBeenCalled();
    await escribir(/^Nueva clave/, 'ClaveNueva2026');
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar clave' }));
    expect(await screen.findByText('Las claves no coinciden')).toBeInTheDocument();
    expect(cambiar).not.toHaveBeenCalled();
  });

  it('cambia la clave, confirma y limpia el formulario', async () => {
    cambiar.mockResolvedValue(true);
    renderConRutas(<CambiarClaveView />);
    await llenar('ClaveActual2026', 'ClaveNueva2026', 'ClaveNueva2026');
    expect(await screen.findByText('Su clave fue actualizada.')).toBeInTheDocument();
    expect(cambiar).toHaveBeenCalledWith({ claveActual: 'ClaveActual2026', nuevaClave: 'ClaveNueva2026' });
    expect(screen.getByLabelText(/^Clave actual/)).toHaveValue('');
  });

  it('si la clave actual es incorrecta muestra el mensaje de la API sin dar por hecho el cambio', async () => {
    cambiar.mockRejectedValue(new ApiError('La contraseña actual no es correcta', 422));
    renderConRutas(<CambiarClaveView />);
    await llenar('incorrecta', 'ClaveNueva2026', 'ClaveNueva2026');
    expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña actual no es correcta');
    expect(screen.queryByText('Su clave fue actualizada.')).not.toBeInTheDocument();
  });
});
