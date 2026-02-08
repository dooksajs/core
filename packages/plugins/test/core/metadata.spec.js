import { describe, it, afterEach, beforeEach } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { metadata, state } from '#core'
import { createState, mockWindow } from '../helpers/index.js'

/**
 * Helper function to create state data
 * @returns {Object} State data object
 */
function createStateData () {
  return createState([metadata])
}

describe('Metadata Plugin', () => {
  let restoreWindow

  beforeEach(function () {
    // Reset window mock for each test
    restoreWindow = mockWindow(this).restore
  })

  afterEach(() => {
    state.restore()
    if (restoreWindow) restoreWindow()
  })

  describe('Setup & Initialization', () => {
    it('should initialize with default state', async () => {
      const stateData = createStateData()
      state.setup(stateData)
      metadata.setup()

      const languages = state.stateGetValue({ name: 'metadata/languages' }).item
      const defaultLanguage = state.stateGetValue({ name: 'metadata/defaultLanguage' }).item
      const currentLanguage = state.stateGetValue({ name: 'metadata/currentLanguage' }).item

      deepStrictEqual(languages, ['en'])
      strictEqual(defaultLanguage, 'en')
      strictEqual(currentLanguage, '')
    })

    it('should initialize with custom options', async () => {
      const stateData = createStateData()
      state.setup(stateData)

      const customLanguages = ['en', 'fr', 'es']
      const customDefault = 'en'

      metadata.setup({
        languages: customLanguages,
        defaultLanguage: customDefault
      })

      const languages = state.stateGetValue({ name: 'metadata/languages' }).item
      const defaultLanguage = state.stateGetValue({ name: 'metadata/defaultLanguage' }).item

      deepStrictEqual(languages, customLanguages)
      strictEqual(defaultLanguage, customDefault)
    })
  })

  describe('URL Parameter Handling', () => {
    it('should set current language from URL parameter', async () => {
      // Mock window with search params BEFORE setup
      if (restoreWindow) restoreWindow()
      // Create a mock context for mockWindow since we are inside a test
      const mockContext = {
        mock: {
          fn: () => {
          }
        }
      }
      restoreWindow = mockWindow(mockContext, { search: '?lang=fr' }).restore

      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      const currentLanguage = state.stateGetValue({ name: 'metadata/currentLanguage' }).item
      strictEqual(currentLanguage, 'fr')
    })

    it('should ignore invalid language in URL parameter', async () => {
      if (restoreWindow) restoreWindow()
      const mockContext = {
        mock: {
          fn: () => {
          }
        }
      }
      restoreWindow = mockWindow(mockContext, { search: '?lang=de' }).restore

      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      const currentLanguage = state.stateGetValue({ name: 'metadata/currentLanguage' }).item
      strictEqual(currentLanguage, '')
    })

    it('should ignore default language in URL parameter', async () => {
      if (restoreWindow) restoreWindow()
      const mockContext = {
        mock: {
          fn: () => {
          }
        }
      }
      restoreWindow = mockWindow(mockContext, { search: '?lang=en' }).restore

      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      const currentLanguage = state.stateGetValue({ name: 'metadata/currentLanguage' }).item
      strictEqual(currentLanguage, '')
    })
  })

  describe('State Validation Logic', () => {
    it('should revert when setting invalid language', async () => {
      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      // Initially empty (default)
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, '')

      // Set to valid language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'fr')

      // Set to invalid language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      // Should revert to previous valid value ('fr') or default logic?
      // The handler says: value: data.previous || ''
      // Let's see if it reverts to 'fr'
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'fr')
    })

    it('should revert to previous value when setting default language', async () => {
      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      // Set to 'fr'
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'fr')

      // Set to 'en' (default)
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      // Should revert to previous valid value ('fr')
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'fr')
    })

    it('should prevent setting default language from initial state', async () => {
      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr'],
        defaultLanguage: 'en'
      })

      // Initial is ''

      // Try setting 'en'
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      // Previous was undefined or empty.
      // `data.previous` might be undefined on first set? No, it's an update.
      // But `stateSetValue` creates the value.
      // If it's the first time, previous might be undefined.

      // Actually `setup()` sets it to `currentLanguage` (which is '' initially).
      // So previous is ''.

      // So setting 'en' -> triggers listener -> checks 'en' === 'en' -> sets value to previous ('') || '' -> ''.
      // So it stays empty.

      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, '')
    })

    it('should handle revert logic correctly', async () => {
      const stateData = createStateData()
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr', 'es'],
        defaultLanguage: 'en'
      })

      // Set 'fr'
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'fr')

      // Set 'es'
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'es'
      })
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'es')

      // Set invalid 'de'
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })
      // Should revert to 'es'
      strictEqual(state.stateGetValue({ name: 'metadata/currentLanguage' }).item, 'es')
    })
  })
})
