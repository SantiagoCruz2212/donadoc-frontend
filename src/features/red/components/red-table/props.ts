import { TrasplanteVigente } from '../../models/red-models';

export interface RedTableProps {
  trasplantes: TrasplanteVigente[];
  onAbrir: (casoId: string) => void;
}
