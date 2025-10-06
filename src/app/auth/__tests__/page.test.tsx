import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthPage from '../page'
import { useAuth } from '@components/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@lib/supabase/client'

jest.mock('@components/AuthProvider')
jest.mock('next/navigation')
jest.mock('@lib/supabase/client')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('AuthPage', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_DEMO_ENABLED = 'true'
    mockUseRouter.mockReturnValue({ push: mockPush, replace: mockReplace } as any)
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn()
    })
    mockCreateClient.mockReturnValue({
      auth: {
        signInWithOAuth: jest.fn(() => Promise.resolve({ error: null }))
      }
    } as any)
  })

  it('renders sign in form', async () => {
    render(<AuthPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('toggles between sign in and sign up', () => {
    render(<AuthPage />)
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Need an account? Sign Up'))
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Already have an account? Sign In'))
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('handles sign in submission', async () => {
    mockSignIn.mockResolvedValue(undefined)
    render(<AuthPage />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles sign up submission', async () => {
    mockSignUp.mockResolvedValue(undefined)
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()
    
    render(<AuthPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Need an account? Sign Up')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Need an account? Sign Up'))
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } })
    const passwordFields = screen.getAllByLabelText(/password/i)
    fireEvent.change(passwordFields[0], { target: { value: 'password123' } })
    fireEvent.change(passwordFields[1], { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123')
      expect(alertMock).toHaveBeenCalledWith('Check your email for confirmation link')
    })
    
    alertMock.mockRestore()
  })

  it('displays error message on sign in failure', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))
    render(<AuthPage />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } })
    
    // Wait for button to be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).not.toBeDisabled()
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('handles Google OAuth sign in', async () => {
    const mockSignInWithOAuth = jest.fn(() => Promise.resolve({ error: null }))
    mockCreateClient.mockReturnValue({
      auth: { signInWithOAuth: mockSignInWithOAuth }
    } as any)

    render(<AuthPage />)
    fireEvent.click(screen.getByText('Continue with Google'))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') }
      })
    })
  })

  it('handles GitHub OAuth sign in', async () => {
    const mockSignInWithOAuth = jest.fn(() => Promise.resolve({ error: null }))
    mockCreateClient.mockReturnValue({
      auth: { signInWithOAuth: mockSignInWithOAuth }
    } as any)

    render(<AuthPage />)
    fireEvent.click(screen.getByText('Continue with GitHub'))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: { redirectTo: expect.stringContaining('/auth/callback') }
      })
    })
  })

  it('handles demo mode', () => {
    render(<AuthPage />)
    fireEvent.click(screen.getByText('Continue as Demo'))

    expect(localStorage.getItem('demo-mode')).toBe('true')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('redirects if already logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@example.com' } as any,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn()
    })

    render(<AuthPage />)
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('does not redirect for demo user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'demo', email: 'demo@example.com' } as any,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn()
    })

    render(<AuthPage />)
    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })
})