# Tests du frontend

Ce dossier regroupe les tests unitaires et d’intégration du frontend (Next.js + React), organisés par type de composant.

## Organisation

- `tests/components/` : tests de composants UI (ex: CardModal)
- Fichiers de config:
  - `vitest.config.ts` : configuration Vitest
  - `vitest.setup.ts` : setup global (Jest-DOM)

## Prérequis

- Dépendances de test (déjà ajoutées):
  - Vitest, Testing Library (React + User-Event), JSDOM, Jest-DOM
- Scripts npm:
  - `test` : exécute les tests en mode non-interactif
  - `test:watch` : exécute les tests en mode watch

## Lancer les tests

Dans le dossier `frontend` :

```bash
pnpm install
pnpm test
```

Mode watch:

```bash
pnpm test:watch
```

## Conventions

- Nommage des fichiers: `*.test.tsx` ou `*.spec.tsx`
- Découverte: uniquement dans `tests/**` (voir `vitest.config.ts`)
- Environnement: `jsdom` (DOM simulé pour tests React)
- Assertions DOM: via `@testing-library/jest-dom`

## Écrire un test de composant

Exemple minimal:

```tsx
import { render, screen } from "@testing-library/react";
import MyComponent from "../../components/MyComponent";

test("affiche le titre", () => {
  render(<MyComponent title="Bonjour" />);
  expect(screen.getByText(/bonjour/i)).toBeInTheDocument();
});
```

## Tester CardModal

- Exemple complet: voir [tests/components/CardModal.test.tsx](tests/components/CardModal.test.tsx)
- Les interactions (édition de titre, description, membres, labels, due date, commentaires) vérifient l’émission des `CustomEvent`:
  - `epitrello:card-title-updated`
  - `epitrello:card-description-updated`
  - `epitrello:card-members-updated`
  - `epitrello:card-labels-updated`
  - `epitrello:card-duedate-updated`
  - `epitrello:card-comments-updated`

Utilitaire d’attente d’événement:

```ts
function waitForEvent<T = any>(name: string): Promise<T> {
  return new Promise((resolve) => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as T;
      window.removeEventListener(name, handler as EventListener);
      resolve(detail);
    };
    window.addEventListener(name, handler as EventListener);
  });
}
```

## Conseils

- Préférez `userEvent` à `fireEvent` pour des interactions plus réalistes.
- Gardez les tests unitaires focalisés: une fonctionnalité par test.
- Évitez les snapshots sur du markup instable; privilégiez des assertions ciblées.

## Dépannage

- Si aucun test n’est détecté, vérifier `include` dans [vitest.config.ts](vitest.config.ts).
- Erreurs de rendu: assurez-vous que les composants n’utilisent pas des APIs non disponibles en JSDOM.
- Logs utiles: certains composants journalisent les actions, visibles dans la sortie de test.
