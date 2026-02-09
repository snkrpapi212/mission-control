#!/usr/bin/env python3
"""
TaskFlow AI - Health Check Script

A comprehensive health monitoring solution for the TaskFlow AI product website.
Checks website availability, response time, SSL status, and provides clear status output.

Usage:
    python healthcheck.py                              # Run once
    python healthcheck.py --watch                      # Continuous monitoring
    python healthcheck.py --url https://example.com     # Custom URL
    python healthcheck.py --json                       # JSON output format
"""

import argparse
import json
import socket
import ssl
import sys
import time
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class HealthCheckResult:
    """Container for health check results."""
    url: str
    status: str
    http_code: Optional[int]
    response_time_ms: Optional[float]
    ssl_valid: Optional[bool]
    ssl_expiry_days: Optional[int]
    error_message: Optional[str]
    timestamp: str
    is_up: bool

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON output."""
        return asdict(self)

    def to_pretty_string(self) -> str:
        """Format results for human-readable output."""
        status_icon = "✅" if self.is_up else "❌"
        status_text = "UP" if self.is_up else "DOWN"

        lines = [
            f"{status_icon} TaskFlow AI Health Check",
            f"   URL: {self.url}",
            f"   Status: {status_text}",
        ]

        if self.http_code:
            lines.append(f"   HTTP Code: {self.http_code}")

        if self.response_time_ms is not None:
            lines.append(f"   Response Time: {self.response_time_ms:.2f}ms")

        if self.ssl_valid is not None:
            ssl_status = "✅ Valid" if self.ssl_valid else "❌ Invalid"
            lines.append(f"   SSL Status: {ssl_status}")
            if self.ssl_expiry_days is not None:
                lines.append(f"   SSL Expires In: {self.ssl_expiry_days} days")

        if self.error_message:
            lines.append(f"   Error: {self.error_message}")

        lines.append(f"   Timestamp: {self.timestamp}")

        return "\n".join(lines)


class HealthChecker:
    """Website health monitoring class."""

    DEFAULT_TIMEOUT = 10  # seconds
    DEFAULT_URL = "https://taskflow.ai"

    def __init__(self, url: str = None, timeout: int = DEFAULT_TIMEOUT):
        """
        Initialize the health checker.

        Args:
            url: Website URL to check (defaults to taskflow.ai)
            timeout: Request timeout in seconds
        """
        self.url = url or self.DEFAULT_URL
        self.timeout = timeout
        # Ensure URL has protocol
        if not self.url.startswith(('http://', 'https://')):
            self.url = 'https://' + self.url

    def check(self) -> HealthCheckResult:
        """
        Perform comprehensive health check.

        Returns:
            HealthCheckResult with all check details
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        start_time = time.time()

        try:
            # Make HTTP request
            request = Request(self.url, headers={'User-Agent': 'TaskFlowAI-HealthCheck/1.0'})
            with urlopen(request, timeout=self.timeout) as response:
                http_code = response.status
                response_time_ms = (time.time() - start_time) * 1000

                # Check SSL
                ssl_valid, ssl_expiry_days = self._check_ssl()

                return HealthCheckResult(
                    url=self.url,
                    status="healthy",
                    http_code=http_code,
                    response_time_ms=response_time_ms,
                    ssl_valid=ssl_valid,
                    ssl_expiry_days=ssl_expiry_days,
                    error_message=None,
                    timestamp=timestamp,
                    is_up=True
                )

        except HTTPError as e:
            return HealthCheckResult(
                url=self.url,
                status="http_error",
                http_code=e.code,
                response_time_ms=None,
                ssl_valid=None,
                ssl_expiry_days=None,
                error_message=f"HTTP Error: {e.reason} (Code: {e.code})",
                timestamp=timestamp,
                is_up=False
            )

        except URLError as e:
            return HealthCheckResult(
                url=self.url,
                status="unreachable",
                http_code=None,
                response_time_ms=None,
                ssl_valid=None,
                ssl_expiry_days=None,
                error_message=f"URL Error: {e.reason}",
                timestamp=timestamp,
                is_up=False
            )

        except socket.timeout:
            return HealthCheckResult(
                url=self.url,
                status="timeout",
                http_code=None,
                response_time_ms=None,
                ssl_valid=None,
                ssl_expiry_days=None,
                error_message="Connection timed out",
                timestamp=timestamp,
                is_up=False
            )

        except Exception as e:
            return HealthCheckResult(
                url=self.url,
                status="error",
                http_code=None,
                response_time_ms=None,
                ssl_valid=None,
                ssl_expiry_days=None,
                error_message=f"Unexpected error: {str(e)}",
                timestamp=timestamp,
                is_up=False
            )

    def _check_ssl(self) -> tuple:
        """
        Check SSL certificate validity.

        Returns:
            Tuple of (is_valid, days_until_expiry)
        """
        try:
            hostname = self.url.split('://')[1].split('/')[0]
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    # Parse expiry date
                    expires_on = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (expires_on - datetime.utcnow()).days
                    return True, days_until_expiry
        except Exception:
            return None, None

    def continuous_watch(self, interval: int = 60, count: Optional[int] = None):
        """
        Continuously monitor website health.

        Args:
            interval: Seconds between checks
            count: Number of checks (None for infinite)
        """
        check_num = 0
        print(f"🔍 Starting continuous monitoring of {self.url}")
        print(f"⏱️  Check interval: {interval} seconds")
        print("-" * 50)

        try:
            while count is None or check_num < count:
                check_num += 1
                result = self.check()
                print(f"[{check_num}] {result.to_pretty_string()}")
                print("-" * 50)

                if count is None or check_num < count:
                    time.sleep(interval)

        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped by user")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="TaskFlow AI - Website Health Check Monitor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python healthcheck.py              Run single health check
  python healthcheck.py --watch       Continuous monitoring
  python healthcheck.py --url https://taskflow.ai  Custom URL
  python healthcheck.py --json        JSON output for scripts
  python healthcheck.py --quiet      Minimal output
        """
    )

    parser.add_argument(
        '--url', '-u',
        default='https://taskflow.ai',
        help=f'URL to check (default: https://taskflow.ai)'
    )

    parser.add_argument(
        '--timeout', '-t',
        type=int,
        default=10,
        help='Request timeout in seconds (default: 10)'
    )

    parser.add_argument(
        '--watch', '-w',
        action='store_true',
        help='Continuous monitoring mode'
    )

    parser.add_argument(
        '--interval', '-i',
        type=int,
        default=60,
        help='Watch mode: seconds between checks (default: 60)'
    )

    parser.add_argument(
        '--count', '-c',
        type=int,
        default=None,
        help='Watch mode: number of checks to run (default: infinite)'
    )

    parser.add_argument(
        '--json', '-j',
        action='store_true',
        help='Output results as JSON'
    )

    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Minimal output (just status)'
    )

    args = parser.parse_args()

    checker = HealthChecker(url=args.url, timeout=args.timeout)

    if args.watch:
        checker.continuous_watch(interval=args.interval, count=args.count)
    else:
        result = checker.check()

        if args.json:
            print(json.dumps(result.to_dict(), indent=2))
        elif args.quiet:
            status = "UP" if result.is_up else "DOWN"
            print(f"{status}|{result.url}|{result.http_code or 'N/A'}|{result.response_time_ms or 0:.0f}ms")
        else:
            print(result.to_pretty_string())

        # Exit with appropriate code for automation
        sys.exit(0 if result.is_up else 1)


if __name__ == '__main__':
    main()
