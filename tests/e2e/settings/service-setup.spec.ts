import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

// A fresh install: nothing set up yet, and the welcome offered on launch.
test.use({ storageState: { cookies: [], origins: [] } })

test('the welcome sums up Service setup and Review opens the checklist', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  const setup = page.getByTestId('ai-setup-dialog')
  const services = setup.getByTestId('ai-setup-services')
  await expect(services.getByRole('heading', { name: 'Service setup' })).toBeVisible()
  const summary = services.getByTestId('service-setup-summary')
  await expect(summary.locator('[data-service-group="ai"]')).toContainText('AI0/2')
  await expect(summary.locator('[data-service-group="storage"]')).toContainText('Local only')

  await services.getByRole('button', { name: 'Review' }).click()
  await expect(setup).toHaveCount(0)
  const panel = page.getByTestId('settings-service-setup-panel')
  await expect(panel).toBeVisible()
  await expect(page.getByTestId('settings-section-setup')).toHaveAttribute('aria-selected', 'true')

  const design = panel.locator('[data-service="design-model"]')
  await expect(design).toHaveAttribute('data-status', 'todo')
  await expect(design).toContainText('Not configured')
  const storage = panel.locator('[data-service="cloud-storage"]')
  await expect(storage).toHaveAttribute('data-status', 'local-only')
  // Review and Fast tasks are assignable but unused, so they are not on the list.
  await expect(panel.locator('[data-service="review-model"]')).toHaveCount(0)

  await storage.click()
  await expect(page.getByTestId('settings-storage-panel')).toBeVisible()
})
