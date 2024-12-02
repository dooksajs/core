import { test as base, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * @import {Page, TestInfo} from '@playwright/test'
 */

export const test = base.extend({
  axeWithTags: [
    ['EN-301-549', 'best-practice'],
    // @ts-ignore
    { option: true }
  ],
  axeDisableRules: [
    ['landmark-one-main'],
    // @ts-ignore
    { option: true }
  ],
  accessabilityCheck: [
    /**
     * @param {Object} param
     * @param {Page} [param.page]
     * @param {string[]} [param.axeDisableRules]
     * @param {string[]} [param.axeWithTags]
     * @param {Function} use
     * @param {TestInfo} testInfo
     */
    async ({ page, axeDisableRules, axeWithTags }, use, testInfo) => {
      await use({
        axeDisableRules,
        axeWithTags
      })

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(axeWithTags)
        .disableRules(axeDisableRules)
        .analyze()

      const violationFingerprints = accessibilityScanResults.violations.map(violation => ({
        rule: violation.id,
        help: violation.help,
        targets: violation.nodes.map(node => node.target)
      }))

      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(violationFingerprints, null, 2),
        contentType: 'application/json'
      })

      expect(accessibilityScanResults.violations).toHaveLength(0)
    },
    // @ts-ignore
    { auto: true }
  ]
})

export { expect } from '@playwright/test'
