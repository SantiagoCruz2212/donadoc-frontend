import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { en } from './en';
import { es } from './es';
import { I18nProvider } from './i18n-context';
import { useTranslations } from './use-translations';

const claves = (o: Record<string, unknown>, prefijo = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' && v !== null ? claves(v as Record<string, unknown>, `${prefijo}${k}.`) : [`${prefijo}${k}`]));

function Demo() {
  const { t, idioma, cambiarIdioma } = useTranslations();
  return (
    <>
      <p>{t.auth.submit}</p>
      <span data-testid="idioma">{idioma}</span>
      <button onClick={() => cambiarIdioma('en')}>en</button>
    </>
  );
}

describe('i18n', () => {
  it('inglés y español tienen exactamente las mismas claves', () => {
    expect(claves(en).sort()).toEqual(claves(es).sort());
  });

  it('muestra el español por defecto y cambia a inglés recordando la elección', async () => {
    render(
      <I18nProvider>
        <Demo />
      </I18nProvider>,
    );
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    await userEvent.click(screen.getByText('en'));
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(localStorage.getItem('donadoc.idioma')).toBe('en');
  });

  it('recupera el idioma guardado al iniciar', () => {
    localStorage.setItem('donadoc.idioma', 'en');
    render(
      <I18nProvider>
        <Demo />
      </I18nProvider>,
    );
    expect(screen.getByTestId('idioma')).toHaveTextContent('en');
  });
});