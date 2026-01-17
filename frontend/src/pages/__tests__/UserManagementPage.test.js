import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import UserManagementPage from '../UserManagementPage';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock dos módulos
jest.mock('@/utils/api');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockTheme = createTheme();

const MockProviders = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={mockTheme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('UserManagementPage - Correção de Imports', () => {
  beforeEach(() => {
    // Mock do user admin
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: { id: '1', role: 'admin', name: 'Admin Test' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('1. Renderiza sem erros de imports duplicados', () => {
    // Este teste garante que não há erro de "Identifier already declared"
    expect(() => {
      render(
        <MockProviders>
          <UserManagementPage />
        </MockProviders>
      );
    }).not.toThrow();
  });

  test('2. FormControlLabel está disponível e funciona', async () => {
    const { container } = render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Clicar no botão "Novo Usuário" para abrir modal
    const createButton = screen.getByTestId('create-user-btn');
    fireEvent.click(createButton);

    // Aguardar modal aparecer
    await waitFor(() => {
      expect(screen.getByText(/Sistema de Onboarding/i)).toBeInTheDocument();
    });

    // Verificar se FormControlLabel está renderizado (checkboxes de onboarding)
    const checkboxLabels = container.querySelectorAll('.MuiFormControlLabel-root');
    expect(checkboxLabels.length).toBeGreaterThan(0);
  });

  test('3. Checkbox está disponível e funciona', async () => {
    render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Abrir modal
    const createButton = screen.getByTestId('create-user-btn');
    fireEvent.click(createButton);

    await waitFor(() => {
      const tempPasswordCheckbox = screen.getByTestId('generate-temp-password-checkbox');
      expect(tempPasswordCheckbox).toBeInTheDocument();
    });

    // Testar interação com checkbox
    const tempPasswordCheckbox = screen.getByTestId('generate-temp-password-checkbox');
    fireEvent.click(tempPasswordCheckbox);

    // Verificar se alerta aparece (comportamento emergente)
    await waitFor(() => {
      expect(screen.getByText(/Uma senha temporária será gerada/i)).toBeInTheDocument();
    });
  });

  test('4. Divider está disponível e renderiza corretamente', async () => {
    const { container } = render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Abrir modal
    const createButton = screen.getByTestId('create-user-btn');
    fireEvent.click(createButton);

    await waitFor(() => {
      // Verificar se Divider está presente (usado antes da seção de onboarding)
      const dividers = container.querySelectorAll('.MuiDivider-root');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  test('5. Todos os imports do MUI funcionam sem conflitos', () => {
    // Lista de componentes que devem estar importados e funcionando
    const muiComponents = [
      'Box', 'Paper', 'Typography', 'Button', 'TextField',
      'Dialog', 'DialogTitle', 'DialogContent', 'DialogActions',
      'IconButton', 'Chip', 'Table', 'TableBody', 'TableCell',
      'TableContainer', 'TableHead', 'TableRow', 'MenuItem',
      'Select', 'FormControl', 'InputLabel', 'Alert',
      'Tooltip', 'InputAdornment', 'FormControlLabel', 'Checkbox', 'Divider'
    ];

    // Renderizar componente
    const { container } = render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Verificar que renderizou sem erros (indica que todos imports funcionam)
    expect(container).toBeInTheDocument();
    
    // Verificar presença de elementos chave
    expect(screen.getByText(/Gerenciamento de Usuários/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-user-btn')).toBeInTheDocument();
  });

  test('6. Não há erros de console relacionados a imports', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Verificar que não há erros de "already declared" ou "duplicate import"
    const errors = consoleErrorSpy.mock.calls;
    const importErrors = errors.filter(call => 
      call.some(arg => 
        typeof arg === 'string' && (
          arg.includes('already been declared') ||
          arg.includes('duplicate') ||
          arg.includes('import')
        )
      )
    );

    expect(importErrors.length).toBe(0);

    consoleErrorSpy.mockRestore();
  });

  test('7. Simulação de interação completa: criar usuário com onboarding', async () => {
    // Mock API
    const api = require('@/utils/api').default;
    api.post = jest.fn().mockResolvedValue({
      data: {
        message: 'Usuário criado com sucesso',
        user: { id: '2', name: 'Test User', email: 'test@test.com' },
        email_sent: true,
        temporary_password: true,
      },
    });

    render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // 1. Abrir modal
    fireEvent.click(screen.getByTestId('create-user-btn'));

    // 2. Preencher dados
    await waitFor(() => {
      expect(screen.getByTestId('create-name-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('create-name-input'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByTestId('create-email-input'), {
      target: { value: 'test@test.com' },
    });

    // 3. Marcar checkboxes de onboarding (usa FormControlLabel + Checkbox)
    fireEvent.click(screen.getByTestId('generate-temp-password-checkbox'));
    fireEvent.click(screen.getByTestId('send-welcome-email-checkbox'));

    // 4. Verificar alertas (usa Alert + Divider)
    await waitFor(() => {
      expect(screen.getByText(/Uma senha temporária será gerada/i)).toBeInTheDocument();
      expect(screen.getByText(/Um email de boas-vindas será enviado/i)).toBeInTheDocument();
    });

    // 5. Confirmar criação
    fireEvent.click(screen.getByTestId('confirm-create-btn'));

    // 6. Verificar sucesso
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users', expect.objectContaining({
        name: 'Test User',
        email: 'test@test.com',
        send_welcome_email: true,
        generate_temp_password: true,
      }));
    });
  });
});

describe('UserManagementPage - Validações de Segurança', () => {
  test('8. Valida email único (sem duplicatas)', async () => {
    const api = require('@/utils/api').default;
    api.post = jest.fn().mockRejectedValue({
      response: { data: { detail: 'Email já cadastrado' } },
    });

    render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Abrir modal e tentar criar usuário duplicado
    fireEvent.click(screen.getByTestId('create-user-btn'));

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('create-email-input'), {
        target: { value: 'duplicate@test.com' },
      });
    });

    fireEvent.click(screen.getByTestId('confirm-create-btn'));

    // Verificar que toast.error foi chamado
    await waitFor(() => {
      const { toast } = require('sonner');
      expect(toast.error).toHaveBeenCalledWith('Email já cadastrado');
    });
  });

  test('9. Internacionalização PT-BR está aplicada', () => {
    render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Verificar textos em português
    expect(screen.getByText(/Gerenciamento de Usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/Criar, editar, arquivar e excluir cadastros/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-user-btn')).toHaveTextContent(/Novo Usuário/i);
  });
});

describe('UserManagementPage - Cobertura de Edge Cases', () => {
  test('10. Não quebra se user não for admin', () => {
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: { id: '2', role: 'agent', name: 'Agent Test' },
    });

    const { container } = render(
      <MockProviders>
        <UserManagementPage />
      </MockProviders>
    );

    // Deve mostrar "Acesso negado" para não-admins
    expect(screen.getByText(/Acesso negado/i)).toBeInTheDocument();
  });
});
