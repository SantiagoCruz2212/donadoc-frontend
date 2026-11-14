import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApiError } from '@/shared/models/api-models';
import { renderConRutas } from '@/test/render';

import { listarTrasplantesVigentes } from '../../apis/red-api';
import { TrasplanteVigente } from '../../models/red-models';
import RedVigentesView from './index';

jest.mock('../../apis/red-api');
const listar = listarTrasplantesVigentes as jest.MockedFunction<typeof listarTrasplantesVigentes>;

const propio: TrasplanteVigente = {
  codigo: 'TX-AAAA1111', institucion: 'Clínica Demo', esPropio: true, casoId: 'caso-1', tipoDonante: 'ORGANOS', estado: 'EN_CURSO', fechaInicio: '2026-11-08',
  componentes: [{ tipoComponente: 'RINON', rescatado: true }],
};
const ajeno: TrasplanteVigente = {
  codigo: 'TX-BBBB2222', institucion: 'Clínica Otra', esPropio: false, casoId: null, tipoDonante: null, estado: 'FIRMADO', fechaInicio: '2026-11-07',
  componentes: [{ tipoComponente: 'CORNEA', rescatado: false }],
};

describe('RedVigentesView', () => {
  beforeEach(() => jest.resetAllMocks());

  it('muestra los trasplantes de todas las instituciones solo con datos no personales', async () => {
    listar.mockResolvedValue({ items: [propio, ajeno], total: 2 });
    renderConRutas(<RedVigentesView />);
    expect(await screen.findByText('TX-AAAA1111')).toBeInTheDocument();
    expect(screen.getByText('TX-BBBB2222')).toBeInTheDocument();
    expect(screen.getByText('2 trasplantes vigentes')).toBeInTheDocument();
    const encabezados = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(encabezados.join('|')).not.toMatch(/Nombre|Apellido|Documento|Identificaci|Edad|Causa/i);
    expect(screen.getByText(/no incluye ningún dato personal/)).toBeInTheDocument();
  });

  it('solo los casos propios traen el botón «Abrir» y llevan a su detalle', async () => {
    listar.mockResolvedValue({ items: [propio, ajeno], total: 2 });
    renderConRutas(<RedVigentesView />, { otras: { '/casos/caso-1': 'DETALLE DEL CASO' } });
    await screen.findByText('TX-AAAA1111');
    expect(screen.getAllByRole('button', { name: 'Abrir' })).toHaveLength(1);
    const filaAjena = screen.getByText('TX-BBBB2222').closest('tr') as HTMLElement;
    expect(within(filaAjena).queryByRole('button')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(await screen.findByText('DETALLE DEL CASO')).toBeInTheDocument();
  });

  it('indica si cada órgano fue rescatado o no', async () => {
    listar.mockResolvedValue({ items: [propio, ajeno], total: 2 });
    renderConRutas(<RedVigentesView />);
    expect(await screen.findByText('(rescatado)')).toBeInTheDocument();
    expect(screen.getByText('(no rescatado)')).toBeInTheDocument();
  });

  it('sin trasplantes vigentes lo dice', async () => {
    listar.mockResolvedValue({ items: [], total: 0 });
    renderConRutas(<RedVigentesView />);
    expect(await screen.findByText('No hay trasplantes vigentes.')).toBeInTheDocument();
  });

  it('muestra el error de la API', async () => {
    listar.mockRejectedValue(new ApiError('Error interno del servidor', 500));
    renderConRutas(<RedVigentesView />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor');
  });
});
