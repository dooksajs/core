import { test, expect } from '../fixtures/component.js'

test('has one h1 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h1')

  const oneH1Element = await page.getByRole('heading', { level: 1 }).count()

  await expect(oneH1Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading')
})

test('has one h2 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h2')

  const oneH2Element = await page.getByRole('heading', { level: 2 }).count()

  await expect(oneH2Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading', 'page-has-heading-one')
})

test('has one h3 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h3')

  const oneH2Element = await page.getByRole('heading', { level: 3 }).count()

  await expect(oneH2Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading', 'page-has-heading-one')
})

test('has one h4 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h4')

  const oneH2Element = await page.getByRole('heading', { level: 4 }).count()

  await expect(oneH2Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading', 'page-has-heading-one')
})

test('has one h5 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h5')

  const oneH2Element = await page.getByRole('heading', { level: 5 }).count()

  await expect(oneH2Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading', 'page-has-heading-one')
})

test('has one h6 element', async ({ page, axeDisableRules }) => {
  await page.goto('/_/component/h6')

  const oneH2Element = await page.getByRole('heading', { level: 6 }).count()

  await expect(oneH2Element).toBe(1)

  // add axe rules
  axeDisableRules.push('empty-heading', 'page-has-heading-one')
})

