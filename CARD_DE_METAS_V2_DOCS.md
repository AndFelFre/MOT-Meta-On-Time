# MOT - Card de Metas V2 com Material-UI
## Documentação Técnica Completa

### 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes Implementados](#componentes)
4. [Cálculos e Algoritmos](#cálculos)
5. [Guia de Uso](#guia-de-uso)
6. [Testes](#testes)
7. [Deploy](#deploy)

---

## 🎯 Visão Geral

O **Card de Metas V2** é uma evolução moderna do dashboard MOT, implementando:
- ✅ Material-UI para design system profissional
- ✅ Modo Dark/Light com ThemeProvider
- ✅ Ícones modernos (CheckCircle, Warning, Error)
- ✅ Tooltips explicativos
- ✅ Animações com Framer Motion
- ✅ Gráfico Radar com Chart.js
- ✅ Cálculo correto do Churn inverso
- ✅ Internacionalização PT-BR

---

## 🏗️ Arquitetura

### Stack Tecnológica
```
Frontend:
├── React 19
├── Material-UI 7.3.7
├── Chart.js 4.5.1 + react-chartjs-2
├── Framer Motion 12.26.2
├── Emotion (styled-components)
└── Tailwind CSS (coexistindo)

Backend:
├── FastAPI
├── MongoDB
└── JWT Authentication
```

### Estrutura de Arquivos
```
/app/frontend/src/
├── contexts/
│   ├── AuthContext.js          # JWT auth
│   └── ThemeContext.js          # Dark/Light mode (NOVO)
├── components/
│   ├── MetricCardMUI.js         # Card de KPI com MUI (NOVO)
│   ├── KPIRadarChart.js         # Gráfico Radar (NOVO)
│   ├── MetricCard.js            # Versão legacy
│   └── DashboardLayout.js       # Layout com sidebar
├── pages/
│   ├── DashboardPageV2.js       # Nova versão MUI (NOVO)
│   └── DashboardPage.js         # Versão legacy
├── utils/
│   └── helpers.js               # Cálculos de KPI (ATUALIZADO)
└── __tests__/
    └── CardDeMetas.test.js      # Testes unitários (NOVO)
```

---

## 🧩 Componentes Implementados

### 1. ThemeContext (contexts/ThemeContext.js)
**Responsabilidade:** Gerenciar modo dark/light global

**Features:**
- Persistência em localStorage
- Toggle theme button
- Paleta de cores customizada (Slate 900, Emerald 500, Rose 600)
- Typography (Plus Jakarta Sans, DM Sans)

**API:**
```javascript
const { mode, toggleTheme } = useTheme();
// mode: 'light' | 'dark'
// toggleTheme: () => void
```

**Paleta de Cores:**
| Modo  | Background | Paper   | Text Primary | Text Secondary |
|-------|-----------|---------|--------------|----------------|
| Light | #F8FAFC   | #FFFFFF | #0F172A      | #64748B        |
| Dark  | #0F172A   | #1E293B | #F8FAFC      | #94A3B8        |

---

### 2. MetricCardMUI (components/MetricCardMUI.js)
**Responsabilidade:** Card individual de KPI com design moderno

**Props:**
```typescript
interface MetricCardMUIProps {
  metric: {
    name: string;
    meta: string | number;
    realizado: string | number;
    atingimento: number;
    peso: number;
    atingimentoFinal: number;
    farol: 'green' | 'yellow' | 'red';
    isInverse?: boolean;
  };
  index: number; // Para animação stagger
}
```

**Features:**
1. **Farol Moderno:**
   - 🟢 CheckCircleIcon (verde): ≥100%
   - 🟡 WarningIcon (amarelo): 80-99%
   - 🔴 ErrorIcon (vermelho): <80%

2. **Tooltips:**
   - Hover no farol: Explicação do status
   - Hover na progress bar: Valor exato

3. **Animações:**
   - Entrada: fade-in + slide-up
   - Hover: lift + shadow
   - Delay stagger: index * 0.1s

4. **Badge Inverso:**
   - Para KPIs como Churn (menor é melhor)

5. **Progress Bar:**
   - LinearProgress do MUI
   - Cores dinâmicas baseadas no farol
   - Cap em 200% (evita overflow visual)

---

### 3. KPIRadarChart (components/KPIRadarChart.js)
**Responsabilidade:** Gráfico radar dos 5 KPIs

**Props:**
```typescript
interface KPIRadarChartProps {
  metrics: Metric[];
}
```

**Features:**
- Radar com 5 eixos (um por KPI)
- Cores adaptativas (dark/light)
- Tooltips interativos
- Escala 0-150%
- Responsivo

**Configuração Chart.js:**
```javascript
{
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 150,
      ticks: { stepSize: 50 }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { 
      callbacks: {
        label: (context) => `${context.parsed.r.toFixed(1)}%`
      }
    }
  }
}
```

---

### 4. DashboardPageV2 (pages/DashboardPageV2.js)
**Responsabilidade:** Página principal do dashboard com MUI

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (nome, tema toggle, refresh)     │
├─────────────────────────────────────────┤
│ Summary Cards (3 cols)                  │
│ [Atingimento] [Carreira] [Bônus]        │
├─────────────────────────────────────────┤
│ Metas do Mês (grid 3 cols)              │
│ [KPI 1] [KPI 2] [KPI 3]                 │
│ [KPI 4] [KPI 5]                         │
├─────────────────────────────────────────┤
│ [Radar Chart] [Motivational Card]       │
└─────────────────────────────────────────┘
```

**Features:**
- Refresh button (polling manual)
- Theme toggle (sol/lua)
- Loading state (CircularProgress)
- Error handling
- Fade-in animations
- Responsive grid

---

## 🧮 Cálculos e Algoritmos

### Fórmulas dos KPIs

#### 1. Novos Ativos (Padrão)
```javascript
atingimento = (realizado / meta) * 100
atingimentoFinal = (atingimento / 100) * peso
farol = atingimento >= 100 ? 'green' : atingimento >= 80 ? 'yellow' : 'red'
```

**Exemplo:**
- Meta: 12
- Realizado: 14
- Atingimento: (14/12) * 100 = **116.67%**
- Peso: 0.3
- Final: (116.67/100) * 0.3 = **0.35 (35%)**
- Farol: 🟢 verde

---

#### 2. Churn (Inverso) ⚠️ ESPECIAL
**Regra:** Quanto menor o churn, melhor!

**Fórmula Corrigida:**
```javascript
// Se realizado < meta: BOM (atingimento > 100%)
// Se realizado = meta: NEUTRO (atingimento = 100%)
// Se realizado > meta: RUIM (atingimento < 100%)

atingimento = ((meta - realizado) / meta) * 100 + 100
atingimentoFinal = min((atingimento / 100), 2) * peso
```

**Exemplos:**
| Meta | Realizado | Cálculo | Atingimento | Farol |
|------|-----------|---------|-------------|-------|
| 5%   | 3%        | ((5-3)/5)*100+100 | **140%** | 🟢 verde |
| 5%   | 5%        | ((5-5)/5)*100+100 | **100%** | 🟢 verde |
| 5%   | 7%        | ((5-7)/5)*100+100 | **60%**  | 🔴 vermelho |

**Implementação (helpers.js):**
```javascript
const churnAtingimento = kpi.churn_meta > 0 
  ? Math.max(0, ((kpi.churn_meta - kpi.churn_realizado) / kpi.churn_meta) * 100 + 100)
  : 100;
const churnFinal = Math.min((churnAtingimento / 100), 2) * weights.churn;
```

---

#### 3. TPV M1 (Padrão)
```javascript
atingimento = (realizado / meta) * 100
```

**Exemplo:**
- Meta: R$ 100.000
- Realizado: R$ 110.000
- Atingimento: **110%**
- Peso: 0.2
- Final: **0.22 (22%)**

---

#### 4. Ativos M1 (Padrão)
Meta: clientes com TPV ≥ R$ 7k

---

#### 5. Migração Hunter +70% (Padrão)
Meta: 70% de conversão

---

### Total Geral
```javascript
totalAtingimento = Σ (atingimentoFinal * 100)
```

**Validação:** Pesos devem somar 1.0
```javascript
const totalPeso = metrics.reduce((sum, m) => sum + m.peso, 0);
console.assert(totalPeso === 1.0);
```

---

## 📖 Guia de Uso

### 1. Setup Inicial
```bash
# Backend
cd /app/backend
pip install -r requirements.txt
python server.py

# Frontend
cd /app/frontend
yarn install
yarn start
```

### 2. Acessar Dashboard V2
```
URL: http://localhost:3000/dashboard
Login: andre@mot.com / admin123
```

### 3. Alternar Tema
Clicar no ícone de sol/lua no header (top-right)

### 4. Atualizar KPIs (Admin)
1. Ir para `/admin`
2. Selecionar usuário
3. Clicar em "Editar KPIs"
4. Inserir valores realizados
5. Salvar

### 5. Visualizar Radar
Scroll down no dashboard até "Radar de Performance"

---

## 🧪 Testes

### Executar Testes
```bash
cd /app/frontend
yarn test CardDeMetas.test.js
```

### Cobertura de Testes
- ✅ Cálculos automáticos (10 casos)
- ✅ Farois modernos (3 cenários)
- ✅ Tooltips (hover interaction)
- ✅ Internacionalização PT-BR
- ✅ Modo Dark/Light
- ✅ Animações (stagger)
- ✅ Radar Chart
- ✅ Responsividade
- ✅ Validação de inputs
- ✅ Simulações de usuários (emergente)

### Simulação Emergente - Caso de Uso

**Cenário:** Admin atualiza Novos Ativos de 0 para 14

```javascript
// Estado Inicial
kpi.novos_ativos_realizado = 0;
calculateKPIMetrics(kpi);
// totalAtingimento: ~85% (sem Novos Ativos)
// farol: 🔴 vermelho

// Admin Atualiza
kpi.novos_ativos_realizado = 14;
calculateKPIMetrics(kpi);
// totalAtingimento: ~110% (com Novos Ativos)
// farol: 🟢 verde
// atingimentoFinal: 0.35 (35% do total)

// Agente Visualiza
// - Vê novo valor
// - Radar atualizado
// - Bônus recalculado
```

---

## 🚀 Deploy

### Produção
```bash
# Build frontend
cd /app/frontend
yarn build

# Deploy para Vercel/Netlify
# Upload da pasta /build
```

### Variáveis de Ambiente
```
REACT_APP_BACKEND_URL=https://api.mot.com
MONGO_URL=mongodb://...
JWT_SECRET=your-secret-key
```

---

## 🎨 Design System

### Tipografia
| Elemento   | Fonte              | Peso | Size |
|------------|--------------------|------|------|
| H1         | Plus Jakarta Sans  | 700  | 3rem |
| H2         | Plus Jakarta Sans  | 700  | 2rem |
| Body       | DM Sans            | 400  | 1rem |
| Caption    | DM Sans            | 500  | 0.75rem |
| Overline   | DM Sans            | 600  | 0.65rem |

### Espaçamento
- Card padding: 24px (p-6)
- Grid gap: 24px (gap-6)
- Section margin: 32px (mb-4)

### Animações
- Entrada: 300ms ease-out
- Hover: 200ms ease-in-out
- Stagger delay: 100ms por card

---

## 🔄 Integração com Bonificações

O Card de Metas alimenta o sistema de bonificação:

```javascript
// 1. Calcular atingimento total
const { totalAtingimento } = calculateKPIMetrics(kpi);

// 2. Determinar multiplicador
let multiplicador;
if (totalAtingimento >= 100) {
  multiplicador = 1.0;  // 100% do bônus
} else if (totalAtingimento >= 80) {
  multiplicador = 0.8;  // 80% do bônus
} else {
  multiplicador = 0.0;  // Sem bônus
}

// 3. Calcular bônus final
bonusFinal = bonusTotal * multiplicador;
bonusFinal = Math.min(bonusFinal, salarioBase * 2); // Cap 200%
```

---

## 📊 Melhorias Futuras

1. **WebSockets:** Atualização em tempo real (substituir polling)
2. **Histórico Temporal:** Gráfico de evolução mensal
3. **Metas Dinâmicas:** Admin pode ajustar metas individuais
4. **Exportação PDF:** Gerar relatório do card
5. **Notificações:** Alerta quando meta é atingida
6. **Mobile App:** PWA para vendedores
7. **IA Preditiva:** Sugerir ações para atingir meta

---

## 📞 Suporte

- **Documentação:** /docs
- **Issues:** GitHub Issues
- **Email:** suporte@mot.com

---

## 📄 Licença

MIT License - MOT © 2025

---

**Desenvolvido com ❤️ por Emergent AI**
