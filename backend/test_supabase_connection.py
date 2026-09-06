"""
Utility script to test and initialize a Supabase PostgreSQL connection.
Usage:
    python test_supabase_connection.py "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
"""
import sys
import os

def test_connection(connection_string: str = None):
    if not connection_string:
        connection_string = os.getenv("DATABASE_URL")
    
    if not connection_string or connection_string.startswith("sqlite"):
        print("[-] Please provide a valid Supabase PostgreSQL connection string.")
        print("    Example: python test_supabase_connection.py \"postgresql://postgres:your_pass@db.xyz.supabase.co:5432/postgres\"")
        return False

    if connection_string.startswith("postgres://"):
        connection_string = connection_string.replace("postgres://", "postgresql://", 1)

    print(f"[+] Connecting to Supabase PostgreSQL at:\n    {connection_string.split('@')[-1] if '@' in connection_string else connection_string}...")
    
    from sqlalchemy import create_engine, text
    from app.models import Base
    
    try:
        engine = create_engine(connection_string, pool_pre_ping=True)
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version();")).scalar()
            print(f"[SUCCESS] Connected to Supabase PostgreSQL!\n    Database Engine: {version[:50]}...")
            
            # Check PostGIS extension
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                print("[SUCCESS] PostGIS extension initialized for geospatial meteorological telemetry!")
            except Exception as e:
                print(f"[INFO] PostGIS check: {e}")

        # Create all tables
        print("[+] Creating AakashaVani database schema (users, otp_verifications, patterns, subscriptions, chat_history)...")
        Base.metadata.create_all(engine)
        print("[SUCCESS] All tables successfully created and synchronized with Supabase!")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to connect to Supabase: {e}")
        return False

if __name__ == "__main__":
    conn_str = sys.argv[1] if len(sys.argv) > 1 else None
    test_connection(conn_str)
