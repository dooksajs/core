import { test, expect } from '../fixtures/component.js'

// Test configuration for all heading levels
const headingTestCases = [
  {
    level: 1,
    url: '/_/component/h1',
    rules: ['empty-heading'],
    description: 'h1 heading'
  },
  {
    level: 2,
    url: '/_/component/h2',
    rules: ['empty-heading', 'page-has-heading-one'],
    description: 'h2 heading'
  },
  {
    level: 3,
    url: '/_/component/h3',
    rules: ['empty-heading', 'page-has-heading-one'],
    description: 'h3 heading'
  },
  {
    level: 4,
    url: '/_/component/h4',
    rules: ['empty-heading', 'page-has-heading-one'],
    description: 'h4 heading'
  },
  {
    level: 5,
    url: '/_/component/h5',
    rules: ['empty-heading', 'page-has-heading-one'],
    description: 'h5 heading'
  },
  {
    level: 6,
    url: '/_/component/h6',
    rules: ['empty-heading', 'page-has-heading-one'],
    description: 'h6 heading'
  }
]

/**
 * Helper function to validate heading count
 */
async function validateHeadingCount (page, level) {
  const heading = page.getByRole('heading', { level })
  const count = await heading.count()

  return count
}

// Parameterized tests for basic heading validation
headingTestCases.forEach(({ level, url, rules, description }) => {
  test(`has exactly one ${description}`, async ({ page, axeDisableRules }) => {
    await page.goto(url)

    // Verify page loaded successfully
    await expect(page).toHaveURL(url)

    // Validate heading count
    const count = await validateHeadingCount(page, level)
    expect(count).toBe(1)

    // Add accessibility rules
    axeDisableRules.push(...rules)
  })
})

// Additional validation: verify heading elements exist and are proper HTML elements
headingTestCases.forEach(({ level, url, description }) => {
  test(`${description} has proper HTML structure`, async ({ page, axeDisableRules }) => {
    await page.goto(url)

    const heading = page.getByRole('heading', { level })

    // Verify heading element exists
    await expect(heading).toHaveCount(1)

    // Verify it's the correct HTML element
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
    expect(tagName).toBe(`h${level}`)

    // Add appropriate rules based on level
    if (level === 1) {
      axeDisableRules.push('empty-heading')
    } else {
      axeDisableRules.push('empty-heading', 'page-has-heading-one')
    }
  })
})

// Test that all heading levels work consistently
test('all heading levels maintain consistent structure', async ({ page, axeDisableRules }) => {
  const results = []

  for (const { level, url } of headingTestCases) {
    await page.goto(url)

    const heading = page.getByRole('heading', { level })
    const count = await heading.count()
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase())

    results.push({
      level,
      count,
      tagName,
      expectedTag: `h${level}`,
      passed: count === 1 && tagName === `h${level}`
    })
  }

  // Verify all headings passed
  results.forEach((result) => {
    expect(result.passed).toBe(true)
  })

  // Add appropriate rules (using h1 as reference)
  axeDisableRules.push('empty-heading')
})

// Test accessibility rules are properly configured
headingTestCases.forEach(({ level, url, rules, description }) => {
  test(`${description} accessibility rules are correct`, async ({ page, axeDisableRules }) => {
    await page.goto(url)

    // Verify the correct rules are being applied
    const testRules = []

    if (level === 1) {
      testRules.push('empty-heading')
    } else {
      testRules.push('empty-heading', 'page-has-heading-one')
    }

    // Verify rules match expected
    expect(rules).toEqual(testRules)

    // Add the rules to the fixture
    axeDisableRules.push(...rules)
  })
})
