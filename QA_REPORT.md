# Rapport QA — Gestionnaire de tâches

## 1. Présentation du projet

- **Thème choisi** : Thème 1 — Gestionnaire de tâches.
- **Objectif** : construire une petite application de gestion de tâches en appliquant une démarche qualité complète (TDD, tests unitaires, tests d'intégration, test E2E, CI/CD).
- **Stack** : Node.js + Express pour l'API, frontend HTML/JS simple, Jest + Supertest pour les tests, Playwright pour le E2E, GitHub Actions pour la CI.
- **Principales fonctionnalités** : créer une tâche, la modifier, la marquer comme terminée, filtrer par statut, compter les tâches en retard.

## 2. Fonctionnalités développées

- Création d'une tâche avec titre, priorité et date d'échéance optionnelle.
- Validation : titre obligatoire, priorité dans une liste autorisée, date valide.
- Modification d'une tâche existante.
- Marquage d'une tâche comme terminée.
- Filtrage des tâches par statut (`terminee` / `en-cours`).
- Calcul du nombre de tâches en retard.
- Interface web simple : formulaire d'ajout, liste des tâches, bouton « Terminer », affichage des erreurs.

J'ai volontairement gardé un périmètre réduit mais entièrement testé, plutôt qu'un projet plus ambitieux incomplet.

## 3. Règles métier principales

1. Une tâche sans titre (ou avec un titre composé uniquement d'espaces) est invalide.
2. La priorité doit appartenir à la liste autorisée : `basse`, `normale`, `haute`.
3. Une tâche dont la date d'échéance est passée est considérée « en retard ».
4. Une tâche terminée ne doit plus jamais être considérée comme en retard, même si son échéance est passée.

## 4. Démarche TDD

J'ai appliqué le TDD sur la fonctionnalité « détection des tâches en retard » et sur la validation à la création. Voici 3 cycles documentés.

### Cycle 1 — Une tâche sans titre est refusée

- **Comportement attendu** : `createTask({ title: '' })` doit lever l'erreur « Le titre est obligatoire ».
- **Test écrit** : `une tâche sans titre est refusée` dans `tests/unit/taskService.test.js`.
- **Résultat initial** : échec — `createTask` acceptait n'importe quel objet et créait la tâche sans vérifier le titre.
- **Code ajouté** : ajout de la vérification `if (!title || title.trim() === '') throw new Error('Le titre est obligatoire')` au début de `createTask`.
- **Résultat final** : succès.

### Cycle 2 — Une tâche avec échéance passée est en retard

- **Comportement attendu** : `isLate(task)` renvoie `true` si `dueDate` est antérieure à la date courante.
- **Test écrit** : `une tâche avec une échéance passée est en retard` (avec une date `now` injectée dans la fonction pour rendre le test déterministe).
- **Résultat initial** : échec — la fonction `isLate` n'existait pas.
- **Code ajouté** : implémentation minimale `return new Date(task.dueDate) < now`.
- **Résultat final** : succès.

### Cycle 3 — Une tâche terminée n'est plus en retard

- **Comportement attendu** : une tâche terminée dont l'échéance est passée ne doit pas être comptée en retard.
- **Test écrit** : `une tâche terminée avec une échéance passée n'est plus en retard`.
- **Résultat initial** : échec — `isLate` renvoyait `true` car elle ne regardait que la date, pas le statut `done`.
- **Code ajouté** : ajout de `if (task.done) return false;` en première ligne de `isLate`, puis refactor pour gérer aussi le cas `dueDate === null`.
- **Résultat final** : succès.

## 5. Risques qualité identifiés

- **Mauvaise validation des données** : l'API pourrait accepter une tâche sans titre ou avec une priorité inventée → couvert par les tests unitaires et d'intégration (retour 400).
- **Erreur de calcul du retard** : confusion possible entre tâche terminée et tâche en retard → couvert par les cycles TDD 2 et 3.
- **Régression sur une règle métier** : une modification future pourrait casser la règle « terminée ≠ en retard » → les tests unitaires servent de filet de sécurité, exécutés à chaque push par la CI.
- **Mauvais affichage côté utilisateur** : la tâche créée pourrait ne pas apparaître dans la liste → couvert par le test E2E.
- **État incohérent en mémoire entre les tests** : les tests partageaient le même tableau de tâches → résolu avec `resetTasks()` dans un `beforeEach`.

## 6. Stratégie de tests

- **Tests unitaires** sur `taskService` : c'est là que vivent toutes les règles métier. Ils sont rapides, isolés, et permettent de tester facilement les cas limites (titre vide, espaces, date invalide) sans lancer de serveur.
- **Tests d'intégration** sur les routes API : ils vérifient que la route Express, la validation et le service fonctionnent ensemble, avec les bons statuts HTTP (201, 400, 404) et le bon format JSON. Un test unitaire ne suffit pas car une route peut mal brancher le service.
- **Test E2E** sur le parcours « créer une tâche → la voir dans la liste → la terminer » : c'est le parcours principal de l'application, celui qu'un utilisateur réel ferait en premier. Il vérifie le frontend, l'API et la logique métier en même temps.
- **Ce qui est couvert** : toutes les règles métier, toutes les routes API, le parcours utilisateur principal et un cas d'erreur visible côté interface.
- **Ce qui n'est pas couvert** : la persistance (stockage en mémoire uniquement), les tests de charge, la compatibilité multi-navigateurs (E2E lancé sur Chromium seulement).

## 7. Tests unitaires réalisés

Fichier : `tests/unit/taskService.test.js` (15 tests)

- Cas nominaux : création valide, priorité par défaut, modification, filtre par statut, comptage des retards.
- Cas limites : titre composé uniquement d'espaces, tâche sans date d'échéance, tâche terminée avec échéance passée.
- Cas d'erreur : titre vide, priorité invalide, date invalide, tâche introuvable, statut de filtre inconnu.

Commande : `npm run test:unit`

## 8. Tests d'intégration réalisés

Fichier : `tests/integration/tasks.api.test.js` (11 tests, avec Supertest)

- Cas nominaux : POST 201 + JSON de la tâche, GET liste, PATCH done, PUT modification, compteur de retards.
- Cas d'erreur : POST sans titre → 400, priorité invalide → 400, tâche inexistante → 404, filtre inconnu → 400.
- Chaque test vérifie le **statut HTTP** et le **format de la réponse JSON**.

Commande : `npm run test:integration`

## 9. Test E2E réalisé

Fichier : `e2e/tasks.spec.js` (Playwright)

- **Parcours testé** : l'utilisateur ouvre la page, remplit le formulaire (titre + priorité haute), soumet, voit la tâche apparaître dans la liste, clique sur « Terminer » et voit la tâche barrée.
- **Deuxième test** : soumettre le formulaire sans titre affiche le message d'erreur.
- **Sélecteurs robustes** : uniquement des attributs `data-testid` (pas de sélecteurs CSS fragiles liés au style).
- Playwright démarre lui-même le serveur grâce à l'option `webServer` de `playwright.config.js`.

Commande : `npm run e2e`

## 10. Pipeline CI/CD

- **Où** : `.github/workflows/ci.yml` (GitHub Actions).
- **Déclenchement** : à chaque `push` et chaque `pull request`.
- **Commandes exécutées** : `npm ci`, puis `npm run test:unit`, puis `npm run test:integration` ; un second job installe Chromium et lance `npm run e2e`.
- **Si un test échoue** : le job devient rouge, le job E2E n'est pas lancé (grâce à `needs: tests`) et le commit est marqué comme échoué sur GitHub.
- **Limites actuelles** : pas de déploiement (CI seulement, pas de CD), pas de mesure de couverture publiée, E2E sur un seul navigateur.

## 11. Utilisation de l'IA générative

- **Outil utilisé** : Claude (Anthropic).
- **Prompts utilisés** : demande de proposition de cas limites pour la validation des tâches ; relecture des tests d'intégration ; aide à la structuration de ce rapport QA ; explication du fonctionnement de `webServer` dans Playwright.
- **Ce qui a été conservé** : la liste des cas limites proposés (titre avec espaces uniquement, date invalide), la structure du rapport.
- **Ce qui a été modifié** : les noms de tests générés étaient en anglais, je les ai réécrits en français pour rester cohérent ; j'ai simplifié une version proposée de `isLate` qui gérait des cas inutiles (fuseaux horaires).
- **Ce qui a été refusé** : une suggestion d'ajouter une base de données SQLite, hors périmètre pour ce projet.
- **Limites observées** : l'IA propose parfois des tests redondants ou des assertions trop vagues (`toBeTruthy`) qu'il faut remplacer par des assertions précises. Je reste responsable du code rendu : chaque test a été relu et exécuté.

## 12. Limites actuelles

- Stockage en mémoire : les tâches sont perdues au redémarrage du serveur.
- Pas d'authentification ni de gestion multi-utilisateurs.
- Pas de suppression de tâche.
- E2E limité à Chromium.

## 13. Améliorations possibles

- Persister les tâches dans une base (SQLite ou PostgreSQL) avec une base de test dédiée.
- Ajouter la suppression et le tri des tâches.
- Publier la couverture de tests (jest --coverage) dans la CI et ajouter un badge.
- Ajouter un test E2E supplémentaire sur le filtre par statut.
- Ajouter des tests d'accessibilité basiques (axe-core).
