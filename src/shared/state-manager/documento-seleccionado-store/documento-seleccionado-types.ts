export interface DocumentoSeleccionadoState {
  /** Documento de la historia clínica elegido para extraer con IA; vive aquí porque lo comparten dos features. */
  documentoId: string | null;
}

export interface DocumentoSeleccionadoActions {
  seleccionar: (documentoId: string | null) => void;
  limpiar: () => void;
}

export type DocumentoSeleccionadoStore = DocumentoSeleccionadoState & DocumentoSeleccionadoActions;
