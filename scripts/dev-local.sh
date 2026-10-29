#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$PROJECT_ROOT/.local/bin:$PATH"
POSTGRES_BIN="${POSTGRES_BIN:-/Library/PostgreSQL/18/bin}"

if ! command -v bun >/dev/null; then
  echo 'Bun is required. Install Bun or place it in .local/bin.' >&2
  exit 1
fi

if [[ -d "$PROJECT_ROOT/.local/postgres" ]]; then
  if ! "$POSTGRES_BIN/pg_ctl" -D "$PROJECT_ROOT/.local/postgres" status >/dev/null 2>&1; then
    "$POSTGRES_BIN/pg_ctl" -D "$PROJECT_ROOT/.local/postgres" \
      -l "$PROJECT_ROOT/.local/postgres.log" \
      -o '-h 127.0.0.1 -p 55432' start
  fi
fi

cd "$PROJECT_ROOT"
exec bun run dev
