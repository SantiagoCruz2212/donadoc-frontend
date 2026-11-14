import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

import { calcularTabla } from '../../models/calculos';
import { plantillaDemo } from '../../models/informes-fixtures';
import { FilaTabla, todosLosCampos } from '../../models/informes-models';
import { TablaEditor } from './index';
import { TablaEditorProps } from './props';

const campos = todosLosCampos(plantillaDemo.esquema);
const mensual = campos.find((c) => c.clave === 'mensual')!;
const donantes = campos.find((c) => c.clave === 'donantes')!;

function pintar(campo: TablaEditorProps['campo'], filas: FilaTabla[], extra: Partial<TablaEditorProps> = {}) {
  const props = {
    onCambiarCelda: jest.fn(),
    onAgregarFila: jest.fn(),
    onQuitarFila: jest.fn(),
    ...extra,
  };
  render(
    <I18nProvider>
      <TablaEditor campo={campo} filas={filas} calculada={calcularTabla(campo, filas)} errores={{}} {...props} />
    </I18nProvider>,
  );
  return props;
}

describe('TablaEditor · filas fijas', () => {
  it('muestra una fila por rótulo, la columna calculada de solo lectura y marcada, y la fila TOTAL', () => {
    pintar(mensual, [{ recibidos: 10, descartados: 3 }, { recibidos: 5 }, {}]);
    const region = screen.getByRole('region', { name: 'Movimiento mensual' });
    expect(within(region).getByRole('rowheader', { name: 'Enero' })).toBeInTheDocument();
    expect(within(region).getByRole('rowheader', { name: 'Marzo' })).toBeInTheDocument();
    expect(within(region).getByRole('columnheader', { name: /Útiles calculada/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Enero · Recibidos')).toHaveValue(10);
    expect(screen.getByLabelText('Enero · Recibidos')).toHaveAttribute('min', '0');
    const calculada = screen.getByLabelText('Enero · Útiles (calculada)');
    expect(calculada).toHaveValue('7');
    expect(calculada).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Febrero · Útiles (calculada)')).toHaveValue('5');
    expect(screen.getByLabelText('Marzo · Útiles (calculada)')).toHaveValue('0');
    const total = within(region).getByRole('rowheader', { name: 'TOTAL' }).closest('tr') as HTMLElement;
    expect(within(total).getAllByRole('cell').map((c) => c.textContent)).toEqual(['15', '3', '12']);
  });

  it('no ofrece agregar ni quitar filas', () => {
    pintar(mensual, [{}, {}, {}]);
    expect(screen.queryByRole('button', { name: /Agregar fila/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();
  });

  it('al escribir informa clave, fila, columna y número; al vaciar informa undefined', async () => {
    const p = pintar(mensual, [{ recibidos: 2 }, {}, {}]);
    await userEvent.type(screen.getByLabelText('Febrero · Descartados'), '4');
    expect(p.onCambiarCelda).toHaveBeenCalledWith('mensual', 1, 'descartados', 4);
    await userEvent.clear(screen.getByLabelText('Enero · Recibidos'));
    expect(p.onCambiarCelda).toHaveBeenLastCalledWith('mensual', 0, 'recibidos', undefined);
  });

  it('una tabla de filas fijas sin totales en el esquema no dibuja la fila TOTAL', () => {
    pintar({ ...mensual, totales: false }, [{}, {}, {}]);
    expect(screen.queryByRole('rowheader', { name: 'TOTAL' })).not.toBeInTheDocument();
  });
});

describe('TablaEditor · filas libres', () => {
  it('sin filas lo dice y permite agregar', async () => {
    const p = pintar(donantes, []);
    expect(screen.getByText(/Sin filas/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar fila' }));
    expect(p.onAgregarFila).toHaveBeenCalledWith('donantes');
  });

  it('numera las filas, edita texto, fecha y selección y quita una fila por su posición', async () => {
    const p = pintar(donantes, [{ nombre: 'Ana' }, {}]);
    expect(screen.getByLabelText('Fila 1 · Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Fila 2 · Fecha de obtención')).toHaveAttribute('type', 'date');
    await userEvent.type(screen.getByLabelText('Fila 2 · Nombre'), 'L');
    expect(p.onCambiarCelda).toHaveBeenLastCalledWith('donantes', 1, 'nombre', 'L');
    await userEvent.selectOptions(screen.getByLabelText('Fila 1 · Lugar'), 'UCI');
    expect(p.onCambiarCelda).toHaveBeenLastCalledWith('donantes', 0, 'lugar', 'UCI');
    await userEvent.selectOptions(screen.getByLabelText('Fila 1 · Lugar'), '');
    expect(p.onCambiarCelda).toHaveBeenLastCalledWith('donantes', 0, 'lugar', undefined);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar fila 2' }));
    expect(p.onQuitarFila).toHaveBeenCalledWith('donantes', 1);
  });

  it('en el máximo de filas no deja agregar más y muestra el contador', () => {
    pintar(donantes, [{}, {}, {}]);
    expect(screen.getByRole('button', { name: 'Agregar fila' })).toBeDisabled();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('un campo sin columnas ni maxFilas se dibuja sin fallar (máximo 200)', () => {
    pintar({ clave: 'x', etiqueta: 'Libre', tipo: 'tabla', requerido: false }, []);
    expect(screen.getByText('0 / 200')).toBeInTheDocument();
  });
});

describe('TablaEditor · resúmenes', () => {
  it('muestra solo los conteos mayores que cero', () => {
    pintar(donantes, [{ lugar: 'UCI' }, { lugar: 'UCI' }, {}]);
    expect(screen.getByText('Por lugar:').closest('p')).toHaveTextContent('Por lugar: UCI 2');
  });

  it('sin conteos dice «sin datos»', () => {
    pintar(donantes, [{}]);
    expect(screen.getByText('Por lugar:').closest('p')).toHaveTextContent('Por lugar: sin datos');
  });
});

describe('TablaEditor · errores de la API', () => {
  it('marca la celda con aria-invalid y la enlaza con su mensaje', () => {
    render(
      <I18nProvider>
        <TablaEditor
          campo={donantes}
          filas={[{ nombre: 'Ana' }]}
          calculada={calcularTabla(donantes, [{ nombre: 'Ana' }])}
          errores={{ 'donantes[0].fechaObtencion': 'Debe ser una fecha válida AAAA-MM-DD', 'donantes[0]': 'La fila no es válida', donantes: 'Máximo 3 filas', mensual: 'otra tabla' }}
          onCambiarCelda={jest.fn()}
          onAgregarFila={jest.fn()}
          onQuitarFila={jest.fn()}
        />
      </I18nProvider>,
    );
    const celda = screen.getByLabelText('Fila 1 · Fecha de obtención');
    expect(celda).toHaveAttribute('aria-invalid', 'true');
    const mensaje = screen.getByText('Debe ser una fecha válida AAAA-MM-DD');
    expect(celda).toHaveAttribute('aria-describedby', mensaje.id);
    expect(screen.getByLabelText('Fila 1 · Nombre')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('La fila no es válida')).toHaveAttribute('role', 'alert');
    const tabla = screen.getByText('Máximo 3 filas');
    expect(screen.getByRole('region', { name: 'Donantes' })).toHaveAttribute('aria-describedby', tabla.id);
    expect(screen.queryByText('otra tabla')).not.toBeInTheDocument();
  });
});
