#!/usr/bin/env bash
#
# Hermetic test runner for local development and CI-less sandboxes (e.g. agents).
#
# It provisions a throwaway Postgres in Docker, applies migrations, and runs the
# suite — so `git clone && bash scripts/test.sh` is green with zero prior machine
# setup and no .env. CI does NOT use this script: the CI workflow already supplies
# its own Postgres service and DATABASE_URL, then runs `npm test` directly.
#
# The container publishes to a Docker-assigned ephemeral host port by default, so
# many runs (e.g. parallel agents) can share one host without colliding. Set
# TEST_DB_PORT to pin a fixed port instead.
#
# Usage:
#   bash scripts/test.sh                      # run the whole suite
#   bash scripts/test.sh tests/auth.test.ts   # args pass straight through to vitest
#   TEST_DB_PORT=5555 bash scripts/test.sh    # pin the host port
#
set -euo pipefail
cd "$(dirname "$0")/.."

# Load committed, non-secret test config (.env.test): AUTH_SECRET, ADMIN_*, etc.
set -a
# shellcheck disable=SC1091
source .env.test
set +a

command -v docker >/dev/null 2>&1 || {
  echo "✗ docker is required for scripts/test.sh but was not found on PATH." >&2
  exit 1
}

# Pin the port if TEST_DB_PORT is set; otherwise let Docker pick a free one.
PUBLISH="127.0.0.1::5432"
[ -n "${TEST_DB_PORT:-}" ] && PUBLISH="127.0.0.1:${TEST_DB_PORT}:5432"

echo "▸ starting ephemeral Postgres"
CID=$(docker run -d --rm \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=subly_test \
  -p "${PUBLISH}" postgres:16-alpine)
cleanup() { docker stop "$CID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# Discover the host port Docker assigned (or the pinned one) and build the URL.
HOST_PORT=$(docker port "$CID" 5432/tcp | head -1 | sed 's/.*://')
export DATABASE_URL="postgresql://test:test@localhost:${HOST_PORT}/subly_test"
echo "  Postgres on :${HOST_PORT}"

echo "▸ waiting for Postgres to accept connections"
for _ in $(seq 1 60); do
  docker exec "$CID" pg_isready -U test -d subly_test >/dev/null 2>&1 && break
  sleep 0.5
done

echo "▸ applying migrations"
npx prisma migrate deploy

echo "▸ running tests"
npx vitest run "$@"
