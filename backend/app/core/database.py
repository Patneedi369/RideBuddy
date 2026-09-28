from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Database setup
db_url = settings.DATABASE_URL

def create_db_engine(url: str):
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(url, pool_pre_ping=True)
        # Test connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"[DATABASE WARNING] PostgreSQL connection failed: {e}. Falling back to SQLite.")
        return create_engine("sqlite:///./ridebuddy.db", connect_args={"check_same_thread": False})

engine = create_db_engine(db_url)



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
