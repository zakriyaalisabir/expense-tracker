import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthProvider'
import { createClient } from '@lib/supabase/client'

jest.mock('@lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function TestComponent() {
  const { user, loading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders children', () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
      }
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('loads demo user when demo mode enabled', async () => {
    localStorage.setItem('demo-mode', 'true')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      expect(screen.getByTestId('user')).toHaveTextContent('demo@example.com')
    })
  })

  it('loads authenticated user from session', async () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn(() => Promise.resolve({
          data: { session: { user: { id: 'u1', email: 'test@example.com' } } },
          error: null
        })),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
      }
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('handles no session', async () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
      }
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('throws error when useAuth used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within AuthProvider')
    consoleError.mockRestore()
  })
})
