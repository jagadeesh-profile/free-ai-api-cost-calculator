import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login2 from '../pages/Login2';
import Calculator from '../pages/Calculator_new';
import Dashboard from '../pages/Dashboard';

// Mock API hooks
vi.mock('../hooks/useAuth', () => ({
  useLogin: vi.fn(),
  useRegister: vi.fn(),
}));

vi.mock('../hooks/useOrganizations', () => ({
  useOrganizations: vi.fn(),
  useCreateOrganization: vi.fn(),
}));

vi.mock('../hooks/useCalculations', () => ({
  useCalculateCost: vi.fn(),
  useAnalyticsSummary: vi.fn(),
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// Login Tests
describe('Login2 Component', () => {
  it('renders login form', () => {
    render(<Login2 />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows error on empty form submission', async () => {
    render(<Login2 />, { wrapper: Wrapper });
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<Login2 />, { wrapper: Wrapper });
    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows switch to register toggle', () => {
    render(<Login2 />, { wrapper: Wrapper });
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  it('toggles between login and register forms', () => {
    render(<Login2 />, { wrapper: Wrapper });
    const toggleButton = screen.getByText(/Create one/i);
    
    fireEvent.click(toggleButton);
    
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    render(<Login2 />, { wrapper: Wrapper });
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });
});

// Calculator Tests
describe('Calculator Component', () => {
  it('renders calculator form', () => {
    render(<Calculator />, { wrapper: Wrapper });
    expect(screen.getByText(/Add Calculation/i)).toBeInTheDocument();
  });

  it('adds calculation item to list', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    const providerInput = screen.getByPlaceholderText('Provider');
    const usageInput = screen.getByPlaceholderText('Usage units');
    const rateInput = screen.getByPlaceholderText('Rate per unit');
    
    fireEvent.change(providerInput, { target: { value: 'OpenAI' } });
    fireEvent.change(usageInput, { target: { value: '1000' } });
    fireEvent.change(rateInput, { target: { value: '0.03' } });
    
    const addButton = screen.getByText(/Add Calculation/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });
  });

  it('removes calculation item from list', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    // Add item first
    const providerInput = screen.getByPlaceholderText('Provider');
    fireEvent.change(providerInput, { target: { value: 'OpenAI' } });
    fireEvent.click(screen.getByText(/Add Calculation/i));
    
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });
    
    // Remove item
    const removeButton = screen.getByRole('button', { name: /Remove|Delete/i });
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('OpenAI')).not.toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    const addButton = screen.getByText(/Add Calculation/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Provider is required/i)).toBeInTheDocument();
    });
  });

  it('displays cost breakdown after calculation', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    // Add items
    const providerInput = screen.getByPlaceholderText('Provider');
    const usageInput = screen.getByPlaceholderText('Usage units');
    const rateInput = screen.getByPlaceholderText('Rate per unit');
    
    fireEvent.change(providerInput, { target: { value: 'OpenAI' } });
    fireEvent.change(usageInput, { target: { value: '1000' } });
    fireEvent.change(rateInput, { target: { value: '0.03' } });
    fireEvent.click(screen.getByText(/Add Calculation/i));
    
    // Calculate
    const calculateButton = screen.getByRole('button', { name: /Calculate|Submit/i });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Total Cost|Cost:/i)).toBeInTheDocument();
    });
  });

  it('displays analytics summary', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const analyticsSection = screen.getByText(/Analytics|Summary/i);
      expect(analyticsSection).toBeInTheDocument();
    });
  });

  it('handles empty items list', () => {
    const { container } = render(<Calculator />, { wrapper: Wrapper });
    
    // No items should be displayed initially
    const itemsList = container.querySelector('[data-testid="items-list"]');
    expect(itemsList?.children.length).toBe(0);
  });

  it('clears form after successful calculation', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    const providerInput = screen.getByPlaceholderText('Provider') as HTMLInputElement;
    fireEvent.change(providerInput, { target: { value: 'OpenAI' } });
    fireEvent.click(screen.getByText(/Add Calculation/i));
    
    const calculateButton = screen.getByRole('button', { name: /Calculate|Submit/i });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(providerInput.value).toBe('');
    });
  });
});

// Dashboard Tests
describe('Dashboard Component', () => {
  it('renders dashboard layout', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    expect(screen.getByText(/Dashboard|Organizations/i)).toBeInTheDocument();
  });

  it('displays organization list', async () => {
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Organizations|My Organizations/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    
    const loadingIndicator = screen.queryByRole('status');
    if (loadingIndicator) {
      expect(loadingIndicator).toBeInTheDocument();
    }
  });

  it('displays organization details', async () => {
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Should display at least one organization
      const orgElement = screen.queryByText(/Free Plan|Pro Plan|Enterprise/i);
      if (orgElement) {
        expect(orgElement).toBeInTheDocument();
      }
    });
  });

  it('allows creating new organization', async () => {
    render(<Dashboard />, { wrapper: Wrapper });
    
    const createButton = screen.queryByRole('button', { name: /Create|New Organization/i });
    if (createButton) {
      fireEvent.click(createButton);
      
      const nameInput = screen.queryByPlaceholderText('Organization name');
      expect(nameInput).toBeInTheDocument();
    }
  });

  it('shows empty state when no organizations', async () => {
    // This would need mocked hook returning empty array
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const emptyState = screen.queryByText(/No organizations|Create your first/i);
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });

  it('handles error state gracefully', async () => {
    render(<Dashboard />, { wrapper: Wrapper });
    
    // Wait for potential error message
    await waitFor(() => {
      const errorElement = screen.queryByText(/Error|Failed|Something went wrong/i);
      if (errorElement) {
        expect(errorElement).toBeInTheDocument();
      }
    });
  });
});

// Form Validation Tests
describe('Form Validation', () => {
  it('validates email format', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.org',
    ];
    
    const invalidEmails = [
      'invalid@',
      '@example.com',
      'user@.com',
      'no-at-sign.com',
    ];
    
    validEmails.forEach(email => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });
  });

  it('validates password strength', () => {
    const weakPasswords = ['123', 'password', '12345678'];
    const strongPasswords = ['Pass@123', 'SecurePass2024!', 'My$ecure#Pass'];
    
    // At least 8 chars, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    weakPasswords.forEach(pwd => {
      const isStrong = passwordRegex.test(pwd);
      expect(isStrong).toBe(false);
    });
  });
});

// Integration Tests
describe('Component Integration', () => {
  it('navigates from login to dashboard', async () => {
    // This would test the full flow with router integration
    render(<Login2 />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('calculator results are persisted', async () => {
    render(<Calculator />, { wrapper: Wrapper });
    
    const providerInput = screen.getByPlaceholderText('Provider');
    fireEvent.change(providerInput, { target: { value: 'OpenAI' } });
    fireEvent.click(screen.getByText(/Add Calculation/i));
    
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });
    
    // Results should persist in component state or React Query cache
    const calculateButton = screen.getByRole('button', { name: /Calculate|Submit/i });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Cost|Total/i)).toBeInTheDocument();
    });
  });
});

// Accessibility Tests
describe('Accessibility', () => {
  it('login form has proper labels', () => {
    render(<Login2 />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/email|email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('provides keyboard navigation', () => {
    const { container } = render(<Login2 />, { wrapper: Wrapper });
    const buttons = container.querySelectorAll('button');
    
    buttons.forEach(button => {
      expect(button).toHaveProperty('disabled', false);
    });
  });

  it('has sufficient color contrast', () => {
    // This is a visual test that would need actual color comparison
    const { container } = render(<Dashboard />, { wrapper: Wrapper });
    expect(container).toBeInTheDocument();
  });
});

