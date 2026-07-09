import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AcademicPage from '../page';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@/app/context/DarkModeContext', () => ({
  useDarkMode: () => ({ isDarkMode: false }),
}));

jest.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        'academic.title': 'Academic Hub',
        'academic.spaces.tab': 'Study Zones',
        'academic.spaces.title': 'Consensus Crowd Levels',
        'academic.spaces.noise': 'Noise Level',
        'academic.spaces.capacity': 'Capacity',
        'academic.spaces.empty': 'Empty',
        'academic.spaces.moderate': 'Moderate',
        'academic.spaces.crowded': 'Crowded',
        'academic.spaces.report': 'Report Occupancy',
      };
      return keys[key] || key;
    },
  }),
}));

jest.mock('@/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Alice', role: 'STUDENT' },
  }),
}));

jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>;
  };
});

jest.mock('@/components/AnimatedBackground', () => {
  return function MockAnimatedBackground() {
    return <div data-testid="animated-background">Background</div>;
  };
});

// Mock window.alert
const originalAlert = window.alert;

beforeAll(() => {
  window.alert = jest.fn();
});

afterAll(() => {
  window.alert = originalAlert;
});

describe('AcademicPage - Study Zones Crowd Sourcing tab', () => {
  const mockSpaces = [
    {
      id: 1,
      name: 'Main Library Floor 1',
      building: 'Library',
      floor: 1,
      room: '101',
      capacity: 150,
      defaultNoiseLevel: 'QUIET',
      status: 'EMPTY',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockSpaces });
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders without crashing and fetches study spaces', async () => {
    render(<AcademicPage />);

    // Check initial fetch was called
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Switch to spaces tab (Wait for loading state to resolve naturally after 1000ms)
    const spacesTab = await screen.findByText('Study Zones', {}, { timeout: 3000 });
    expect(spacesTab).toBeInTheDocument();
    fireEvent.click(spacesTab);

    // Verify study space data is rendered
    await waitFor(() => {
      expect(screen.getByText('Main Library Floor 1')).toBeInTheDocument();
      expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
      expect(screen.getByText(/150 Students/i)).toBeInTheDocument();
    });
  });

  it('allows user to report crowd status', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    render(<AcademicPage />);

    // Click spaces tab (Wait for loading state to resolve naturally after 1000ms)
    const spacesTab = await screen.findByText('Study Zones', {}, { timeout: 3000 });
    fireEvent.click(spacesTab);

    // Wait for spaces to render and show Report button
    const reportBtn = await screen.findByText('📢 Report Crowd Level', {}, { timeout: 3000 });
    expect(reportBtn).toBeInTheDocument();
    fireEvent.click(reportBtn);

    // Choose Crowded option
    const crowdedBtn = screen.getByText('Busy');
    fireEvent.click(crowdedBtn);

    // Verify post request is sent to backend
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/study-spaces/1/vote'),
      { status: 'CROWDED' },
      expect.any(Object)
    );
  });
});
