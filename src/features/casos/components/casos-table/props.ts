import { Caso } from '../../models/casos-models';

export interface CasosTableProps {
  casos: Caso[];
  onAbrir: (id: string) => void;
}