import { CampoInforme, ValorCampo } from '../../models/informes-models';

export interface CampoInformeProps {
  /** Campo que no es tabla (las tablas las dibuja TablaEditor). */
  campo: CampoInforme;
  valor: ValorCampo | undefined;
  error?: string;
  onCambiar: (clave: string, valor: ValorCampo) => void;
}
