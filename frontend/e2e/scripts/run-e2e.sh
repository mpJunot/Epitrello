#!/usr/bin/env bash
set -euo pipefail

# Playwright E2E runner for Epitrello
# Automatically starts Docker services if not already running, then runs tests

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$FRONTEND_DIR/.." && pwd)"

cd "$FRONTEND_DIR"

# Load .env.e2e if it exists
if [[ -f e2e/.env.e2e ]]; then
  echo "📦 Loading environment from e2e/.env.e2e"
  set -a
  # shellcheck disable=SC1091
  source e2e/.env.e2e
  set +a
fi

# Check if services are already running
services_ready() {
  # Check frontend
  local frontend_ok=$(timeout 2 curl -s http://localhost:3000 > /dev/null 2>&1 && echo 1 || echo 0)
  # Check backend (GraphQL endpoint)
  local backend_ok=$(timeout 2 curl -s http://localhost:4000/graphql > /dev/null 2>&1 && echo 1 || echo 0)
  
  [[ "$frontend_ok" == "1" ]] && [[ "$backend_ok" == "1" ]]
}

# Wait for a specific service with verbose output
wait_for_service() {
  local url="$1"
  local name="$2"
  local max_attempts="$3"
  
  for i in $(seq 1 "$max_attempts"); do
    if timeout 2 curl -s "$url" > /dev/null 2>&1; then
      echo "✅ $name is ready"
      return 0
    fi
    printf "."
    sleep 1
  done
  
  echo ""
  echo "❌ $name is not responding at $url"
  return 1
}

# If services not ready, start them
if ! services_ready; then
  echo "🚀 Starting Docker services with 'make docker-start'..."
  
  cd "$REPO_ROOT"
  
  # Run make docker-start in background
  make docker-start > /tmp/docker-start.log 2>&1 &
  DOCKER_PID=$!
  
  # Wait longer for services to start and database to be ready
  echo "⏳ Waiting for Docker services to initialize (30s)..."
  sleep 30
  
  # Wait for services to be ready (max 60 seconds)
  echo "⏳ Waiting for backend to respond..."
  
  if ! wait_for_service "http://localhost:4000/graphql" "Backend" 60; then
    echo ""
    echo "❌ Backend failed to start"
    echo ""
    echo "📋 Docker start logs:"
    tail -30 /tmp/docker-start.log || echo "No logs available"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   - Check Docker is running: docker ps"
    echo "   - Check make docker-start manually: cd $REPO_ROOT && make docker-start"
    echo "   - View full logs: tail -f /tmp/docker-start.log"
    exit 1
  fi
  
  cd "$FRONTEND_DIR"
  
  # Now start the frontend in development mode in background
  echo "🚀 Starting frontend development server..."
  pnpm dev > /tmp/frontend-dev.log 2>&1 &
  FRONTEND_PID=$!
  
  echo "⏳ Waiting for frontend to start..."
  if ! wait_for_service "http://localhost:3000" "Frontend" 60; then
    echo ""
    echo "❌ Frontend failed to start"
    echo ""
    echo "📋 Frontend logs:"
    tail -30 /tmp/frontend-dev.log || echo "No logs available"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   - Check pnpm is installed: which pnpm"
    echo "   - Check dependencies: pnpm list"
    echo "   - View full logs: tail -f /tmp/frontend-dev.log"
    
    # Kill the backend if frontend fails
    kill $DOCKER_PID 2>/dev/null || true
    exit 1
  fi
  
  echo ""
  echo "✅ All services ready!"
  sleep 2  # Extra time for stability
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

# Run tests
pnpm run test:e2e \
  --project "$PROJECT" \
  "${FILTER_ARGS[@]}" \
  "${HEADLESS_FLAG[@]}"
