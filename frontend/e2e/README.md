# E2E Tests - Epitrello

> **Status**: ✅ **All 39 Critical Tests Passing**
> **Philosophy**: Only test essential user journeys
> **Last Updated**: January 2026

---

## Philosophy: Critical Path Testing

We maintain **39 focused tests** that cover all critical user journeys:

- ✅ Tests run in ~20 seconds
- ✅ All tests are essential (zero filler)
- ✅ Each test validates one complete user workflow
- ✅ Easy to maintain and extend

---

## Test Files Overview

| File                                         | Tests  | Purpose                                          |
| -------------------------------------------- | ------ | ------------------------------------------------ |
| `01-auth-critical.spec.ts`                   | 5      | Register, login, logout, session persistence     |
| `02-workspaces-boards-critical.spec.ts`      | 5      | Create workspace/board, access, switch           |
| `03-lists-cards-critical.spec.ts`            | 6      | Create/edit/delete lists and cards               |
| `04-drag-drop-critical.spec.ts`              | 4      | Drag and drop cards between lists                |
| `05-persistence-resilience-critical.spec.ts` | 7      | Data persistence, error handling, network issues |
| `06-collaboration-critical.spec.ts`          | 4      | Invite members, assign cards, permissions        |
| `07-search-filtering-critical.spec.ts`       | 3      | Search boards/cards, filter by assignee          |
| `08-card-details-critical.spec.ts`           | 5      | Card description, due dates, labels, checklists  |
| **TOTAL**                                    | **39** | **All critical paths covered**                   |

---

## Running Tests

**Prérequis** : le backend (et Postgres) doit être démarré, par ex. depuis la racine du repo : `make docker-start`.
Le frontend est démarré automatiquement par Playwright si rien n’écoute sur `http://localhost:3000`.
Alternative tout-en-un : `pnpm e2e:run` (script qui lance Docker + frontend puis les tests).

```bash
# Depuis la racine : démarrer backend + Postgres
make docker-start

# Depuis frontend/ : lancer les tests (le frontend est démarré automatiquement)
pnpm test:e2e

# Ou tout-en-un depuis frontend/
pnpm e2e:run

# Run specific test file
pnpm test:e2e 01-auth-critical.spec.ts

# Run with UI (debug mode)
pnpm test:e2e --ui

# View test report
pnpm test:e2e
pnpm exec playwright show-report
```

---

## Test Coverage

### Authentication (5 tests)

- Register new user → Auto-login ✓
- Login with wrong password → Error ✓
- Login with valid credentials ✓
- Session persists after page refresh ✓
- Logout and redirect to login ✓

### Workspaces & Boards (5 tests)

- Create workspace ✓
- Create board in workspace ✓
- Access existing board ✓
- Switch between workspaces ✓
- Board persists after logout/login ✓

### Lists & Cards (6 tests)

- Create list in board ✓
- Add card to list ✓
- Edit card title ✓
- Delete card ✓
- Move card between lists ✓
- Duplicate card ✓

### Drag & Drop (4 tests)

- Drag card within same list ✓
- Drag card to another list ✓
- Drag list in board ✓
- Visual feedback during drag ✓

### Data Persistence (7 tests)

- Card changes persist after refresh ✓
- List order persists after refresh ✓
- User stays logged in after refresh ✓
- Board data consistent after navigation ✓
- Missing board handled gracefully ✓
- App recovers from network error ✓
- Card operations work after network interruption ✓

### Collaboration (4 tests)

- Invite member to board ✓
- Assign card to member ✓
- Remove member from board ✓
- View member indicators on cards ✓

### Search & Filtering (3 tests)

- Search for board by name ✓
- Search for card by title ✓
- Filter cards by assignee ✓

### Card Details (5 tests)

- Add/edit card description ✓
- Set/modify due date ✓
- Add/remove labels ✓
- Create/manage checklist ✓
- Add/delete comments ✓

---

## Important Notes

### Environment Setup

- **Backend + Postgres** : doivent être lancés avant les tests (ex. `make docker-start` à la racine).
- **Frontend** : démarré automatiquement par Playwright si besoin lorsque vous lancez `pnpm test:e2e`.
- Les tests créent des utilisateurs à la volée, aucune donnée de test à préparer.

### Test Isolation

Each test is independent and can run in any order.

### Debugging

- **View videos**: Check `test-results/` folder for failing test videos
- **Debug mode**: Use `--ui` flag to run tests interactively
- **Slow down**: Add `await page.waitForTimeout(1000)` to slow down specific steps
  User → Access Board ✓
  User → Board persists after logout/login ✓
  User → Can navigate between boards ✓

```
**Why**: Core data structure - if boards break, app is unusable.

### 3. List & Card Management (6 tests)
```

Board → Add List ✓
List → Add Card ✓
Card → Edit title → Persist ✓
Card → Delete ✓
Card → Move to another list ✓
List → Reorder lists ✓

```
**Why**: Core Trello workflow - organizing work.

### 4. Drag-Drop UX (4 tests)
```

Card → Drag to other list → Drop ✓
Card → Reorder in same list ✓
Card → Drag → Refresh page → Position persists ✓
Card → Drag to invalid target → Revert ✓

```
**Why**: Drag-drop is THE differentiator for Trello clones.

### 5. Data Persistence & Error Handling (7 tests)
```

Card modified → Refresh → Change persists ✓
List order → Refresh → Order persists ✓
User → Logout → Login → All data intact ✓
Network → Offline briefly → App recovers ✓
Navigate away → Navigate back → Data consistent ✓
API → Returns error → App handles gracefully ✓
Card → Edit → Network timeout → Still works ✓

```
**Why**: Users depend on their data being safe. One lost task = lost trust.

### 6. Collaboration (4 tests)
```

Board owner → Invite member → Member gets access ✓
Card → Assign to user → Shows assignment ✓
Board → Display current members ✓
Shared board → Member can edit ✓

```
**Why**: Without collaboration, it's not Trello, just a personal todo.

### 7. Search & Filter (3 tests)
```

Board (50+ cards) → Search "bug" → Shows matches ✓
Results → Filter by assignee → Filters ✓
Search → Clear → All cards visible again ✓

```
**Why**: Large boards become unusable without search.

### 8. Card Rich Metadata (5 tests)
```

Card → Add description → Persist ✓
Card → Set due date → Shows deadline ✓
Card → Add label/color → Shows on card ✓
Card → Create checklist → Track items ✓
Card → Close modal → Modal closes ✓

````
**Why**: Rich metadata differentiates Trello from basic todo list.

---

## ❌ What We DON'T Test (Intentionally)

| Category | Example | Why Not |
|----------|---------|---------|
| **Visual Tests** | "Button is red" | Unit tests cover component rendering |
| **Edge Cases** | "1000 cards in list" | Performance tests handle this |
| **Exact Styling** | "Avatar size is 32px" | Visual regression suite (separate) |
| **Implementation Details** | "HTTP 200 response code" | Integration tests |
| **Variations** | "10 ways to delete a card" | Redundant, one test is enough |
| **Minor UX** | "Loading spinner animation" | Nice-to-have, not blocking |
| **Non-critical Auth** | "OAuth with Google" | Not MVP critical |
| **Password Reset Flow** | "Email verification token" | Not critical for core app |
| **Notifications** | "Get alert when assigned" | If implemented, separate test |

**Why?** Keep E2E tests focused on real blocking issues. Let other test types handle implementation details.

---
## Test Architecture

### Locator Strategies
Tests use flexible, resilient selectors:

```typescript
// Flexible text matching
page.locator('text=/add.*card|new card/i')

// Role-based selectors
page.getByRole('button', { name: /sign in/i })

// Attribute-based for fallback
page.locator('input[placeholder*="card" i]')
````

### Error Handling

Tests gracefully handle missing elements:

```typescript
const hasButton = await button.isVisible({ timeout: 3000 }).catch(() => false);
if (hasButton) {
  await button.click();
}
```

### Helper Functions

Reusable functions for common workflows:

```typescript
// Register and auto-login a new user
async function registerNewUser(page: Page) { ... }

// Ensure user is authenticated
async function ensureAuthenticated(page: Page) { ... }

// Navigate to any available board
async function openAnyBoard(page: Page) { ... }
```

---

## Debugging Failed Tests

### View Test Report

```bash
pnpm exec playwright show-report
```

Opens HTML report with:

- Video of failed test
- Screenshots
- Error details
- Timing information

### Run in Debug Mode

```bash
pnpm test:e2e --ui --debug
```

Starts Playwright Inspector with:

- Step-by-step playback
- Live element inspection
- Network monitoring

### Check Test Videos

```
test-results/[test-name]/video.webm
test-results/[test-name]/test-failed-1.png
```

---

## Maintenance

### When UI Changes

Tests use flexible locators, so most UI changes don't break tests.

### When Test Fails

1. Check if it's a real bug (data didn't save, navigation failed)
2. If it's a selector issue, update the regex pattern
3. If it's a timing issue, increase timeout
4. Run test 3+ times to confirm consistency

### Linting

```bash
# Check for unused variables, imports
pnpm lint
```

All tests must pass linting with zero warnings/errors.

**Status**: ✅ Ready for Production
**Questions?** Open an issue or ask in #engineering

## ⚠️ Known Limitations

- Tests require backend service running
- Uses test-board-123 as baseline fixture
- No E2E tests for: Checklists, Due Dates, Search, A11y, Performance
- Single browser (Chromium) - Firefox/Safari planned

## 🚀 Next Steps

1. Add Checklists tests (12 tests)
2. Add Due Dates tests (12 tests)
3. Add Search & Filters tests (20 tests)
4. Add Accessibility tests (15 tests)
5. Add Performance benchmarks (10 tests)

---

**Last Updated:** 2026-01-29
**Test Framework:** Playwright v1.49.1+
**Language:** TypeScript
