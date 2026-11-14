import { FiltrosAuditoria } from '../../models/auditoria-models';

export interface AuditoriaFiltrosProps {
  filtros: FiltrosAuditoria;
  onCambiar: (campo: keyof FiltrosAuditoria, valor: string) => void;
  onFiltrar: () => void;
  onLimpiar: () => void;
}
