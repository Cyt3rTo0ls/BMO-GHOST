#!/usr/bin/env python3
"""
HackerBrain OS - generate_key.py (OWNER ONLY)

Generates 6-digit PRO activation keys. Keys are logged locally with a
generation timestamp. This script must never be distributed: it is the
owner-side tool that mints keys for paying customers.

Usage:
    python3 generate_key.py            # generate one key
    python3 generate_key.py 5          # generate five keys

WARNING: This tool is intended for authorized security testing only.
"""

from __future__ import annotations

import os
import random
import sys
import time
from datetime import datetime, timezone

from core.key_validator import _checksum

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KEY_LOG = os.path.join(BASE_DIR, "data", "keys.log")
MINT_LIMIT = 100


def mint_key(rng: random.Random) -> str:
    """
    Generate a 6-digit key that satisfies the same relation the validator
    enforces. Sampling is rejection-based and fast (no anti-timing delay
    here: this is the owner-side minting tool).
    """
    while True:
        candidate = "%06d" % rng.randint(0, 999999)
        if _checksum(candidate):
            return candidate


def log_key(key: str, note: str = "") -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    os.makedirs(os.path.dirname(KEY_LOG), exist_ok=True)
    with open(KEY_LOG, "a", encoding="utf-8") as fh:
        fh.write(f"{ts} | KEY={key} | {note}\n")


def main() -> int:
    count = 1
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print("[ERROR] usage: generate_key.py [count]", file=sys.stderr)
            return 2
    if count < 1 or count > MINT_LIMIT:
        print("[ERROR] count must be between 1 and %d" % MINT_LIMIT, file=sys.stderr)
        return 2

    rng = random.SystemRandom()
    print("HackerBrain OS - key generator (owner tool)")
    print("Keys are logged to data/keys.log\n")

    for i in range(count):
        key = mint_key(rng)
        log_key(key, note=f"batch-{int(time.time())}")
        print("[%d] %s" % (i + 1, key))

    print("\nDeliver keys privately. Do not commit data/keys.log.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
