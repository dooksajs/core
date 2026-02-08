import { describe, it, after, afterEach, beforeEach, mock } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { JSDOM } from 'jsdom'
import { state, stateUnsafeSetValue, stateGetValue, error } from '#core'
import { icon } from '#client'
import { component } from '../../src/client/component.js'
import { createTestServer, createState } from '../helpers/index.js'

describe('Icon plugin', function () {
  const testServer = createTestServer()
  let dom
  let hostname

  beforeEach(async function () {
    // Setup jsdom environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    global.document = dom.window.document
    // @ts-ignore
    global.window = dom.window
    global.screen = dom.window.screen
    Object.defineProperty(global, 'navigator', {
      value: dom.window.navigator,
      writable: true
    })
    global.HTMLElement = dom.window.HTMLElement
    global.Node = dom.window.Node

    // Start test server with icon-server fixture
    hostname = await testServer.start({
      plugins: [
        {
          type: 'fixture',
          name: 'icon-server.js',
          setup: {}
        }
      ]
    })

    // Setup state
    const stateData = createState([icon, component, error])
    state.setup(stateData)
    error.setup()

    // Setup icon plugin with test server URL
    icon.setup({
      apiUrl: hostname
    })
  })

  afterEach(async function () {
    await testServer.restore()
    state.restore()
    // Cleanup errors
    error.errorClearErrors({})
    // Cleanup global objects
    delete global.document
    delete global.window
    delete global.screen
    // delete global.navigator -- cannot delete
    delete global.HTMLElement
    delete global.Node
  })

  after(async () => {
    await testServer.stop()
  })

  it('should fetch and render an icon', async function () {
    const componentId = 'comp-1'
    const iconId = 'mdi:home'

    // Create mock element
    const element = document.createElement('div')
    element.dataset.icon = iconId

    // Set component node in state
    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    // Trigger render
    icon.iconRender(componentId)

    // Wait for batch timeout and fetch
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify icon rendered
    ok(element.innerHTML.includes('<svg'), 'SVG should be rendered')
    ok(element.innerHTML.includes('path'), 'SVG path should be present')
    ok(element.classList.contains('fade-in'), 'Should have fade-in class')

    // Verify cache was updated
    const cachedIcon = stateGetValue({
      name: 'icon/items',
      id: iconId
    })
    strictEqual(cachedIcon.isEmpty, false)
  })

  it('should use cached icon if available', async function () {
    const componentId = 'comp-cache'
    const iconId = 'mdi:cached-icon'

    // Pre-populate cache
    state.stateSetValue({
      name: 'icon/items',
      value: '<svg>cached</svg>',
      options: { id: iconId }
    })

    // Create mock element
    const element = document.createElement('div')
    element.dataset.icon = iconId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    // Spy on fetch to ensure no request is made
    const fetchSpy = mock.method(global, 'fetch')

    // Trigger render
    icon.iconRender(componentId)

    // Verify immediate render from cache
    strictEqual(element.innerHTML, '<svg>cached</svg>')
    strictEqual(fetchSpy.mock.callCount(), 0)
  })

  it('should handle icon aliases', async function () {
    const componentId = 'comp-alias'
    const iconId = 'mdi:alias-icon' // Defined in icon-server.js to be alias of original-icon

    const element = document.createElement('div')
    element.dataset.icon = iconId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    icon.iconRender(componentId)

    await new Promise(resolve => setTimeout(resolve, 100))

    ok(element.innerHTML.includes('<svg'), 'SVG should be rendered for alias')

    // Verify alias was stored in state
    const alias = stateGetValue({
      name: 'icon/aliases',
      id: iconId
    })
    strictEqual(alias.isEmpty, false)
    strictEqual(alias.item, 'mdi:original-icon')
  })

  it('should use cached alias if available', async function () {
    const componentId = 'comp-cached-alias'
    const aliasId = 'mdi:cached-alias'
    const targetId = 'mdi:target-icon'

    // Pre-populate target icon
    state.stateSetValue({
      name: 'icon/items',
      value: '<svg>target</svg>',
      options: { id: targetId }
    })

    // Pre-populate alias
    state.stateSetValue({
      name: 'icon/aliases',
      value: targetId,
      options: { id: aliasId }
    })

    const element = document.createElement('div')
    element.dataset.icon = aliasId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    const fetchSpy = mock.method(global, 'fetch')

    icon.iconRender(componentId)

    strictEqual(element.innerHTML, '<svg>target</svg>')
    strictEqual(fetchSpy.mock.callCount(), 0)
  })

  it('should batch requests for same prefix', async function () {
    const id1 = 'comp-batch-1'
    const id2 = 'comp-batch-2'
    const icon1 = 'mdi:icon-1'
    const icon2 = 'mdi:icon-2'

    const el1 = document.createElement('div')
    el1.dataset.icon = icon1
    stateUnsafeSetValue({
      name: 'component/nodes',
      value: el1,
      options: { id: id1 }
    })

    const el2 = document.createElement('div')
    el2.dataset.icon = icon2
    stateUnsafeSetValue({
      name: 'component/nodes',
      value: el2,
      options: { id: id2 }
    })

    // Trigger both renders immediately
    icon.iconRender(id1)
    icon.iconRender(id2)

    // Wait for batch processing
    await new Promise(resolve => setTimeout(resolve, 100))

    ok(el1.innerHTML.includes('<svg'))
    ok(el2.innerHTML.includes('<svg'))

    // Verify cache
    const cache1 = stateGetValue({
      name: 'icon/items',
      id: icon1
    })
    const cache2 = stateGetValue({
      name: 'icon/items',
      id: icon2
    })
    strictEqual(cache1.isEmpty, false)
    strictEqual(cache2.isEmpty, false)
  })

  it('should handle 404/missing icons gracefully', async function () {
    const componentId = 'comp-404'
    const iconId = 'missing:icon' // icon-server returns 404 for 'missing' prefix

    const element = document.createElement('div')
    element.dataset.icon = iconId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    icon.iconRender(componentId)

    await new Promise(resolve => setTimeout(resolve, 100))

    // Should render fallback icon
    ok(element.innerHTML.includes('<svg'), 'Fallback SVG should be rendered')

    // Check if error was logged
    strictEqual(error.errorGetErrorCount(), 1)
    const errors = error.errorGetErrors()
    ok(errors.length > 0)
    ok(errors[0].message && errors[0].message.includes('could not find icon'))
  })

  it('should handle missing icon in response', async function () {
    // Scenario where server returns 200 OK but icon is not in data.icons
    const componentId = 'comp-missing-in-response'
    const iconId = 'mdi:not-found' // icon-server skips this icon

    const element = document.createElement('div')
    element.dataset.icon = iconId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    icon.iconRender(componentId)

    await new Promise(resolve => setTimeout(resolve, 100))

    // Should NOT change innerHTML (remains empty)
    strictEqual(element.innerHTML, '')
  })

  it('should handle network errors', async function () {
    const componentId = 'comp-error'
    const iconId = 'error:icon'

    // Configure icon plugin to use invalid URL
    icon.setup({
      apiUrl: 'http://invalid-url'
    })

    const element = document.createElement('div')
    element.dataset.icon = iconId

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: element,
      options: { id: componentId }
    })

    icon.iconRender(componentId)

    await new Promise(resolve => setTimeout(resolve, 100))

    strictEqual(error.errorGetErrorCount(), 1)
    const errors = error.errorGetErrors()
    ok(errors.length > 0)
    ok(errors[0].message && errors[0].message.includes('Failed to fetch icons'))
  })

  it('should throw error if component does not exist', function () {
    try {
      icon.iconRender('non-existent')
      ok(false, 'Should have thrown error')
    } catch (error) {
      strictEqual(error.message, 'Component does not exist')
    }
  })
})
