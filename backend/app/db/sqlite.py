import sqlite3
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger("db.sqlite")

DB_PATH = settings.DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for user accounts, health profiles, consents, and observation records."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                age_group TEXT NOT NULL,
                gender TEXT,
                city TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS health_profiles (
                user_id INTEGER PRIMARY KEY,
                conditions TEXT NOT NULL,
                sensitivity_group TEXT NOT NULL,
                additional_notes TEXT,
                consent_given INTEGER NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS location_consents (
                user_id INTEGER PRIMARY KEY,
                gps_allowed INTEGER NOT NULL,
                latitude REAL,
                longitude REAL,
                city TEXT,
                consent_given INTEGER NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS notification_settings (
                user_id INTEGER PRIMARY KEY,
                high_pollution_alerts INTEGER DEFAULT 1,
                daily_forecast INTEGER DEFAULT 1,
                health_advisories INTEGER DEFAULT 1,
                traffic_pollution_routing INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS environmental_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                city TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                aqi INTEGER NOT NULL,
                pm25 REAL,
                pm10 REAL,
                no2 REAL,
                o3 REAL,
                co REAL,
                temperature REAL,
                humidity INTEGER,
                traffic_index INTEGER,
                source TEXT NOT NULL
            );
        """)

        # Insert sample historical readings if empty
        cur.execute("SELECT COUNT(*) as count FROM environmental_history;")
        row = cur.fetchone()
        if row and row["count"] == 0:
            sample_times = [
                ("2026-11-12T08:00:00Z", "Delhi", 28.6139, 77.2090, 168, 88.5, 142.0, 42.1, 28.4, 1.2, 22.0, 65, 45, "OpenAQ Station Feed"),
                ("2026-11-12T11:00:00Z", "Delhi", 28.6139, 77.2090, 155, 76.2, 128.5, 39.0, 34.0, 1.0, 26.5, 52, 60, "OpenAQ Station Feed"),
                ("2026-11-12T14:00:00Z", "Delhi", 28.6139, 77.2090, 142, 65.0, 115.0, 32.5, 48.2, 0.9, 29.0, 44, 55, "OpenAQ Station Feed"),
                ("2026-11-12T17:00:00Z", "Delhi", 28.6139, 77.2090, 138, 59.4, 102.0, 36.8, 41.5, 0.8, 27.2, 58, 70, "OpenAQ Station Feed"),
                ("2026-11-12T20:00:00Z", "Delhi", 28.6139, 77.2090, 149, 68.2, 118.0, 44.0, 31.0, 1.1, 24.1, 62, 30, "OpenAQ Station Feed"),
            ]
            cur.executemany("""
                INSERT INTO environmental_history 
                (timestamp, city, latitude, longitude, aqi, pm25, pm10, no2, o3, co, temperature, humidity, traffic_index, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, sample_times)

        conn.commit()
        logger.info("SQLite database initialized successfully at %s", DB_PATH)
    finally:
        conn.close()

# ==================== User CRUD ====================

def create_user(full_name: str, email: str, password_hash: str, age_group: str, gender: Optional[str], city: str) -> int:
    created_at = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (full_name, email, password_hash, age_group, gender, city, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (full_name, email.lower(), password_hash, age_group, gender or "Prefer not to say", city, created_at))
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE lower(email) = ?", (email.lower(),))
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def update_user_profile(user_id: int, full_name: Optional[str] = None, age_group: Optional[str] = None, gender: Optional[str] = None, city: Optional[str] = None) -> bool:
    fields = []
    values = []
    if full_name:
        fields.append("full_name = ?")
        values.append(full_name)
    if age_group:
        fields.append("age_group = ?")
        values.append(age_group)
    if gender:
        fields.append("gender = ?")
        values.append(gender)
    if city:
        fields.append("city = ?")
        values.append(city)
    if not fields:
        return False
    values.append(user_id)
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", tuple(values))
        conn.commit()
        return True
    finally:
        conn.close()

def delete_user_account(user_id: int) -> bool:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM health_profiles WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM location_consents WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM notification_settings WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

# ==================== Health Profile CRUD ====================

def save_health_profile(user_id: int, conditions: List[str], sensitivity_group: str, additional_notes: Optional[str], consent_given: bool) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    cond_str = json.dumps(conditions)
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO health_profiles (user_id, conditions, sensitivity_group, additional_notes, consent_given, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                conditions=excluded.conditions,
                sensitivity_group=excluded.sensitivity_group,
                additional_notes=excluded.additional_notes,
                consent_given=excluded.consent_given,
                updated_at=excluded.updated_at
        """, (user_id, cond_str, sensitivity_group, additional_notes, 1 if consent_given else 0, updated_at))
        conn.commit()
        return {
            "user_id": user_id,
            "conditions": conditions,
            "sensitivity_group": sensitivity_group,
            "additional_notes": additional_notes,
            "consent_given": consent_given,
            "updated_at": updated_at
        }
    finally:
        conn.close()

def get_health_profile(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM health_profiles WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            return None
        return {
            "user_id": row["user_id"],
            "conditions": json.loads(row["conditions"]) if row["conditions"] else [],
            "sensitivity_group": row["sensitivity_group"],
            "additional_notes": row["additional_notes"],
            "consent_given": bool(row["consent_given"]),
            "updated_at": row["updated_at"]
        }
    finally:
        conn.close()

def delete_health_profile(user_id: int) -> bool:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM health_profiles WHERE user_id = ?", (user_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

# ==================== Location Consent CRUD ====================

def save_location_consent(user_id: int, gps_allowed: bool, latitude: Optional[float], longitude: Optional[float], city: Optional[str], consent_given: bool) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO location_consents (user_id, gps_allowed, latitude, longitude, city, consent_given, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                gps_allowed=excluded.gps_allowed,
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                city=excluded.city,
                consent_given=excluded.consent_given,
                updated_at=excluded.updated_at
        """, (user_id, 1 if gps_allowed else 0, latitude, longitude, city or settings.DEFAULT_CITY, 1 if consent_given else 0, updated_at))
        conn.commit()
        return {
            "user_id": user_id,
            "gps_allowed": gps_allowed,
            "latitude": latitude,
            "longitude": longitude,
            "city": city or settings.DEFAULT_CITY,
            "consent_given": consent_given,
            "updated_at": updated_at
        }
    finally:
        conn.close()

def get_location_consent(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM location_consents WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            return None
        return {
            "user_id": row["user_id"],
            "gps_allowed": bool(row["gps_allowed"]),
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "city": row["city"],
            "consent_given": bool(row["consent_given"]),
            "updated_at": row["updated_at"]
        }
    finally:
        conn.close()

# ==================== Environmental History Storage ====================

def store_environmental_reading(timestamp: str, city: str, latitude: float, longitude: float, aqi: int,
                                pm25: Optional[float], pm10: Optional[float], no2: Optional[float],
                                o3: Optional[float], co: Optional[float], temperature: Optional[float],
                                humidity: Optional[int], traffic_index: Optional[int], source: str):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO environmental_history 
            (timestamp, city, latitude, longitude, aqi, pm25, pm10, no2, o3, co, temperature, humidity, traffic_index, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (timestamp, city, latitude, longitude, aqi, pm25, pm10, no2, o3, co, temperature, humidity, traffic_index, source))
        conn.commit()
    finally:
        conn.close()

def get_historical_readings(city: str = "Delhi", limit: int = 24) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT timestamp, aqi, pm25, pm10, no2, o3, co, temperature, humidity
            FROM environmental_history
            WHERE lower(city) = ? OR lower(city) LIKE ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (city.lower(), f"%{city.lower()}%", limit))
        rows = cur.fetchall()
        results = [dict(r) for r in rows]
        return list(reversed(results))
    finally:
        conn.close()
