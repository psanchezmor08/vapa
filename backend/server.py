from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import logging
import uuid
import jwt
from passlib.context import CryptContext
import ipaddress
import qrcode
import io
import base64
import secrets
import string
import hashlib
import json
from urllib.parse import quote, unquote

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'vapa-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str = "viewer"  # admin, editor, viewer
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "viewer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: str
    author_id: str
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    published: bool = True

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    published: Optional[bool] = None

class SubnetCalculatorInput(BaseModel):
    ip_address: str
    cidr: int

class SubnetCalculatorOutput(BaseModel):
    network_address: str
    broadcast_address: str
    first_usable_ip: str
    last_usable_ip: str
    total_hosts: int
    usable_hosts: int
    subnet_mask: str
    wildcard_mask: str
    cidr: int
    ip_class: str
    network_binary: str
    subnet_binary: str

class QRGeneratorInput(BaseModel):
    text: str
    size: int = 300

class QRGeneratorOutput(BaseModel):
    qr_code: str  # Base64 encoded image

class PasswordGeneratorInput(BaseModel):
    length: int = 16
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True

class PasswordGeneratorOutput(BaseModel):
    password: str
    strength: str

class Base64Input(BaseModel):
    text: str
    encode: bool = True  # True for encode, False for decode

class Base64Output(BaseModel):
    result: str

class HashInput(BaseModel):
    text: str
    algorithm: str = "sha256"  # md5, sha1, sha256, sha512

class HashOutput(BaseModel):
    hash: str
    algorithm: str

class JSONValidatorInput(BaseModel):
    json_string: str

class JSONValidatorOutput(BaseModel):
    valid: bool
    formatted: Optional[str] = None
    error: Optional[str] = None

class UnitConverterInput(BaseModel):
    value: float
    from_unit: str  # bytes, kb, mb, gb, tb
    to_unit: str

class UnitConverterOutput(BaseModel):
    result: float
    from_unit: str
    to_unit: str

class UUIDGeneratorOutput(BaseModel):
    uuid: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordReset(BaseModel):
    new_password: str

class UserUpdate(BaseModel):
    role: Optional[str] = None

class URLEncoderInput(BaseModel):
    text: str
    encode: bool = True

class URLEncoderOutput(BaseModel):
    result: str

class PortAnalyzerInput(BaseModel):
    port: int

class PortAnalyzerOutput(BaseModel):
    port: int
    service: str
    description: str

# ============= AUTH HELPERS =============

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_current_active_editor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos suficientes")
    return current_user

async def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return current_user
# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, current_user: User = Depends(get_current_active_admin)):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return UserResponse(**user.model_dump())

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['id']}, expires_delta=access_token_expires
    )
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(get_current_active_admin)):
    users = await db.users.find({}, {"_id": 0}).to_list(100)
    result = []
    for u in users:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
        result.append(UserResponse(**u))
    return result

@api_router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_current_active_admin)):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return UserResponse(**user.model_dump())

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_active_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado"}

@api_router.put("/users/{user_id}/password")
async def reset_user_password(user_id: str, data: PasswordReset, current_user: User = Depends(get_current_active_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": get_password_hash(data.new_password)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Contraseña restablecida"}

@api_router.put("/auth/change-password")
async def change_my_password(data: PasswordChange, current_user: User = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"password_hash": get_password_hash(data.new_password)}}
    )
    return {"message": "Contraseña cambiada correctamente"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.model_dump())

# ============= BLOG ROUTES =============

@api_router.get("/blog/posts", response_model=List[BlogPost])
async def get_blog_posts(published_only: bool = True, credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    user_role = None
    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                u = await db.users.find_one({"id": user_id}, {"_id": 0})
                if u:
                    user_role = u.get("role")
        except:
            pass
    if user_role in ["admin", "editor", "viewer"]:
        query = {} if not published_only else {"published": True}
    else:
        query = {"published": True}
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post['updated_at'], str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

@api_router.get("/blog/posts/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if isinstance(post['created_at'], str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post['updated_at'], str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    
    return BlogPost(**post)

@api_router.post("/blog/posts", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate, current_user: User = Depends(get_current_active_editor)):
    # Generate slug from title
    slug = post_data.title.lower().replace(" ", "-").replace(":", "").replace("?", "")
    
    post = BlogPost(
        title=post_data.title,
        slug=slug,
        content=post_data.content,
        excerpt=post_data.excerpt,
        author_id=current_user.id,
        published=post_data.published
    )
    
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_posts.insert_one(doc)
    
    return post

@api_router.put("/blog/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostUpdate, current_user: User = Depends(get_current_active_editor)):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post_data.model_dump(exclude_unset=True)
    if update_data:
        if 'title' in update_data:
            update_data['slug'] = update_data['title'].lower().replace(" ", "-").replace(":", "").replace("?", "")
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated_post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated_post['created_at'], str):
        updated_post['created_at'] = datetime.fromisoformat(updated_post['created_at'])
    if isinstance(updated_post['updated_at'], str):
        updated_post['updated_at'] = datetime.fromisoformat(updated_post['updated_at'])
    
    return BlogPost(**updated_post)

@api_router.delete("/blog/posts/{post_id}")
async def delete_blog_post(post_id: str, current_user: User = Depends(get_current_active_editor)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

# ============= TOOLS ROUTES =============

@api_router.post("/tools/subnet-calculator", response_model=SubnetCalculatorOutput)
async def calculate_subnet(input_data: SubnetCalculatorInput):
    try:
        network = ipaddress.ip_network(f"{input_data.ip_address}/{input_data.cidr}", strict=False)
        
        # Get IP class
        first_octet = int(input_data.ip_address.split('.')[0])
        if first_octet < 128:
            ip_class = "A"
        elif first_octet < 192:
            ip_class = "B"
        elif first_octet < 224:
            ip_class = "C"
        elif first_octet < 240:
            ip_class = "D (Multicast)"
        else:
            ip_class = "E (Reserved)"
        
        # Calculate addresses
        all_hosts = list(network.hosts())
        first_usable = str(all_hosts[0]) if len(all_hosts) > 0 else str(network.network_address)
        last_usable = str(all_hosts[-1]) if len(all_hosts) > 0 else str(network.broadcast_address)
        
        # Binary representations
        network_binary = '.'.join([bin(int(x))[2:].zfill(8) for x in str(network.network_address).split('.')])
        subnet_binary = '.'.join([bin(int(x))[2:].zfill(8) for x in str(network.netmask).split('.')])
        
        # Wildcard mask
        wildcard = ipaddress.IPv4Address(int(network.hostmask))
        
        return SubnetCalculatorOutput(
            network_address=str(network.network_address),
            broadcast_address=str(network.broadcast_address),
            first_usable_ip=first_usable,
            last_usable_ip=last_usable,
            total_hosts=network.num_addresses,
            usable_hosts=network.num_addresses - 2 if network.num_addresses > 2 else 0,
            subnet_mask=str(network.netmask),
            wildcard_mask=str(wildcard),
            cidr=input_data.cidr,
            ip_class=ip_class,
            network_binary=network_binary,
            subnet_binary=subnet_binary
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid IP or CIDR: {str(e)}")

@api_router.post("/tools/qr-generator", response_model=QRGeneratorOutput)
async def generate_qr(input_data: QRGeneratorInput):
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(input_data.text)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return QRGeneratorOutput(qr_code=f"data:image/png;base64,{img_str}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating QR: {str(e)}")

@api_router.post("/tools/password-generator", response_model=PasswordGeneratorOutput)
async def generate_password(input_data: PasswordGeneratorInput):
    try:
        characters = ""
        if input_data.use_lowercase:
            characters += string.ascii_lowercase
        if input_data.use_uppercase:
            characters += string.ascii_uppercase
        if input_data.use_digits:
            characters += string.digits
        if input_data.use_symbols:
            characters += string.punctuation
        
        if not characters:
            raise HTTPException(status_code=400, detail="At least one character type must be selected")
        
        password = ''.join(secrets.choice(characters) for _ in range(input_data.length))
        
        # Calculate strength
        strength = "Weak"
        if input_data.length >= 12 and sum([input_data.use_uppercase, input_data.use_lowercase, input_data.use_digits, input_data.use_symbols]) >= 3:
            strength = "Strong"
        elif input_data.length >= 8:
            strength = "Medium"
        
        return PasswordGeneratorOutput(password=password, strength=strength)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating password: {str(e)}")

@api_router.post("/tools/base64", response_model=Base64Output)
async def base64_converter(input_data: Base64Input):
    try:
        if input_data.encode:
            result = base64.b64encode(input_data.text.encode()).decode()
        else:
            result = base64.b64decode(input_data.text).decode()
        return Base64Output(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@api_router.post("/tools/hash", response_model=HashOutput)
async def hash_generator(input_data: HashInput):
    try:
        if input_data.algorithm == "md5":
            hash_obj = hashlib.md5(input_data.text.encode())
        elif input_data.algorithm == "sha1":
            hash_obj = hashlib.sha1(input_data.text.encode())
        elif input_data.algorithm == "sha256":
            hash_obj = hashlib.sha256(input_data.text.encode())
        elif input_data.algorithm == "sha512":
            hash_obj = hashlib.sha512(input_data.text.encode())
        else:
            raise HTTPException(status_code=400, detail="Invalid algorithm")
        
        return HashOutput(hash=hash_obj.hexdigest(), algorithm=input_data.algorithm)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@api_router.post("/tools/json-validator", response_model=JSONValidatorOutput)
async def json_validator(input_data: JSONValidatorInput):
    try:
        parsed = json.loads(input_data.json_string)
        formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
        return JSONValidatorOutput(valid=True, formatted=formatted)
    except json.JSONDecodeError as e:
        return JSONValidatorOutput(valid=False, error=str(e))

@api_router.post("/tools/unit-converter", response_model=UnitConverterOutput)
async def unit_converter(input_data: UnitConverterInput):
    try:
        units = {"bytes": 1, "kb": 1024, "mb": 1024**2, "gb": 1024**3, "tb": 1024**4}
        
        from_bytes = input_data.value * units[input_data.from_unit.lower()]
        result = from_bytes / units[input_data.to_unit.lower()]
        
        return UnitConverterOutput(
            result=round(result, 4),
            from_unit=input_data.from_unit,
            to_unit=input_data.to_unit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@api_router.get("/tools/uuid-generator", response_model=UUIDGeneratorOutput)
async def uuid_generator():
    return UUIDGeneratorOutput(uuid=str(uuid.uuid4()))

@api_router.post("/tools/url-encoder", response_model=URLEncoderOutput)
async def url_encoder(input_data: URLEncoderInput):
    try:
        if input_data.encode:
            result = quote(input_data.text)
        else:
            result = unquote(input_data.text)
        return URLEncoderOutput(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@api_router.post("/tools/port-analyzer", response_model=PortAnalyzerOutput)
async def port_analyzer(input_data: PortAnalyzerInput):
    common_ports = {
        20: ("FTP Data", "File Transfer Protocol (Data)"),
        21: ("FTP Control", "File Transfer Protocol (Control)"),
        22: ("SSH", "Secure Shell"),
        23: ("Telnet", "Telnet Protocol"),
        25: ("SMTP", "Simple Mail Transfer Protocol"),
        53: ("DNS", "Domain Name System"),
        80: ("HTTP", "HyperText Transfer Protocol"),
        110: ("POP3", "Post Office Protocol v3"),
        143: ("IMAP", "Internet Message Access Protocol"),
        443: ("HTTPS", "HTTP Secure"),
        445: ("SMB", "Server Message Block"),
        3306: ("MySQL", "MySQL Database"),
        3389: ("RDP", "Remote Desktop Protocol"),
        5432: ("PostgreSQL", "PostgreSQL Database"),
        6379: ("Redis", "Redis Database"),
        8080: ("HTTP Proxy", "HTTP Alternative"),
        27017: ("MongoDB", "MongoDB Database"),
    }
    
    port_info = common_ports.get(input_data.port, ("Unknown", "Port not in common services database"))
    
    return PortAnalyzerOutput(
        port=input_data.port,
        service=port_info[0],
        description=port_info[1]
    )

@api_router.get("/")
async def root():
    return {"message": "VAPA.es API - Sistema de herramientas técnicas"}

# ============= STARTUP EVENT =============

@app.on_event("startup")
async def startup_event():
    # Create admin user if not exists
    admin_email = "admin@vapa.es"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logging.info(f"Admin user created: {admin_email} / admin123")
    
    # Create initial blog posts if not exist
    posts_count = await db.blog_posts.count_documents({})
    if posts_count == 0:
        initial_posts = [
            {
                "id": str(uuid.uuid4()),
                "title": "Subnetting IPv4: Guía Maestra para Administradores",
                "slug": "guia-subnetting-ipv4-redes",
                "content": "# Subnetting IPv4: Guía Maestra\n\nEl subnetting es una técnica fundamental en la administración de redes...",
                "excerpt": "Aprende a segmentar redes de forma profesional para mejorar la seguridad.",
                "author_id": "system",
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Seguridad Crítica en Contenedores Docker",
                "slug": "seguridad-docker-servidores-nas",
                "content": "# Seguridad en Docker\n\nLos contenedores Docker requieren consideraciones especiales de seguridad...",
                "excerpt": "Estrategias para proteger despliegues en NAS y OMV.",
                "author_id": "system",
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "JSON vs YAML: ¿Cuál es mejor para tu Proyecto?",
                "slug": "json-vs-yaml-comparativa",
                "content": "# JSON vs YAML\n\nAmbos formatos tienen sus ventajas y desventajas...",
                "excerpt": "Análisis de formatos de serialización de datos.",
                "author_id": "system",
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.blog_posts.insert_many(initial_posts)
        logging.info("Initial blog posts created")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(api_router)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
