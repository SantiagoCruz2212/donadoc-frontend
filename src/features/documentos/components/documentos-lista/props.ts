import { Documento } from '../../models/documentos-models';

export interface DocumentosListaProps {
  documentos: Documento[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string) => void;
}