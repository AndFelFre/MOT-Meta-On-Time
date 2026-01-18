# MOT (Meta On Time) - Product Requirements Document

## Visão Geral
Plataforma web para gerenciamento de metas, performance e bônus de agentes comerciais.

## Stack Tecnológica
- **Frontend:** React.js + Material-UI + Chart.js + Tailwind CSS + Framer Motion
- **Backend:** Python FastAPI
- **Database:** MongoDB

## Roles de Usuário
1. **Admin (Gerente):** Acesso total - CRUD usuários, editar KPIs, ver dashboard agregado, gamificação, config carreira
2. **Agent (Vendedor):** Visualização própria - dashboard pessoal, forecast, competências, gamificação

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

### ✅ Dashboard Administrativo V2 (100%)
- Visão agregada da equipe comercial
- Estatísticas: Total vendedores, Atingimento médio, TPV total, Churn médio
- Gráficos: Distribuição de performance, Ranking de atingimento, TPV por vendedor
- Cards de vendedores com filtros (nome, nível, performance)
- Sistema de alertas e sugestões
- Exportação CSV
- Modal de edição de KPIs (realizado, metas, pesos)

### ✅ Sistema de Gamificação (100%) - NOVO!
- **Ranking Mensal:** Posições com medalhas 🥇🥈🥉, pontos, streaks
- **10 Badges:** Primeira Venda, Batedor de Metas, Sequências, Retentor, Campeão TPV, etc.
- **Sistema de Pontos:** Cada badge concede pontos ao usuário
- **Premiar (Admin):** Conceder badges manualmente para vendedores
- **Stats Pessoais:** Posição no ranking, total de pontos, badges conquistadas, sequência

### ✅ Configuração de Plano de Carreira (100%) - NOVO!
- **Tabela Editável:** 5 níveis padrão (Recruta → Master)
- **CRUD Completo:** Criar, editar, excluir níveis
- **Campos:** Nome, Requisitos, TPV Mínimo, Tempo Mínimo, Bônus %, Benefícios, Cor
- **Visualização:** Progressão visual com chips coloridos

### ✅ Gerenciamento de Usuários (100%)
- CRUD completo de usuários
- Arquivar/Desarquivar
- Busca e filtros
- Sistema de onboarding

### ✅ Menu Reorganizado (100%) - NOVO!
Ordem: Dashboard > Administração > Gerenciar Usuários > Gamificação > Config. Carreira > Bonificação > Plano de Carreira > ...

### ✅ Módulos Adicionais (80%)
- Bonificação: Cálculo baseado em TPV
- Plano de Carreira: Níveis e requisitos
- Extrato: Histórico de performance
- DRE: Análise financeira
- Forecast: Funil de vendas
- Competências: Quiz mensal

## Arquitetura de Arquivos

```
/app/
├── backend/
│   ├── server.py              # API FastAPI
│   └── .env                   # Configurações
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SellerCard.js       # Card de vendedor
│   │   │   ├── StatsOverview.js    # Stats agregados
│   │   │   ├── EditKpiModal.js     # Modal edição KPIs
│   │   │   ├── AlertsPanel.js      # Painel de alertas
│   │   │   ├── AdminCharts.js      # Gráficos admin
│   │   │   ├── DashboardLayout.js  # Menu reorganizado
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.js  # Dashboard admin V2
│   │   │   ├── GamificationPage.js    # NOVO - Gamificação
│   │   │   ├── CareerConfigPage.js    # NOVO - Config Carreira
│   │   │   ├── DashboardPageV2.js
│   │   │   ├── UserManagementPage.js
│   │   │   └── ...
│   │   └── App.js
│   └── package.json
├── tests/
│   └── test_gamification_career.py  # 12 testes automatizados
└── memory/
    └── PRD.md
```

## APIs de Gamificação

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/gamification/badges` | GET | Lista todas as badges |
| `/api/gamification/user/{user_id}` | GET | Dados de gamificação do usuário |
| `/api/gamification/ranking` | GET | Ranking mensal |
| `/api/gamification/award-badge/{user_id}` | POST | Admin concede badge |

## APIs de Carreira

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/career-levels` | GET | Lista níveis de carreira |
| `/api/career-levels` | POST | Cria novo nível |
| `/api/career-levels/{level_id}` | PUT | Atualiza nível |
| `/api/career-levels/{level_id}` | DELETE | Remove nível |

## Credenciais de Teste
- **Admin:** admin@mot.com / admin123

## Changelog

### 2026-01-18 (Sessão 3) - PATCHES
- ✅ **Validação soma de pesos = 100%**: Toast de erro se pesos não somam 1.0
- ✅ **Menu reorganizado**: Dashboard > Administração > Gamificação > Config. Carreira
- ✅ **Auto-check carreira no Perfil**: Barra de progresso para próximo nível
- ✅ **README.md atualizado**: Setup completo, endpoints, configuração
- ✅ **.env.example**: Documentação de secrets (backend e frontend)
- ✅ **+9 testes e2e**: weights validation, career progression, data integrity
- ✅ **Accordion imports**: Dashboard organizado com seções colapsáveis

### 2026-01-18 (Sessão 2)
- ✅ Implementado Sistema de Gamificação completo
  - 10 badges com pontos e descrições
  - Ranking mensal com posições
  - Tab para admin premiar vendedores
  - Stats pessoais (posição, pontos, badges, streak)
- ✅ Implementado Configuração de Plano de Carreira
  - CRUD completo de níveis
  - 5 níveis padrão (Recruta → Master)
  - Campos editáveis: requisitos, TPV, tempo, bônus, benefícios
  - Visualização da progressão
- ✅ Menu reorganizado (Dashboard > Administração > Gamificação > Config. Carreira)
- ✅ 12 testes automatizados criados e passando

### 2026-01-18 (Sessão 1)
- ✅ Corrigido bug endpoint GET /api/users
- ✅ Criado Dashboard Admin V2 com gráficos e filtros
- ✅ Componentes: SellerCard, StatsOverview, EditKpiModal, AlertsPanel

### 2026-01-17
- Implementação inicial completa
- Sistema de onboarding
- Dashboard V2 com Chart.js

## Próximas Tarefas (Backlog)

### P1 - Alta Prioridade
- [ ] Gamificação automática baseada em KPIs (auto-award badges)
- [ ] WebSockets para atualização em tempo real do ranking
- [ ] Notificações push para conquistas

### P2 - Média Prioridade  
- [ ] Upload de foto de perfil
- [ ] Exportação PDF de relatórios
- [ ] Histórico de alterações de KPIs

### P3 - Baixa Prioridade
- [ ] Refatorar server.py em módulos (APIRouter)
- [ ] Dashboard de análise de gamificação
- [ ] Integração com CRM externo
