import { Acceso } from '../../models/accesos-models';

export interface AccesosTableProps {
  accesos: Acceso[];
  onNuevaClave: (id: string) => void;
  ocupado: boolean;
}
