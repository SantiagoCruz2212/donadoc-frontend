import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

import { Alert } from './alert';
import { AppHeader } from './app-header';
import { Button } from './button';
import { Card } from './card';
import { Chip } from './chip';
import { Field } from './field';

describe('componentes compartidos', () => {
  it('Button dispara el clic y respeta disabled', async () => {
    const alClic = jest.fn();
    const { rerender } = render(<Button onClick={alClic}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(alClic).toHaveBeenCalledTimes(1);
    rerender(<Button disabled>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('Alert usa role alert para errores y status para el resto', () => {
    const { rerender } = render(<Alert tipo="error">Falló</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
    rerender(<Alert tipo="ok">Listo</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Listo');
  });

  it('Field muestra la etiqueta y el error de validación', () => {
    render(
      <Field etiqueta="Correo" error="Obligatorio">
        <input />
      </Field>,
    );
    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Obligatorio');
  });

  it('Chip y Card muestran su contenido', () => {
    render(
      <Card titulo="Título">
        <Chip texto="BORRADOR" />
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument();
    expect(screen.getByText('BORRADOR')).toBeInTheDocument();
  });

  it('AppHeader muestra el usuario, cierra sesión y cambia de idioma', async () => {
    const salir = jest.fn();
    render(
      <I18nProvider>
        <AppHeader usuario="Coordinación Demo" onCerrarSesion={salir} />
      </I18nProvider>,
    );
    expect(screen.getByText('Coordinación Demo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(salir).toHaveBeenCalled();
    await userEvent.selectOptions(screen.getByLabelText('Idioma'), 'en');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});