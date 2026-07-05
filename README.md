# Gestionnaire de tâches — Mini-projet Qualité logicielle & tests

Mini-projet réalisé en **TDD** dans le cadre du module Qualité logicielle & tests.

Application de gestion de tâches : création, modification, priorités, tâches terminées, détection des tâches en retard.

## Stack

- **Backend** : Node.js + Express (API REST)
- **Frontend** : HTML/CSS/JS simple (servi par Express)
- **Tests unitaires & intégration** : Jest + Supertest
- **Tests E2E** : Playwright
- **CI/CD** : GitHub Actions

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npm run dev
```

Puis ouvrir http://localhost:3000

## Lancer les tests

```bash
npm test                 # tous les tests (unitaires + intégration)
npm run test:unit        # tests unitaires uniquement
npm run test:integration # tests d'intégration uniquement
npm run e2e              # test E2E (installe d'abord : npx playwright install chromium)
```

## Structure du projet

```
src/
  domain/taskService.js   -> logique métier (testée unitairement)
  routes/taskRoutes.js    -> routes API Express
  app.js                  -> configuration Express
  server.js               -> point d'entrée
public/index.html         -> interface utilisateur
tests/
  unit/                   -> tests unitaires (Jest)
  integration/            -> tests d'intégration API (Supertest)
e2e/                      -> test end-to-end (Playwright)
.github/workflows/ci.yml  -> pipeline CI
QA_REPORT.md              -> rapport qualité
```

## Règles métier principales

- une tâche sans titre (ou avec un titre vide) est refusée ;
- la priorité doit être `basse`, `normale` ou `haute` ;
- une tâche dont la date d'échéance est passée est « en retard » ;
- une tâche terminée n'est **jamais** considérée comme en retard.

## API

| Méthode | Route | Description |
|---|---|---|
| GET | /api/tasks | Liste des tâches (filtre `?status=terminee` ou `?status=en-cours`) |
| GET | /api/tasks/late/count | Nombre de tâches en retard |
| POST | /api/tasks | Créer une tâche `{ title, priority?, dueDate? }` |
| PUT | /api/tasks/:id | Modifier une tâche |
| PATCH | /api/tasks/:id/done | Marquer comme terminée |

## Preuve d'exécution des tests

![Capture écran](capture.png)