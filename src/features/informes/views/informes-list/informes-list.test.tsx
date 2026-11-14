import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { listarInformes, listarPlantillas } from '../../apis/informes-api';
import { plantillaDemo } from '../../models/informes-fixtures';
import { InformeResumen, PaginaInformes, PlantillaInforme } from '../../models/informes-models';
import InformesListView from './index';

jest.mock('../../apis/informes-api');
const plantillas = listarPlantillas as jest.MockedFunction<typeof listarPlantillas>;
const informes = listarInformes as jest.MockedFunction<typeof listarInformes>;

const semanal: PlantillaInforme = { codigo: 'INF-SEM', nombre: 'Informe semanal demo', version: '1', esquema: { ambito: 'INFORME', periodicidad: 'SEMANAL', secciones: [] } };
const resumen = (n: number, extra: Partial<InformeResumen> = {}): InformeResumen => ({
  id: `i${n}`, codigo: 'INF-DEMO', nombre: 'Informe mensual demo', periodo: `2026-0${n}`, estado: 'BORRADOR', version: 1, actualizadoEn: '2026-11-08T10:15:00-05:00', ...extra,
});
const pagina = (items: InformeResumen[], page = 1, totalPages = 1): PaginaInformes => ({ items, page, totalPages, total: items.length });

const abrir = () =>
  renderConRutas(<InformesListView />, { otras: { '/informes/INF-DEMO/2026-10': 'DETALLE MENSUAL', '/informes/INF-SEM/2026-S42': 'DETALLE SEMANAL', '/informes/INF-DEMO/2026-02': 'DETALLE FILA' } });

describe('InformesListView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    plantillas.mockResolvedValue([plantillaDemo, semanal]);
    informes.mockResolvedValue(pagina([resumen(2), resumen(1, { estado: 'COMPLETO', version: 3 })]));
  });

  it('lista los informes de la organización con periodo, estado y versión', async () => {
    abrir();
    const tabla = within(await screen.findByRole('table'));
    expect(await tabla.findByText('2026-02')).toBeInTheDocument();
    expect(tabla.getByText('COMPLETO')).toBeInTheDocument();
    expect(tabla.getByText('3')).toBeInTheDocument();
    expect(informes).toHaveBeenCalledWith('', 1);
  });

  it('con un informe mensual el periodo es un selector de mes y abre /informes/:codigo/:periodo', async () => {
    abrir();
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'INF-DEMO');
    const periodo = screen.getByLabelText('Periodo (mes)');
    expect(periodo).toHaveAttribute('type', 'month');
    fireEvent.change(periodo, { target: { value: '2026-10' } });
    await userEvent.click(screen.getByRole('button', { name: 'Abrir informe' }));
    expect(await screen.findByText('DETALLE MENSUAL')).toBeInTheDocument();
  });

  it('con un informe semanal valida la forma AAAA-Sww y luego abre el informe', async () => {
    abrir();
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'INF-SEM');
    const periodo = screen.getByLabelText('Periodo (semana, AAAA-Sww)');
    await userEvent.type(periodo, '2026-s99');
    await userEvent.click(screen.getByRole('button', { name: 'Abrir informe' }));
    expect(await screen.findByText(/Use la forma AAAA-Sww/)).toBeInTheDocument();
    expect(screen.queryByText('DETALLE SEMANAL')).not.toBeInTheDocument();
    await userEvent.clear(periodo);
    await userEvent.type(periodo, '2026-s42');
    expect(periodo).toHaveValue('2026-S42');
    await userEvent.click(screen.getByRole('button', { name: 'Abrir informe' }));
    expect(await screen.findByText('DETALLE SEMANAL')).toBeInTheDocument();
  });

  it('sin elegir informe ni periodo muestra los dos errores y no navega', async () => {
    abrir();
    await screen.findByRole('table');
    await userEvent.click(screen.getByRole('button', { name: 'Abrir informe' }));
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toEqual(expect.arrayContaining(['Elija un informe', 'Elija un mes válido (AAAA-MM)']));
  });

  it('cambiar de informe limpia el periodo escrito', async () => {
    abrir();
    await userEvent.selectOptions(await screen.findByLabelText('Informe'), 'INF-SEM');
    await userEvent.type(screen.getByLabelText('Periodo (semana, AAAA-Sww)'), '2026-S4');
    await userEvent.selectOptions(screen.getByLabelText('Informe'), 'INF-DEMO');
    expect(screen.getByLabelText('Periodo (mes)')).toHaveValue('');
  });

  it('el botón «Abrir» de una fila lleva a ese informe', async () => {
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Abrir Informe mensual demo 2026-02' }));
    expect(await screen.findByText('DETALLE FILA')).toBeInTheDocument();
  });

  it('filtra por informe y vuelve a la página 1', async () => {
    abrir();
    await screen.findByRole('table');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por informe'), 'INF-SEM');
    await waitFor(() => expect(informes).toHaveBeenLastCalledWith('INF-SEM', 1));
  });

  it('pagina hacia adelante y atrás, sin salirse del rango', async () => {
    informes.mockImplementation(async (_c, page) => pagina([resumen(page)], page, 2));
    abrir();
    await screen.findByText('Página 1 de 2 · 1');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Página 2 de 2 · 1');
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    await screen.findByText('Página 1 de 2 · 1');
  });

  it('sin informes lo dice', async () => {
    informes.mockResolvedValue(pagina([]));
    abrir();
    expect(await screen.findByText('Aún no hay informes guardados.')).toBeInTheDocument();
  });

  it('muestra el error de la API (por ejemplo, 403)', async () => {
    informes.mockRejectedValue(new ApiError('No tiene permiso para esta acción', 403));
    plantillas.mockRejectedValue(new ApiError('No tiene permiso para esta acción', 403));
    abrir();
    expect((await screen.findAllByRole('alert'))[0]).toHaveTextContent('No tiene permiso');
  });
});
