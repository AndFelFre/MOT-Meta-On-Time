from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'mot-secret-key-2025')
JWT_ALGORITHM = "HS256"

class UserRole(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"

class CareerLevel(str, Enum):
    RECRUTA = "Recruta"
    ASPIRANTE = "Aspirante"
    CONSULTOR = "Consultor"
    SENIOR = "Senior"
    MASTER = "Master"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    role: UserRole
    career_level: CareerLevel = CareerLevel.RECRUTA
    base_salary: float = 1570.0
    active_base: int = 159
    time_in_company: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.AGENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class KPI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    month: str
    novos_ativos_meta: int = 12
    novos_ativos_realizado: int = 0
    churn_meta: float = 5.0
    churn_realizado: float = 0.0
    tpv_m1_meta: float = 100000.0
    tpv_m1_realizado: float = 0.0
    ativos_m1_meta: int = 10
    ativos_m1_realizado: int = 0
    migracao_hunter_meta: float = 70.0
    migracao_hunter_realizado: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KPIUpdate(BaseModel):
    novos_ativos_realizado: Optional[int] = None
    churn_realizado: Optional[float] = None
    tpv_m1_realizado: Optional[float] = None
    ativos_m1_realizado: Optional[int] = None
    migracao_hunter_realizado: Optional[float] = None

class BonusFaixa(BaseModel):
    faixa: str
    tpv_min: float
    bonus_per_client: float
    meta_min_clients: int
    clients_count: int = 0

class Bonus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    month: str
    faixas: List[BonusFaixa]
    bonus_total: float = 0.0
    multiplicador: float = 0.0
    bonus_final: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BonusUpdate(BaseModel):
    faixas: List[BonusFaixa]

class Extrato(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    month: str
    bonus_time: float = 0.0
    bonus_rentabilizacao: float = 0.0
    historico_semestral: List[Dict] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DRE(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    month: str
    salario: float
    beneficios: float
    custos_totais: float
    receita: float
    breakeven: float
    payback_months: int
    roi_percent: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DRECreate(BaseModel):
    month: str
    salario: float
    beneficios: float
    receita: float

class Forecast(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    month: str
    qualificacao: int = 0
    proposta: int = 0
    novo_cliente: int = 0
    novo_ativo: int = 0
    conv_qualif_proposta: float = 0.0
    conv_proposta_cliente: float = 0.0
    conv_cliente_ativo: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ForecastUpdate(BaseModel):
    qualificacao: Optional[int] = None
    proposta: Optional[int] = None
    novo_cliente: Optional[int] = None
    novo_ativo: Optional[int] = None

class Competencia(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    persistencia: int = 3
    influencia: int = 3
    relacionamento: int = 3
    organizacao: int = 3
    criatividade: int = 3
    media: float = 3.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompetenciaUpdate(BaseModel):
    persistencia: Optional[int] = None
    influencia: Optional[int] = None
    relacionamento: Optional[int] = None
    organizacao: Optional[int] = None
    criatividade: Optional[int] = None

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    import uuid
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pw,
        "role": user_data.role.value if hasattr(user_data.role, 'value') else user_data.role,
        "career_level": CareerLevel.RECRUTA.value,
        "base_salary": 1570.0,
        "active_base": 159,
        "time_in_company": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.users.insert_one(user_doc)
    token = create_token(user_id, user_doc["role"])
    
    user_response = {k: v for k, v in user_doc.items() if k != "password" and k != "_id"}
    
    return {"token": token, "user": user_response}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {k: v for k, v in user.items() if k != "password"}}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/users")
async def get_users(current_user: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@api_router.get("/kpis/{user_id}/{month}")
async def get_kpi(user_id: str, month: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    kpi = await db.kpis.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not kpi:
        import uuid
        kpi_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "month": month,
            "novos_ativos_meta": 12,
            "novos_ativos_realizado": 0,
            "churn_meta": 5.0,
            "churn_realizado": 0.0,
            "tpv_m1_meta": 100000.0,
            "tpv_m1_realizado": 0.0,
            "ativos_m1_meta": 10,
            "ativos_m1_realizado": 0,
            "migracao_hunter_meta": 70.0,
            "migracao_hunter_realizado": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.kpis.insert_one(kpi_doc)
        kpi = await db.kpis.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return kpi

@api_router.put("/kpis/{user_id}/{month}")
async def update_kpi(user_id: str, month: str, update: KPIUpdate, current_user: User = Depends(require_admin)):
    kpi = await db.kpis.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI não encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.kpis.update_one({"user_id": user_id, "month": month}, {"$set": update_data})
    updated_kpi = await db.kpis.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return updated_kpi

@api_router.get("/bonus/{user_id}/{month}")
async def get_bonus(user_id: str, month: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    bonus = await db.bonus.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not bonus:
        import uuid
        faixas = [
            {"faixa": "15k+", "tpv_min": 15000, "bonus_per_client": 50, "meta_min_clients": 5, "clients_count": 0},
            {"faixa": "30k+", "tpv_min": 30000, "bonus_per_client": 100, "meta_min_clients": 4, "clients_count": 0},
            {"faixa": "50k+", "tpv_min": 50000, "bonus_per_client": 200, "meta_min_clients": 3, "clients_count": 0},
            {"faixa": "100k+", "tpv_min": 100000, "bonus_per_client": 400, "meta_min_clients": 2, "clients_count": 0},
            {"faixa": "200k+", "tpv_min": 200000, "bonus_per_client": 800, "meta_min_clients": 1, "clients_count": 0}
        ]
        bonus_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "month": month,
            "faixas": faixas,
            "bonus_total": 0.0,
            "multiplicador": 0.0,
            "bonus_final": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.bonus.insert_one(bonus_doc)
        bonus = await db.bonus.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return bonus

@api_router.put("/bonus/{user_id}/{month}")
async def update_bonus(user_id: str, month: str, update: BonusUpdate, current_user: User = Depends(require_admin)):
    bonus = await db.bonus.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus não encontrado")
    
    bonus_total = sum(f["bonus_per_client"] * f["clients_count"] for f in update.faixas)
    
    kpi = await db.kpis.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    multiplicador = 0.0
    if kpi:
        atingimento_geral = 0.0
        weights = {"novos_ativos": 0.3, "churn": 0.2, "tpv_m1": 0.2, "ativos_m1": 0.15, "migracao_hunter": 0.15}
        
        if kpi["novos_ativos_meta"] > 0:
            atingimento_geral += (kpi["novos_ativos_realizado"] / kpi["novos_ativos_meta"]) * weights["novos_ativos"]
        if kpi["churn_meta"] > 0:
            churn_perc = (1 - (kpi["churn_realizado"] / kpi["churn_meta"])) if kpi["churn_realizado"] < kpi["churn_meta"] else 0
            atingimento_geral += churn_perc * weights["churn"]
        if kpi["tpv_m1_meta"] > 0:
            atingimento_geral += (kpi["tpv_m1_realizado"] / kpi["tpv_m1_meta"]) * weights["tpv_m1"]
        if kpi["ativos_m1_meta"] > 0:
            atingimento_geral += (kpi["ativos_m1_realizado"] / kpi["ativos_m1_meta"]) * weights["ativos_m1"]
        if kpi["migracao_hunter_meta"] > 0:
            atingimento_geral += (kpi["migracao_hunter_realizado"] / kpi["migracao_hunter_meta"]) * weights["migracao_hunter"]
        
        if atingimento_geral >= 1.0:
            multiplicador = 1.0
        elif atingimento_geral >= 0.8:
            multiplicador = 0.8
        else:
            multiplicador = 0.0
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    base_salary = user.get("base_salary", 1570.0) if user else 1570.0
    bonus_final = min(bonus_total * multiplicador, base_salary * 2)
    
    update_data = {
        "faixas": [f.model_dump() for f in update.faixas],
        "bonus_total": bonus_total,
        "multiplicador": multiplicador,
        "bonus_final": bonus_final,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bonus.update_one({"user_id": user_id, "month": month}, {"$set": update_data})
    updated_bonus = await db.bonus.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return updated_bonus

@api_router.get("/extrato/{user_id}/{month}")
async def get_extrato(user_id: str, month: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    extrato = await db.extrato.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not extrato:
        import uuid
        extrato_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "month": month,
            "bonus_time": 0.0,
            "bonus_rentabilizacao": 0.0,
            "historico_semestral": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.extrato.insert_one(extrato_doc)
        extrato = await db.extrato.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return extrato

@api_router.post("/dre/{user_id}")
async def create_dre(user_id: str, dre_data: DRECreate, current_user: User = Depends(require_admin)):
    import uuid
    custos_totais = dre_data.salario + dre_data.beneficios
    breakeven = custos_totais
    roi_percent = ((dre_data.receita - custos_totais) / custos_totais * 100) if custos_totais > 0 else 0
    payback_months = int(custos_totais / dre_data.receita) if dre_data.receita > 0 else 0
    
    dre_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "month": dre_data.month,
        "salario": dre_data.salario,
        "beneficios": dre_data.beneficios,
        "custos_totais": custos_totais,
        "receita": dre_data.receita,
        "breakeven": breakeven,
        "payback_months": payback_months,
        "roi_percent": roi_percent,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.dre.insert_one(dre_doc)
    return dre_doc

@api_router.get("/dre/{user_id}")
async def get_dre_list(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    dres = await db.dre.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return dres

@api_router.get("/forecast/{user_id}/{month}")
async def get_forecast(user_id: str, month: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    forecast = await db.forecast.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not forecast:
        import uuid
        forecast = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "month": month,
            "qualificacao": 0,
            "proposta": 0,
            "novo_cliente": 0,
            "novo_ativo": 0,
            "conv_qualif_proposta": 0.0,
            "conv_proposta_cliente": 0.0,
            "conv_cliente_ativo": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.forecast.insert_one(forecast)
    return forecast

@api_router.put("/forecast/{user_id}/{month}")
async def update_forecast(user_id: str, month: str, update: ForecastUpdate, current_user: User = Depends(require_admin)):
    forecast = await db.forecast.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    if not forecast:
        raise HTTPException(status_code=404, detail="Forecast não encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if "qualificacao" in update_data and update_data["qualificacao"] > 0:
        if "proposta" in update_data:
            update_data["conv_qualif_proposta"] = (update_data["proposta"] / update_data["qualificacao"]) * 100
    
    if "proposta" in update_data and update_data["proposta"] > 0:
        if "novo_cliente" in update_data:
            update_data["conv_proposta_cliente"] = (update_data["novo_cliente"] / update_data["proposta"]) * 100
    
    if "novo_cliente" in update_data and update_data["novo_cliente"] > 0:
        if "novo_ativo" in update_data:
            update_data["conv_cliente_ativo"] = (update_data["novo_ativo"] / update_data["novo_cliente"]) * 100
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.forecast.update_one({"user_id": user_id, "month": month}, {"$set": update_data})
    updated_forecast = await db.forecast.find_one({"user_id": user_id, "month": month}, {"_id": 0})
    return updated_forecast

@api_router.get("/competencias/{user_id}")
async def get_competencias(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    comp = await db.competencias.find_one({"user_id": user_id}, {"_id": 0})
    if not comp:
        import uuid
        comp = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "persistencia": 3,
            "influencia": 3,
            "relacionamento": 3,
            "organizacao": 3,
            "criatividade": 3,
            "media": 3.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.competencias.insert_one(comp)
    return comp

@api_router.put("/competencias/{user_id}")
async def update_competencias(user_id: str, update: CompetenciaUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    comp = await db.competencias.find_one({"user_id": user_id}, {"_id": 0})
    if not comp:
        raise HTTPException(status_code=404, detail="Competências não encontradas")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    valores = [
        update_data.get("persistencia", comp.get("persistencia", 3)),
        update_data.get("influencia", comp.get("influencia", 3)),
        update_data.get("relacionamento", comp.get("relacionamento", 3)),
        update_data.get("organizacao", comp.get("organizacao", 3)),
        update_data.get("criatividade", comp.get("criatividade", 3))
    ]
    update_data["media"] = sum(valores) / len(valores)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.competencias.update_one({"user_id": user_id}, {"$set": update_data})
    updated_comp = await db.competencias.find_one({"user_id": user_id}, {"_id": 0})
    return updated_comp

@api_router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    from datetime import datetime
    current_month = datetime.now().strftime("%Y-%m")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    kpi = await db.kpis.find_one({"user_id": user_id, "month": current_month}, {"_id": 0})
    bonus = await db.bonus.find_one({"user_id": user_id, "month": current_month}, {"_id": 0})
    forecast = await db.forecast.find_one({"user_id": user_id, "month": current_month}, {"_id": 0})
    competencias = await db.competencias.find_one({"user_id": user_id}, {"_id": 0})
    
    if not kpi:
        import uuid
        kpi = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "month": current_month,
            "novos_ativos_meta": 12,
            "novos_ativos_realizado": 0,
            "churn_meta": 5.0,
            "churn_realizado": 0.0,
            "tpv_m1_meta": 100000.0,
            "tpv_m1_realizado": 0.0,
            "ativos_m1_meta": 10,
            "ativos_m1_realizado": 0,
            "migracao_hunter_meta": 70.0,
            "migracao_hunter_realizado": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.kpis.insert_one(kpi)
    
    return {
        "user": user,
        "kpi": kpi,
        "bonus": bonus,
        "forecast": forecast,
        "competencias": competencias
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()