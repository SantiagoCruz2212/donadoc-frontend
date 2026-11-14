import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

import { CampoInforme } from '../../models/informes-models';
import { CampoInformeView } from './index';

const pintar = (campo: CampoInforme, valor: string | number | boolean | undefined, error?: string) => {
  const onCambiar = jest.fn();
  render(
    <I18nProvider>
      <CampoInformeView campo={campo} valor={valor} error={error} onCambiar={onCambiar} />
    </I18nProvider>,
  );
  return onCambiar;
};
const base = { clave: 'k', etiqueta: 'Campo', requerido: true } as const;

describe('CampoInformeView', () => {
  it('texto y área de texto informan lo escrito y marcan lo obligatorio', async () => {
    const cambiar = pintar({ ...base, tipo: 'texto' }, '');
    await userEvent.type(screen.getByLabelText(/Campo/), 'a');
    expect(cambiar).toHaveBeenCalledWith('k', 'a');
  });

  it('área de texto', async () => {
    const cambiar = pintar({ ...base, tipo: 'areaTexto', requerido: false }, 'x');
    await userEvent.type(screen.getByLabelText('Campo'), 'y');
    expect(cambiar).toHaveBeenCalledWith('k', 'xy');
  });

  it('selección con opciones y valor vacío', async () => {
    const cambiar = pintar({ ...base, tipo: 'seleccion', opciones: ['A', 'B'] }, '');
    await userEvent.selectOptions(screen.getByLabelText(/Campo/), 'B');
    expect(cambiar).toHaveBeenCalledWith('k', 'B');
  });

  it('selección sin opciones definidas no falla', () => {
    pintar({ ...base, tipo: 'seleccion' }, undefined);
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('número informa un número, o texto vacío al borrar', async () => {
    const cambiar = pintar({ ...base, tipo: 'numero' }, 5);
    const campo = screen.getByLabelText(/Campo/);
    expect(campo).toHaveValue(5);
    await userEvent.type(campo, '2');
    expect(cambiar).toHaveBeenLastCalledWith('k', 52);
    await userEvent.clear(campo);
    expect(cambiar).toHaveBeenLastCalledWith('k', '');
  });

  it('casilla informa verdadero o falso y muestra su error', async () => {
    const cambiar = pintar({ ...base, tipo: 'booleano' }, false, 'Debe ser verdadero o falso');
    await userEvent.click(screen.getByLabelText(/Campo/));
    expect(cambiar).toHaveBeenCalledWith('k', true);
    expect(screen.getByRole('alert')).toHaveTextContent('Debe ser verdadero o falso');
  });

  it('casilla marcada', () => {
    pintar({ ...base, tipo: 'booleano' }, true);
    expect(screen.getByLabelText(/Campo/)).toBeChecked();
  });
});
