import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import * as utils from '@/shared/utils/utils';
import { renderConRutas } from '@/test/render';

import { descargarPdf, guardarInforme, obtenerInforme } from '../../apis/informes-api';
import { informeDemo } from '../../models/informes-fixtures';
import InformeDetalleView from './index';

jest.mock('../../apis/informes-api');
const obtener = obtenerInforme as jest.MockedFunction<typeof obtenerInforme>;
const guardar = guardarInforme as jest.MockedFunction<typeof guardarInforme>;
const pdf = descargarPdf as jest.MockedFunction<typeof descargarPdf>;

const abrir = () =>
  renderConRutas(<InformeDetalleView codigo="INF-DEMO" periodo="2026-10" />, { otras: { '/informes': 'PANTALLA INFORMES' } });

describe('InformeDetalleView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    obtener.mockResolvedValue(informeDemo());
  });

  it('genera el formulario desde el esquema: campos simples y tablas', async () => {
    abrir();
    expect(await screen.findByText('General')).toBeInTheDocument();
    expect(obtener).toHaveBeenCalledWith('INF-DEMO', '2026-10');
    expect(screen.getByRole('heading', { name: 'Informe mensual demo' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/).tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText(/Responsable/)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Fecha de cierre/)).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText(/Tipo/).tagName).toBe('SELECT');
    expect(screen.getByLabelText(/Cuenta/)).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText(/Revisado/)).toHaveAttribute('type', 'checkbox');
    expect(screen.getByRole('region', { name: 'Movimiento mensual' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Donantes' })).toBeInTheDocument();
    expect(screen.getByText(/Periodo 2026-10/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descargar PDF' })).not.toBeInTheDocument();
  });

  it('recalcula en vivo la columna calculada y los totales mientras se escribe', async () => {
    abrir();
    await userEvent.type(await screen.findByLabelText('Enero · Recibidos'), '10');
    await userEvent.type(screen.getByLabelText('Enero · Descartados'), '3');
    await userEvent.type(screen.getByLabelText('Febrero · Recibidos'), '5');
    expect(screen.getByLabelText('Enero · Útiles (calculada)')).toHaveValue('7');
    expect(screen.getByLabelText('Febrero · Útiles (calculada)')).toHaveValue('5');
    const total = screen.getByRole('rowheader', { name: 'TOTAL' }).closest('tr') as HTMLElement;
    expect(total).toHaveTextContent('TOTAL15312');
  });

  it('en tablas libres agrega y quita filas, con el resumen en vivo', async () => {
    abrir();
    await screen.findByText('Tablas');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    await userEvent.selectOptions(screen.getByLabelText('Fila 1 · Lugar'), 'UCI');
    await userEvent.selectOptions(screen.getByLabelText('Fila 2 · Lugar'), 'UCI');
    expect(screen.getByText('Por lugar:').closest('p')).toHaveTextContent('Por lugar: UCI 2');
    await userEvent.click(screen.getByRole('button', { name: 'Quitar fila 1' }));
    expect(screen.queryByLabelText('Fila 2 · Lugar')).not.toBeInTheDocument();
    expect(screen.getByText('Por lugar:').closest('p')).toHaveTextContent('Por lugar: UCI 1');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    expect(screen.getByRole('button', { name: 'Agregar fila' })).toBeDisabled();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('guarda el borrador enviando solo lo diligenciado: filas fijas alineadas y tablas libres sin filas vacías', async () => {
    guardar.mockResolvedValue(
      informeDemo({ estado: 'BORRADOR', version: 1, datos: { responsable: 'Ana', mensual: [{ recibidos: 10 }, {}, {}], donantes: [{ nombre: 'Luis' }] } }),
    );
    abrir();
    await userEvent.type(await screen.findByLabelText(/Responsable/), 'Ana');
    await userEvent.type(screen.getByLabelText('Enero · Recibidos'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    await userEvent.type(screen.getByLabelText('Fila 2 · Nombre'), 'Luis');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    await waitFor(() =>
      expect(guardar).toHaveBeenCalledWith(
        'INF-DEMO',
        '2026-10',
        { responsable: 'Ana', revisado: false, mensual: [{ recibidos: 10 }, {}, {}], donantes: [{ nombre: 'Luis' }] },
        false,
      ),
    );
    expect(await screen.findByText('Informe guardado.')).toBeInTheDocument();
    expect(screen.getByText(/versión 1/)).toBeInTheDocument();
  });

  it('tras guardar usa la respuesta del servidor: datos y calculados', async () => {
    const respuesta = informeDemo({ estado: 'BORRADOR', version: 1, datos: { mensual: [{ recibidos: 4 }, {}, {}] } });
    // El servidor es la autoridad: si calcula otro valor, es el que se muestra.
    respuesta.calculados.mensual.filas[0] = { recibidos: 4, utiles: 99 };
    guardar.mockResolvedValue(respuesta);
    abrir();
    await userEvent.type(await screen.findByLabelText('Enero · Recibidos'), '4');
    expect(screen.getByLabelText('Enero · Útiles (calculada)')).toHaveValue('4');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    await screen.findByText('Informe guardado.');
    expect(screen.getByLabelText('Enero · Útiles (calculada)')).toHaveValue('99');
  });

  it('marcar como completo envía completo=true, confirma el PDF y habilita la descarga', async () => {
    guardar.mockResolvedValue(informeDemo({ estado: 'COMPLETO', version: 2, datos: { responsable: 'Ana' } }));
    abrir();
    await userEvent.type(await screen.findByLabelText(/Responsable/), 'Ana');
    await userEvent.click(screen.getByRole('button', { name: 'Marcar como completo' }));
    await waitFor(() => expect(guardar).toHaveBeenCalledWith('INF-DEMO', '2026-10', { responsable: 'Ana', revisado: false }, true));
    expect(await screen.findByText('Informe completo: PDF generado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeInTheDocument();
  });

  it('muestra los errores del 422 junto al campo y a la celda', async () => {
    guardar.mockRejectedValue(
      new ApiError('Datos inválidos', 422, [
        { property: 'responsable', constraints: { informe: 'Este campo es obligatorio' } },
        { property: 'mensual[1].recibidos', constraints: { informe: 'Debe ser un número mayor o igual a 0' } },
        { property: 'mensual[2]', constraints: { informe: 'La fila no es válida' } },
      ]),
    );
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Marcar como completo' }));
    const alertas = await screen.findAllByRole('alert');
    expect(alertas.some((a) => a.textContent === 'Este campo es obligatorio')).toBe(true);
    expect(alertas.some((a) => a.textContent?.startsWith('Datos inválidos'))).toBe(true);
    const celda = screen.getByLabelText('Febrero · Recibidos');
    expect(celda).toHaveAttribute('aria-invalid', 'true');
    expect(celda).toHaveAttribute('aria-describedby', screen.getByText('Debe ser un número mayor o igual a 0').id);
    expect(screen.getByText('La fila no es válida')).toBeInTheDocument();
  });

  it('quitar una fila descarta los errores de esa tabla (las posiciones ya no valen)', async () => {
    guardar.mockRejectedValue(new ApiError('Datos inválidos', 422, [{ property: 'donantes[0].fechaObtencion', constraints: { informe: 'Fecha inválida' } }]));
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar fila' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
    expect(await screen.findByText('Fecha inválida')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Quitar fila 1' }));
    expect(screen.queryByText('Fecha inválida')).not.toBeInTheDocument();
  });

  it('descarga el PDF con código, periodo y versión', async () => {
    obtener.mockResolvedValue(informeDemo({ estado: 'COMPLETO', version: 3 }));
    pdf.mockResolvedValue(new Blob(['%PDF-'], { type: 'application/pdf' }));
    const descargar = jest.spyOn(utils, 'descargarBlob').mockImplementation(() => undefined);
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar PDF' }));
    await waitFor(() => expect(descargar).toHaveBeenCalledWith(expect.any(Blob), 'INF-DEMO-2026-10-v3.pdf'));
    descargar.mockRestore();
  });

  it('si el PDF falla muestra el error', async () => {
    obtener.mockResolvedValue(informeDemo({ estado: 'COMPLETO', version: 3 }));
    pdf.mockRejectedValue(new ApiError('El informe aún no está completo', 404));
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar PDF' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El informe aún no está completo');
  });

  it('si el informe no se puede cargar (p. ej. periodo inválido) muestra el error y no el formulario', async () => {
    obtener.mockRejectedValue(new ApiError('El periodo debe tener la forma AAAA-MM (p. ej. 2026-10)', 400));
    abrir();
    expect(await screen.findByRole('alert')).toHaveTextContent('El periodo debe tener la forma AAAA-MM');
    expect(screen.queryByRole('button', { name: 'Guardar borrador' })).not.toBeInTheDocument();
    expect(screen.queryByText('Cargando informe…')).not.toBeInTheDocument();
  });

  it('un error sin detalle usa el mensaje genérico', async () => {
    obtener.mockRejectedValue('fallo');
    abrir();
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un error inesperado');
  });

  it('volver lleva a la lista de informes', async () => {
    abrir();
    await userEvent.click(await screen.findByRole('button', { name: '← Volver a los informes' }));
    expect(screen.getByText('PANTALLA INFORMES')).toBeInTheDocument();
  });
});
