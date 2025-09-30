import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import App from '../App';

// Mock the socket service
jest.mock('../services/socketService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  isConnected: false
}));

// Mock the API service
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders login page when user is not authenticated', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should redirect to login since no user is authenticated
    expect(window.location.pathname).toBe('/login');
  });

  it('renders dashboard when user is authenticated', () => {
    // Mock authenticated user
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const mockToken = 'mock-token';
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should redirect to dashboard
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('handles invalid user data in localStorage gracefully', () => {
    // Set invalid user data
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('token', 'mock-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should handle gracefully and redirect to login
    expect(window.location.pathname).toBe('/login');
  });
});

describe('App Routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to login for unauthenticated users', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(window.location.pathname).toBe('/login');
  });

  it('redirects to dashboard for authenticated users', () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(window.location.pathname).toBe('/dashboard');
  });
});
