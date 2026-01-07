import { test as base, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * @import {Page, TestInfo} from '@playwright/test'
 */

// Component-specific rule presets
const COMPONENT_RULE_PRESETS = {
  // Base elements that don't need structural heading rules
  base: ['landmark-one-main', 'page-has-heading-one'],
  // Heading elements - only need empty-heading check
  heading: ['landmark-one-main', 'page-has-heading-one'],
  // Interactive elements - need name rules but not structural
  interactive: ['landmark-one-main', 'page-has-heading-one'],
  // Form elements - need label rules but not structural
  form: ['landmark-one-main', 'page-has-heading-one'],
  // Content elements - minimal rules
  content: ['landmark-one-main', 'page-has-heading-one'],
  // All rules disabled
  none: ['landmark-one-main', 'page-has-heading-one', 'empty-heading', 'button-name', 'link-name', 'label', 'image-alt']
}

/**
 * @typedef {Object} AccessibilityCheckHelpers
 * @property {string[]} axeDisableRules - Array of rules to disable
 * @property {string[]} axeWithTags - Array of tags to use
 * @property {(presetName: string) => void} applyPreset - Apply component-specific rule preset
 * @property {(rules: string|string[]) => void} addRules - Add specific rules to disable
 * @property {(rules: string|string[]) => void} removeRules - Remove specific rules from disabled list
 * @property {() => void} resetRules - Reset to original rules
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
  /**
   * Enhanced accessibility check with rule override capability
   * @param {Object} param
   * @param {Page} [param.page]
   * @param {string[]} [param.axeDisableRules]
   * @param {string[]} [param.axeWithTags]
   * @param {Function} use
   * @param {TestInfo} testInfo
   */
  accessabilityCheck: [
    async ({ page, axeDisableRules, axeWithTags }, use, testInfo) => {
      // Store the original rules for potential restoration
      const originalRules = [...axeDisableRules]

      /** @type {AccessibilityCheckHelpers} */
      const helpers = {
        axeDisableRules,
        axeWithTags,
        applyPreset: (presetName) => {
          if (COMPONENT_RULE_PRESETS[presetName]) {
            axeDisableRules.length = 0
            axeDisableRules.push(...COMPONENT_RULE_PRESETS[presetName])
          }
        },
        addRules: (rules) => {
          const rulesArray = Array.isArray(rules) ? rules : [rules]
          rulesArray.forEach(rule => {
            if (!axeDisableRules.includes(rule)) {
              axeDisableRules.push(rule)
            }
          })
        },
        removeRules: (rules) => {
          const rulesArray = Array.isArray(rules) ? rules : [rules]
          rulesArray.forEach(rule => {
            const index = axeDisableRules.indexOf(rule)
            if (index > -1) {
              axeDisableRules.splice(index, 1)
            }
          })
        },
        resetRules: () => {
          axeDisableRules.length = 0
          axeDisableRules.push(...originalRules)
        }
      }

      await use(helpers)

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
