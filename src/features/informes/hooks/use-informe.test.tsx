import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { I18nProvider } from '@/shared/config/i18n/i18n-context';

import { guardarInforme, obtenerInforme } from '../apis/informes-api';
import { informeDemo } from '../models/informes-fixtures';
import { useInforme } from './use-informe';

jest.mock('../apis/informes-api');
const obtener = obtenerInforme as jest.MockedFunction<typeof obtenerInforme>;
const guardar = guardarInforme as jest.MockedFunction<typeof guardarInforme>;

const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider>{children}</I18nProvider>;

async function cargar() {
  const r = renderHook(() => useInforme('INF-DEMO', '2026-10'), { wrapper });
  await waitFor(() => expect(r.result.current.informe).not.toBeNull());
  return r;
}

describe('useInforme', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    obtener.mockResolvedValue(informeDemo());
  });

  it('antes de cargar no guarda ni falla al editar', async () => {
    const r = renderHook(() => useInforme('INF-DEMO', '2026-10'), { wrapper });
    await act(async () => {
      await r.result.current.guardar(false);
      r.result.current.cambiarCelda('mensual', 0, 'recibidos', 1);
    });
    expect(guardar).not.toHaveBeenCalled();
    await waitFor(() => expect(r.result.current.informe).not.toBeNull());
  });

  it('cambiar una celda recalcula la fila, y undefined la vacía', async () => {
    const r = await cargar();
    act(() => r.result.current.cambiarCelda('mensual', 0, 'recibidos', 9));
    expect(r.result.current.calculados.mensual.filas[0]).toEqual({ recibidos: 9, utiles: 9 });
    expect(r.result.current.calculados.mensual.totales?.utiles).toBe(9);
    act(() => r.result.current.cambiarCelda('mensual', 0, 'recibidos', undefined));
    expect(r.result.current.calculados.mensual.filas[0]).toEqual({ utiles: 0 });
  });

  it('editar una fila conserva la identidad de las demás filas calculadas (memoización)', async () => {
    const r = await cargar();
    const antes = r.result.current.calculados.mensual.filas;
    act(() => r.result.current.cambiarCelda('mensual', 1, 'recibidos', 2));
    const despues = r.result.current.calculados.mensual.filas;
    expect(despues[0]).toBe(antes[0]);
    expect(despues[2]).toBe(antes[2]);
    expect(despues[1]).not.toBe(antes[1]);
  });

  it('ignora celdas de campos inexistentes y filas en tablas de filas fijas', async () => {
    const r = await cargar();
    const antes = r.result.current.valores;
    act(() => {
      r.result.current.cambiarCelda('nada', 0, 'x', 1);
      r.result.current.agregarFila('nada');
      r.result.current.agregarFila('mensual');
      r.result.current.quitarFila('nada', 0);
      r.result.current.quitarFila('mensual', 0);
    });
    expect(r.result.current.valores).toEqual(antes);
  });

  it('agrega filas hasta el máximo y quita por posición', async () => {
    const r = await cargar();
    act(() => {
      r.result.current.agregarFila('donantes');
      r.result.current.agregarFila('donantes');
      r.result.current.agregarFila('donantes');
      r.result.current.agregarFila('donantes');
    });
    expect(r.result.current.valores.donantes).toHaveLength(3);
    act(() => r.result.current.cambiarCelda('donantes', 2, 'lugar', 'UCI'));
    act(() => r.result.current.quitarFila('donantes', 0));
    expect(r.result.current.valores.donantes).toEqual([{}, { lugar: 'UCI' }]);
    expect(r.result.current.calculados.donantes.resumenes[0].conteos).toEqual({ UCI: 1, Urgencias: 0 });
  });

  it('si el servidor no manda los calculados de una tabla, los calcula localmente', async () => {
    obtener.mockResolvedValue(informeDemo({ calculados: {}, datos: { mensual: [{ recibidos: 3 }] } }));
    const r = await cargar();
    expect(r.result.current.calculados.mensual.filas[0]).toEqual({ recibidos: 3, utiles: 3 });
  });

  it('guardar con error de red deja el mensaje y sin errores por campo', async () => {
    guardar.mockRejectedValue(new Error('Sin conexión con el servidor'));
    const r = await cargar();
    await act(async () => r.result.current.guardar(false));
    expect(r.result.current.error).toBe('Sin conexión con el servidor');
    expect(r.result.current.errores).toEqual({});
    expect(r.result.current.cargando).toBe(false);
  });

  it('cambiar de periodo vuelve a cargar y limpia lo anterior', async () => {
    const r = renderHook(({ p }) => useInforme('INF-DEMO', p), { wrapper, initialProps: { p: '2026-10' } });
    await waitFor(() => expect(r.result.current.informe).not.toBeNull());
    obtener.mockResolvedValue(informeDemo({ periodo: '2026-11' }));
    r.rerender({ p: '2026-11' });
    await waitFor(() => expect(r.result.current.informe?.periodo).toBe('2026-11'));
    expect(obtener).toHaveBeenLastCalledWith('INF-DEMO', '2026-11');
  });
});
