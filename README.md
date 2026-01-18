# MOT (Meta On Time)

Sistema de gerenciamento de metas, performance e bonificação para equipes comerciais.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Python 3.9+
- MongoDB 5+

### Setup Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar servidor
uvicorn server:app --reload --port 8001
```

### Setup Frontend

```bash
cd frontend

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar REACT_APP_BACKEND_URL

# Executar
yarn start
```

## ⚙️ Configuração

### Variáveis de Ambiente Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MONGO_URL` | URL de conexão MongoDB | `mongodb://localhost:27017` |
| `DB_NAME` | Nome do banco de dados | `mot_database` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `sua-chave-secreta-aqui` |
| `CORS_ORIGINS` | Origens permitidas CORS | `http://localhost:3000` |

### Variáveis de Ambiente Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `REACT_APP_BACKEND_URL` | URL da API backend | `http://localhost:8001` |

## 📁 Estrutura do Projeto

```
/app
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dependências Python
│   └── .env               # Configurações (não commitar!)
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context API (Auth, Theme)
│   │   └── utils/         # Utilitários (API client)
│   ├── package.json
│   └── .env
├── tests/                 # Testes automatizados
└── memory/
    └── PRD.md             # Documentação do produto
```

## 🔐 Autenticação

O sistema usa JWT para autenticação. Roles disponíveis:
- **admin**: Acesso total (gerenciar usuários, editar KPIs, configurar carreira)
- **agent**: Acesso ao próprio dashboard e funcionalidades de vendedor

### Credenciais de Teste
```
Admin: admin@mot.com / admin123
```

## 📊 Funcionalidades

### Dashboard
- KPIs com indicadores de status (farol)
- Gráfico radar de performance
- Cards de resumo (atingimento, nível, bônus)

### Gamificação
- Ranking mensal de vendedores
- Sistema de badges e pontos
- Premiação manual pelo admin

### Plano de Carreira
- 5 níveis: Recruta → Aspirante → Consultor → Senior → Master
- Requisitos configuráveis (TPV, tempo)
- Bônus progressivo por nível

### Gerenciamento de Usuários (Admin)
- CRUD completo
- Sistema de onboarding
- Arquivamento de usuários

## 🧪 Testes

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
yarn test
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Criar usuário (admin)
- `POST /api/auth/change-password` - Alterar senha

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Remover usuário

### KPIs
- `GET /api/kpis/{user_id}/{month}` - Obter KPIs
- `PUT /api/kpis/{user_id}/{month}` - Atualizar KPIs

### Gamificação
- `GET /api/gamification/badges` - Listar badges
- `GET /api/gamification/ranking` - Ranking mensal
- `POST /api/gamification/award-badge/{user_id}` - Conceder badge

### Carreira
- `GET /api/career-levels` - Listar níveis
- `POST /api/career-levels` - Criar nível
- `PUT /api/career-levels/{id}` - Atualizar nível
- `DELETE /api/career-levels/{id}` - Remover nível

## 🛠️ Tecnologias

**Frontend:**
- React 18
- Material-UI 5
- Chart.js
- Framer Motion
- React Router 6

**Backend:**
- FastAPI
- Motor (MongoDB async)
- PyJWT
- bcrypt

**Database:**
- MongoDB

## 📄 Licença

Proprietário - Todos os direitos reservados.
