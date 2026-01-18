# MOT (Meta On Time) - Product Requirements Document

## Visão Geral
Plataforma web para gerenciamento de metas, performance e bônus de agentes comerciais.

## Stack Tecnológica
- **Frontend:** React.js + Material-UI + Chart.js + Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** MongoDB

## Roles de Usuário
1. **Admin (Gerente):** Acesso total - CRUD usuários, editar KPIs, ver dashboard agregado
2. **Agent (Vendedor):** Visualização própria - dashboard pessoal, forecast, competências

## Funcionalidades Implementadas

### ✅ Autenticação (100%)
- Login JWT com validação de credenciais
- Sistema de onboarding com senha temporária
- Troca de senha no primeiro acesso
- Proteção de rotas por role

### ✅ Dashboard Individual (100%)
- Cards de resumo (Atingimento, Nível, Bônus)
- KPIs do mês com farol de status
- Gráfico radar de performance
- Toggle dark/light mode

### ✅ Dashboard Administrativo (100%) - NOVO!
- Visão agregada da equipe comercial
- Estatísticas: Total vendedores, Atingimento médio, TPV total, Churn médio
- Gráficos: Distribuição de performance, Ranking de atingimento, TPV por vendedor
- Cards de vendedores com filtros (nome, nível, performance)
- Sistema de alertas e sugestões
- Exportação CSV
- Modal de edição de KPIs (realizado, metas, pesos)

### ✅ Gerenciamento de Usuários (100%)
- CRUD completo de usuários
- Arquivar/Desarquivar
- Busca e filtros
- Sistema de onboarding

### ✅ Módulos Adicionais (80%)
- Bonificação: Cálculo baseado em TPV
- Plano de Carreira: Níveis e requisitos
- Extrato: Histórico de performance
- DRE: Análise financeira
- Forecast: Funil de vendas
- Competências: Quiz mensal

## Bugs Corrigidos Nesta Sessão
1. **GET /api/users retornando null** - Endpoint estava vazio, implementado corretamente
2. **TypeError: Cannot read properties of null** - Corrigido retorno de arrays vazios

## Arquitetura de Arquivos

```
/app/
├── backend/
│   ├── server.py              # API FastAPI (monolítico)
│   └── .env                   # Configurações
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SellerCard.js       # NOVO - Card de vendedor
│   │   │   ├── StatsOverview.js    # NOVO - Stats agregados
│   │   │   ├── EditKpiModal.js     # NOVO - Modal edição KPIs
│   │   │   ├── AlertsPanel.js      # NOVO - Painel de alertas
│   │   │   ├── AdminCharts.js      # NOVO - Gráficos admin
│   │   │   ├── DashboardLayout.js
│   │   │   ├── MetricCardMUI.js
│   │   │   └── KPIRadarChart.js
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.js  # NOVO - Dashboard admin completo
│   │   │   ├── DashboardPageV2.js
│   │   │   ├── UserManagementPage.js
│   │   │   └── ...outros
│   │   └── App.js
│   └── package.json
└── memory/
    └── PRD.md
```

## Credenciais de Teste
- **Admin:** admin@mot.com / admin123

## Próximas Tarefas (Backlog)

### P1 - Alta Prioridade
- [ ] Implementar edição global de metas (todas de uma vez)
- [ ] WebSockets para atualização em tempo real
- [ ] Notificações push para alertas

### P2 - Média Prioridade  
- [ ] Upload de foto de perfil
- [ ] Exportação PDF de relatórios
- [ ] Histórico de alterações de KPIs

### P3 - Baixa Prioridade
- [ ] Refatorar server.py em módulos (APIRouter)
- [ ] Implementar testes automatizados
- [ ] Integração com CRM externo

## Changelog

### 2026-01-18
- ✅ Corrigido bug endpoint GET /api/users (retornava null)
- ✅ Criado novo Dashboard Administrativo com:
  - Stats agregados da equipe
  - Gráficos de performance (Doughnut, Bar)
  - Cards de vendedores com filtros
  - Modal de edição de KPIs
  - Sistema de alertas
  - Exportação CSV

### 2026-01-17
- Implementação inicial completa
- Sistema de onboarding
- Dashboard V2 com Chart.js
