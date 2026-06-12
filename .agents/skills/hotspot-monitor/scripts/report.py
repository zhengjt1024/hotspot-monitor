"""Generate a hot topics report from the Hotspot Monitor API."""
import urllib.request
import json
import sys
from datetime import datetime

BASE = "http://localhost:3001/api"

def fetch(path):
    try:
        with urllib.request.urlopen(f"{BASE}{path}", timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"Error: Cannot reach API at {BASE} - {e}", file=sys.stderr)
        sys.exit(1)

def main():
    print("=" * 60)
    print("  Hotspot Monitor - Hot Topics Report")
    print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Stats
    stats = fetch("/topics/stats/summary")
    print(f"\nSummary: {stats['total']} total | {stats['verified']} verified | {stats['fake']} fake | {stats['today']} today")

    if stats.get('sources'):
        print("\nSources:")
        for s in stats['sources']:
            print(f"  {s['source']}: {s['count']}")

    # Keywords
    keywords = fetch("/keywords")
    print(f"\nActive Keywords ({len(keywords)}):")
    for kw in keywords:
        status = "ACTIVE" if kw.get('enabled') else "PAUSED"
        print(f"  [{status}] {kw['keyword']}" + (f" ({kw['category']})" if kw.get('category') else ""))

    # Top verified topics
    topics_data = fetch("/topics?verified=1&limit=10")
    topics = topics_data.get('topics', [])
    print(f"\nTop Verified Topics:")
    for i, t in enumerate(topics, 1):
        score = t.get('relevance_score', '?')
        src = t.get('source_name', t.get('source', '?'))
        title = (t.get('title', '') or '')[:80]
        print(f"  {i}. [{score}%] [{src}] {title}")

    # Unread notifications
    notifs = fetch("/notifications?unread=1")
    count = notifs.get('unreadCount', 0)
    print(f"\nUnread Notifications: {count}")

    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
