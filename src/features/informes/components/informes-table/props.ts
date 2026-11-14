import { InformeResumen, PaginaInformes, PlantillaInforme } from '../../models/informes-models';

export interface InformesTableProps {
  pagina: PaginaInformes;
  plantillas: PlantillaInforme[];
  codigo: string;
  onFiltrar: (codigo: string) => void;
  onAbrir: (informe: InformeResumen) => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}
