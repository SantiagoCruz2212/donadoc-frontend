import { Caso } from '../../models/casos-models';

export interface CasoResumenProps {
  caso: Caso;
  onVolver: () => void;
}