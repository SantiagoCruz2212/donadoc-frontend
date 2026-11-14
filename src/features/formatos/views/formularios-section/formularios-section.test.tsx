import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { ApiError } from '@/shared/models/api-models';
import * as utils from '@/shared/utils/utils';
import { renderConRutas } from '@/test/render';

import { descargarPdf, guardarFormulario, listarFormatos, obtenerFormulario } from '../../apis/formatos-api';
import { Formulario, Plantilla } from '../../models/formatos-models';
import FormulariosSection from './index';

jest.mock('../../apis/formatos-api');
const listar = listarFormatos as jest.MockedFunction<typeof listarFormatos>;
const obtener = obtenerFormulario as jest.MockedFunction<typeof obtenerFormulario>;
const guardar = guardarFormulario as jest.MockedFunction<typeof guardarFormulario>;
const pdf = descargarPdf as jest.MockedFunction<typeof descargarPdf>;

const plantilla: Plantilla = {
  codigo: 'HC-DONANTE', nombre: 'Resumen de historia clínica', version: '1',
  esquema: {
    secciones: [
      {
        titulo: 'Identificación',
        campos: [
          { clave: 'nombres', etiqueta: 'Nombres', tipo: 'texto', requerido: true, origen: 'donante.nombres' },
          { clave: 'ingreso', etiqueta: 'Fecha de ingreso', tipo: 'fecha', requerido: true },
        ],
      },
      {
        titulo: 'Clínica',
        campos: [
          { clave: 'grupo', etiqueta: 'Grupo sanguíneo', tipo: 'seleccion', requerido: true, opciones: ['O+', 'A-'] },
          { clave: 'notas', etiqueta: 'Notas', tipo: 'areaTexto', requerido: false },
          { clave: 'autoriza', etiqueta: 'Autoriza', tipo: 'booleano', requerido: true },
          { clave: 'edad', etiqueta: 'Edad', tipo: 'numero', requerido: false },
        ],
      },
    ],
  },
};
const formulario = (extra: Partial<Formulario> = {}): Formulario => ({
  plantilla, estado: 'SIN_INICIAR', version: 0, documentoId: null, hashSha256: null, datos: null, precarga: { nombres: 'Mariana' }, ...extra,
});

async function abrirFormato() {
  await userEvent.selectOptions(await screen.findByLabelText('Formato'), 'HC-DONANTE');
}

describe('FormulariosSection', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    listar.mockResolvedValue([plantilla]);
  });

  it('lista los formatos y genera el formulario desde el esquema, con lo conocido precargado y avisado', async () => {
    obtener.mockResolvedValue(formulario());
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    expect(await screen.findByText('Identificación')).toBeInTheDocument();
    expect(screen.getByText('Clínica')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres/)).toHaveValue('Mariana');
    expect(screen.getByText(/precargado/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de ingreso/)).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText(/Edad/)).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText(/Notas/).tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText(/Autoriza/)).toHaveAttribute('type', 'checkbox');
    expect(obtener).toHaveBeenCalledWith('c1', 'HC-DONANTE');
  });

  it('informa al padre el formato abierto y su estado', async () => {
    const alCambiar = jest.fn();
    obtener.mockResolvedValue(formulario({ estado: 'COMPLETO', version: 2, documentoId: 'doc-1' }));
    renderConRutas(<FormulariosSection casoId="c1" onFormularioChange={alCambiar} />);
    await abrirFormato();
    await screen.findByText('Identificación');
    expect(alCambiar).toHaveBeenLastCalledWith({ documentoId: 'doc-1', estado: 'COMPLETO', version: 2 });
  });

  it('guarda un borrador enviando solo los valores con contenido', async () => {
    obtener.mockResolvedValue(formulario());
    guardar.mockResolvedValue(formulario({ estado: 'BORRADOR', version: 1, datos: { nombres: 'Mariana' } }));
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar borrador' }));
    await waitFor(() => expect(guardar).toHaveBeenCalledWith('c1', 'HC-DONANTE', { nombres: 'Mariana', autoriza: false }, false));
    expect(await screen.findByText('Formato guardado.')).toBeInTheDocument();
  });

  it('marcar completo envía todos los valores y confirma la generación del PDF', async () => {
    obtener.mockResolvedValue(formulario());
    guardar.mockResolvedValue(formulario({ estado: 'COMPLETO', version: 1, documentoId: 'doc-1', hashSha256: 'a'.repeat(64), datos: { nombres: 'Mariana' } }));
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    await userEvent.type(await screen.findByLabelText(/Fecha de ingreso/), '2026-11-03');
    await userEvent.selectOptions(screen.getByLabelText(/Grupo sanguíneo/), 'O+');
    await userEvent.click(screen.getByLabelText(/Autoriza/));
    await userEvent.type(screen.getByLabelText(/Edad/), '34');
    await userEvent.click(screen.getByRole('button', { name: 'Marcar completo y generar PDF' }));
    await waitFor(() =>
      expect(guardar).toHaveBeenCalledWith('c1', 'HC-DONANTE', { nombres: 'Mariana', ingreso: '2026-11-03', grupo: 'O+', autoriza: true, edad: 34 }, true),
    );
    expect(await screen.findByText('Formato completo: PDF generado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeInTheDocument();
  });

  it('muestra junto a cada campo el error de validación que devuelve la API', async () => {
    obtener.mockResolvedValue(formulario());
    guardar.mockRejectedValue(new ApiError('Datos inválidos', 422, [{ property: 'grupo', constraints: { formato: 'Este campo es obligatorio' } }]));
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    await userEvent.click(await screen.findByRole('button', { name: 'Marcar completo y generar PDF' }));
    const alertas = await screen.findAllByRole('alert');
    expect(alertas.some((a) => a.textContent === 'Este campo es obligatorio')).toBe(true);
    expect(alertas.some((a) => a.textContent?.startsWith('Datos inválidos'))).toBe(true);
  });

  it('un formato firmado queda de solo lectura y no se puede guardar', async () => {
    obtener.mockResolvedValue(formulario({ estado: 'FIRMADO', version: 2, documentoId: 'doc-1', datos: { nombres: 'Mariana' } }));
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    expect(await screen.findByText('Este formato ya está firmado y no se puede modificar.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres/)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar borrador' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Marcar completo y generar PDF' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeInTheDocument();
  });

  it('descarga el PDF con el nombre del formato y la versión', async () => {
    obtener.mockResolvedValue(formulario({ estado: 'COMPLETO', version: 3, documentoId: 'doc-1' }));
    pdf.mockResolvedValue(new Blob(['%PDF-'], { type: 'application/pdf' }));
    const descargar = jest.spyOn(utils, 'descargarBlob').mockImplementation(() => undefined);
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar PDF' }));
    await waitFor(() => expect(descargar).toHaveBeenCalledWith(expect.any(Blob), 'HC-DONANTE-v3.pdf'));
    descargar.mockRestore();
  });

  it('si el formato no se puede cargar muestra el error', async () => {
    obtener.mockRejectedValue(new ApiError('Formato no encontrado', 404));
    renderConRutas(<FormulariosSection casoId="c1" />);
    await abrirFormato();
    expect(await screen.findByRole('alert')).toHaveTextContent('Formato no encontrado');
  });

  it('cambiar «recarga» vuelve a pedir el formato abierto (por ejemplo tras firmar)', async () => {
    function Padre() {
      const [n, setN] = useState(0);
      return (
        <>
          <button onClick={() => setN(n + 1)}>REFRESCAR</button>
          <FormulariosSection casoId="c1" recarga={n} />
        </>
      );
    }
    obtener.mockResolvedValue(formulario());
    renderConRutas(<Padre />);
    await abrirFormato();
    await screen.findByText('Identificación');
    expect(obtener).toHaveBeenCalledTimes(1);
    obtener.mockResolvedValue(formulario({ estado: 'FIRMADO', version: 2, documentoId: 'doc-1', datos: { nombres: 'Mariana' } }));
    await userEvent.click(screen.getByRole('button', { name: 'REFRESCAR' }));
    expect(await screen.findByText('Este formato ya está firmado y no se puede modificar.')).toBeInTheDocument();
    expect(obtener).toHaveBeenCalledTimes(2);
  });
});
