import { ApiError } from '@/shared/models/api-models';

import { clases, descargarBlob, erroresPorCampo, formatearFechaHora, formatearPorcentaje, mensajeDeError, traducirValidacion } from './utils';

describe('utils', () => {
  it('formatea el porcentaje y tolera datos ausentes', () => {
    expect(formatearPorcentaje(0.915)).toBe('92 %');
    expect(formatearPorcentaje(null)).toBe('—');
    expect(formatearPorcentaje(undefined)).toBe('—');
  });

  it('formatea fecha y hora, y devuelve guion si la fecha es inválida', () => {
    expect(formatearFechaHora('2026-11-02T12:43:15.756-05:00')).toMatch(/2026|26/);
    expect(formatearFechaHora('no es fecha')).toBe('—');
  });

  it('arma el mensaje de un ApiError incluyendo el detalle por campo', () => {
    const e = new ApiError('Datos inválidos', 400, [{ property: 'nombres', constraints: { isNotEmpty: 'nombres should not be empty' } }]);
    expect(mensajeDeError(e, 'x')).toBe('Datos inválidos: nombres should not be empty');
    expect(mensajeDeError(new ApiError('Sin permiso', 403), 'x')).toBe('Sin permiso');
  });

  it('usa el mensaje de un Error común o el texto por defecto', () => {
    expect(mensajeDeError(new Error('falló'), 'x')).toBe('falló');
    expect(mensajeDeError('texto suelto', 'por defecto')).toBe('por defecto');
  });

  it('traduce claves de validación y deja pasar mensajes desconocidos', () => {
    expect(traducirValidacion({ required: 'Obligatorio' }, 'required')).toBe('Obligatorio');
    expect(traducirValidacion({ required: 'Obligatorio' }, 'otra cosa')).toBe('otra cosa');
    expect(traducirValidacion({}, undefined)).toBeUndefined();
  });

  it('une clases ignorando valores vacíos', () => {
    expect(clases('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('convierte el detalle de validación de la API en un mapa campo → mensaje', () => {
    const e = new ApiError('Datos inválidos', 422, [
      { property: 'grupo', constraints: { formato: 'Este campo es obligatorio' } },
      { property: 'edad', constraints: { a: 'Debe ser un número', b: 'Debe ser positivo' } },
    ]);
    expect(erroresPorCampo(e)).toEqual({ grupo: 'Este campo es obligatorio', edad: 'Debe ser un número, Debe ser positivo' });
    expect(erroresPorCampo(new Error('x'))).toEqual({});
  });

  it('descargarBlob crea un enlace temporal, lo pulsa con el nombre indicado y libera la URL', () => {
    const crear = jest.fn(() => 'blob:prueba');
    const liberar = jest.fn();
    Object.assign(URL, { createObjectURL: crear, revokeObjectURL: liberar });
    const clic = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('formato.pdf');
      expect(this.href).toBe('blob:prueba');
    });
    descargarBlob(new Blob(['x']), 'formato.pdf');
    expect(clic).toHaveBeenCalledTimes(1);
    expect(liberar).toHaveBeenCalledWith('blob:prueba');
    expect(document.querySelector('a[download]')).toBeNull(); // no deja enlaces sueltos en la página
    clic.mockRestore();
  });
});