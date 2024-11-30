import { test, expect } from '@playwright/test'

test('has one h1 element', async ({ page }) => {
  await page.goto('/_/component/h1')

  const elements = await page.locator('h1').count()

  await expect(elements).toBe(1)
})
