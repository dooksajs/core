# createAction API Reference

## Overview

The `createAction` function compiles declarative action sequences into executable compiled actions.

## Import

```javascript
import createAction from '@dooksa/create-action'
```

## Function Signature

```javascript
function createAction(
  id: string,
  data: ActionValue[],
  dependencies?: string[],
  methods?: Object.<string, boolean>
): Action
```

## Parameters

### `id` (string, required)

Unique identifier for the action. This becomes the root action ID and is used in debugging and action management.

**Example:**
```javascript
createAction('my-action', [...])
```

### `data` (ActionValue[], required)

Array of action step objects that define the workflow. Each object represents a single step in the action sequence.

**Structure:**
```javascript
[
  {
    $id: 'step_name',        // Optional: Name for referencing
    method_name: { ... }     // Action method and its parameters
  },
  // ... more steps
]
```

### `dependencies` (string[], optional, default: `[]`)

Array of plugin or action dependencies required by this action. Used for dependency management and loading order.

**Example:**
```javascript
createAction('my-action', [...], ['plugin-a', 'plugin-b'])
```

### `methods` (Object, optional, default: `availableMethods`)

Object mapping of allowed action method names to `true`. Restricts which methods can be used in the action.

**Example:**
```javascript
createAction('my-action', [...], [], {
  action_dispatch: true,
  state_setValue: true
})
```

## Returns

### Action Object

```javascript
{
  id: string,                    // The action identifier
  blocks: Object.<string, ActionBlock>,  // Compiled block definitions
  blockSequences: Object.<string, string[]>,  // Execution sequences
  sequences: string[],           // Array of sequence IDs
  dependencies: string[]         // Required dependencies
}
```

## ActionBlock Structure

```javascript
{
  key?: string,           // Property name (for nested blocks)
  method?: string,        // Action method name
  dataType?: string,      // Data type: 'array', 'object'
  value?: string,         // Primitive value
  blockValue?: string,    // Single child block reference
  blockValues?: string[], // Array of child block references
  ifElse?: boolean,       // Flag for conditional blocks
  blockSequence?: string  // Associated sequence ID
}
```

## ActionValue Types

### Basic Action Object

```javascript
{
  $id?: string,                    // Step identifier
  [methodName]: methodParameters   // Action method
}
```

### Supported Methods

#### Data Retrieval

**variable_getValue**
```javascript
{
  variable_getValue: {
    scope?: string,
    prefixId?: string,
    suffixId?: string,
    query?: string[]|string
  }
}
```

**action_getValue**
```javascript
{
  action_getValue: {
    value: ActionValue|string,
    query: string[]|string
  }
}
```

**action_getPayloadValue**
```javascript
{
  action_getPayloadValue: string  // Payload key path
}
```

**action_getContextValue**
```javascript
{
  action_getContextValue: 'id'|'groupId'|'parentId'|'rootId'|'$null'
}
```

#### Data Transformation

**operator_eval**
```javascript
{
  operator_eval: {
    name: Operator,
    values: Array<ActionValue|string|number>
  }
}
```

**operator_compare**
```javascript
{
  operator_compare: {
    value_1: ActionValue|string|number|boolean,
    value_2: ActionValue|string|number|boolean,
    op: Operator
  }
}
```

**string_replace**
```javascript
{
  string_replace: {
    value: ActionValue|string,
    pattern: ActionValue|string,
    replacement: ActionValue|string
  }
}
```

**regex_pattern**
```javascript
{
  regex_pattern: {
    pattern: ActionValue|string,
    flags?: ActionValue|string
  }
}
```

#### State Management

**state_setValue**
```javascript
{
  state_setValue: {
    name: ActionValue|DataCollectionName,
    value: ActionValue|ActionValue[]|string|number|boolean|NestedData,
    options?: {
      id?: ActionValue|string,
      metadata?: Object,
      stopPropagation?: ActionValue|boolean,
      merge?: ActionValue|boolean,
      replace?: ActionValue|boolean,
      update?: {
        position?: ActionValue[]|string[]|number[],
        method?: 'push'|'pull'|'pop'|'shift'|'unshift'|'splice',
        startIndex?: ActionValue|number,
        deleteCount?: ActionValue|number
      }
    }
  }
}
```

**state_getValue**
```javascript
{
  state_getValue: {
    name: ActionValue|DataCollectionName,
    id?: ActionValue|string,
    prefixId?: ActionValue|string,
    suffixId?: ActionValue|string,
    options?: {
      expand?: ActionValue|boolean,
      expandExclude?: Object.<string, ActionValue|boolean>,
      expandClone?: ActionValue|boolean,
      position?: ActionValue|string[]|string,
      clone?: ActionValue|boolean
    }
  }
}
```

**state_deleteValue**
```javascript
{
  state_deleteValue: {
    name: ActionValue|DataCollectionName,
    id: ActionValue|string,
    cascade?: ActionValue|boolean,
    listeners?: ActionValue|boolean
  }
}
```

**variable_setValue**
```javascript
{
  variable_setValue: {
    scope?: ActionValue|string,
    groupId?: ActionValue|string,
    prefixId?: ActionValue|string,
    suffixId?: ActionValue|string,
    values: SetActionValueValues[]
  }
}
```

#### Component Operations

**component_remove**
```javascript
{
  component_remove: {
    id: ActionValue|string
  }
}
```

**component_renderChildren**
```javascript
{
  component_renderChildren: {
    id: ActionValue|string,
    items?: ActionValue|ActionValue[]|string[]
  }
}
```

#### Event Handling

**state_addListener**
```javascript
{
  state_addListener: {
    name: DataCollectionName,
    on?: 'update'|'delete',
    id?: ActionValue|string,
    priority?: number,
    force?: boolean,
    captureAll?: boolean,
    handlerId?: ActionValue|string,
    handler: ActionValue|string
  }
}
```

**state_deleteListener**
```javascript
{
  state_deleteListener: {
    name: DataCollectionName,
    id?: ActionValue|string,
    on?: 'update'|'delete',
    handlerId: ActionValue|string
  }
}
```

#### Conditional Logic

**action_ifElse**
```javascript
{
  action_ifElse: {
    if: Array<EvalConditionFrom|EvalConditionAndOr>,
    then: EvalConditionRef[],
    else: EvalConditionRef[]
  }
}
```

#### List Operations

**list_filter**
```javascript
{
  list_filter: {
    items: ActionValue|ActionValue[]|string[]|number[],
    options: Array<{
      name: ActionValue|string,
      value: ActionValue|string|number|boolean
    }>
  }
}
```

**list_map**
```javascript
{
  list_map: {
    items: ActionValue,
    actionId: ActionValue|string,
    context?: ActionValue|ActionDispatchContext
  }
}
```

**list_push**
```javascript
{
  list_push: {
    target: ActionValue|ActionValue[]|string[]|number[],
    source: ActionValue|string|number
  }
}
```

**list_sort**
```javascript
{
  list_sort: {
    items: ActionValue|ActionValue[]|string[]|number[],
    type: 'ascending'|'descending'
  }
}
```

**list_splice**
```javascript
{
  list_splice: {
    target: ActionValue|ActionValue[]|string[]|number[],
    source: ActionValue|string|number|boolean,
    start?: ActionValue|number,
    number?: ActionValue|number
  }
}
```

**list_indexOf**
```javascript
{
  list_indexOf: {
    items: ActionValue|ActionValue[]|string[]|number[],
    value: ActionValue|string|number
  }
}
```

#### Fetch Operations

**api_getAll**
```javascript
{
  api_getAll: {
    collection: ActionValue|string,
    expand?: ActionValue|boolean,
    limit?: ActionValue|number,
    page?: ActionValue|number,
    perPage?: ActionValue|number,
    sync?: ActionValue|boolean,
    where?: ActionValue|string
  }
}
```

**api_getById**
```javascript
{
  api_getById: {
    collection: ActionValue|string,
    id: ActionValue|string[],
    expand?: ActionValue|boolean,
    sync?: ActionValue|boolean
  }
}
```

#### Query Operations

**query_fetch**
```javascript
{
  query_fetch: {
    id: ActionValue|string
  }
}
```

**query_filter**
```javascript
{
  query_filter: {
    id: ActionValue|string,
    componentId: ActionValue|string
  }
}
```

#### Route Operations

**route_navigate**
```javascript
{
  route_navigate: {
    to: ActionValue|string
  }
}
```

**route_currentId**
```javascript
{
  route_currentId: '$null'
}
```

**route_currentPath**
```javascript
{
  route_currentPath: '$null'
}
```

#### Icon Operations

**icon_render**
```javascript
{
  icon_render: ActionValue|string
}
```

#### Editor Operations

**editor_getSchema**
```javascript
{
  editor_getSchema: ActionValue|string
}
```

#### Token Operations

**token_textContent**
```javascript
{
  token_textContent: ActionValue|string
}
```

## Special Properties

### `$id`

Names a step for later reference.

```javascript
{
  $id: 'step_name',
  variable_getValue: { query: 'data' }
}
```

### `$ref`

References a previous step's result by its `$id`.

```javascript
{
  state_setValue: {
    value: { $ref: 'step_name' }
  }
}
```

### `$sequenceRef`

References an execution sequence by index.

```javascript
{
  action_ifElse: {
    then: [{ $sequenceRef: 0 }],
    else: [{ $sequenceRef: 1 }]
  }
}
```

### `$null`

Special marker for null values.

```javascript
{
  state_generateId: '$null'
}
```

## Data Types

### DataCollectionName

Union of all available data collection names:
- `'action/block'`
- `'action/items'`
- `'action/sequences'`
- `'variable/values'`
- `'data/collections'`
- `'content/items'`
- `'component/nodes'`
- `'component/items'`
- `'component/children'`
- `'component/parents'`
- `'component/properties'`
- `'component/options'`
- `'component/groups'`
- `'component/belongsToGroup'`
- `'component/roots'`
- `'event/listeners'`
- `'event/handlers'`
- `'metadata/currentLanguage'`
- `'metadata/languages'`
- `'metadata/plugins'`
- `'metadata/actions'`
- `'page/id'`
- `'page/events'`
- `'page/items'`
- `'query/items'`
- `'query/where'`
- `'query/sort'`

### Operator

Union of all supported operators:
- `'=='`, `'!='`, `'>='`, `'<= '`, `'>'`, `'<'`
- `'!'`, `'%'`, `'++'`, `'--'`, `'-'`, `'+'`, `'*'`, `'**'`
- `'!!'`, `'~'`, `'notNull'`, `'isNull'`, `'typeof'`

### NestedData

```javascript
Object.<string, string|boolean|number|ActionValue>
```

## Error Handling

### Common Errors

1. **$ref outside block sequence**
   - Occurs when `$ref` references an index that doesn't exist
   - Ensure referenced step exists and index is valid

2. **Invalid method**
   - Occurs when using a method not in `availableMethods`
   - Check method name or extend allowed methods

3. **Circular references**
   - Occurs when steps reference each other in a loop
   - Ensure data flows in one direction

## Examples

### Simple Data Flow

```javascript
const simpleAction = createAction('simple', [
  {
    $id: 'input',
    action_getPayloadValue: 'data'
  },
  {
    state_setValue: {
      name: 'result',
      value: { $ref: 'input' }
    }
  }
])
```

### Conditional Execution

```javascript
const conditionalAction = createAction('conditional', [
  {
    $id: 'status',
    action_getPayloadValue: 'status'
  },
  {
    action_ifElse: {
      if: [{ op: '==', from: { $ref: 'status' }, to: 'active' }],
      then: [{ $sequenceRef: 0 }],
      else: [{ $sequenceRef: 1 }]
    }
  }
])
```

### Complex Transformation

```javascript
const transformAction = createAction('transform', [
  {
    $id: 'raw',
    action_getPayloadValue: 'input'
  },
  {
    $id: 'trimmed',
    string_replace: {
      value: { $ref: 'raw' },
      pattern: '^\\s+|\\s+$',
      replacement: ''
    }
  },
  {
    $id: 'length',
    operator_eval: {
      name: 'typeof',
      values: [{ $ref: 'trimmed' }]
    }
  },
  {
    state_setValue: {
      name: 'processed',
      value: {
        text: { $ref: 'trimmed' },
        length: { $ref: 'length' }
      }
    }
  }
])
```

## Performance Considerations

1. **Compilation happens once** - The action is compiled when `createAction` is called
2. **Hash-based optimization** - Duplicate blocks are eliminated
3. **Reference resolution** - All `$ref` and `$sequenceRef` are resolved at compile time
4. **Reusable** - Compiled actions can be executed multiple times

## Debugging

### Enable Debug Logging

```javascript
// Add debug steps
{
  $id: 'debug_input',
  state_setValue: {
    name: 'debug/log',
    value: { $ref: 'input' }
  }
}
```

### Use Descriptive IDs

```javascript
// Good
{
  $id: 'user_validation_result',
  operator_compare: { ... }
}

// Avoid
{
  $id: 's3',
  operator_compare: { ... }
}
```

## Related

- [createAction Guide](./create-action-guide.md) - Comprehensive usage guide
- [Quick Reference](./quick-reference.md) - Quick lookup guide
