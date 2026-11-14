import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { es } from '@/shared/config/i18n/es';
import { useDocumentoSeleccionadoStore } from '@/shared/state-manager';
import { renderConRutas } from '@/test/render';

import { listarDocumentos, subirArchivo, subirTexto } from '../../apis/documentos-api';
import { Documento } from '../../models/documentos-models';
import DocumentosSection from './index';

jest.mock('../../apis/documentos-api');
const listar = listarDocumentos as jest.MockedFunction<typeof listarDocumentos>;
const texto = subirTexto as jest.MockedFunction<typeof subirTexto>;
const archivo = subirArchivo as jest.MockedFunction<typeof subirArchivo>;

const doc = (id: string, nombre: string): Documento => ({ id, casoId: 'c1', tipo: 'HISTORIA_EXTERNA', estado: 'COMPLETO', nombreArchivo: nombre, hashSha256: 'abc', creadoEn: '2026-11-02T12:00:00-05:00' });

describe('DocumentosSection', () => {
  beforeEach(() => {
    [listar, texto, archivo].forEach((m) => m.mockReset());
    useDocumentoSeleccionadoStore.getState().limpiar();
  });

  it('lista los documentos y selecciona el primero para la extracción', async () => {
    listar.mockResolvedValue([doc('d1', 'historia.pdf'), doc('d2', 'otra.txt')]);
    renderConRutas(<DocumentosSection casoId="c1" />);
    expect(await screen.findByText(/historia\.pdf/)).toBeInTheDocument();
    await waitFor(() => expect(useDocumentoSeleccionadoStore.getState().documentoId).toBe('d1'));
    await userEvent.click(screen.getByRole('radio', { name: /otra\.txt/ }));
    expect(useDocumentoSeleccionadoStore.getState().documentoId).toBe('d2');
  });

  it('usa el ejemplo sintético, registra el texto y deja el documento seleccionado', async () => {
    listar.mockResolvedValueOnce([]).mockResolvedValue([doc('d9', 'historia-pegada.txt')]);
    texto.mockResolvedValue(doc('d9', 'historia-pegada.txt'));
    renderConRutas(<DocumentosSection casoId="c1" />);
    await userEvent.click(screen.getByRole('button', { name: 'Usar ejemplo sintético' }));
    expect(screen.getByPlaceholderText('Texto de la historia clínica…')).toHaveValue(es.documentos.sampleText);
    await userEvent.click(screen.getByRole('button', { name: 'Registrar texto' }));
    expect(await screen.findByText('Historia clínica registrada.')).toBeInTheDocument();
    expect(texto).toHaveBeenCalledWith('c1', es.documentos.sampleText);
    expect(useDocumentoSeleccionadoStore.getState().documentoId).toBe('d9');
  });

  it('no registra un texto vacío', async () => {
    listar.mockResolvedValue([]);
    renderConRutas(<DocumentosSection casoId="c1" />);
    await userEvent.click(screen.getByRole('button', { name: 'Registrar texto' }));
    expect(await screen.findByText('Escriba o pegue la historia clínica')).toBeInTheDocument();
    expect(texto).not.toHaveBeenCalled();
  });

  it('carga un archivo y avisa con su nombre', async () => {
    listar.mockResolvedValue([]);
    archivo.mockResolvedValue(doc('d5', 'historia.pdf'));
    const { container } = renderConRutas(<DocumentosSection casoId="c1" />);
    const f = new File(['%PDF'], 'historia.pdf', { type: 'application/pdf' });
    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, f);
    expect(await screen.findByText('Archivo cargado: historia.pdf')).toBeInTheDocument();
    expect(archivo).toHaveBeenCalledWith('c1', f);
  });

  it('muestra el error del servidor si el archivo no es válido', async () => {
    listar.mockResolvedValue([]);
    const { ApiError } = await import('@/shared/models/api-models');
    archivo.mockRejectedValue(new ApiError('Solo se aceptan archivos .pdf o .txt', 422));
    const { container } = renderConRutas(<DocumentosSection casoId="c1" />);
    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, new File(['x'], 'a.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Solo se aceptan archivos .pdf o .txt');
  });

  it('muestra el mensaje claro cuando el PDF no es válido o está dañado', async () => {
    listar.mockResolvedValue([]);
    const { ApiError } = await import('@/shared/models/api-models');
    archivo.mockRejectedValueOnce(new ApiError('El archivo no es un PDF válido', 422));
    const { container } = renderConRutas(<DocumentosSection casoId="c1" />);
    const entrada = container.querySelector('input[type=file]') as HTMLInputElement;
    await userEvent.upload(entrada, new File(['esto es texto'], 'falso.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El archivo no es un PDF válido');
  });

  it('muestra el mensaje de tamaño máximo cuando el archivo supera el límite', async () => {
    listar.mockResolvedValue([]);
    const { ApiError } = await import('@/shared/models/api-models');
    archivo.mockRejectedValueOnce(new ApiError('El archivo supera el tamaño máximo permitido', 413));
    const { container } = renderConRutas(<DocumentosSection casoId="c1" />);
    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, new File(['x'], 'grande.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El archivo supera el tamaño máximo permitido');
  });

  it('permite reintentar con el mismo archivo tras un error, sin recargar la página', async () => {
    listar.mockResolvedValue([]);
    const { ApiError } = await import('@/shared/models/api-models');
    archivo.mockRejectedValueOnce(new ApiError('No se pudo guardar el archivo', 500)).mockResolvedValueOnce(doc('d7', 'historia.pdf'));
    const { container } = renderConRutas(<DocumentosSection casoId="c1" />);
    const entrada = container.querySelector('input[type=file]') as HTMLInputElement;
    const f = new File(['%PDF-1.4'], 'historia.pdf', { type: 'application/pdf' });
    await userEvent.upload(entrada, f);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el archivo');
    expect(entrada.value).toBe('');
    await userEvent.upload(entrada, f);
    expect(await screen.findByText('Archivo cargado: historia.pdf')).toBeInTheDocument();
    expect(archivo).toHaveBeenCalledTimes(2);
  });
});