import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# Ensure SQLite path is always absolute to backend/ directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
default_sqlite_path = f"sqlite:///{os.path.join(backend_dir, 'aakashavani.db').replace('\\', '/')}"

from sqlalchemy import event, text

raw_db_url = os.getenv("DATABASE_URL", default_sqlite_path)

# Normalize postgres:// to postgresql:// for SQLAlchemy compatibility (Supabase / Render)
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

DB_PATH = raw_db_url

if DB_PATH.startswith("sqlite"):
    engine = create_engine(
        DB_PATH,
        connect_args={
            "check_same_thread": False,
            "timeout": 30
        },
        pool_pre_ping=True
    )

    # Enable High-Concurrency SQLite WAL Mode & Enterprise PRAGMAs
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        # WAL Mode enables simultaneous reading and writing without database locks
        cursor.execute("PRAGMA journal_mode=WAL")
        # Synchronous NORMAL ensures durability with maximum I/O throughput
        cursor.execute("PRAGMA synchronous=NORMAL")
        # Busy timeout instructs engine to wait up to 5,000ms for lock release
        cursor.execute("PRAGMA busy_timeout=5000")
        # Enforce relational integrity
        cursor.execute("PRAGMA foreign_keys=ON")
        # 64MB In-Memory Page Cache for rapid geospatial queries
        cursor.execute("PRAGMA cache_size=-64000")
        cursor.close()

else:
    # Supabase / RDS PostgreSQL connection with connection pooling & recycling
    engine = create_engine(
        DB_PATH,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=15,
        max_overflow=25
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_db_health() -> dict:
    """Performs an active database connection and query readiness probe."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            is_healthy = result == 1
            journal_mode = "WAL"
            if DB_PATH.startswith("sqlite"):
                try:
                    journal_mode = conn.execute(text("PRAGMA journal_mode")).scalar()
                except Exception:
                    pass
            return {
                "database_status": "HEALTHY" if is_healthy else "DEGRADED",
                "database_engine": "SQLite (WAL Mode)" if DB_PATH.startswith("sqlite") else "PostgreSQL (Pooled)",
                "journal_mode": str(journal_mode).upper(),
                "connection_test": "PASSED"
            }
    except Exception as e:
        return {
            "database_status": "UNHEALTHY",
            "error": str(e),
            "connection_test": "FAILED"
        }

