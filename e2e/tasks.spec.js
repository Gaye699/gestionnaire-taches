const { test, expect } = require('@playwright/test');

// Test E2E : parcours utilisateur complet
// 1. L'utilisateur crée une tâche via le formulaire
// 2. La tâche apparaît dans la liste
// 3. Il la marque comme terminée et voit le changement visuel

test('un utilisateur crée une tâche, la voit dans la liste puis la termine', async ({ page }) => {
  await page.goto('/');

  // Créer une tâche
  await page.getByTestId('task-title-input').fill('Envoyer le TP au prof');
  await page.getByTestId('task-priority-select').selectOption('haute');
  await page.getByTestId('task-submit').click();

  // La tâche apparaît dans la liste
  const item = page.getByTestId('task-item').filter({ hasText: 'Envoyer le TP au prof' });
  await expect(item).toBeVisible();
  await expect(item).toContainText('haute');

  // Marquer comme terminée
  await item.getByTestId('task-done-button').click();

  // La tâche est barrée (classe done) et le bouton disparaît
  const doneItem = page.getByTestId('task-item').filter({ hasText: 'Envoyer le TP au prof' });
  await expect(doneItem).toHaveClass(/done/);
  await expect(doneItem.getByTestId('task-done-button')).toHaveCount(0);
});

test('créer une tâche sans titre affiche un message d\'erreur', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('task-submit').click();

  await expect(page.getByTestId('error-message')).toHaveText('Le titre est obligatoire');
});
