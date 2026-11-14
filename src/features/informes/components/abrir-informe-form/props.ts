import { PlantillaInforme } from '../../models/informes-models';

export interface AbrirInformeFormProps {
  plantillas: PlantillaInforme[];
  onAbrir: (codigo: string, periodo: string) => void;
}
