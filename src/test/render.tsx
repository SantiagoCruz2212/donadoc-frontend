import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

/** Renderiza una vista con idioma y router, y con rutas de apoyo para comprobar la navegación. */
export function renderConRutas(ui: ReactElement, opciones: { ruta?: string; ruta_path?: string; otras?: Record<string, string> } = {}) {
  const otras = opciones.otras ?? {};
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[opciones.ruta ?? '/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path={opciones.ruta_path ?? '/'} element={ui} />
          {Object.entries(otras).map(([path, texto]) => (
            <Route key={path} path={path} element={<p>{texto}</p>} />
          ))}
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}