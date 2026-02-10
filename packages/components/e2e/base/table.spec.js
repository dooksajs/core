import { test, expect } from '../fixtures/component.js'

const tableComponents = [
  {
    name: 'table',
    tag: 'table'
  },
  {
    name: 'thead',
    tag: 'thead'
  },
  {
    name: 'tbody',
    tag: 'tbody'
  },
  {
    name: 'tfoot',
    tag: 'tfoot'
  },
  {
    name: 'tr',
    tag: 'tr'
  },
  {
    name: 'th',
    tag: 'th'
  },
  {
    name: 'td',
    tag: 'td'
  },
  {
    name: 'caption',
    tag: 'caption'
  },
  {
    name: 'col',
    tag: 'col'
  },
  {
    name: 'colgroup',
    tag: 'colgroup'
  }
]

tableComponents.forEach(({ name, tag }) => {
  test(`${name} renders correctly`, async ({ page, axeDisableRules }) => {
    // Disable rules that fail for isolated table elements
    axeDisableRules.push(
      'landmark-one-main',
      'page-has-heading-one',
      'region',
      'scope-attr-valid',
      'table-duplicate-name',
      'table-fake-caption',
      'td-headers-attr',
      'th-has-data-cells',
      'aria-required-parent',
      'aria-required-children'
    )

    await page.goto(`/_/component/${name}`)

    const element = page.locator(tag).first()
    await expect(element).toHaveCount(1)

    const tagName = await element.evaluate(el => el.tagName.toLowerCase())
    expect(tagName).toBe(tag)
  })
})
