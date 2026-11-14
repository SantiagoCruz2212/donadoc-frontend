export interface CasoAccionesProps {
  estado: string;
  esAdmin: boolean;
  ocupado: boolean;
  error: string;
  aviso: string;
  onCambiar: (estado: string, causa?: string) => void;
  onEliminar: () => void;
}
