import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { crearAcceso, listarAccesos, restablecerAcceso } from '../../apis/accesos-api';
import { Acceso } from '../../models/accesos-models';
import AccesosListView from './index';

jest.mock('../../apis/accesos-api');
const listar = listarAccesos as jest.MockedFunction<typeof listarAccesos>;
const crear = crearAcceso as jest.MockedFunction<typeof crearAcceso>;
const restablecer = restablecerAcceso as jest.MockedFunction<typeof restablecerAcceso>;

const acceso = (n: number, extra: Partial<Acceso> = {}): Acceso => ({
  id: `a${n}`, correo: `persona${n}@correo.com`, nombre: `Persona ${n}`, rol: 'OPERADOR', perfil: null, estado: 'ACTIVO', creadoEn: '2026-11-19T10:00:00-05:00', ...extra,
});

describe('AccesosListView', () => {
  beforeEach(() => jest.resetAllMocks());

  it('lista los accesos y no ofrece restablecer la clave de un superadmin', async () => {
    listar.mockResolvedValue([acceso(1, { rol: 'SUPER_ADMIN', nombre: 'Dev' }), acceso(2)]);
    renderConRutas(<AccesosListView />);
    const tabla = within(await screen.findByRole('table'));
    expect(tabla.getByText('persona2@correo.com')).toBeInTheDocument();
    expect(tabla.getByText('Superadmin')).toBeInTheDocument();
    expect(tabla.getAllByRole('button', { name: 'Enviar clave nueva' })).toHaveLength(1);
  });

  it('crea un acceso, avisa que la clave se envió por correo y recarga la lista', async () => {
    listar.mockResolvedValueOnce([]).mockResolvedValueOnce([acceso(3)]);
    crear.mockResolvedValue(acceso(3));
    renderConRutas(<AccesosListView />);
    await screen.findByRole('table');
    await userEvent.type(screen.getByLabelText('Correo'), 'persona3@correo.com');
    await userEvent.type(screen.getByLabelText('Nombre'), 'Persona 3');
    await userEvent.click(screen.getByRole('button', { name: 'Crear y enviar clave' }));
    await waitFor(() => expect(crear).toHaveBeenCalledWith({ correo: 'persona3@correo.com', nombre: 'Persona 3', rol: 'OPERADOR', perfil: '' }));
    expect(await screen.findByText(/La clave se envió a persona3@correo.com/)).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(2);
  });

  it('valida el correo antes de llamar a la API', async () => {
    listar.mockResolvedValue([]);
    renderConRutas(<AccesosListView />);
    await screen.findByRole('table');
    await userEvent.type(screen.getByLabelText('Correo'), 'no-es-correo');
    await userEvent.type(screen.getByLabelText('Nombre'), 'Persona');
    await userEvent.click(screen.getByRole('button', { name: 'Crear y enviar clave' }));
    expect(await screen.findByText('Ingrese un correo válido')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor (p. ej. correo repetido)', async () => {
    listar.mockResolvedValue([]);
    crear.mockRejectedValue(new ApiError('Ya existe un acceso con ese correo', 409));
    renderConRutas(<AccesosListView />);
    await screen.findByRole('table');
    await userEvent.type(screen.getByLabelText('Correo'), 'repetido@correo.com');
    await userEvent.type(screen.getByLabelText('Nombre'), 'Persona');
    await userEvent.click(screen.getByRole('button', { name: 'Crear y enviar clave' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un acceso con ese correo');
  });

  it('envía una clave nueva por correo', async () => {
    listar.mockResolvedValue([acceso(4)]);
    restablecer.mockResolvedValue(acceso(4));
    renderConRutas(<AccesosListView />);
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar clave nueva' }));
    await waitFor(() => expect(restablecer).toHaveBeenCalledWith('a4'));
    expect(await screen.findByText(/Clave nueva enviada a persona4@correo.com/)).toBeInTheDocument();
  });
});
