import { InformeVista, TablaCalculada, ValorCampo, ValorCelda, Valores } from '../../models/informes-models';

export interface InformeFormularioProps {
  informe: InformeVista;
  valores: Valores;
  calculados: Record<string, TablaCalculada>;
  errores: Record<string, string>;
  cargando: boolean;
  onCambiarCampo: (clave: string, valor: ValorCampo) => void;
  onCambiarCelda: (clave: string, indice: number, columna: string, valor: ValorCelda | undefined) => void;
  onAgregarFila: (clave: string) => void;
  onQuitarFila: (clave: string, indice: number) => void;
  onGuardar: (completo: boolean) => void;
  onDescargar: () => void;
}
