"""
Copies all existing records from local SQLite (aakashavani.db) to Neon PostgreSQL.
"""
import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, OTPVerification

neon_url = os.getenv("DATABASE_URL")
if not neon_url or "sqlite" in neon_url:
    print("[ERROR] Please set DATABASE_URL to your PostgreSQL connection string in the environment.")
    print("Example: export DATABASE_URL='postgresql://neondb_owner:YOUR_PASSWORD@host/neondb?sslmode=require'")
    exit(1)

neon_engine = create_engine(neon_url)
NeonSession = sessionmaker(bind=neon_engine)
neon_db = NeonSession()

sqlite_conn = sqlite3.connect("aakashavani.db")
sqlite_c = sqlite_conn.cursor()

# Migrate Users
sqlite_c.execute("SELECT user_id, phone_number, email, pm_kisan_id, name, role, user_role, district, state, auth_provider, avatar_url, preferred_language, voice_enabled, low_bandwidth_mode, is_verified, password_hash, created_at, last_login_at FROM users")
rows = sqlite_c.fetchall()
migrated_users = 0

for r in rows:
    existing = neon_db.query(User).filter(User.user_id == r[0]).first()
    if not existing:
        u = User(
            user_id=r[0],
            phone_number=r[1],
            email=r[2],
            pm_kisan_id=r[3],
            name=r[4],
            role=r[5],
            user_role=r[6],
            district=r[7],
            state=r[8],
            auth_provider=r[9],
            avatar_url=r[10],
            preferred_language=r[11],
            voice_enabled=bool(r[12]),
            low_bandwidth_mode=bool(r[13]),
            is_verified=bool(r[14]),
            password_hash=r[15]
        )
        neon_db.add(u)
        migrated_users += 1

neon_db.commit()
print(f"[SUCCESS] Migrated {migrated_users} user records to Neon PostgreSQL!")

# Check total count in Neon
total_users = neon_db.query(User).count()
print(f"[SUCCESS] Total active users in Neon PostgreSQL: {total_users}")

neon_db.close()
sqlite_conn.close()
