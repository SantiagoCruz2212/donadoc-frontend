import { Formulario, limpiarValores, valoresIniciales } from './formatos-models';

const formulario = (extra: Partial<Formulario> = {}): Formulario => ({
  plantilla: {
    codigo: 'X', nombre: 'Formato X', version: '1',
    esquema: {
      secciones: [
        {
          titulo: 'S1',
          campos: [
            { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
            { clave: 'grupo', etiqueta: 'Grupo', tipo: 'seleccion', requerido: false, opciones: ['O+'] },
            { clave: 'autoriza', etiqueta: 'Autoriza', tipo: 'booleano', requerido: true },
            { clave: 'edad', etiqueta: 'Edad', tipo: 'numero', requerido: false },
          ],
        },
      ],
    },
  },
  estado: 'SIN_INICIAR', version: 0, documentoId: null, hashSha256: null, datos: null, precarga: {}, ...extra,
});

describe('valoresIniciales', () => {
  it('sin datos guardados usa la precarga y avisa cuáles campos vienen precargados', () => {
    const { valores, precargados } = valoresIniciales(formulario({ precarga: { nombre: 'Juan', grupo: 'O+' } }));
    expect(valores).toEqual({ nombre: 'Juan', grupo: 'O+', autoriza: false, edad: '' });
    expect(precargados).toEqual(['nombre', 'grupo']);
  });

  it('lo ya guardado manda sobre lo precargado', () => {
    const { valores, precargados } = valoresIniciales(formulario({ datos: { nombre: 'Guardado' }, precarga: { nombre: 'Precargado', grupo: 'O+' } }));
    expect(valores.nombre).toBe('Guardado');
    expect(valores.grupo).toBe('O+');
    expect(precargados).toEqual(['grupo']);
  });

  it('los booleanos sin dato empiezan en falso y el resto vacío', () => {
    const { valores } = valoresIniciales(formulario());
    expect(valores.autoriza).toBe(false);
    expect(valores.nombre).toBe('');
  });
});

describe('limpiarValores', () => {
  const { plantilla } = formulario();

  it('descarta textos vacíos, números NaN e indefinidos; conserva falsos y ceros', () => {
    expect(limpiarValores(plantilla.esquema, { nombre: '', grupo: undefined, autoriza: false, edad: NaN })).toEqual({ autoriza: false });
    expect(limpiarValores(plantilla.esquema, { nombre: 'Ana', autoriza: true, edad: 0 })).toEqual({ nombre: 'Ana', autoriza: true, edad: 0 });
  });

  it('ignora claves que el esquema no define', () => {
    expect(limpiarValores(plantilla.esquema, { nombre: 'Ana', intruso: 'x' })).toEqual({ nombre: 'Ana' });
  });
});
