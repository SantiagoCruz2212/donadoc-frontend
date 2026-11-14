import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { descargarBlob, erroresPorCampo, mensajeDeError } from '@/shared/utils/utils';

import { descargarPdf, guardarInforme, obtenerInforme } from '../apis/informes-api';
import { actualizarFila, calcularTabla, calcularTablas } from '../models/calculos';
import {
  CampoInforme,
  FilaTabla,
  InformeVista,
  limpiarDatos,
  maxFilasDe,
  TablaCalculada,
  todosLosCampos,
  ValorCampo,
  ValorCelda,
  Valores,
  valoresIniciales,
} from '../models/informes-models';

interface Estado {
  valores: Valores;
  calculados: Record<string, TablaCalculada>;
}

const VACIO: Estado = { valores: {}, calculados: {} };

/**
 * Un informe de un periodo: carga el esquema y lo guardado, mantiene los valores (campos y tablas) y recalcula en vivo
 * las columnas calculadas, totales y resúmenes mientras se escribe. Al guardar manda lo diligenciado y vuelve a mostrar
 * lo que devuelve el servidor (que es la autoridad), con los errores del 422 por campo, fila o celda.
 */
export function useInforme(codigo: string, periodo: string) {
  const { t } = useTranslations();
  const [informe, setInforme] = useState<InformeVista | null>(null);
  const [estado, setEstado] = useState<Estado>(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const campos = useMemo(() => {
    const m: Record<string, CampoInforme> = {};
    if (informe) for (const c of todosLosCampos(informe.plantilla.esquema)) m[c.clave] = c;
    return m;
  }, [informe]);

  const aplicar = useCallback((v: InformeVista) => {
    const lista = todosLosCampos(v.plantilla.esquema);
    const valores = valoresIniciales(v);
    // Lo del servidor manda; lo local solo completa tablas que el servidor no haya enviado.
    setEstado({ valores, calculados: { ...calcularTablas(lista, valores), ...(v.calculados ?? {}) } });
    setInforme(v);
  }, []);

  useEffect(() => {
    let activo = true;
    setError('');
    setAviso('');
    setErrores({});
    setInforme(null);
    setEstado(VACIO);
    obtenerInforme(codigo, periodo)
      .then((v) => activo && aplicar(v))
      .catch((e) => activo && setError(mensajeDeError(e, t.common.unexpectedError)));
    return () => {
      activo = false;
    };
  }, [codigo, periodo, t, aplicar]);

  const cambiarCampo = useCallback((clave: string, valor: ValorCampo) => {
    setEstado((p) => ({ ...p, valores: { ...p.valores, [clave]: valor } }));
  }, []);

  /** Edita una celda (undefined la vacía) y recalcula solo lo que depende de esa fila. */
  const cambiarCelda = useCallback(
    (clave: string, indice: number, columna: string, valor: ValorCelda | undefined) => {
      const campo = campos[clave];
      if (!campo) return;
      setEstado((p) => {
        const filas = (p.valores[clave] as FilaTabla[]).slice();
        const fila = { ...filas[indice] };
        if (valor === undefined) delete fila[columna];
        else fila[columna] = valor;
        filas[indice] = fila;
        return { valores: { ...p.valores, [clave]: filas }, calculados: { ...p.calculados, [clave]: actualizarFila(campo, p.calculados[clave], filas, indice) } };
      });
    },
    [campos],
  );

  const agregarFila = useCallback(
    (clave: string) => {
      const campo = campos[clave];
      if (!campo || campo.filasFijas) return;
      setEstado((p) => {
        const actuales = p.valores[clave] as FilaTabla[];
        if (actuales.length >= maxFilasDe(campo)) return p;
        const filas = [...actuales, {}];
        return { valores: { ...p.valores, [clave]: filas }, calculados: { ...p.calculados, [clave]: calcularTabla(campo, filas) } };
      });
    },
    [campos],
  );

  const quitarFila = useCallback(
    (clave: string, indice: number) => {
      const campo = campos[clave];
      if (!campo || campo.filasFijas) return;
      // Los errores de esa tabla hablan de posiciones que ya no valen: se descartan.
      setErrores((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== clave && !k.startsWith(`${clave}[`))));
      setEstado((p) => {
        const filas = (p.valores[clave] as FilaTabla[]).filter((_, i) => i !== indice);
        return { valores: { ...p.valores, [clave]: filas }, calculados: { ...p.calculados, [clave]: calcularTabla(campo, filas) } };
      });
    },
    [campos],
  );

  const guardar = useCallback(
    async (completo: boolean) => {
      if (!informe) return;
      setCargando(true);
      setError('');
      setAviso('');
      setErrores({});
      try {
        const nuevo = await guardarInforme(codigo, periodo, limpiarDatos(informe.plantilla.esquema, estado.valores), completo);
        aplicar(nuevo);
        setAviso(completo ? t.informes.completed : t.informes.saved);
      } catch (e) {
        setErrores(erroresPorCampo(e));
        setError(mensajeDeError(e, t.common.unexpectedError));
      } finally {
        setCargando(false);
      }
    },
    [informe, estado.valores, codigo, periodo, aplicar, t],
  );

  const descargar = useCallback(async () => {
    setError('');
    try {
      descargarBlob(await descargarPdf(codigo, periodo), `${codigo}-${periodo}-v${informe?.version ?? 1}.pdf`);
    } catch (e) {
      setError(mensajeDeError(e, t.common.unexpectedError));
    }
  }, [codigo, periodo, informe, t]);

  return {
    informe,
    valores: estado.valores,
    calculados: estado.calculados,
    errores,
    error,
    aviso,
    cargando,
    cambiarCampo,
    cambiarCelda,
    agregarFila,
    quitarFila,
    guardar,
    descargar,
  };
}
