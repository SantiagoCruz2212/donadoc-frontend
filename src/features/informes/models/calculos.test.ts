import { actualizarFila, calcularFila, calcularTabla, calcularTablas, formatearNumero } from './calculos';
import { plantillaDemo } from './informes-fixtures';
import { CampoInforme, FilaTabla, todosLosCampos } from './informes-models';

const [, , , , , , mensual, donantes] = todosLosCampos(plantillaDemo.esquema);

describe('calcularTabla (mismas reglas que el backend)', () => {
  it('filas fijas: siempre hay una fila por rótulo y las vacías quedan en cero en las calculadas', () => {
    const r = calcularTabla(mensual, [{ recibidos: 10, descartados: 3 }]);
    expect(r.filas).toHaveLength(3);
    expect(r.filas[0]).toEqual({ recibidos: 10, descartados: 3, utiles: 7 });
    expect(r.filas[1]).toEqual({ utiles: 0 });
    expect(r.filas[2]).toEqual({ utiles: 0 });
  });

  it('una celda no numérica cuenta 0 en fórmulas y totales; las filas conservan su posición', () => {
    const filas = [{}, { recibidos: 'abc', descartados: 2 }, { recibidos: 5, descartados: 'x' }] as FilaTabla[];
    const r = calcularTabla(mensual, filas);
    expect(r.filas.map((f) => f.utiles)).toEqual([0, -2, 5]);
    expect(r.totales).toEqual({ recibidos: 5, descartados: 2, utiles: 3 });
  });

  it('los totales incluyen las columnas calculadas y solo las numéricas', () => {
    const r = calcularTabla(mensual, [{ recibidos: 4, descartados: 1 }, { recibidos: 6 }]);
    expect(r.totales).toEqual({ recibidos: 10, descartados: 1, utiles: 9 });
  });

  it('sin totales en el esquema no hay objeto de totales', () => {
    expect(calcularTabla(donantes, [{ nombre: 'Ana' }]).totales).toBeUndefined();
  });

  it('tabla libre: tantas filas como se pasen (ninguna si no hay)', () => {
    expect(calcularTabla(donantes, undefined).filas).toEqual([]);
    expect(calcularTabla(donantes, [{ nombre: 'Ana' }, {}]).filas).toHaveLength(2);
  });

  it('los resúmenes parten con todas las opciones en 0 y cuentan solo valores válidos', () => {
    const vacio = calcularTabla(donantes, []);
    expect(vacio.resumenes).toEqual([{ titulo: 'Por lugar', columna: 'lugar', conteos: { UCI: 0, Urgencias: 0 } }]);
    const r = calcularTabla(donantes, [{ lugar: 'UCI' }, { lugar: 'UCI' }, { lugar: 'Otro' }, { lugar: 5 }, {}, { lugar: 'Urgencias' }]);
    expect(r.resumenes[0].conteos).toEqual({ UCI: 2, Urgencias: 1 });
  });

  it('resumen sobre una columna inexistente queda sin opciones', () => {
    const campo: CampoInforme = { ...donantes, resumenes: [{ columna: 'nada', titulo: 'X' }] };
    expect(calcularTabla(campo, [{ lugar: 'UCI' }]).resumenes[0].conteos).toEqual({});
  });

  it('un campo sin columnas no falla', () => {
    const campo: CampoInforme = { clave: 't', etiqueta: 'T', tipo: 'tabla', requerido: false, totales: true };
    expect(calcularTabla(campo, [{}])).toEqual({ filas: [{}], totales: {}, resumenes: [] });
  });
});

describe('calcularFila', () => {
  it('no modifica la fila original y tolera fila indefinida', () => {
    const original = { recibidos: 2 };
    expect(calcularFila(mensual, original)).toEqual({ recibidos: 2, utiles: 2 });
    expect(original).toEqual({ recibidos: 2 });
    expect(calcularFila(mensual, undefined)).toEqual({ utiles: 0 });
  });

  it('una fórmula sin «menos» solo suma', () => {
    const campo: CampoInforme = { clave: 't', etiqueta: 'T', tipo: 'tabla', requerido: false, columnas: [{ clave: 's', etiqueta: 'S', tipo: 'numero', formula: { mas: ['a', 'b'] } }] };
    expect(calcularFila(campo, { a: 1, b: 2 })).toEqual({ a: 1, b: 2, s: 3 });
  });
});

describe('calcularTablas', () => {
  it('calcula solo los campos de tipo tabla, por clave', () => {
    const r = calcularTablas(todosLosCampos(plantillaDemo.esquema), { mensual: [{ recibidos: 1 }], donantes: 'no es lista' });
    expect(Object.keys(r)).toEqual(['mensual', 'donantes']);
    expect(r.mensual.totales?.recibidos).toBe(1);
    expect(r.donantes.filas).toEqual([]);
    expect(calcularTablas(todosLosCampos(plantillaDemo.esquema), null).mensual.filas).toHaveLength(3);
  });
});

describe('actualizarFila', () => {
  it('reutiliza las demás filas y deja iguales los resultados de un cálculo completo', () => {
    const filas: FilaTabla[] = [{ recibidos: 5 }, {}, { recibidos: 1, descartados: 1 }];
    const previa = calcularTabla(mensual, filas);
    const nuevas = filas.slice();
    nuevas[1] = { recibidos: 8, descartados: 2 };
    const r = actualizarFila(mensual, previa, nuevas, 1);
    expect(r).toEqual(calcularTabla(mensual, nuevas));
    expect(r.filas[0]).toBe(previa.filas[0]);
    expect(r.filas[2]).toBe(previa.filas[2]);
    expect(r.filas[1]).not.toBe(previa.filas[1]);
  });

  it('sin cálculo previo, con otra cantidad de filas o con índice fuera de rango recalcula todo', () => {
    const filas: FilaTabla[] = [{ recibidos: 1 }, {}, {}];
    expect(actualizarFila(mensual, undefined, filas, 0)).toEqual(calcularTabla(mensual, filas));
    expect(actualizarFila(donantes, calcularTabla(donantes, [{}]), [{}, {}], 1)).toEqual(calcularTabla(donantes, [{}, {}]));
    expect(actualizarFila(mensual, calcularTabla(mensual, filas), filas, 9)).toEqual(calcularTabla(mensual, filas));
  });
});

describe('formatearNumero', () => {
  it('quita el ruido de coma flotante', () => {
    expect(formatearNumero(0.1 + 0.2)).toBe('0.3');
    expect(formatearNumero(12)).toBe('12');
    expect(formatearNumero(-2)).toBe('-2');
  });
});
