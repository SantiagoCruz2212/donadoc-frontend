import { informeDemo, plantillaDemo } from './informes-fixtures';
import { erroresDeTabla, limpiarDatos, maxFilasDe, periodicidadDe, periodoValido, todosLosCampos, valoresIniciales } from './informes-models';

describe('periodo', () => {
  it('mensual exige AAAA-MM con mes 01 a 12', () => {
    expect(periodoValido('MENSUAL', '2026-10')).toBe(true);
    expect(periodoValido('MENSUAL', '2026-13')).toBe(false);
    expect(periodoValido('MENSUAL', '2026-00')).toBe(false);
    expect(periodoValido('MENSUAL', '2026-S42')).toBe(false);
    expect(periodoValido('MENSUAL', '')).toBe(false);
  });

  it('semanal exige AAAA-Sww con semana 01 a 53', () => {
    expect(periodoValido('SEMANAL', '2026-S42')).toBe(true);
    expect(periodoValido('SEMANAL', '2026-S01')).toBe(true);
    expect(periodoValido('SEMANAL', '2026-S53')).toBe(true);
    expect(periodoValido('SEMANAL', '2026-S54')).toBe(false);
    expect(periodoValido('SEMANAL', '2026-S00')).toBe(false);
    expect(periodoValido('SEMANAL', '2026-S5')).toBe(false);
    expect(periodoValido('SEMANAL', '2026-10')).toBe(false);
  });

  it('la periodicidad por defecto es mensual', () => {
    expect(periodicidadDe({ secciones: [] })).toBe('MENSUAL');
    expect(periodicidadDe({ periodicidad: 'SEMANAL', secciones: [] })).toBe('SEMANAL');
  });
});

describe('maxFilasDe', () => {
  const [mensual, donantes] = todosLosCampos(plantillaDemo.esquema).slice(6);
  it('filas fijas: su cantidad; libres: maxFilas o 200', () => {
    expect(maxFilasDe(mensual)).toBe(3);
    expect(maxFilasDe(donantes)).toBe(3);
    expect(maxFilasDe({ ...donantes, maxFilas: undefined })).toBe(200);
  });
});

describe('valoresIniciales', () => {
  it('sin datos: textos vacíos, booleano en falso, una fila vacía por rótulo y tabla libre sin filas', () => {
    const v = valoresIniciales(informeDemo());
    expect(v.responsable).toBe('');
    expect(v.revisado).toBe(false);
    expect(v.mensual).toEqual([{}, {}, {}]);
    expect(v.donantes).toEqual([]);
  });

  it('con datos: respeta lo guardado y alinea las filas fijas por posición (copias, no las mismas)', () => {
    const datos = { responsable: 'Ana', cuenta: 4, mensual: [{ recibidos: 1 }], donantes: [{ nombre: 'Luis' }] };
    const v = valoresIniciales(informeDemo({ datos }));
    expect(v.responsable).toBe('Ana');
    expect(v.cuenta).toBe(4);
    expect(v.mensual).toEqual([{ recibidos: 1 }, {}, {}]);
    expect((v.mensual as object[])[0]).not.toBe(datos.mensual[0]);
    expect(v.donantes).toEqual([{ nombre: 'Luis' }]);
  });
});

describe('limpiarDatos', () => {
  const esquema = plantillaDemo.esquema;

  it('omite textos vacíos y NaN y conserva falso y cero', () => {
    const r = limpiarDatos(esquema, { observaciones: '', responsable: 'Ana', cuenta: Number.NaN, revisado: false, tipo: '' });
    expect(r).toEqual({ responsable: 'Ana', revisado: false });
    expect(limpiarDatos(esquema, { cuenta: 0 })).toEqual({ cuenta: 0 });
  });

  it('filas fijas: conserva la posición de cada fila, quita celdas vacías y columnas calculadas', () => {
    const r = limpiarDatos(esquema, { mensual: [{}, { recibidos: 3, descartados: '', utiles: 99 }, {}] });
    expect(r.mensual).toEqual([{}, { recibidos: 3 }, {}]);
  });

  it('tabla sin ningún dato no se envía', () => {
    expect(limpiarDatos(esquema, { mensual: [{}, {}, {}], donantes: [{}, { nombre: '  ' }] })).toEqual({});
  });

  it('tabla libre: sin filas vacías y con textos recortados', () => {
    const r = limpiarDatos(esquema, { donantes: [{ nombre: ' Ana ' }, {}, { lugar: 'UCI' }] });
    expect(r.donantes).toEqual([{ nombre: 'Ana' }, { lugar: 'UCI' }]);
  });

  it('un valor de tabla que no es lista se trata como vacío', () => {
    expect(limpiarDatos(esquema, { mensual: 'x' })).toEqual({});
  });
});

describe('erroresDeTabla', () => {
  it('agrupa errores de la tabla, de fila y de celda, ignorando otras claves', () => {
    const r = erroresDeTabla(
      { mensual: 'Máximo 3 filas', 'mensual[3]': 'Fila inválida', 'mensual[3].hb': 'Debe ser un número', 'mensual[0].recibidos': 'Mal', 'mensual[x]': 'raro', donantes: 'otra', 'mensualidad[1]': 'no' },
      'mensual',
    );
    expect(r.tabla).toBe('Máximo 3 filas');
    expect(r.filas[3]).toEqual({ fila: 'Fila inválida', celdas: { hb: 'Debe ser un número' } });
    expect(r.filas[0]).toEqual({ celdas: { recibidos: 'Mal' } });
    expect(Object.keys(r.filas)).toEqual(['0', '3']);
  });

  it('sin errores devuelve estructura vacía', () => {
    expect(erroresDeTabla({}, 'mensual')).toEqual({ filas: {} });
  });
});
