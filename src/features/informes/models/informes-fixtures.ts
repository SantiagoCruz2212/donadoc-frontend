import { calcularTablas } from './calculos';
import { InformeVista, PlantillaInforme, todosLosCampos } from './informes-models';

/** Datos sintéticos compartidos por las pruebas del feature (no se usan en producción). */
export const plantillaDemo: PlantillaInforme = {
  codigo: 'INF-DEMO',
  nombre: 'Informe mensual demo',
  version: '1',
  esquema: {
    ambito: 'INFORME',
    periodicidad: 'MENSUAL',
    secciones: [
      {
        titulo: 'General',
        campos: [
          { clave: 'observaciones', etiqueta: 'Observaciones', tipo: 'areaTexto', requerido: false },
          { clave: 'responsable', etiqueta: 'Responsable', tipo: 'texto', requerido: true },
          { clave: 'cierre', etiqueta: 'Fecha de cierre', tipo: 'fecha', requerido: false },
          { clave: 'tipo', etiqueta: 'Tipo', tipo: 'seleccion', requerido: false, opciones: ['A', 'B'] },
          { clave: 'cuenta', etiqueta: 'Cuenta', tipo: 'numero', requerido: false },
          { clave: 'revisado', etiqueta: 'Revisado', tipo: 'booleano', requerido: false },
        ],
      },
      {
        titulo: 'Tablas',
        campos: [
          {
            clave: 'mensual',
            etiqueta: 'Movimiento mensual',
            tipo: 'tabla',
            requerido: true,
            filasFijas: ['Enero', 'Febrero', 'Marzo'],
            totales: true,
            columnas: [
              { clave: 'recibidos', etiqueta: 'Recibidos', tipo: 'numero' },
              { clave: 'descartados', etiqueta: 'Descartados', tipo: 'numero' },
              { clave: 'utiles', etiqueta: 'Útiles', tipo: 'numero', formula: { mas: ['recibidos'], menos: ['descartados'] } },
            ],
          },
          {
            clave: 'donantes',
            etiqueta: 'Donantes',
            tipo: 'tabla',
            requerido: false,
            maxFilas: 3,
            resumenes: [{ columna: 'lugar', titulo: 'Por lugar' }],
            columnas: [
              { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto' },
              { clave: 'fechaObtencion', etiqueta: 'Fecha de obtención', tipo: 'fecha' },
              { clave: 'lugar', etiqueta: 'Lugar', tipo: 'seleccion', opciones: ['UCI', 'Urgencias'] },
            ],
          },
        ],
      },
    ],
  },
};

export const informeDemo = (extra: Partial<InformeVista> = {}): InformeVista => {
  const datos = extra.datos ?? null;
  return {
    plantilla: plantillaDemo,
    periodo: '2026-10',
    estado: 'SIN_INICIAR',
    version: 0,
    hashSha256: null,
    datos,
    calculados: calcularTablas(todosLosCampos(plantillaDemo.esquema), datos),
    actualizadoEn: null,
    ...extra,
  };
};
