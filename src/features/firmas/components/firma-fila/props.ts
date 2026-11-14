import { Firma, Verificacion } from '../../models/firmas-models';

export interface FirmaFilaProps {
  firma: Firma;
  verificacion?: Verificacion;
  ocupada: boolean;
  onEnviarCodigo: (firmaId: string) => void;
  onFirmar: (firmaId: string, codigo: string) => void;
  onComprobar: (firmaId: string) => void;
}
