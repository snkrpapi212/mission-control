#!/usr/bin/env python3
"""Mission Control API health check script."""

import urllib.request
import json
import sys

def check_health():
    """Check if Mission Control API is running."""
    try:
        with urllib.request.urlopen('http://localhost:3000/api/tasks', timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                task_count = len(data.get('data', []))
                print(f"Found {task_count} tasks")
                print("OK")
                return True
    except Exception as e:
        print(f"Error: {e}")
        print("FAIL")
        return False

if __name__ == '__main__':
    success = check_health()
    sys.exit(0 if success else 1)
