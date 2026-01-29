#!/usr/bin/env bash
set -euo pipefail

# Playwright E2E runner for Epitrello
# Automatically starts Docker services if not already running, then runs tests

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load .env.e2e if it exists
if [[ -f .env.e2e ]]; then
  echo "📦 Loading environment from .env.e2e"
  set -a
  # shellcheck disable=SC1091
  source .env.e2e
  set +a
fi

# Check if services are already running
services_ready() {
  timeout 1 curl -s http://localhost:3000 > /dev/null 2>&1 && \
  timeout 1 curl -s -X POST http://localhost:4000/graphql > /dev/null 2>&1
}

# If services not ready, start them
if ! services_ready; then
  echo "🚀 Starting Docker services..."
  nohup make -C "$ROOT_DIR" docker-start > /dev/null 2>&1 &
  
  # Wait for services to be ready (max 120 seconds)
  echo "⏳ Waiting for services to start..."
  for i in {1..120}; do
    if services_ready; then
      echo ""
      echo "✅ Services ready!"
      sleep 2  # Extra time for stability
      break
    fi
    printf "."
    sleep 1
  done
  
  if ! services_ready; then
    echo ""
    echo "❌ Services failed to start after 2 minutes"
    exit 1
  fi
else
  echo "✅ Services already running"
fi

echo ""
echo "🧪 Running E2E tests..."
echo ""

# Install browsers if needed
if [[ "${INSTALL_BROWSERS:-0}" == "1" ]]; then
  pnpm exec playwright install --with-deps
fi

export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:3000}"

HEADLESS_FLAG=()
if [[ "${HEADLESS:-1}" == "0" ]]; then
  HEADLESS_FLAG=("--headed")
fi

PROJECT="${PW_PROJECT:-chromium}"
FILTER_ARGS=()
if [[ -n "${TEST_FILTER:-}" ]]; then
  FILTER_ARGS=("${TEST_FILTER}")
fi

# Run from frontend root using pnpm script
FRONTEND_ROOT="$ROOT_DIR/.."
cd "$FRONTEND_ROOT"

# Use pnpm run to properly set up the environment
pnpm run test:e2e \
  --project "$PROJECT" \
  "${FILTER_ARGS[@]}" \
  "${HEADLESS_FLAG[@]}"
