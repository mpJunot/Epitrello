# 📋 Documentation des Tests E2E - Epitrello

## 📊 Vue d'ensemble

**Total : 246 tests E2E** (reduit de 329 après suppression des doublons)
**Durée : ~1 minute**
**Taux de réussite : 100%**

---

## 🧪 Suites de Tests

### 1️⃣ **Authentication & Navigation** (19 tests)

#### [auth.spec.ts](e2e/tests/auth.spec.ts) - 8 tests
- Navigation page login
- Formulaire et éléments accessibles
- Validations de base
- Accès sans erreurs critiques

**Objectif** : Vérifier que la page de connexion charge et fonctionne

#### [auth-pages.spec.ts](e2e/tests/auth-pages.spec.ts) - 11 tests
- Password Reset - accès, chargement, validation token
- OAuth Callback - gestion des tokens
- User Registration - formulaire et validation
- Navigation inter-pages auth

**Objectif** : Vérifier toutes les pages d'authentification

#### [workspaces.spec.ts](e2e/tests/workspaces.spec.ts) - 6 tests
- Navigation settings/members/dashboard
- Affichage des pages
- Requêtes réseau complètes

**Objectif** : Vérifier l'accès aux pages workspaces

---

### 2️⃣ **Board Core Operations** (26 tests)

#### [board-create.spec.ts](e2e/tests/board-create.spec.ts) - 6 tests
- Création depuis Topbar modal
- Création depuis workspace page
- Création depuis dashboard
- Ouverture board existant
- Visibilité et persistance

**Objectif** : Vérifier création/accès board via tous les chemins

#### [board-lists.spec.ts](e2e/tests/board-lists.spec.ts) - 20 tests

**Création & édition (8 tests)**
- Créer liste rapidement
- Renommer avec Escape/Enter
- Prévention création/renommage vide
- Suppression avec confirmation

**Persistance (12 tests)**
- Ordre après refresh
- Noms après refresh
- État server après création
- Multiples cycles de navigation et refresh

**Objectif** : Vérifier opérations CRUD listes et leur persistance

---

### 3️⃣ **Card Management** (40 tests)

#### [board-cards.spec.ts](e2e/tests/board-cards.spec.ts) - 40 tests

**Création (4 tests)**
- Navigation pour création
- Structure de page supportée
- Champs input disponibles
- Multiple cards

**Édition (8 tests)**
- Accès détail modal
- Modification titre
- Modification description
- Changements sans erreurs

**Mouvement (8 tests)**
- Drag inter-listes
- Drag intra-liste
- Reflet changements UI
- Position maintenue

**Suppression (5 tests)**
- Menus actions accessibles
- Options archivage
- Confirmations
- Opérations réversibles

**Persistance (8 tests)**
- Après refresh/navigation
- Queue sync offline
- État entre sessions
- Détails corrects

**Intégration (7 tests)**
- Cycle vie complet
- Multi-boards
- Pas d'interférence nav
- Opérations concurrentes

**Objectif** : Vérifier toute la vie des cartes (création → suppression)

---

### 4️⃣ **User Interactions** (88 tests)

#### [board-drag-drop.spec.ts](e2e/tests/board-drag-drop.spec.ts) - 51 tests

**Drag inter-listes (8 tests)**
- Navigation board
- Structure pour drag
- Cartes identifiables
- Event listeners

**Drag intra-liste (7 tests)**
- Support drag même liste
- Pas mouvement inter-listes
- Reordonnancement multiple
- Reflet positions UI

**Reordonnancement listes (8 tests)**
- Listes draggable
- Reordonnancement fonctionnel
- Première/dernière position
- Contenu préservé

**Drop invalide (8 tests)**
- Feedback cible invalide
- Revert position invalide
- Prévention mauvais type
- Cancel drag outside board

**Scroll & Mobile (10 tests)**
- Scroll position maintenue
- Auto-scroll edges
- Visibilité maintenue
- Mobile viewports
- Coordinates correctes

**Intégration (10 tests)**
- Sequential operations
- Rapid operations
- State persistence
- Works after refresh
- Performance acceptable
- Dark mode support

**Objectif** : Vérifier drag & drop critique pour UX Trello

#### [board-labels.spec.ts](e2e/tests/board-labels.spec.ts) - 11 tests

**Management (5 tests)**
- Appliquer label à carte
- Créer/éditer label
- Changer couleur
- Retirer label
- Multiple labels

**Filtering (3 tests)**
- Filter par single/multiple labels
- Clear filter

**Persistence (3 tests)**
- Après refresh
- Lors déplacement cartes
- Navigation away/back

**Objectif** : Vérifier gestion des labels sur cartes

#### [board-assignees.spec.ts](e2e/tests/board-assignees.spec.ts) - 21 tests

**Assignment (5 tests)**
- Assigner membre
- Multiple assignees
- Retirer assignation
- Réassigner
- Visibles sur card

**Avatars (3 tests)**
- Display avatars
- Name on hover
- Avatar stack

**Filtering (3 tests)**
- Filter par single/multiple
- Filter unassigned

**Members (3 tests)**
- Lister members
- Noms et avatars
- Rôles visibles

**Invitations (4 tests)**
- Inviter par email
- Pending status
- Resend invitation
- Cancel invitation

**Persistence (3 tests)**
- Après refresh
- Lors déplacement cartes
- Navigation away/back

**Objectif** : Vérifier assignation d'équipe

#### [board-collaboration.spec.ts](e2e/tests/board-collaboration.spec.ts) - 26 tests

**Real-time (4 tests)**
- WebSocket établit
- Card changes sync
- List changes real-time
- New cards appear

**Concurrent (4 tests)**
- Édits simultanées synchronisent
- Concurrent drag sync
- Conflits résolus
- UI responsive

**Comments (5 tests)**
- Ajouter commentaire
- Commentaires real-time
- Activity feed updates
- Author/timestamp
- Edit/delete comments

**Notifications (5 tests)**
- Assigned card notification
- Mentioned notification
- Notification center
- Mark as read
- Clear all

**Presence (4 tests)**
- Active users shown
- Online status
- Typing indicator
- Disconnect updates

**Resilience (4 tests)**
- Reconnection works
- Queued actions sent
- No data loss conflicts
- Multi-tabs sync

**Objectif** : Vérifier collaboration temps réel et notifications

---

### 5️⃣ **Robustness & Error Handling** (46 tests)

#### [board-robustness.spec.ts](e2e/tests/board-robustness.spec.ts) - 46 tests

**Refresh en drag (8 tests)**
- Navigation pour simulation
- Reste navigable
- Drag state reset
- Positions préservées
- Placeholders nettoyés
- UI responsive
- Drag reprend
- Pas erreurs

**Refresh en édition (8 tests)**
- Édition state cleared
- Modifications gérées
- Modales fermées
- Inputs réinitialisés
- Contenu non corrompu
- Validation reset
- Pas data loss
- Board recoverable

**Backend indisponible (9 tests)**
- Slow load handled
- localStorage fallback
- Données en cache offline
- Feedback utilisateur
- Persistance localStorage
- Dégradation gracieuse
- Données récupérables
- Sync resumes
- No crashes

**Erreurs API (11 tests)**
- API errors sans crash
- Messages d'erreur affichés
- Toast notifications
- UI rollback
- No operation blocking
- No state modification
- Retry mechanism
- Data consistency
- No sensitive info
- Multiple errors sequential
- Recovery possible

**Intégration (10 tests)**
- Cascading failures
- Content survives restart
- Data consistency
- UX acceptable
- Offline-first seamless
- No deadlock concurrent
- Memory reasonable
- Thread safety
- Cache invalidation
- Error recovery chain

**Objectif** : Vérifier résilience app (erreurs, offline, refresh)

---

## 📈 Récapitulatif par Domaine

| Domaine | Tests | Détail |
|---------|-------|--------|
| **Auth** | 19 | Login, Register, Reset Password |
| **Boards** | 26 | Create, Lists, Persistence |
| **Cards** | 40 | CRUD, Move, Edit, Delete |
| **Drag & Drop** | 51 | Inter/Intra, Lists, Scroll, Mobile |
| **Labels** | 11 | Create, Filter, Persist |
| **Assignees** | 21 | Assign, Avatar, Filter, Invite |
| **Collaboration** | 26 | Real-time, Comments, Notifications, Presence |
| **Robustness** | 46 | Refresh, Offline, Errors |
| **TOTAL** | **246** | ✅ 100% Pass Rate |

---

## 🎯 Ce qui est bien couvert

✅ **Navigation & Auth** - Page login/register/password reset
✅ **Board Management** - Création, listes, persistance
✅ **Card Lifecycle** - Création → Suppression complet
✅ **Drag & Drop** - Inter-listes, intra-liste, listes, scroll
✅ **Labels** - Application, édition, filtrage
✅ **Assignees** - Affectation, avatars, invitations
✅ **Real-time** - WebSocket, updates, notifications
✅ **Robustness** - Erreurs, offline, refresh

---

## ⚠️ Ce qui n'est PAS couvert (À ajouter)

❌ **Checklists & Sous-tâches** - Création, marquer complété, progrès
❌ **Due Dates & Reminders** - Définir dates, notifications, calendar
❌ **Comments avancés** - Mentions, reactions, threading
❌ **Search & Filters avancés** - Recherche texte, filtres custom
❌ **Board Settings** - Titre, description, archivage
❌ **Permissions avancées** - Admin, editor, viewer roles
❌ **File Attachments** - Upload, download, preview
❌ **Activity Timeline** - Historique complet des changements
❌ **Accessibility (A11y)** - Keyboard nav, screen reader, WCAG
❌ **Performance** - Large boards (100+ cartes), bundle size
❌ **Cross-browser** - Firefox, Safari, Mobile browsers
❌ **Bulk Operations** - Sélection multiple, move multiple
❌ **Dark Mode** - Tests visuels pour dark mode
❌ **Export/Import** - Board export, card backup

---

## 🚀 Comment Lancer les Tests

```bash
# Tous les tests
pnpm test:e2e

# Suite spécifique
pnpm exec playwright test e2e/tests/board-cards.spec.ts

# Mode debug
pnpm exec playwright test --debug

# Mode headed (voir navigateur)
pnpm test:e2e:headed

# Rapport HTML
pnpm exec playwright show-report e2e/playwright-report
```

---

## 📝 Notes Importantes

### Principes des Tests
- **Pas de mocking** : Tests naviguent app réelle
- **localStorage & Cache** : Utilisent les mécanismes de l'app
- **Offline-first** : Testent fallback quand backend indisponible
- **Real workflows** : Simulent trajets utilisateur réels

### Exécution
- Tests s'exécutent en parallèle par défaut
- Durée totale : ~60 secondes
- Baseline : test-board-123 doit exister en backend

### Maintenance
- Tests nettoyés des doublons (réduits de 329 → 246)
- Chaque test a une responsabilité claire
- Commentaires explicites pour tests complexes

---

## 🔄 Statut de Réduction

| État | Tests | Changement |
|------|-------|-----------|
| Avant | 329 | - |
| Après | 246 | -83 tests (-25%) |
| Doublons supprimés | 83 | Navigation, structure, interface checks |

**Tests supprimés** :
- "can navigate to board for X testing" - 12 doublons
- "board page structure supports X" - 8 doublons  
- "X interface is/should be accessible" - 15 doublons
- "element count >= 0" - ~30 doublons
- "expect(page.url()).toContain" - ~18 doublons

**Résultat** : 246 tests qui testent réellement des fonctionnalités

---

## 📅 Prochaines Priorités

1. **Checklists** (10-12 tests) - Très utilisé
2. **Due Dates** (10-12 tests) - Core feature
3. **Search & Filters** (15-20 tests) - Important pour UX
4. **Accessibility** (15-20 tests) - Compliance & UX
5. **Performance** (10-15 tests) - Scalability

---

## 📞 Support

Pour ajouter un test :
1. Identifie le suite appropriée (board-X.spec.ts)
2. Ajoute dans `test.describe()` correspondant
3. Suis le pattern des tests existants
4. Lance `pnpm test:e2e` pour vérifier

Pour signaler un problème :
- Vérifiez que test-board-123 existe
- Vérifiez connexion backend
- Vérifiez variables d'env PLAYWRIGHT_TEST_BASE_URL
