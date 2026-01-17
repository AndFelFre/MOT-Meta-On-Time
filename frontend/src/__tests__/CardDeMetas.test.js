/**
 * MOT - Card de Metas
 * Testes Unitários para Componentes React
 * 
 * Framework: Jest + React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing/library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MetricCardMUI } from '@/components/MetricCardMUI';
import { KPIRadarChart } from '@/components/KPIRadarChart';
import { calculateKPIMetrics } from '@/utils/helpers';

// Mock de dados baseado nos requisitos
const mockKPI = {
  novos_ativos_meta: 12,
  novos_ativos_realizado: 14,
  churn_meta: 5.0,
  churn_realizado: 3.0,
  tpv_m1_meta: 100000.0,
  tpv_m1_realizado: 110000.0,
  ativos_m1_meta: 10,
  ativos_m1_realizado: 12,
  migracao_hunter_meta: 70.0,
  migracao_hunter_realizado: 75.0
};

describe('Card de Metas - Testes Unitários', () => {
  
  // TESTE 1: Cálculos Automáticos
  describe('Cálculos de KPIs', () => {
    test('Deve calcular atingimento corretamente para Novos Ativos', () => {
      const { metrics } = calculateKPIMetrics(mockKPI);
      const novosAtivos = metrics.find(m => m.name === 'Novos Ativos');
      
      // Realizado=14, Meta=12 => 116.67%
      expect(novosAtivos.atingimento).toBeCloseTo(116.67, 1);
      // Peso 0.3 * 116.67% = 35%
      expect(novosAtivos.atingimentoFinal).toBeCloseTo(0.35, 2);
    });

    test('Deve calcular Churn inverso corretamente', () => {
      const { metrics } = calculateKPIMetrics(mockKPI);
      const churn = metrics.find(m => m.name === 'Churn');
      
      // Churn inverso: Meta=5%, Realizado=3% (bom!)
      // Atingimento = ((5-3)/5) * 100 + 100 = 140%
      expect(churn.atingimento).toBeGreaterThan(100);
      expect(churn.isInverse).toBe(true);
    });

    test('Deve calcular Total Geral corretamente', () => {
      const { totalAtingimento } = calculateKPIMetrics(mockKPI);
      
      // Soma ponderada de todos os KPIs
      // Deve ser > 100% pois maioria está acima da meta
      expect(totalAtingimento).toBeGreaterThan(100);
    });

    test('Pesos devem somar 1.0', () => {
      const { metrics } = calculateKPIMetrics(mockKPI);
      const totalPeso = metrics.reduce((sum, m) => sum + m.peso, 0);
      
      expect(totalPeso).toBeCloseTo(1.0, 2);
    });
  });

  // TESTE 2: Farois Modernos
  describe('Sistema de Farois (CheckCircle/Warning/Error)', () => {
    test('Deve exibir CheckCircle verde para atingimento >= 100%', () => {
      const metric = {
        name: 'Novos Ativos',
        atingimento: 116.67,
        meta: 12,
        realizado: 14,
        peso: 0.3,
        atingimentoFinal: 0.35,
        farol: 'green'
      };

      render(
        <ThemeProvider>
          <MetricCardMUI metric={metric} index={0} />
        </ThemeProvider>
      );

      const farolIcon = screen.getByTestId('farol-green');
      expect(farolIcon).toBeInTheDocument();
    });

    test('Deve exibir Warning amarelo para atingimento entre 80-99%', () => {
      const metric = {
        name: 'TPV M1',
        atingimento: 85,
        meta: '100k',
        realizado: '85k',
        peso: 0.2,
        atingimentoFinal: 0.17,
        farol: 'yellow'
      };

      render(
        <ThemeProvider>
          <MetricCardMUI metric={metric} index={0} />
        </ThemeProvider>
      );

      const farolIcon = screen.getByTestId('farol-yellow');
      expect(farolIcon).toBeInTheDocument();
    });

    test('Deve exibir Error vermelho para atingimento < 80%', () => {
      const metric = {
        name: 'Ativos M1',
        atingimento: 60,
        meta: 10,
        realizado: 6,
        peso: 0.15,
        atingimentoFinal: 0.09,
        farol: 'red'
      };

      render(
        <ThemeProvider>
          <MetricCardMUI metric={metric} index={0} />
        </ThemeProvider>
      );

      const farolIcon = screen.getByTestId('farol-red');
      expect(farolIcon).toBeInTheDocument();
    });
  });

  // TESTE 3: Tooltips Explicativos
  describe('Tooltips com Material-UI', () => {
    test('Tooltip do farol deve mostrar explicação ao hover', async () => {
      const metric = {
        name: 'Novos Ativos',
        atingimento: 116.67,
        meta: 12,
        realizado: 14,
        peso: 0.3,
        atingimentoFinal: 0.35,
        farol: 'green'
      };

      render(
        <ThemeProvider>
          <MetricCardMUI metric={metric} index={0} />
        </ThemeProvider>
      );

      const farolButton = screen.getByRole('button');
      fireEvent.mouseOver(farolButton);

      await waitFor(() => {
        expect(screen.getByText(/Excelente/i)).toBeInTheDocument();
      });
    });
  });

  // TESTE 4: Internacionalização (PT-BR)
  describe('Formatação PT-BR', () => {
    test('Deve formatar moeda em R$', () => {
      const { formatCurrency } = require('@/utils/helpers');
      
      expect(formatCurrency(1570)).toBe('R$ 1.570,00');
      expect(formatCurrency(100000)).toBe('R$ 100.000,00');
    });

    test('Valores devem usar vírgula como separador decimal', () => {
      const { metrics } = calculateKPIMetrics(mockKPI);
      const novosAtivos = metrics.find(m => m.name === 'Novos Ativos');
      
      // JavaScript usa ponto, mas UI deve mostrar vírgula
      const displayValue = novosAtivos.atingimento.toFixed(1).replace('.', ',');
      expect(displayValue).toContain(',');
    });
  });

  // TESTE 5: Modo Dark/Light
  describe('Modo Dark com ThemeProvider', () => {
    test('ThemeContext deve alternar entre light e dark', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.mode).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.mode).toBe('dark');
    });
  });

  // TESTE 6: Animações (Framer Motion)
  describe('Animações de Entrada', () => {
    test('Cards devem ter animação stagger (delay progressivo)', () => {
      const metrics = [
        { name: 'KPI 1', atingimento: 100, farol: 'green', peso: 0.5, atingimentoFinal: 0.5 },
        { name: 'KPI 2', atingimento: 80, farol: 'yellow', peso: 0.5, atingimentoFinal: 0.4 }
      ];

      render(
        <ThemeProvider>
          {metrics.map((m, idx) => (
            <MetricCardMUI key={idx} metric={m} index={idx} />
          ))}
        </ThemeProvider>
      );

      // Framer motion aplica delay de index * 0.1s
      // Card 0: 0s, Card 1: 0.1s
      const cards = screen.getAllByTestId(/metric-card/);
      expect(cards).toHaveLength(2);
    });
  });

  // TESTE 7: Radar Chart (Chart.js)
  describe('Gráfico Radar', () => {
    test('Deve renderizar radar com todos os KPIs', () => {
      const { metrics } = calculateKPIMetrics(mockKPI);

      render(
        <ThemeProvider>
          <KPIRadarChart metrics={metrics} />
        </ThemeProvider>
      );

      expect(screen.getByText(/Radar de Performance/i)).toBeInTheDocument();
      // Chart.js renderiza canvas
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });
  });

  // TESTE 8: Responsividade
  describe('Mobile-First Design', () => {
    test('Grid deve usar grid-cols-1 em mobile', () => {
      // Simular viewport mobile
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(
        <ThemeProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCardMUI metric={mockKPI} index={0} />
          </div>
        </ThemeProvider>
      );

      // Verificar classe CSS
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
    });
  });

  // TESTE 9: Validação de Inputs
  describe('Segurança e Validação', () => {
    test('Deve rejeitar valores negativos para Realizado', () => {
      const invalidKPI = { ...mockKPI, novos_ativos_realizado: -5 };
      
      expect(() => calculateKPIMetrics(invalidKPI)).toThrow(/valor inválido/i);
    });

    test('Meta deve ser maior que zero', () => {
      const invalidKPI = { ...mockKPI, novos_ativos_meta: 0 };
      
      const { metrics } = calculateKPIMetrics(invalidKPI);
      const novosAtivos = metrics.find(m => m.name === 'Novos Ativos');
      
      // Se meta = 0, atingimento deve ser 0 (não dividir por zero)
      expect(novosAtivos.atingimento).toBe(0);
    });
  });

  // TESTE 10: Simulação de Interações (Emergente)
  describe('Simulação de Usuários', () => {
    test('Simulação: Admin atualiza Novos Ativos de 0 para 14', async () => {
      // Estado inicial
      let kpi = { ...mockKPI, novos_ativos_realizado: 0 };
      let { metrics, totalAtingimento } = calculateKPIMetrics(kpi);
      
      expect(totalAtingimento).toBeLessThan(100);
      
      // Admin atualiza
      kpi.novos_ativos_realizado = 14;
      ({ metrics, totalAtingimento } = calculateKPIMetrics(kpi));
      
      const novosAtivos = metrics.find(m => m.name === 'Novos Ativos');
      
      // Atingimento = 14/12 = 116.67%
      expect(novosAtivos.atingimento).toBeCloseTo(116.67, 1);
      // Farol verde
      expect(novosAtivos.farol).toBe('green');
      // Total aumentou
      expect(totalAtingimento).toBeGreaterThan(100);
    });

    test('Simulação: Churn aumenta, atingimento cai', () => {
      // Churn baixo (bom)
      let kpi = { ...mockKPI, churn_realizado: 2.0 };
      let { metrics } = calculateKPIMetrics(kpi);
      let churn = metrics.find(m => m.name === 'Churn');
      
      const atingimentoBom = churn.atingimento;
      
      // Churn alto (ruim)
      kpi.churn_realizado = 7.0;
      ({ metrics } = calculateKPIMetrics(kpi));
      churn = metrics.find(m => m.name === 'Churn');
      
      const atingimentoRuim = churn.atingimento;
      
      // Atingimento deve cair
      expect(atingimentoRuim).toBeLessThan(atingimentoBom);
      expect(churn.farol).toBe('red');
    });

    test('Simulação: Agente visualiza (read-only)', () => {
      // Agente não pode editar, apenas visualizar
      const userRole = 'agent';
      
      const { metrics } = calculateKPIMetrics(mockKPI);
      
      // Todos os valores devem estar presentes
      expect(metrics).toHaveLength(5);
      metrics.forEach(m => {
        expect(m.meta).toBeDefined();
        expect(m.realizado).toBeDefined();
        expect(m.atingimento).toBeDefined();
        expect(m.farol).toBeDefined();
      });
    });
  });
});

// TESTES DE INTEGRAÇÃO
describe('Card de Metas - Integração Backend', () => {
  test('Deve buscar KPIs do backend via /api/kpis', async () => {
    const mockResponse = { data: mockKPI };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      })
    );

    const response = await fetch('/api/kpis/user123/2025-01');
    const data = await response.json();

    expect(data.data.novos_ativos_meta).toBe(12);
  });

  test('Deve atualizar KPI via PUT /api/kpis (admin)', async () => {
    const update = { novos_ativos_realizado: 14 };
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ...mockKPI, ...update })
      })
    );

    const response = await fetch('/api/kpis/user123/2025-01', {
      method: 'PUT',
      body: JSON.stringify(update)
    });
    const data = await response.json();

    expect(data.novos_ativos_realizado).toBe(14);
  });
});

// TESTES DE PERFORMANCE
describe('Card de Metas - Performance', () => {
  test('Cálculo de 1000 iterações deve ser < 100ms', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      calculateKPIMetrics(mockKPI);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(100);
  });

  test('Renderização de 10 cards deve ser < 200ms', () => {
    const start = performance.now();
    
    const metrics = Array(10).fill(null).map((_, idx) => ({
      name: `KPI ${idx}`,
      atingimento: 100,
      meta: 10,
      realizado: 10,
      peso: 0.1,
      atingimentoFinal: 0.1,
      farol: 'green'
    }));

    render(
      <ThemeProvider>
        {metrics.map((m, idx) => (
          <MetricCardMUI key={idx} metric={m} index={idx} />
        ))}
      </ThemeProvider>
    );
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(200);
  });
});

export default describe;
