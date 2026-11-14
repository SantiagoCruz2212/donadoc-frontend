import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { useSessionStore } from '@/shared/state-manager';
import { renderConRutas } from '@/test/render';

import { agregarComponente, cambiarEstado, eliminarCaso, listarComponentes, obtenerCaso } from '../../apis/casos-api';
import { Caso } from '../../models/casos-models';
import CasoResumenView from './index';

jest.mock('../../apis/casos-api');
const obtener = obtenerCaso as jest.MockedFunction<typeof obtenerCaso>;
const cambiar = cambiarEstado as jest.MockedFunction<typeof cambiarEstado>;
const eliminar = eliminarCaso as jest.MockedFunction<typeof eliminarCaso>;
const listarComps = listarComponentes as jest.MockedFunction<typeof listarComponentes>;
const agregarComp = agregarComponente as jest.MockedFunction<typeof agregarComponente>;

const caso = (estado: string): Caso => ({
  id: 'c1', estado, tipoDonante: null, muerteViolenta: false, creadoEn: '2026-11-02T12:00:00-05:00',
  donante: { id: 'd1', tipoDocumento: 'CC', numeroDocumento: '1000000001', nombres: 'Juan', apellidos: 'Pérez' },
});
const usuario = (rol: string) => ({ id: 'u1', nombre: 'Demo', correo: 'd@demo.local', rol, perfil: null });

describe('CasoResumenView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    listarComps.mockResolvedValue([]);
    useSessionStore.getState().iniciarSesion('jwt', usuario('ADMIN_ORG'));
  });

  it('muestra el donante y permite volver a la lista', async () => {
    obtener.mockResolvedValue(caso('BORRADOR'));
    renderConRutas(<CasoResumenView casoId="c1" />, { otras: { '/casos': 'LISTA DE CASOS' } });
    expect(await screen.findByRole('heading', { name: /Caso de Juan Pérez/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '← Volver a los casos' }));
    expect(await screen.findByText('LISTA DE CASOS')).toBeInTheDocument();
  });

  it('muestra el error cuando el caso no existe', async () => {
    obtener.mockRejectedValue(new ApiError('Caso no encontrado', 404));
    renderConRutas(<CasoResumenView casoId="zz" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Caso no encontrado');
  });

  it('ofrece solo las transiciones válidas del estado y recarga el caso al cambiarlo', async () => {
    obtener.mockResolvedValueOnce(caso('BORRADOR')).mockResolvedValue(caso('EN_CURSO'));
    cambiar.mockResolvedValue(caso('EN_CURSO'));
    renderConRutas(<CasoResumenView casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Pasar a EN_CURSO' }));
    expect(cambiar).toHaveBeenCalledWith('c1', 'EN_CURSO', undefined);
    expect(await screen.findByText('Estado actualizado.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Pasar a FIRMADO' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pasar a CERRADO' })).not.toBeInTheDocument();
  });

  it('«contraindicado» exige escribir la causa antes de habilitarse', async () => {
    obtener.mockResolvedValue(caso('BORRADOR'));
    cambiar.mockResolvedValue(caso('CONTRAINDICADO'));
    renderConRutas(<CasoResumenView casoId="c1" />);
    const boton = await screen.findByRole('button', { name: 'Pasar a CONTRAINDICADO' });
    expect(boton).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Causa de la contraindicación'), 'Sepsis activa');
    expect(boton).toBeEnabled();
    await userEvent.click(boton);
    expect(cambiar).toHaveBeenCalledWith('c1', 'CONTRAINDICADO', 'Sepsis activa');
  });

  it('muestra el mensaje de la API cuando la transición no se permite', async () => {
    obtener.mockResolvedValue(caso('BORRADOR'));
    cambiar.mockRejectedValue(new ApiError('No se puede pasar de BORRADOR a EN_CURSO', 409));
    renderConRutas(<CasoResumenView casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Pasar a EN_CURSO' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede pasar');
  });

  it('un administrador puede eliminar un caso en borrador (con confirmación) y vuelve a la lista', async () => {
    obtener.mockResolvedValue(caso('BORRADOR'));
    eliminar.mockResolvedValue(true);
    const confirmar = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderConRutas(<CasoResumenView casoId="c1" />, { otras: { '/casos': 'LISTA DE CASOS' } });
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar caso' }));
    expect(confirmar).toHaveBeenCalled();
    expect(await screen.findByText('LISTA DE CASOS')).toBeInTheDocument();
    expect(eliminar).toHaveBeenCalledWith('c1');
    confirmar.mockRestore();
  });

  it('si la persona cancela la confirmación no se elimina nada', async () => {
    obtener.mockResolvedValue(caso('BORRADOR'));
    const confirmar = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderConRutas(<CasoResumenView casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar caso' }));
    expect(eliminar).not.toHaveBeenCalled();
    confirmar.mockRestore();
  });

  it('un operador no ve el botón de eliminar', async () => {
    useSessionStore.getState().iniciarSesion('jwt', usuario('OPERADOR'));
    obtener.mockResolvedValue(caso('BORRADOR'));
    renderConRutas(<CasoResumenView casoId="c1" />);
    await screen.findByRole('heading', { name: /Caso de Juan Pérez/ });
    expect(screen.queryByRole('button', { name: 'Eliminar caso' })).not.toBeInTheDocument();
  });

  it('un caso cerrado no ofrece acciones', async () => {
    obtener.mockResolvedValue(caso('CERRADO'));
    renderConRutas(<CasoResumenView casoId="c1" />);
    await screen.findByRole('heading', { name: /Caso de Juan Pérez/ });
    expect(screen.queryByRole('button', { name: /Pasar a/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar caso' })).not.toBeInTheDocument();
  });

  it('lista los órganos registrados y permite agregar uno rescatado', async () => {
    obtener.mockResolvedValue(caso('EN_CURSO'));
    listarComps.mockResolvedValueOnce([{ id: 'k1', tipoComponente: 'RINON', rescatado: true, causaNoRescate: null }]).mockResolvedValue([
      { id: 'k1', tipoComponente: 'RINON', rescatado: true, causaNoRescate: null },
      { id: 'k2', tipoComponente: 'HIGADO', rescatado: true, causaNoRescate: null },
    ]);
    agregarComp.mockResolvedValue({ id: 'k2', tipoComponente: 'HIGADO', rescatado: true, causaNoRescate: null });
    renderConRutas(<CasoResumenView casoId="c1" />);
    const lista = await screen.findByRole('list');
    expect(within(lista).getByText('RINON')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Órgano o tejido'), 'HIGADO');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(agregarComp).toHaveBeenCalledWith('c1', expect.objectContaining({ tipoComponente: 'HIGADO', rescatado: true })));
    expect(await within(screen.getByRole('list')).findByText('HIGADO')).toBeInTheDocument();
  });

  it('un órgano no rescatado exige la causa; con ella se registra', async () => {
    obtener.mockResolvedValue(caso('EN_CURSO'));
    agregarComp.mockResolvedValue({ id: 'k3', tipoComponente: 'RINON', rescatado: false, causaNoRescate: 'Contraindicación' });
    renderConRutas(<CasoResumenView casoId="c1" />);
    await screen.findByRole('heading', { name: /Caso de Juan Pérez/ });
    await userEvent.click(screen.getByLabelText('Rescatado'));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(await screen.findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(agregarComp).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText(/^Causa por la que no se rescató/), 'Contraindicación');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(agregarComp).toHaveBeenCalledWith('c1', expect.objectContaining({ rescatado: false, causaNoRescate: 'Contraindicación' })));
  });
});
