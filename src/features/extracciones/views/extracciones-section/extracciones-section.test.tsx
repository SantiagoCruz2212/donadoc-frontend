import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { useDocumentoSeleccionadoStore } from '@/shared/state-manager';
import { renderConRutas } from '@/test/render';

import { decidirSugerencia, listarExtracciones, solicitarExtraccion } from '../../apis/extracciones-api';
import { Extraccion } from '../../models/extracciones-models';
import ExtraccionesSection from './index';

jest.mock('../../apis/extracciones-api');
const listar = listarExtracciones as jest.MockedFunction<typeof listarExtracciones>;
const solicitar = solicitarExtraccion as jest.MockedFunction<typeof solicitarExtraccion>;
const decidir = decidirSugerencia as jest.MockedFunction<typeof decidirSugerencia>;

const extraccion = (estado: string, sugerencias: Extraccion['sugerencias'] = []): Extraccion => ({
  id: 'e1', casoId: 'c1', documentoOrigenId: 'd1', estado, proveedor: 'GEMINI', modelo: 'm', intentos: 1, solicitadoEn: '2026-11-02T12:00:00-05:00', sugerencias,
});
const sug = { id: 's1', campo: 'diagnosticoPrincipal', valorSugerido: 'TCE severo', confianza: 0.91, decision: 'PENDIENTE' as const, valorFinal: null };

describe('ExtraccionesSection', () => {
  beforeEach(() => {
    [listar, solicitar, decidir].forEach((m) => m.mockReset());
    useDocumentoSeleccionadoStore.getState().limpiar();
    listar.mockResolvedValue([]);
  });

  it('sin documento seleccionado explica qué hacer y deshabilita el botón', async () => {
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    expect(await screen.findByText('Registre o seleccione una historia clínica primero.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Extraer con IA' })).toBeDisabled();
  });

  it('extrae con IA el documento seleccionado y resume el resultado', async () => {
    useDocumentoSeleccionadoStore.getState().seleccionar('d1');
    solicitar.mockResolvedValue({ mensaje: 'Extracción procesada; las sugerencias requieren revisión', extraccion: extraccion('PROCESADA', [sug]) });
    listar.mockResolvedValueOnce([]).mockResolvedValue([extraccion('PROCESADA', [sug])]);
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Extraer con IA' }));
    expect(await screen.findByText(/Extracción procesada; las sugerencias requieren revisión \(estado: PROCESADA, proveedor: GEMINI, 1 intento\(s\)\)/)).toBeInTheDocument();
    expect(solicitar).toHaveBeenCalledWith('c1', 'd1');
    expect(await screen.findByText('TCE severo')).toBeInTheDocument();
    expect(screen.getByText('91 %')).toBeInTheDocument();
  });

  it('si el proveedor falla muestra el aviso de extracción pendiente (no es un error de la aplicación)', async () => {
    useDocumentoSeleccionadoStore.getState().seleccionar('d1');
    solicitar.mockResolvedValue({ mensaje: 'El proveedor de IA no respondió; el documento quedó guardado y la extracción pendiente', extraccion: extraccion('PENDIENTE') });
    listar.mockResolvedValue([extraccion('PENDIENTE')]);
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Extraer con IA' }));
    expect(await screen.findByRole('status')).toHaveTextContent('la extracción pendiente');
    expect(await screen.findByText('Sin sugerencias: capture los datos manualmente.')).toBeInTheDocument();
  });

  it('acepta, modifica y rechaza sugerencias (la persona decide)', async () => {
    useDocumentoSeleccionadoStore.getState().seleccionar('d1');
    const dos = [sug, { ...sug, id: 's2', campo: 'causaMuerte', valorSugerido: 'Muerte encefálica' }, { ...sug, id: 's3', campo: 'grupoSanguineo', valorSugerido: 'O+' }];
    listar.mockResolvedValue([extraccion('PROCESADA', dos)]);
    decidir.mockResolvedValue({ ...sug, decision: 'ACEPTADA' });
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    const aceptar = await screen.findAllByRole('button', { name: 'Aceptar' });
    await userEvent.click(aceptar[0]);
    expect(decidir).toHaveBeenLastCalledWith('s1', 'ACEPTADA', undefined);

    const modificar = screen.getAllByRole('button', { name: 'Modificar' });
    expect(modificar[1]).toBeDisabled(); // sin valor corregido no se puede modificar
    await userEvent.type(screen.getAllByLabelText('Valor corregido')[1], 'Muerte encefálica por TCE');
    await userEvent.click(screen.getAllByRole('button', { name: 'Modificar' })[1]);
    expect(decidir).toHaveBeenLastCalledWith('s2', 'MODIFICADA', 'Muerte encefálica por TCE');

    await userEvent.click(screen.getAllByRole('button', { name: 'Rechazar' })[2]);
    expect(decidir).toHaveBeenLastCalledWith('s3', 'RECHAZADA', undefined);
  });

  it('muestra las sugerencias ya revisadas como decisión, sin botones', async () => {
    listar.mockResolvedValue([extraccion('PROCESADA', [{ ...sug, decision: 'ACEPTADA', valorFinal: 'TCE severo' }])]);
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    expect(await screen.findByText('ACEPTADA')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aceptar' })).not.toBeInTheDocument();
  });

  it('muestra el error de la API al fallar la solicitud', async () => {
    useDocumentoSeleccionadoStore.getState().seleccionar('d1');
    solicitar.mockRejectedValue(new ApiError('Documento no encontrado', 404));
    renderConRutas(<ExtraccionesSection casoId="c1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Extraer con IA' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Documento no encontrado');
  });
});