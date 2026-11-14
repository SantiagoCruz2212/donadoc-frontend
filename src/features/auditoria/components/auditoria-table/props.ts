import { PaginaAuditoria } from '../../models/auditoria-models';

export interface AuditoriaTableProps {
  pagina: PaginaAuditoria;
  onAnterior: () => void;
  onSiguiente: () => void;
}
