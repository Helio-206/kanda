# Backend — Kanda
### Guia de Desenvolvimento Passo a Passo

> **Stack:** FastAPI · Tortoise ORM · PostgreSQL + PostGIS · Celery · Redis · Cloudinary · Grounding DINO (Hugging Face)

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura do Projecto](#2-estrutura-do-projecto)
3. [Configuração do Ambiente](#3-configuração-do-ambiente)
4. [Models (Tortoise ORM)](#4-models-tortoise-orm)
5. [Schemas (Pydantic)](#5-schemas-pydantic)
6. [Identidade Anónima (UUID + Tracking Code)](#6-identidade-anónima-uuid--tracking-code)
7. [Upload de Imagens com Firebase Storage](#7-upload-de-imagens-com-firebase-storage)
8. [Integração com Grounding DINO (Hugging Face)](#8-integração-com-grounding-dino-hugging-face)
9. [Fila de Tarefas com Celery + Redis](#9-fila-de-tarefas-com-celery--redis)
10. [Endpoints da API (FastAPI)](#10-endpoints-da-api-fastapi)
11. [Lógica de Priorização](#11-lógica-de-priorização)
12. [Configuração com Docker Compose](#12-configuração-com-docker-compose)
13. [Variáveis de Ambiente](#13-variáveis-de-ambiente)
14. [Fluxo Completo de uma Denúncia](#14-fluxo-completo-de-uma-denúncia)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────┐     ┌─────────────────┐
│  React Native   │     │   React / Vite   │
│  (Cidadão App)  │     │   (Dashboard)    │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │  X-Device-ID (header) │  (sem token)
         ▼                       ▼
┌──────────────────────────────────────────┐
│              FastAPI (API Gateway)        │
│   - Identifica cidadão por device_uuid   │
│   - Gera tracking_code por ocorrência    │
│   - Aplica regras de negócio              │
│   - Expõe endpoints REST                  │
└───────────┬──────────────┬───────────────┘
            │              │
            ▼              ▼
     ┌──────────┐   ┌─────────────┐
     │  Redis   │   │ PostgreSQL  │
     │  (Fila)  │   │ + PostGIS   │
     └────┬─────┘   └─────────────┘
          │
          ▼
   ┌─────────────┐      ┌────────────────────────┐
   │Celery Worker│ ───► │Grounding DINO           │
   │(Background) │      │(Hugging Face Inference) │
   │             │      │Cloudinary               │
   └─────────────┘      └────────────────────────┘
```

**O que cada peça faz:**

| Componente | Responsabilidade |
|---|---|
| **FastAPI** | Recebe pedidos, identifica dispositivo, aplica regras de negócio |
| **Tortoise ORM** | Mapeamento entre Python e PostgreSQL |
| **PostgreSQL + PostGIS** | Persistência + consultas geoespaciais |
| **Redis** | Broker de mensagens para a fila de tarefas |
| **Celery** | Executa a análise de IA em segundo plano |
| **Cloudinary** | Armazenamento e entrega das fotos das ocorrências |
| **Grounding DINO (HF)** | Detecção e classificação de objectos nas imagens |

---

## 2. Estrutura do Projecto

```
cidade-em-foco-api/
│
├── app/
│   ├── __init__.py
│   ├── main.py                  # Ponto de entrada FastAPI
│   ├── config.py                # Variáveis de ambiente
│   │
│   ├── models/                  # Tortoise ORM Models
│   │   ├── __init__.py
│   │   ├── account.py
│   │   ├── entity.py
│   │   └── occurrence.py
│   │
│   ├── schemas/                 # Pydantic Schemas (validação)
│   │   ├── __init__.py
│   │   ├── account.py
│   │   ├── entity.py
│   │   └── occurrence.py
│   │
│   ├── routers/                 # Endpoints da API
│   │   ├── __init__.py
│   │   ├── occurrences.py
│   │   ├── tracking.py          # Consulta pública por tracking_code
│   │   ├── entities.py
│   │   └── dashboard.py
│   │
│   ├── services/                # Lógica de negócio
│   │   ├── __init__.py
│   │   ├── identity.py          # UUID anónimo + tracking code
│   │   ├── cloudinary.py        # Upload e validação de imagens
│   │   ├── vision.py            # Grounding DINO via Hugging Face
│   │   └── priority.py          # Algoritmo de priorização
│   │
│   └── tasks/                   # Celery Tasks
│       ├── __init__.py
│       └── ai_tasks.py
│
├── .env
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## 3. Configuração do Ambiente

### 3.1 Instalar dependências

```bash
pip install fastapi uvicorn tortoise-orm asyncpg \
    celery redis cloudinary \
    requests pillow python-dotenv \
    pydantic-settings
```

### 3.2 `requirements.txt`

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
tortoise-orm==0.21.3
asyncpg==0.29.0
celery==5.4.0
redis==5.0.4
cloudinary==1.40.0
requests==2.32.3
Pillow==10.3.0
python-dotenv==1.0.1
pydantic-settings==2.2.1
aerich==0.7.2
```

---

## 4. Models (Tortoise ORM)

Os models representam as tabelas no PostgreSQL. São três entidades principais.

### 4.1 `app/models/account.py`

```python
from tortoise import fields, models


class Account(models.Model):
    """
    Representa um utilizador da plataforma.
    Não existe login. A identidade é gerada automaticamente
    no dispositivo (UUID) e enviada como header em cada pedido.

    - Cidadão comum: is_admin=False, identificado apenas pelo device_uuid
    - Gestor público: is_admin=True, autenticado por API key simples
    """
    id = fields.UUIDField(pk=True)

    # UUID gerado no dispositivo móvel na primeira abertura do app
    # Guardado no AsyncStorage (React Native) e enviado como X-Device-ID
    device_uuid = fields.CharField(max_length=36, unique=True)

    # Campos opcionais — o cidadão pode preencher para receber actualizações
    contact_name = fields.CharField(max_length=255, null=True)
    contact_phone = fields.CharField(max_length=20, null=True)

    is_admin = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    # Relação inversa: um Account pode ter várias Occurrences
    reports: fields.ReverseRelation["Occurrence"]

    class Meta:
        table = "accounts"

    def __str__(self):
        return f"Device:{self.device_uuid[:8]}..."
```

### 4.2 `app/models/entity.py`

```python
from tortoise import fields, models


class Entity(models.Model):
    """
    Representa uma entidade pública responsável
    pela resolução de ocorrências.
    Exemplo: Secretaria de Obras, EPAL, ENDE.
    """
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    department = fields.CharField(max_length=100)
    contact_email = fields.CharField(max_length=255, null=True)
    # Categorias que esta entidade é responsável por resolver
    # Exemplo: ["buraco", "pavimento"]
    responsible_categories = fields.JSONField(default=list)
    created_at = fields.DatetimeField(auto_now_add=True)

    # Relação inversa
    assigned_occurrences: fields.ReverseRelation["Occurrence"]

    class Meta:
        table = "entities"

    def __str__(self):
        return f"{self.name} ({self.department})"
```

### 4.3 `app/models/occurrence.py`

```python
from tortoise import fields, models


class Occurrence(models.Model):
    """
    Representa uma denúncia feita por um cidadão.
    É o model central do sistema.
    """

    class Status(str):
        PENDING = "pendente"
        ANALYZING = "a_analisar"
        ANALYZED = "analisado"
        IN_PROGRESS = "em_andamento"
        RESOLVED = "resolvido"
        REJECTED = "rejeitado"

    id = fields.IntField(pk=True)

    # Código único de acompanhamento — entregue ao cidadão após a submissão
    # Formato: LUA-2026-XXXX (ex: LUA-2026-K3T8)
    # Permite consulta pública sem necessidade de login
    tracking_code = fields.CharField(max_length=20, unique=True, null=True)

    # Quem reportou (identificado pelo device_uuid, sem login)
    reporter = fields.ForeignKeyField(
        "models.Account",
        related_name="reports",
        on_delete=fields.CASCADE
    )

    # Entidade responsável por resolver (atribuída automaticamente ou manualmente)
    assigned_to = fields.ForeignKeyField(
        "models.Entity",
        related_name="assigned_occurrences",
        null=True,
        on_delete=fields.SET_NULL
    )

    # Dados da ocorrência
    category = fields.CharField(max_length=50, null=True)   # Preenchido pela IA
    description = fields.TextField(null=True)
    photo_url = fields.CharField(max_length=500)

    # Geolocalização
    latitude = fields.FloatField()
    longitude = fields.FloatField()
    address = fields.CharField(max_length=500, null=True)   # Endereço legível

    # Status e prioridade
    status = fields.CharField(max_length=20, default="pendente")
    priority = fields.IntField(default=1)  # 1 (baixa) a 5 (crítica)

    # Confiança da IA na classificação (0.0 a 1.0)
    ai_confidence = fields.FloatField(null=True)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    resolved_at = fields.DatetimeField(null=True)

    class Meta:
        table = "occurrences"

    def __str__(self):
        return f"Ocorrência #{self.id} — {self.category} ({self.status})"
```

### 4.4 Registar os models no `main.py`

```python
# app/main.py
from tortoise.contrib.fastapi import register_tortoise

TORTOISE_ORM = {
    "connections": {
        "default": "postgres://user:password@localhost:5432/cidade_em_foco"
    },
    "apps": {
        "models": {
            "models": [
                "app.models.account",
                "app.models.entity",
                "app.models.occurrence",
                "aerich.models"  # Para migrações
            ],
            "default_connection": "default",
        }
    },
}

register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,   # Em produção, usa aerich para migrações
    add_exception_handlers=True,
)
```

---

## 5. Schemas (Pydantic)

Os schemas validam os dados que entram e saem da API.

### 5.1 `app/schemas/occurrence.py`

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OccurrenceCreate(BaseModel):
    """
    Schema para criar uma nova ocorrência.
    Nota: a foto é enviada separadamente como UploadFile (multipart/form-data).
    Este schema valida apenas os campos de texto do formulário.
    """
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    description: Optional[str] = None
    address: Optional[str] = None
    # Campos opcionais para o cidadão receber actualizações
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None


class OccurrenceResponse(BaseModel):
    """Schema para retornar uma ocorrência ao cliente."""
    id: int
    tracking_code: Optional[str]   # Entregue ao cidadão após a submissão
    category: Optional[str]
    description: Optional[str]
    latitude: float
    longitude: float
    photo_url: str
    status: str
    priority: int
    ai_confidence: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrackingResponse(BaseModel):
    """Schema simplificado para consulta pública por tracking_code."""
    tracking_code: str
    category: Optional[str]
    status: str
    priority: int
    address: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OccurrenceStatusUpdate(BaseModel):
    """Schema para o gestor público actualizar o status."""
    status: str = Field(..., pattern="^(a_analisar|em_andamento|resolvido|rejeitado)$")
    assigned_to_id: Optional[int] = None
```

---

## 6. Identidade Anónima (UUID + Tracking Code)

Em vez de login, o sistema usa dois mecanismos complementares para identificar quem reporta e o que foi reportado.

### Como funciona

**No App Mobile (React Native):**
1. Na primeira abertura, o app gera um UUID v4 e guarda-o no `AsyncStorage`
2. Em cada pedido à API, o UUID é enviado no header `X-Device-ID`
3. O backend cria ou recupera o `Account` associado a esse UUID automaticamente

**O Tracking Code:**
- Gerado pelo backend no momento em que a denúncia é criada
- Formato legível: `LUA-2026-K3T8` (prefixo da cidade + ano + 4 caracteres aleatórios)
- Devolvido ao cidadão imediatamente após a submissão
- Permite consultar o status sem qualquer autenticação via `GET /track/{codigo}`

```
App abre pela 1ª vez
       │
       ▼
 Gera UUID v4 → guarda no AsyncStorage
       │
       ▼
 Envia POST /occurrences
 Header: X-Device-ID: "a1b2-c3d4-..."
       │
       ▼
 FastAPI cria Account (se não existir)
 FastAPI cria Occurrence
 FastAPI gera tracking_code: "LUA-2026-K3T8"
       │
       ▼
 Resposta ao cidadão:
 { "tracking_code": "LUA-2026-K3T8", ... }
       │
       ▼
 Cidadão guarda o código
 Pode consultar: GET /track/LUA-2026-K3T8
```

### 6.1 `app/services/identity.py`

```python
import random
import string
from datetime import datetime
from fastapi import Header, HTTPException
from app.models.account import Account


def generate_tracking_code(occurrence_id: int) -> str:
    """
    Gera um código de acompanhamento único e legível.
    Formato: LUA-YYYY-XXXX
    Exemplo: LUA-2026-K3T8
    """
    year = datetime.now().year
    # 4 caracteres alfanuméricos em maiúsculas (sem vogais para evitar palavras)
    chars = "BCDFGHJKLMNPQRSTVWXZ0123456789"
    suffix = "".join(random.choices(chars, k=4))
    return f"LUA-{year}-{suffix}"


async def get_device_account(
    x_device_id: str = Header(..., description="UUID gerado no dispositivo")
) -> Account:
    """
    Dependência do FastAPI para rotas de cidadão.
    Lê o UUID do header X-Device-ID e cria/recupera o Account.
    Sem este header, o pedido é rejeitado com 400.
    """
    if not x_device_id or len(x_device_id) < 10:
        raise HTTPException(
            status_code=400,
            detail="Header X-Device-ID inválido ou ausente."
        )

    account, _ = await Account.get_or_create(
        device_uuid=x_device_id
    )
    return account


async def get_admin_account(
    x_admin_key: str = Header(..., description="Chave de acesso do gestor público")
) -> Account:
    """
    Dependência para rotas exclusivas de gestores públicos.
    Autenticação simples por API key (suficiente para o MVP).
    Em produção, substituir por JWT ou OAuth2.
    """
    from app.config import settings

    if x_admin_key != settings.admin_api_key:
        raise HTTPException(
            status_code=403,
            detail="Chave de administrador inválida."
        )

    # Retorna ou cria a conta de admin genérica
    account, _ = await Account.get_or_create(
        device_uuid="admin",
        defaults={"is_admin": True}
    )
    return account
```

---

## 7. Upload de Imagens com Cloudinary

### Por que Cloudinary em vez de Firebase Storage?

O Cloudinary é uma plataforma de gestão de media com um tier gratuito generoso (25 créditos/mês, ~25 000 transformações). Para além do armazenamento, oferece **transformações automáticas de imagem via URL** — útil para redimensionar ou comprimir a foto antes de a enviar para o Grounding DINO, sem código adicional.

### Estratégia de upload: Server-side

Ao contrário do Firebase Storage (onde o mobile fazia o upload directamente), com o Cloudinary o **upload passa pelo backend FastAPI**. O mobile envia a imagem em `multipart/form-data`, o FastAPI faz o upload para o Cloudinary e devolve a URL segura.

```
App Mobile
     │
     │  POST /occurrences  (multipart/form-data)
     │  Campo "photo": bytes da imagem
     │  Campo "data": JSON com lat/lng/description
     │
     ▼
FastAPI
     │
     │  1. Recebe os bytes da imagem
     │  2. Faz upload para o Cloudinary
     │  3. Guarda a secure_url retornada
     │  4. Cria a Occurrence com essa URL
     │  5. Despacha para a fila Celery
     │
     ▼
Cloudinary
     │  → Armazena a imagem
     │  → Retorna: { secure_url: "https://res.cloudinary.com/..." }
```

### 7.1 Configuração da conta Cloudinary

1. Criar conta gratuita em [cloudinary.com](https://cloudinary.com)
2. No dashboard, copiar as três credenciais: `CLOUD_NAME`, `API_KEY`, `API_SECRET`
3. Colocar no `.env` (ver secção 13)

### 7.2 `app/services/cloudinary.py`

```python
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException


def init_cloudinary(cloud_name: str, api_key: str, api_secret: str) -> None:
    """
    Inicializa o SDK do Cloudinary com as credenciais do projecto.
    Chamado uma única vez no arranque do FastAPI (app/main.py).
    """
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,  # Garante URLs https://
    )


def upload_occurrence_image(image_bytes: bytes, occurrence_id: int) -> str:
    """
    Faz o upload da imagem para o Cloudinary.
    Retorna a secure_url da imagem armazenada.

    Parâmetros de upload:
    - folder: organiza as imagens numa pasta dedicada
    - public_id: nome único baseado no ID da ocorrência
    - resource_type: "image" (aceita jpg, png, webp, etc.)
    - quality: "auto" — Cloudinary optimiza automaticamente
    - fetch_format: "auto" — serve webp para browsers modernos
    """
    try:
        result = cloudinary.uploader.upload(
            image_bytes,
            folder="cidade-em-foco/occurrences",
            public_id=f"occurrence_{occurrence_id}",
            resource_type="image",
            transformation=[
                {"quality": "auto", "fetch_format": "auto"},
                {"width": 1280, "crop": "limit"},  # Máximo 1280px de largura
            ],
        )
        return result["secure_url"]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload da imagem: {str(e)}"
        )


def validate_cloudinary_url(url: str) -> bool:
    """
    Verifica se a URL pertence ao Cloudinary do projecto.
    Usado como camada extra de validação antes de processar a imagem.
    """
    return "res.cloudinary.com" in url
```

### 7.3 Inicializar no `app/main.py`

```python
# app/main.py
from fastapi import FastAPI
from app.config import settings
from app.services.cloudinary import init_cloudinary

app = FastAPI(title="Cidade em Foco API")

# Inicializa o Cloudinary no arranque
init_cloudinary(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)
```

### 7.4 Actualizar o endpoint de criação de ocorrência

Como o upload agora passa pelo backend, o endpoint muda de `JSON` para `multipart/form-data`:

```python
# app/routers/occurrences.py (trecho actualizado)
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from app.services.cloudinary import upload_occurrence_image


@router.post("/", response_model=OccurrenceResponse, status_code=202)
async def create_occurrence(
    photo: UploadFile = File(..., description="Foto da ocorrência"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    contact_name: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    user: Account = Depends(get_device_account)
):
    """
    Cidadão submete uma nova denúncia com foto.
    O upload para o Cloudinary é feito aqui no backend.
    """
    # Valida o tipo de ficheiro
    if photo.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagem inválido. Use JPEG, PNG ou WebP."
        )

    # Cria a ocorrência primeiro para ter o ID disponível
    occurrence = await Occurrence.create(
        reporter=user,
        photo_url="",          # Preenchido após o upload
        latitude=latitude,
        longitude=longitude,
        description=description,
        address=address,
        status="pendente",
    )

    # Faz o upload da imagem para o Cloudinary
    image_bytes = await photo.read()
    photo_url = upload_occurrence_image(image_bytes, occurrence.id)

    # Gera o tracking code e actualiza a ocorrência
    tracking_code = generate_tracking_code(occurrence.id)
    await Occurrence.filter(id=occurrence.id).update(
        photo_url=photo_url,
        tracking_code=tracking_code
    )
    occurrence.photo_url = photo_url
    occurrence.tracking_code = tracking_code

    # Actualiza contactos opcionais
    if contact_name or contact_phone:
        await Account.filter(id=user.id).update(
            contact_name=contact_name,
            contact_phone=contact_phone
        )

    # Despacha para a fila Celery
    process_ai_analysis.delay(occurrence.id)

    return occurrence
```

---

## 8. Integração com Grounding DINO (Hugging Face)

### O que é o Grounding DINO?

O Grounding DINO é um modelo de detecção de objectos open-source que combina detecção visual com linguagem natural. Em vez de retornar apenas labels genéricos, ele recebe **prompts de texto** e detecta exactamente o que foi pedido na imagem — ideal para o nosso caso porque podemos perguntar directamente: *"buraco . lixo acumulado . lâmpada avariada"*.

Usamos a Hugging Face Inference API, que executa o modelo num servidor remoto sem precisar de GPU própria.

### Como funciona no sistema

```
Celery Worker
     │
     │  1. Descarrega a imagem do Firebase Storage
     │
     ▼
Grounding DINO (HF Inference API)
     │
     │  Prompt: "pothole . garbage pile . broken lamp . flood . graffiti"
     │
     │  2. Retorna bounding boxes + scores para cada objecto detectado
     │     Ex: [{ "label": "pothole", "score": 0.91, "box": {...} }]
     │
     ▼
     │  3. Mapeia o label detectado para a categoria do sistema
     │     "pothole" → "buraco"
     │
     ▼
  Actualiza Occurrence no banco
```

### 8.1 `app/services/vision.py`

```python
import requests
import io
from PIL import Image
from typing import Tuple


# Categorias que o modelo vai procurar na imagem
# Separadas por " . " — sintaxe do Grounding DINO
GROUNDING_PROMPT = (
    "pothole . road damage . garbage pile . trash . broken street light . "
    "flood water . water leak . graffiti . damaged pavement"
)

# Mapeamento de labels do modelo para categorias do sistema
LABEL_TO_CATEGORY = {
    "pothole": "buraco",
    "road damage": "buraco",
    "damaged pavement": "buraco",
    "garbage pile": "lixo",
    "trash": "lixo",
    "broken street light": "iluminacao",
    "flood water": "inundacao",
    "water leak": "fuga_de_agua",
    "graffiti": "vandalismo",
}

HF_API_URL = (
    "https://api-inference.huggingface.co/models/IDEA-Research/grounding-dino-tiny"
)


def _download_image_bytes(image_url: str) -> bytes:
    """
    Descarrega a imagem a partir da URL segura do Cloudinary
    e retorna os bytes em formato JPEG.

    As URLs do Cloudinary são públicas e não requerem autenticação,
    pelo que um requests.get simples é suficiente.
    """
    response = requests.get(image_url, timeout=15)
    response.raise_for_status()

    # Converte para JPEG via Pillow para garantir compatibilidade
    image = Image.open(io.BytesIO(response.content)).convert("RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def analyze_image(image_url: str, hf_token: str) -> Tuple[str, float]:
    """
    Envia a imagem para o Grounding DINO via Hugging Face Inference API.
    Retorna (categoria_do_sistema, score_de_confiança).

    O modelo recebe um prompt de texto com as categorias a detectar
    e devolve os objectos encontrados com os respectivos scores.
    """
    image_bytes = _download_image_bytes(image_url)

    headers = {"Authorization": f"Bearer {hf_token}"}

    # A API do HF aceita a imagem como bytes no body
    # e os parâmetros como query string
    params = {"candidate_labels": GROUNDING_PROMPT}

    response = requests.post(
        HF_API_URL,
        headers=headers,
        params=params,
        data=image_bytes,
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(
            f"Erro Hugging Face API: {response.status_code} — {response.text}"
        )

    detections = response.json()
    # Resposta esperada: lista de { "label": str, "score": float, "box": {...} }

    if not detections:
        return "outro", 0.5

    # Ordena por score e pega o objecto mais confiante
    best = max(detections, key=lambda d: d.get("score", 0))
    label = best.get("label", "").lower()
    score = round(best.get("score", 0.5), 2)

    # Mapeia para a categoria do sistema
    for key, category in LABEL_TO_CATEGORY.items():
        if key in label:
            return category, score

    return "outro", score
```

> **Nota para o Hackathon:** A Hugging Face oferece um tier gratuito para a Inference API. Basta criar uma conta em [huggingface.co](https://huggingface.co), gerar um Access Token e colocá-lo no `.env` como `HF_TOKEN`. O modelo `grounding-dino-tiny` é a versão mais leve e responde em ~2–4 segundos.

---

## 9. Fila de Tarefas com Celery + Redis

### Por que usar uma fila aqui?

Quando um cidadão submete uma denúncia, a chamada ao Grounding DINO (Hugging Face) pode demorar 3 a 6 segundos. Sem uma fila, o servidor ficaria bloqueado durante esse tempo. Com a fila:

1. O FastAPI responde **imediatamente** ao utilizador: `"Denúncia recebida!"`
2. O Celery Worker processa a análise **em segundo plano**
3. O banco de dados é actualizado quando a IA terminar

```
FastAPI          Redis (Fila)       Celery Worker
  │                  │                    │
  │── envia task ──► │                    │
  │◄─ 202 Aceite ────│                    │
  │                  │── pega task ──────►│
  │                  │                   │── chama Grounding DINO (HF)
  │                  │                   │── calcula prioridade
  │                  │                   │── actualiza BD
```

### 9.1 Configuração do Celery

```python
# app/tasks/__init__.py
from celery import Celery

celery_app = Celery(
    "cidade_em_foco",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks.ai_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Africa/Luanda",
    enable_utc=True,
    # Tenta novamente em caso de falha (até 3 vezes)
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)
```

### 9.2 A Task de Análise de IA

```python
# app/tasks/ai_tasks.py
import asyncio
import os
from app.tasks import celery_app
from app.services.vision import analyze_image
from app.services.priority import calculate_priority
from app.models.occurrence import Occurrence


@celery_app.task(bind=True, max_retries=3)
def process_ai_analysis(self, occurrence_id: int):
    """
    Task executada em background.
    1. Busca a ocorrência no banco
    2. Analisa a imagem com o Grounding DINO via Hugging Face
    3. Calcula a prioridade
    4. Actualiza o banco
    """
    async def _run():
        try:
            occurrence = await Occurrence.get(id=occurrence_id)

            # Actualiza status para "a_analisar"
            await Occurrence.filter(id=occurrence_id).update(
                status="a_analisar"
            )

            # Chama o Grounding DINO via Hugging Face Inference API
            hf_token = os.environ.get("HF_TOKEN", "")
            category, confidence = analyze_image(occurrence.photo_url, hf_token)

            # Calcula a prioridade com base na categoria e contexto
            priority = calculate_priority(
                category=category,
                latitude=occurrence.latitude,
                longitude=occurrence.longitude
            )

            # Atribui automaticamente à entidade responsável
            entity = await _find_responsible_entity(category)

            # Actualiza a ocorrência com os dados da IA
            await Occurrence.filter(id=occurrence_id).update(
                category=category,
                ai_confidence=confidence,
                priority=priority,
                status="analisado",
                assigned_to=entity
            )

        except Exception as exc:
            # Em caso de erro, tenta novamente após 60 segundos
            raise self.retry(exc=exc, countdown=60)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(_run())

            # Actualiza a ocorrência com os dados da IA
            await Occurrence.filter(id=occurrence_id).update(
                category=category,
                ai_confidence=confidence,
                priority=priority,
                status="analisado",
                assigned_to=entity
            )

        except Exception as exc:
            # Em caso de erro, tenta novamente após 60 segundos
            raise self.retry(exc=exc, countdown=60)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(_run())


async def _find_responsible_entity(category: str):
    """
    Encontra a entidade responsável com base na categoria da ocorrência.
    """
    from app.models.entity import Entity

    entities = await Entity.all()
    for entity in entities:
        if category in (entity.responsible_categories or []):
            return entity
    return None
```

---

## 10. Endpoints da API (FastAPI)

### 10.1 `app/routers/occurrences.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.occurrence import Occurrence
from app.models.account import Account
from app.schemas.occurrence import (
    OccurrenceCreate,
    OccurrenceResponse,
    OccurrenceStatusUpdate,
    TrackingResponse
)
from app.services.identity import get_device_account, get_admin_account, generate_tracking_code
from app.tasks.ai_tasks import process_ai_analysis

router = APIRouter(prefix="/occurrences", tags=["Ocorrências"])


@router.post("/", response_model=OccurrenceResponse, status_code=202)
async def create_occurrence(
    data: OccurrenceCreate,
    user: Account = Depends(get_device_account)
):
    """
    Cidadão submete uma nova denúncia.
    Identificado pelo header X-Device-ID (UUID gerado no dispositivo).
    A IA é processada em background (fila Celery).
    Retorna 202 Accepted imediatamente com o tracking_code.
    """
    # Actualiza os dados de contacto opcionais no Account
    if data.contact_name or data.contact_phone:
        await Account.filter(id=user.id).update(
            contact_name=data.contact_name,
            contact_phone=data.contact_phone
        )

    occurrence = await Occurrence.create(
        reporter=user,
        photo_url=data.photo_url,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        address=data.address,
        status="pendente",
    )

    # Gera o tracking code e associa à ocorrência
    tracking_code = generate_tracking_code(occurrence.id)
    await Occurrence.filter(id=occurrence.id).update(tracking_code=tracking_code)
    occurrence.tracking_code = tracking_code

    # Despacha para a fila (não bloqueia o response)
    process_ai_analysis.delay(occurrence.id)

    return occurrence


@router.get("/my", response_model=List[OccurrenceResponse])
async def get_my_occurrences(
    user: Account = Depends(get_device_account)
):
    """
    Retorna todas as denúncias do dispositivo actual.
    Identificado pelo header X-Device-ID.
    """
    return await Occurrence.filter(reporter=user).order_by("-created_at")


@router.get("/track/{tracking_code}", response_model=TrackingResponse)
async def track_occurrence(tracking_code: str):
    """
    Endpoint PÚBLICO — não requer nenhum header.
    Qualquer pessoa com o código pode consultar o status da denúncia.
    Exemplo: GET /occurrences/track/LUA-2026-K3T8
    """
    occurrence = await Occurrence.get_or_none(tracking_code=tracking_code.upper())
    if not occurrence:
        raise HTTPException(
            status_code=404,
            detail="Código de acompanhamento não encontrado."
        )
    return occurrence


@router.patch("/{occurrence_id}/status", response_model=OccurrenceResponse)
async def update_occurrence_status(
    occurrence_id: int,
    data: OccurrenceStatusUpdate,
    admin: Account = Depends(get_admin_account)
):
    """
    Gestor público actualiza o status de uma ocorrência.
    Requer header X-Admin-Key com a chave de administrador.
    """
    occurrence = await Occurrence.get_or_none(id=occurrence_id)
    if not occurrence:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada.")

    update_data = {"status": data.status}

    if data.status == "resolvido":
        from datetime import datetime
        update_data["resolved_at"] = datetime.utcnow()

    if data.assigned_to_id:
        update_data["assigned_to_id"] = data.assigned_to_id

    await Occurrence.filter(id=occurrence_id).update(**update_data)
    return await Occurrence.get(id=occurrence_id)
```

### 10.2 `app/routers/dashboard.py` (para o painel de gestão)

```python
from fastapi import APIRouter, Depends
from app.models.occurrence import Occurrence
from app.models.account import Account
from app.services.identity import get_admin_account

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_stats(admin: Account = Depends(get_admin_account)):
    """
    KPIs para o painel do gestor público.
    """
    total = await Occurrence.all().count()
    pending = await Occurrence.filter(status="pendente").count()
    in_progress = await Occurrence.filter(status="em_andamento").count()
    resolved = await Occurrence.filter(status="resolvido").count()

    return {
        "total_occurrences": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "resolution_rate": round((resolved / total * 100), 1) if total > 0 else 0,
    }


@router.get("/occurrences/priority")
async def get_occurrences_by_priority(admin: Account = Depends(get_admin_account)):
    """
    Lista todas as ocorrências ordenadas por prioridade (críticas primeiro).
    Base para o mapa de calor e a fila de trabalho do gestor.
    """
    occurrences = await Occurrence.all().order_by("-priority", "-created_at").prefetch_related("reporter", "assigned_to")
    return occurrences


@router.get("/heatmap")
async def get_heatmap_data(admin: Account = Depends(get_admin_account)):
    """
    Retorna coordenadas e pesos para construir o mapa de calor no frontend.
    """
    occurrences = await Occurrence.filter(
        status__not_in=["resolvido", "rejeitado"]
    ).values("latitude", "longitude", "priority")

    return [
        {
            "lat": o["latitude"],
            "lng": o["longitude"],
            "weight": o["priority"]  # Prioridade usada como peso no heatmap
        }
        for o in occurrences
    ]
```

---

## 11. Lógica de Priorização

Este é o "diferencial inteligente" do sistema. Em vez de ordenar por ordem de chegada, o algoritmo atribui uma prioridade de 1 a 5 com base em múltiplos factores.

### 11.1 `app/services/priority.py`

```python
from typing import Optional


# Pontuação base por categoria
CATEGORY_SCORES = {
    "buraco": 3,
    "inundacao": 5,
    "fuga_de_agua": 4,
    "iluminacao": 3,
    "lixo": 2,
    "vandalismo": 1,
    "outro": 1,
}

# Coordenadas de locais sensíveis em Luanda (exemplo)
# Em produção, estes dados viriam de uma tabela na base de dados
SENSITIVE_LOCATIONS = [
    {"name": "Hospital Josina Machel", "lat": -8.8227, "lng": 13.2343, "radius_km": 0.5},
    {"name": "Escola Primária do Miramar", "lat": -8.8150, "lng": 13.2400, "radius_km": 0.3},
    # Adicionar mais locais...
]


def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calcula a distância em km entre dois pontos geográficos.
    Fórmula de Haversine.
    """
    import math

    R = 6371  # Raio da Terra em km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(d_lng / 2) ** 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _is_near_sensitive_location(lat: float, lng: float) -> bool:
    """
    Verifica se a ocorrência está perto de um local sensível
    (hospital, escola, etc.).
    """
    for location in SENSITIVE_LOCATIONS:
        distance = _haversine_distance(lat, lng, location["lat"], location["lng"])
        if distance <= location["radius_km"]:
            return True
    return False


def calculate_priority(
    category: str,
    latitude: float,
    longitude: float,
    duplicate_count: int = 1
) -> int:
    """
    Calcula a prioridade de 1 (baixa) a 5 (crítica).

    Factores considerados:
    - Tipo de problema (categorias mais perigosas têm score maior)
    - Proximidade de locais sensíveis (+1 ponto)
    - Número de denúncias duplicadas no mesmo local (+1 ponto se > 3)

    Returns: int entre 1 e 5
    """
    score = CATEGORY_SCORES.get(category, 1)

    # Bónus por proximidade de local sensível
    if _is_near_sensitive_location(latitude, longitude):
        score += 1

    # Bónus por múltiplas denúncias no mesmo local
    if duplicate_count >= 3:
        score += 1

    # Garante que fica entre 1 e 5
    return max(1, min(5, score))
```

---

## 12. Configuração com Docker Compose

O Docker Compose levanta toda a infraestrutura local com um único comando: `docker-compose up`.

### `docker-compose.yml`

```yaml
version: "3.9"

services:

  # A API FastAPI
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgres://cidade_user:cidade_pass@db:5432/cidade_em_foco
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # O Worker Celery (processa a fila)
  worker:
    build: .
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgres://cidade_user:cidade_pass@db:5432/cidade_em_foco
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    command: celery -A app.tasks worker --loglevel=info

  # PostgreSQL com extensão PostGIS
  db:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: cidade_user
      POSTGRES_PASSWORD: cidade_pass
      POSTGRES_DB: cidade_em_foco
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis (broker da fila)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### `Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
```

### Iniciar o projecto

```bash
# Levantar todos os serviços
docker-compose up --build

# API disponível em: http://localhost:8000
# Documentação automática: http://localhost:8000/docs
```

---

## 13. Variáveis de Ambiente

### `.env`

```env
# Base de Dados
DATABASE_URL=postgres://cidade_user:cidade_pass@localhost:5432/cidade_em_foco

# Redis
REDIS_URL=redis://localhost:6379/0

# Cloudinary — credenciais disponíveis no dashboard em cloudinary.com
CLOUDINARY_CLOUD_NAME=o-teu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Hugging Face — token de acesso para a Inference API
# Criar em: https://huggingface.co/settings/tokens
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Chave de acesso simples para o dashboard de administrador
# Trocar por algo seguro antes de qualquer deploy
ADMIN_API_KEY=cidade_admin_2026
```

### `app/config.py`

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    hf_token: str
    admin_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()
```

---

## 14. Fluxo Completo de uma Denúncia

Este é o resumo end-to-end de tudo que acontece desde o momento que o cidadão tira uma foto até o gestor resolver o problema.

```
CIDADÃO (App Mobile)
│
│  1. Abre o app pela primeira vez
│     → Gera UUID v4 → guarda no AsyncStorage
│     → Ex: "a1b2c3d4-e5f6-..."
│
│  2. Tira foto + captura GPS
│     → A foto fica guardada localmente no dispositivo
│     → Não há upload directo para a nuvem
│
│  3. POST /occurrences  (multipart/form-data)
│     Header: X-Device-ID: "a1b2c3d4-e5f6-..."
│     Campo photo: <bytes da imagem>
│     Campos: latitude, longitude, description (Form fields)
│     Campos opcionais: contact_name, contact_phone
│
▼
FASTAPI
│
│  4. Lê o X-Device-ID (get_device_account)
│     → Busca ou cria o Account no PostgreSQL
│     → Sem login, sem password, sem JWT
│
│  5. Valida o tipo de ficheiro (jpeg/png/webp)
│
│  6. Cria a Occurrence no banco com photo_url=""
│
│  7. Faz upload da imagem para o Cloudinary
│     → upload_occurrence_image(image_bytes, occurrence.id)
│     → Cloudinary optimiza, redimensiona e devolve:
│        { "secure_url": "https://res.cloudinary.com/..." }
│
│  8. Gera o tracking_code: "LUA-2026-K3T8"
│     Actualiza a Occurrence com photo_url e tracking_code
│
│  9. Envia process_ai_analysis.delay(occurrence_id) → Redis
│
│  10. Retorna 202 Accepted ao utilizador:
│      { "tracking_code": "LUA-2026-K3T8", "status": "pendente", ... }
│
▼
CELERY WORKER (em paralelo)
│
│  11. Pega a task da fila Redis
│
│  12. Actualiza status para "a_analisar"
│
│  13. Descarrega a imagem do Cloudinary (URL pública, sem auth)
│      Envia para Grounding DINO (Hugging Face)
│      Prompt: "pothole . garbage pile . broken street light ..."
│      → Recebe: [{ "label": "pothole", "score": 0.91 }]
│      → Mapeia: "pothole" → categoria: "buraco", confiança: 0.91
│
│  14. Calcula prioridade
│      → category="buraco" → score=3
│      → perto de escola? → score=4
│      → Prioridade final: 4
│
│  15. Encontra a Entity responsável
│      → Entity "Secretaria de Obras" (responsible_categories inclui "buraco")
│
│  16. Actualiza a Occurrence no banco:
│      status: "analisado"
│      category: "buraco"
│      priority: 4
│      assigned_to: Entity#1
│      ai_confidence: 0.91
│
▼
GESTOR PÚBLICO (Dashboard React/Vite)
│
│  17. GET /dashboard/occurrences/priority
│      Header: X-Admin-Key: "cidade_admin_2026"
│      → Vê a denúncia no topo da fila (prioridade 4)
│
│  18. Abre o mapa de calor
│      → GET /dashboard/heatmap
│      → Visualiza o ponto vermelho no bairro X
│
│  19. Despacha equipa de manutenção
│      PATCH /occurrences/42/status
│      Header: X-Admin-Key: "cidade_admin_2026"
│      Body: { status: "em_andamento", assigned_to_id: 1 }
│
│  20. Após resolução:
│      PATCH /occurrences/42/status
│      Body: { status: "resolvido" }
│
▼
CIDADÃO (consulta pública — sem header)
│
│  21. GET /occurrences/track/LUA-2026-K3T8
│      → Sem autenticação, sem UUID
│      → Resposta: { status: "resolvido", category: "buraco", ... } ✅
```

---

## Resumo dos Endpoints

| Método | Endpoint | Header necessário | Descrição |
|---|---|---|---|
| `POST` | `/occurrences/` | `X-Device-ID` | Criar nova denúncia (multipart/form-data) |
| `GET` | `/occurrences/my` | `X-Device-ID` | Ver as minhas denúncias |
| `GET` | `/occurrences/track/{codigo}` | *(nenhum)* | Consulta pública por tracking code |
| `PATCH` | `/occurrences/{id}/status` | `X-Admin-Key` | Actualizar status |
| `GET` | `/dashboard/stats` | `X-Admin-Key` | KPIs gerais |
| `GET` | `/dashboard/occurrences/priority` | `X-Admin-Key` | Lista por prioridade |
| `GET` | `/dashboard/heatmap` | `X-Admin-Key` | Dados para o mapa de calor |

---

*Documento técnico — Cidade em Foco | Backend Guide v3.0*
