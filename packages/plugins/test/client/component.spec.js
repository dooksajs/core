import { describe, it, beforeEach, afterEach, mock } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { JSDOM } from 'jsdom'
import { state, stateGetValue, stateUnsafeSetValue, stateSetValue, error, variable, event, action } from '#core'
import { component } from '../../src/client/component.js'
import { createState } from '../helpers/index.js'

describe('Component plugin', function () {
  let dom
  let rootElement

  beforeEach(async function () {
    // Setup jsdom environment
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost/'
    })
    global.document = dom.window.document
    // @ts-ignore
    global.window = dom.window
    global.HTMLElement = dom.window.HTMLElement
    global.Node = dom.window.Node
    global.MutationObserver = dom.window.MutationObserver
    // @ts-ignore
    global.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({})
    }))

    // Setup state with component plugin
    const stateData = createState([component, error, variable, event, action])
    state.setup(stateData)
    error.setup()
    action.setup({
      actions: {
        testMethod: () => {
        }
      }
    })

    // Mock components registry
    const components = {
      div: {
        id: 'div',
        tag: 'div',
        type: 'container',
        isLoaded: true
      },
      span: {
        id: 'span',
        tag: 'span',
        type: 'text',
        isLoaded: true
      },
      custom: {
        id: 'custom',
        tag: 'custom-element',
        type: 'custom',
        isLoaded: true,
        properties: [
          {
            name: 'title',
            value: 'Default Title'
          }
        ]
      },
      lazy: {
        id: 'lazy',
        tag: 'lazy-element',
        type: 'lazy',
        isLoaded: false,
        component: async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return {}
        }
      },
      'event-comp': {
        id: 'event-comp',
        tag: 'div',
        type: 'container',
        isLoaded: true,
        events: [
          {
            on: 'component/created',
            actionId: 'valid-action'
          }
        ]
      }
    }

    // Initialize component plugin
    component.setup({
      rootId: 'root',
      components
    })

    rootElement = document.getElementById('root')
  })

  afterEach(function () {
    state.restore()
    // Cleanup global objects
    delete global.document
    delete global.window
    delete global.HTMLElement
    delete global.Node
    delete global.MutationObserver
    delete global.fetch
  })

  it('should initialize and replace root element', function () {
    const rootNode = stateGetValue({
      name: 'component/nodes',
      id: 'root'
    })

    strictEqual(rootNode.isEmpty, false)
    ok(rootNode.item instanceof global.HTMLElement)
    strictEqual(rootNode.item.tagName, 'DIV')

    // Check if it is in the document body
    ok(document.body.contains(rootNode.item))
  })

  it('should render child components', async function () {
    const parentId = 'root'
    const childId = 'child-1'

    // Setup child component data in state
    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'span', // Refers to 'span' template
        isTemplate: true
      },
      options: { id: childId }
    })

    // Setup relationships
    stateUnsafeSetValue({
      name: 'component/children',
      value: [childId],
      options: { id: parentId }
    })

    // Trigger render children
    await component.componentRenderChildren({ id: parentId })

    // Verify child node creation
    const childNode = stateGetValue({
      name: 'component/nodes',
      id: childId
    })

    strictEqual(childNode.isEmpty, false)
    strictEqual(childNode.item.tagName, 'SPAN')

    // Verify it is appended to parent
    const parentNode = stateGetValue({
      name: 'component/nodes',
      id: parentId
    }).item

    ok(parentNode.contains(childNode.item))
  })

  it('should set properties on components', async function () {
    const id = 'custom-1'
    const parentId = 'root'

    // Use renderChildren to trigger creation indirectly
    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'custom',
        isTemplate: true
      },
      options: { id }
    })

    // Pre-populate properties in state if we want to simulate override from option/state?
    // Actually renderChildren uses the template from 'component/items' reference.
    // If 'component/items' just points to template id 'custom', it uses defaults.
    // To override, we might need 'component/options' or 'component/properties' set before?
    // The `createTemplate` method applies template properties.
    // To test specific properties, we can verify defaults first.

    await component.componentRenderChildren({
      id: parentId,
      items: [id]
    })

    const node = stateGetValue({
      name: 'component/nodes',
      id
    }).item

    strictEqual(node.tagName, 'CUSTOM-ELEMENT')
    strictEqual(node.getAttribute('title'), 'Default Title')
  })

  it('should update properties when state changes', async function () {
    const id = 'prop-update-test'
    const parentId = 'root'

    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'div',
        isTemplate: true
      },
      options: { id }
    })

    await component.componentRenderChildren({
      id: parentId,
      items: [id]
    })
    const node = stateGetValue({
      name: 'component/nodes',
      id
    }).item

    // Initially no class
    strictEqual(node.getAttribute('class'), null)

    // Update properties in state
    stateSetValue({
      name: 'component/properties',
      value: [{
        name: 'class',
        value: 'updated'
      }],
      options: { id }
    })

    // Verify DOM update
    strictEqual(node.getAttribute('class'), 'updated')
  })

  it('should handle removal of components', async function () {
    const parentId = 'root'
    const childId = 'remove-test'

    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'div',
        isTemplate: true
      },
      options: { id: childId }
    })

    stateSetValue({
      name: 'component/children',
      value: [childId],
      options: { id: parentId }
    })

    await component.componentRenderChildren({
      id: parentId,
      items: [childId]
    })

    // Verify existence
    ok(stateGetValue({
      name: 'component/nodes',
      id: childId
    }).isEmpty === false)

    // Remove
    component.componentRemove({ id: childId })

    // Verify removal from state
    ok(stateGetValue({
      name: 'component/nodes',
      id: childId
    }).isEmpty === true)
    ok(stateGetValue({
      name: 'component/items',
      id: childId
    }).isEmpty === true)

    // Verify removal from parent children list
    const parentChildren = stateGetValue({
      name: 'component/children',
      id: parentId
    })
    // It might be empty or not contain the ID
    if (!parentChildren.isEmpty) {
      ok(!parentChildren.item.includes(childId))
    }
  })

  it('should lazy load components', async function () {
    const id = 'lazy-1'
    const parentId = 'root'

    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'lazy',
        isTemplate: true
      },
      options: { id }
    })

    const promise = component.componentRenderChildren({
      id: parentId,
      items: [id]
    })

    ok(promise instanceof Promise)

    await promise

    const node = stateGetValue({
      name: 'component/nodes',
      id
    }).item
    strictEqual(node.tagName, 'LAZY-ELEMENT')
  })

  it('should trigger events', async function () {
    const id = 'event-test'
    const parentId = 'root'
    const actionId = 'valid-action'

    // Setup action sequence to avoid "No action found" error
    // We use stateSetValue to ensure validation passes or throws
    stateUnsafeSetValue({
      name: 'action/sequences',
      value: ['seq-1'],
      options: { id: actionId }
    })
    stateUnsafeSetValue({
      name: 'action/blockSequences',
      value: ['block-1'],
      options: { id: 'seq-1' }
    })
    stateUnsafeSetValue({
      name: 'action/blocks',
      value: { method: 'testMethod' },
      options: { id: 'block-1' }
    })

    // Verify it exists
    const seq = stateGetValue({
      name: 'action/sequences',
      id: actionId
    })
    ok(!seq.isEmpty)

    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'event-comp',
        isTemplate: true
      },
      options: { id }
    })

    await component.componentRenderChildren({
      id: parentId,
      items: [id]
    })

    // Check if listener was registered
    const listeners = stateGetValue({
      name: 'event/listeners',
      id: 'component/created' + id
    })

    strictEqual(listeners.isEmpty, false)
    strictEqual(listeners.item.includes(actionId), true)
  })

  it('should create scopes and groups', async function () {
    const id = 'scope-test'
    const parentId = 'root'
    const groupId = 'test-group'

    stateUnsafeSetValue({
      name: 'component/items',
      value: {
        id: 'div',
        isTemplate: true,
        groupId
      },
      options: { id }
    })

    await component.componentRenderChildren({
      id: parentId,
      items: [id]
    })

    // Verify scope
    const scope = stateGetValue({
      name: 'variable/scopes',
      id
    })
    strictEqual(scope.isEmpty, false)
    // Scope should contain id and groupId
    ok(scope.item.includes(id))
    ok(scope.item.includes(groupId))

    // Verify group
    const group = stateGetValue({
      name: 'component/groups',
      id: groupId
    })
    strictEqual(group.isEmpty, false)
    ok(group.item.includes(id))
  })
})
