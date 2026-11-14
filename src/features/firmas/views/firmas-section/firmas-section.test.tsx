import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { comprobarIntegridad, crearFirmante, enviarCodigoFirma, listarFirmas, verificarFirma } from '../../apis/firmas-api';
import { Firma } from '../../models/firmas-models';
import FirmasSection from './index';

jest.mock('../../apis/firmas-api');
const listar = listarFirmas as jest.MockedFunction<typeof listarFirmas>;
const crear = crearFirmante as jest.MockedFunction<typeof crearFirmante>;
const enviar = enviarCodigoFirma as jest.MockedFunction<typeof enviarCodigoFirma>;
const verificar = verificarFirma as jest.MockedFunction<typeof verificarFirma>;
const comprobar = comprobarIntegridad as jest.MockedFunction<typeof comprobarIntegridad>;

const pendiente: Firma = {
  id: 'f1', documentoId: 'd1', firmanteNombre: 'Carlos Quintero', firmanteRol: 'FAMILIAR', firmanteCorreo: 'c***@correo.test', orden: 1,
  estado: 'PENDIENTE', firmadoEn: null, proveedor: null, hashFirma: null,
};
const firmada: Firma = { ...pendiente, estado: 'FIRMADA', firmadoEn: '2026-11-08T10:00:00-05:00', proveedor: 'OTP_CORREO', hashFirma: 'ab'.repeat(32) };

describe('FirmasSection', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    listar.mockResolvedValue([]);
  });

  it('mientras el formato no esté completo no permite registrar firmantes ni consulta firmas', () => {
    renderConRutas(<FirmasSection casoId="c1" documentoId={null} estadoDocumento="SIN_INICIAR" />);
    expect(screen.getByText('Complete el formato (PDF generado) para registrar firmantes.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar firmante' })).not.toBeInTheDocument();
    expect(listar).not.toHaveBeenCalled();
  });

  it('un borrador tampoco se firma', () => {
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="BORRADOR" />);
    expect(screen.getByText(/Complete el formato/)).toBeInTheDocument();
  });

  it('valida el correo del firmante antes de registrarlo', async () => {
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" />);
    await userEvent.type(await screen.findByLabelText('Nombre de quien firma'), 'Carlos');
    await userEvent.type(screen.getByLabelText('Correo para el código'), 'no-es-correo');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar firmante' }));
    expect(await screen.findByText('Ingrese un correo válido')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('registra un firmante y lo lista como pendiente', async () => {
    listar.mockResolvedValueOnce([]).mockResolvedValue([pendiente]);
    crear.mockResolvedValue(pendiente);
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" />);
    await userEvent.type(await screen.findByLabelText('Nombre de quien firma'), 'Carlos Quintero');
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'FAMILIAR');
    await userEvent.type(screen.getByLabelText('Correo para el código'), 'carlos@correo.test');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar firmante' }));
    await waitFor(() => expect(crear).toHaveBeenCalledWith('c1', 'd1', { firmanteNombre: 'Carlos Quintero', firmanteRol: 'FAMILIAR', firmanteCorreo: 'carlos@correo.test' }));
    expect(await screen.findByText('Carlos Quintero')).toBeInTheDocument();
    expect(screen.getByText(/c\*\*\*@correo.test/)).toBeInTheDocument(); // el correo llega enmascarado
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('envía el código al correo del firmante', async () => {
    listar.mockResolvedValue([pendiente]);
    enviar.mockResolvedValue(true);
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar código' }));
    expect(enviar).toHaveBeenCalledWith('f1');
    expect(await screen.findByText('Código enviado al correo del firmante.')).toBeInTheDocument();
  });

  it('«Firmar» solo se habilita con 6 dígitos, ignora letras y sella la firma', async () => {
    const alFirmar = jest.fn();
    listar.mockResolvedValueOnce([pendiente]).mockResolvedValue([firmada]);
    verificar.mockResolvedValue(firmada);
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" onFirmado={alFirmar} />);
    const campo = await screen.findByLabelText('Código Carlos Quintero');
    const boton = screen.getByRole('button', { name: 'Firmar' });
    expect(boton).toBeDisabled();
    await userEvent.type(campo, '12ab345');
    expect(campo).toHaveValue('12345');
    expect(boton).toBeDisabled();
    await userEvent.type(campo, '6');
    await userEvent.click(boton);
    await waitFor(() => expect(verificar).toHaveBeenCalledWith('f1', '123456'));
    expect(await screen.findByText('FIRMADA')).toBeInTheDocument();
    expect(alFirmar).toHaveBeenCalled();
  });

  it('un código incorrecto muestra el mensaje de la API y la firma sigue pendiente', async () => {
    listar.mockResolvedValue([pendiente]);
    verificar.mockRejectedValue(new ApiError('Código inválido o vencido', 400));
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" />);
    await userEvent.type(await screen.findByLabelText('Código Carlos Quintero'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Firmar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido o vencido');
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('una firma sellada permite comprobar la integridad: válida', async () => {
    listar.mockResolvedValue([firmada]);
    comprobar.mockResolvedValue({ valida: true, motivos: [], firmanteNombre: 'Carlos', firmanteRol: 'FAMILIAR', firmadoEn: firmada.firmadoEn, proveedor: 'OTP_CORREO' });
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="FIRMADO" />);
    expect(await screen.findByText('Documento firmado: ya no admite cambios.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar firmante' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar integridad' }));
    expect(await screen.findByText('Firma válida: el documento no ha cambiado desde que se firmó.')).toBeInTheDocument();
  });

  it('...y si el documento fue alterado lo dice con el motivo', async () => {
    listar.mockResolvedValue([firmada]);
    comprobar.mockResolvedValue({ valida: false, motivos: ['El documento cambió después de la firma'], firmanteNombre: 'Carlos', firmanteRol: 'FAMILIAR', firmadoEn: firmada.firmadoEn, proveedor: 'OTP_CORREO' });
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="FIRMADO" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Comprobar integridad' }));
    expect(await screen.findByText(/Firma NO válida: El documento cambió después de la firma/)).toBeInTheDocument();
  });

  it('sin firmantes lo indica', async () => {
    renderConRutas(<FirmasSection casoId="c1" documentoId="d1" estadoDocumento="COMPLETO" />);
    expect(await screen.findByText('Aún no hay firmantes.')).toBeInTheDocument();
  });
});
