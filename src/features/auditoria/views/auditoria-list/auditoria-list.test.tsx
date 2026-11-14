import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { consultarAuditoria } from '../../apis/auditoria-api';
import { EventoAuditoria, PaginaAuditoria } from '../../models/auditoria-models';
import AuditoriaListView from './index';

jest.mock('../../apis/auditoria-api');
const consultar = consultarAuditoria as jest.MockedFunction<typeof consultarAuditoria>;

const SIN_FILTROS = { entidad: '', accion: '', desde: '', hasta: '' };
const evento = (n: number, extra: Partial<EventoAuditoria> = {}): EventoAuditoria => ({
  id: `e${n}`, fecha: '2026-11-08T10:15:00-05:00', usuarioId: 'u1', usuarioNombre: 'Coordinación Demo', entidad: 'casos', entidadId: null,
  accion: 'CONSULTAR', metodo: 'GET', ruta: '/api/v1/casos', estadoHttp: 200, ip: '10.0.0.1', ...extra,
});
const pagina = (items: EventoAuditoria[], page = 1, totalPages = 1): PaginaAuditoria => ({ items, page, totalPages, total: items.length });

// Las opciones de los filtros repiten los nombres de las acciones, por eso las comprobaciones se hacen dentro de la tabla.
const tabla = async () => within(await screen.findByRole('table'));

describe('AuditoriaListView', () => {
  beforeEach(() => jest.resetAllMocks());

  it('muestra quién hizo qué, cuándo, desde qué ruta e IP', async () => {
    consultar.mockResolvedValue(pagina([evento(1), evento(2, { accion: 'ELIMINAR', usuarioNombre: null, estadoHttp: 404, ruta: null, ip: null })]));
    renderConRutas(<AuditoriaListView />);
    const t = await tabla();
    expect(t.getByText('Coordinación Demo')).toBeInTheDocument();
    expect(t.getByText('CONSULTAR')).toBeInTheDocument();
    expect(t.getByText('ELIMINAR')).toBeInTheDocument();
    expect(t.getByText('Sistema')).toBeInTheDocument(); // evento sin usuario (p. ej. login fallido)
    expect(t.getByText('/api/v1/casos')).toBeInTheDocument();
    expect(t.getByText('404')).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledWith(SIN_FILTROS, 1);
  });

  it('aplica los filtros solo al pulsar «Filtrar» y vuelve a la página 1', async () => {
    consultar.mockResolvedValue(pagina([evento(1)]));
    renderConRutas(<AuditoriaListView />);
    await tabla();
    await userEvent.selectOptions(screen.getByLabelText('Acción'), 'ELIMINAR');
    expect(consultar).toHaveBeenCalledTimes(1); // cambiar el selector no consulta todavía
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith({ ...SIN_FILTROS, accion: 'ELIMINAR' }, 1));
  });

  it('«Limpiar» quita los filtros', async () => {
    consultar.mockResolvedValue(pagina([evento(1)]));
    renderConRutas(<AuditoriaListView />);
    await tabla();
    await userEvent.selectOptions(screen.getByLabelText('Registro'), 'casos');
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith({ ...SIN_FILTROS, entidad: 'casos' }, 1));
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(SIN_FILTROS, 1));
    expect(screen.getByLabelText('Registro')).toHaveValue('');
  });

  it('pagina hacia adelante y atrás, sin salirse del rango', async () => {
    consultar.mockImplementation(async (_f, page) => pagina([evento(page)], page, 2));
    renderConRutas(<AuditoriaListView />);
    await screen.findByText('Página 1 de 2 · 1');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Página 2 de 2 · 1');
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    await screen.findByText('Página 1 de 2 · 1');
  });

  it('sin eventos lo dice', async () => {
    consultar.mockResolvedValue(pagina([]));
    renderConRutas(<AuditoriaListView />);
    expect(await screen.findByText('No hay eventos con ese filtro.')).toBeInTheDocument();
  });

  it('muestra el error (por ejemplo, 403 si no es administrador)', async () => {
    consultar.mockRejectedValue(new ApiError('No tiene permiso para esta acción', 403));
    renderConRutas(<AuditoriaListView />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No tiene permiso');
  });
});
