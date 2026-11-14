import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { crearCaso, listarCasos } from '../../apis/casos-api';
import { Caso } from '../../models/casos-models';
import CasosListView from './index';

jest.mock('../../apis/casos-api');
const listar = listarCasos as jest.MockedFunction<typeof listarCasos>;
const crear = crearCaso as jest.MockedFunction<typeof crearCaso>;

const caso: Caso = {
  id: 'c1', estado: 'BORRADOR', tipoDonante: 'TOTIPOTENCIAL', muerteViolenta: false, creadoEn: '2026-11-02T12:00:00-05:00',
  donante: { id: 'd1', tipoDocumento: 'CC', numeroDocumento: '1000000001', nombres: 'Juan', apellidos: 'Pérez' },
};

describe('CasosListView', () => {
  beforeEach(() => {
    listar.mockReset();
    crear.mockReset();
  });

  it('muestra los casos de la organización', async () => {
    listar.mockResolvedValue([caso]);
    renderConRutas(<CasosListView />);
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('CC 1000000001')).toBeInTheDocument();
    expect(screen.getByText('BORRADOR')).toBeInTheDocument();
  });

  it('indica cuando aún no hay casos', async () => {
    listar.mockResolvedValue([]);
    renderConRutas(<CasosListView />);
    expect(await screen.findByText('Aún no hay casos.')).toBeInTheDocument();
  });

  it('muestra el error si no se pueden cargar los casos', async () => {
    listar.mockRejectedValue(new ApiError('Sin permiso', 403));
    renderConRutas(<CasosListView />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin permiso');
  });

  it('abre el detalle al pulsar «Abrir»', async () => {
    listar.mockResolvedValue([caso]);
    renderConRutas(<CasosListView />, { otras: { '/casos/c1': 'DETALLE DEL CASO' } });
    await userEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
    expect(await screen.findByText('DETALLE DEL CASO')).toBeInTheDocument();
  });

  it('valida el formulario de nuevo caso antes de llamar a la API', async () => {
    listar.mockResolvedValue([]);
    renderConRutas(<CasosListView />);
    await screen.findByText('Aún no hay casos.');
    await userEvent.type(screen.getByLabelText('Documento (sintético)'), 'ab');
    await userEvent.click(screen.getByRole('button', { name: 'Crear caso' }));
    expect(await screen.findByText('De 4 a 20 letras o números')).toBeInTheDocument();
    expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(2);
    expect(crear).not.toHaveBeenCalled();
  });

  it('crea el caso y navega a su detalle', async () => {
    listar.mockResolvedValue([]);
    crear.mockResolvedValue(caso);
    renderConRutas(<CasosListView />, { otras: { '/casos/c1': 'DETALLE DEL CASO' } });
    await screen.findByText('Aún no hay casos.');
    await userEvent.type(screen.getByLabelText('Documento (sintético)'), '1000000001');
    await userEvent.type(screen.getByLabelText('Nombres'), 'Juan');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Crear caso' }));
    expect(await screen.findByText('DETALLE DEL CASO')).toBeInTheDocument();
    expect(crear).toHaveBeenCalledWith({ tipoDocumento: 'CC', numeroDocumento: '1000000001', nombres: 'Juan', apellidos: 'Pérez' });
  });
});