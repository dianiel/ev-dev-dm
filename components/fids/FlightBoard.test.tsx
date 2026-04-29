import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlightBoard } from './FlightBoard';
import { useFlightsStore } from '@/store/flightsStore';
import type { Flight } from '@/types';

vi.mock('./LiveClock', () => ({
  LiveClock: () => <div>Clock</div>,
}));

const baseFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'LO123',
    airline: 'LOT',
    destination: 'Warsaw',
    departureTime: '08:15',
    terminal: 'T1',
    gate: 'A1',
    status: 'On Time',
  },
  {
    id: '2',
    flightNumber: 'FR456',
    airline: 'Ryanair',
    destination: 'Rome',
    departureTime: '09:20',
    terminal: 'T2',
    gate: 'B3',
    status: 'Delayed',
    delayMinutes: 20,
  },
  {
    id: '3',
    flightNumber: 'LH789',
    airline: 'Lufthansa',
    destination: 'Berlin',
    departureTime: '10:05',
    terminal: 'T1',
    gate: 'A4',
    status: 'Boarding',
  },
];

beforeEach(() => {
  useFlightsStore.setState({
    flights: [],
    filters: {
      terminal: 'All',
      airline: 'All',
      status: 'All',
      destination: '',
    },
  });
});

describe('FlightBoard', () => {
  it('renderuje listę lotów', async () => {
    render(<FlightBoard initialFlights={baseFlights} />);

    expect(await screen.findByText('LO123')).toBeInTheDocument();
    expect(screen.getByText('FR456')).toBeInTheDocument();
    expect(screen.getByText('LH789')).toBeInTheDocument();
    expect(screen.getByText('3 flights')).toBeInTheDocument();
  });

  it('filtruje loty po terminalu', async () => {
    const user = userEvent.setup();
    render(<FlightBoard initialFlights={baseFlights} />);

    const terminalSelect = screen.getByDisplayValue('All Terminals');
    await user.selectOptions(terminalSelect, 'T1');

    expect(screen.getByText('LO123')).toBeInTheDocument();
    expect(screen.getByText('LH789')).toBeInTheDocument();
    expect(screen.queryByText('FR456')).not.toBeInTheDocument();
    expect(screen.getByText('2 flights')).toBeInTheDocument();
  });

  it('pokazuje pusty stan, gdy nie ma lotów', async () => {
    render(<FlightBoard initialFlights={[]} />);

    expect(
      await screen.findByText('No flights match the current filters.')
    ).toBeInTheDocument();
  });
});
