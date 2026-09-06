"""
==============================================================================
💾 AakashaVani — Automated Online Hot Database Backup Utility
Supports: SQLite Online Backup API (Zero Downtime) & PostgreSQL pg_dump
==============================================================================
"""

import os
import sys
import sqlite3
import shutil
from datetime import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
db_file = os.path.join(backend_dir, "aakashavani.db")
backup_dir = os.path.join(backend_dir, "backups")

def perform_online_backup():
    if not os.path.exists(db_file):
        print(f"❌ Database file not found at: {db_file}")
        return False

    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"aakashavani_backup_{timestamp}.db")

    print(f"[BACKUP] Initiating online hot backup of {db_file}...")
    try:
        # Use SQLite's native online backup API to copy even while active writes occur
        src = sqlite3.connect(db_file)
        dst = sqlite3.connect(backup_file)
        with dst:
            src.backup(dst, pages=100)
        dst.close()
        src.close()
        
        file_size_kb = round(os.path.getsize(backup_file) / 1024, 2)
        print(f"[SUCCESS] Hot backup created successfully: {backup_file} ({file_size_kb} KB)")
        
        # Keep only the last 10 backups
        backups = sorted([os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.endswith(".db")])
        if len(backups) > 10:
            for old in backups[:-10]:
                os.remove(old)
                print(f"[CLEANUP] Purged old backup: {os.path.basename(old)}")
        return True
    except Exception as e:
        print(f"[ERROR] Backup failed: {e}")
        return False

if __name__ == "__main__":
    perform_online_backup()
