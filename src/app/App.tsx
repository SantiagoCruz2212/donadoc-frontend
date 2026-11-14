import { RouterProvider } from 'react-router-dom';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

import { router } from './router';

/** Proveedores globales: idioma por encima del router. */
export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </I18nProvider>
  );
}