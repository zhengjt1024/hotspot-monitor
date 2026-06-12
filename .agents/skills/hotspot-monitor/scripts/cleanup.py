"""Clean up old topics and notifications from the Hotspot Monitor database."""
import sqlite3
import argparse
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend', 'data', 'monitor.db')

def main():
    parser = argparse.ArgumentParser(description="Cleanup old monitor data")
    parser.add_argument("--days", type=int, default=7, help="Delete records older than N days (default: 7)")
    args = parser.parse_args()

    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    cutoff = (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Count before
    topics_before = cursor.execute("SELECT COUNT(*) FROM topics").fetchone()[0]
    notifs_before = cursor.execute("SELECT COUNT(*) FROM notifications").fetchone()[0]

    # Delete old notifications first (foreign key cascade)
    cursor.execute("DELETE FROM notifications WHERE created_at < ?", (cutoff,))
    notifs_deleted = cursor.rowcount

    # Delete old topics
    cursor.execute("DELETE FROM topics WHERE created_at < ?", (cutoff,))
    topics_deleted = cursor.rowcount

    conn.commit()
    conn.close()

    print(f"Cleanup complete (older than {args.days} days):")
    print(f"  Topics deleted: {topics_deleted} (was {topics_before})")
    print(f"  Notifications deleted: {notifs_deleted} (was {notifs_before})")

if __name__ == "__main__":
    main()
