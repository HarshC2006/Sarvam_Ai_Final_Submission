import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from .config import DATABASE_PATH

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                case_id TEXT PRIMARY KEY,
                programme_name TEXT,
                mode TEXT,
                language TEXT,
                state_json TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                doc_id TEXT PRIMARY KEY,
                case_id TEXT,
                filename TEXT,
                file_hash TEXT,
                file_path TEXT,
                ocr_markdown TEXT,
                created_at TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT,
                event_type TEXT,
                description TEXT,
                provenance TEXT,
                created_at TIMESTAMP
            )
        """)
        conn.commit()

def save_case_state(case_id: str, state_dict: Dict[str, Any]):
    now = datetime.utcnow().isoformat()
    state_str = json.dumps(state_dict)
    with get_db() as conn:
        conn.execute("""
            INSERT INTO cases (case_id, programme_name, mode, language, state_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(case_id) DO UPDATE SET
                mode=excluded.mode,
                language=excluded.language,
                state_json=excluded.state_json,
                updated_at=excluded.updated_at
        """, (
            case_id,
            state_dict.get("programme_name", ""),
            state_dict.get("mode", "fixture"),
            state_dict.get("language", "hi-IN"),
            state_str,
            now,
            now
        ))
        conn.commit()

def load_case_state(case_id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        row = conn.execute("SELECT state_json FROM cases WHERE case_id = ?", (case_id,)).fetchone()
        if row:
            return json.loads(row["state_json"])
    return None

def log_audit_event(case_id: str, event_type: str, description: str, provenance: str):
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute("""
            INSERT INTO audit_logs (case_id, event_type, description, provenance, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (case_id, event_type, description, provenance, now))
        conn.commit()

def cache_document_ocr(doc_id: str, case_id: str, filename: str, file_hash: str, file_path: str, ocr_markdown: str):
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO documents (doc_id, case_id, filename, file_hash, file_path, ocr_markdown, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (doc_id, case_id, filename, file_hash, file_path, ocr_markdown, now))
        conn.commit()

def get_cached_document_ocr(file_hash: str) -> Optional[str]:
    with get_db() as conn:
        row = conn.execute("SELECT ocr_markdown FROM documents WHERE file_hash = ? ORDER BY created_at DESC LIMIT 1", (file_hash,)).fetchone()
        if row:
            return row["ocr_markdown"]
    return None
