# E2E Tests - Epitrello Frontend

End-to-end tests using Playwright, testing real user workflows from auth to workspace navigation.

## Requirements

- `make docker-start` must be running (frontend + backend + database)
- Playwright browsers installed (done once with `INSTALL_BROWSERS=1`)
- Test credentials in `.env.e2e`

## Quick Start

**Terminal 1 — Start services:**
```bash
cd /home/benjamin/Bureau/Epitrello
make docker-start
```

**Terminal 2 — Run E2E tests:**
```bash
cd /home/benjamin/Bureau/Epitrello/frontend
pnpm e2e:run
```

Tests will automatically verify:
- Frontend is running on http://localhost:3000 ✓
- Backend GraphQL is running on http://localhost:4000 ✓
- Then execute test suite

## Available Commands

```bash
# Headless (default)
pnpm e2e:run

# Headed mode (see browser in action)
HEADLESS=0 pnpm e2e:run

# Single test by name
TEST_FILTER=auth pnpm e2e:run

# Custom base URL (if not localhost)
PLAYWRIGHT_BASE_URL=http://192.168.1.100:3000 pnpm e2e:run

# Install browsers (one-time setup)
INSTALL_BROWSERS=1 pnpm e2e:run
```

## Test Coverage

### `tests/e2e/auth.spec.ts`
- ✓ **Form validation**: Email/password validation without backend
- ✓ **Full login flow**: Complete authentication with token storage and redirect

Requires `E2E_EMAIL` and `E2E_PASSWORD` in `.env.e2e` to run the full login test.

## Environment Variables

Create/edit `.env.e2e`:
```dotenv
E2E_EMAIL=your-test-user@example.com
E2E_PASSWORD=YourStrongPassword123

# Optional
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## Reports

After test run:
```bash
pnpm exec playwright show-report
```

Opens HTML report with:
- Test results ✓ / ✗
- Screenshots on failure
- Video recordings (on failure)
- Execution traces

## Troubleshooting

**"Services not ready" error**
```
❌ Services not ready:
   - Frontend (http://localhost:3000) - NOT RESPONDING
   - Backend (http://localhost:4000) - NOT RESPONDING
```
→ Run `make docker-start` first

**"Login credentials invalid"**
→ Verify user exists in database with credentials from `.env.e2e`

**Timeout waiting for redirect**
→ Check backend GraphQL logs for mutation errors

## Architecture

```
Playwright (Chrome)
  ↓
Frontend (http://localhost:3000)
  ↓
Backend GraphQL (http://localhost:4000)
  ↓
PostgreSQL Database
```

Tests are **fully isolated** and test real interactions between all layers.
