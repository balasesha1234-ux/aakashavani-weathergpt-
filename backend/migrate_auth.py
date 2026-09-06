import sqlite3
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
db_file = os.path.join(backend_dir, "aakashavani.db")

print(f"Connecting to database: {db_file}")
conn = sqlite3.connect(db_file)
c = conn.cursor()

c.execute("PRAGMA table_info(users)")
cols = [row[1] for row in c.fetchall()]
print(f"Current columns in users: {cols}")

new_cols = [
    ("email", "VARCHAR(150)"),
    ("district", "VARCHAR(100) DEFAULT 'Hyderabad'"),
    ("state", "VARCHAR(100) DEFAULT 'Telangana'"),
    ("auth_provider", "VARCHAR(30) DEFAULT 'PHONE_OTP'"),
    ("avatar_url", "VARCHAR(255)"),
    ("last_login_at", "DATETIME")
]

for col_name, col_def in new_cols:
    if col_name not in cols:
        print(f"Adding column {col_name} to users table...")
        c.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")

# Create otp_verifications table
c.execute("""
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT 0,
    created_at DATETIME
)
""")
c.execute("CREATE INDEX IF NOT EXISTS ix_otp_phone ON otp_verifications(phone_number)")

conn.commit()
conn.close()
print("Migration completed successfully!")
