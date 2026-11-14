import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';
import { ApiError } from '@/shared/models/api-models';

import { useAccion } from './use-accion';

const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider>{children}</I18nProvider>;

describe('useAccion', () => {
  it('devuelve el resultado y no deja error cuando la acción funciona', async () => {
    const { result } = renderHook(() => useAccion(async (n: number) => n * 2), { wrapper });
    let r: number | undefined;
    await act(async () => {
      r = await result.current.ejecutar(21);
    });
    expect(r).toBe(42);
    expect(result.current.error).toBe('');
    expect(result.current.cargando).toBe(false);
  });

  it('captura el error de la API y lo muestra como mensaje legible', async () => {
    const { result } = renderHook(() => useAccion(async () => Promise.reject(new ApiError('Sin permiso', 403))), { wrapper });
    await act(async () => {
      await result.current.ejecutar();
    });
    expect(result.current.error).toBe('Sin permiso');
    act(() => result.current.limpiarError());
    expect(result.current.error).toBe('');
  });
});