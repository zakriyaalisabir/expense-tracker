import { render } from '@testing-library/react';
import RootLayout from '../layout';

// Mock components
jest.mock('@components/LayoutContent', () => {
  return function MockLayoutContent({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout-content">{children}</div>;
  };
});

jest.mock('@components/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

jest.mock('@components/StoreProvider', () => {
  return function MockStoreProvider({ children }: { children: React.ReactNode }) {
    return <div data-testid="store-provider">{children}</div>;
  };
});

jest.mock('@components/ErrorNotification', () => {
  return function MockErrorNotification() {
    return <div data-testid="error-notification" />;
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with light theme by default', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('store-provider')).toBeInTheDocument();
    expect(getByTestId('layout-content')).toBeInTheDocument();
    expect(getByTestId('error-notification')).toBeInTheDocument();
  });

  it('applies dark theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-mode');
  });
});