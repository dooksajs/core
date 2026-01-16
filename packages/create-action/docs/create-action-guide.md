# createAction Guide

## Overview

`createAction` is a powerful function that compiles declarative action sequences into executable compiled actions. It allows you to define complex workflows as simple JavaScript objects, making it easy to create reusable, composable action logic.

## Function Signature

```javascript
import createAction from '@dooksa/create-action'

const action = createAction(id, data, dependencies, methods)
```

### Parameters

- **`id`** (string): Unique identifier for the action
- **`data`** (ActionValue[]): Array of action objects that define the workflow
- **`dependencies`** (string[], optional): Array of required plugin/action dependencies
- **`methods`** (Object, optional): Object mapping allowed method names to `true`

### Returns

An `Action` object containing:
- `id`: The action identifier
- `blocks`: Compiled block definitions
- `blockSequences`: Execution sequences
- `sequences`: Array of sequence IDs
- `dependencies`: Required dependencies

### Basic ifElse Conditional

This example shows conditional logic with better naming than generic placeholders:

```javascript
const conditionalAction = createAction('user-validation', [
  {
    action_ifElse: {
      if: [{
        op: '==',
        left: { action_getPayloadValue: 'isValid' },
        right: true
      }],
      then: [{ $sequenceRef: 'handleSuccess' }],
      else: [{ $sequenceRef: 'handleFailure' }]
    }
  },
  {
    $id: 'handleSuccess',
    action_dispatch: { id: 'show-success-message' }
  },
  {
    $id: 'handleFailure',
    action_dispatch: { id: 'show-error-message' }
  }
], {
  action_dispatch: true,
  action_getPayloadValue: true
})
```

**Key improvements over generic naming:**
- `handleSuccess` instead of `test_then`
- `handleFailure` instead of `test_else`
- Descriptive action IDs like `show-success-message` and `show-error-message`

### Simple Action Sequence

This example demonstrates sequential data processing:

```javascript
const processData = createAction('process-data', [
  {
    $id: 'fetchInput',
    action_getPayloadValue: 'data'
  },
  {
    $id: 'transformData',
    action_getValue: {
      value: { $ref: 'fetchInput' },
      query: 'value'
    }
  },
  {
    state_setValue: {
      name: 'result',
      value: { $ref: 'transformData' }
    }
  }
], {
  action_getPayloadValue: true,
  action_getValue: true,
  state_setValue: true
})
```

**Naming conventions used:**
- `fetchInput` - clearly indicates data retrieval
- `transformData` - indicates data transformation
- Logical flow from input → transformation → storage

### Action with Dependencies

This example shows the full three-parameter signature with plugin dependencies:

```javascript
const userAction = createAction('handle-user-action', [
  {
    $id: 'validateUser',
    action_validate: { minLength: 3 }
  },
  {
    $id: 'processUser',
    action_process: {
      input: { $ref: 'validateUser' }
    }
  }
], ['user-plugin', 'validation-plugin'], {
  action_validate: true,
  action_process: true
})
```

**Key features:**
- Plugin dependencies: `['user-plugin', 'validation-plugin']`
- Method permissions object for allowed actions
- Clear naming: `validateUser`, `processUser`

## Basic Structure

An action is defined as an array of step objects. Each step performs a specific operation:

```javascript
const myAction = createAction('my-action', [
  // Step 1: Get data
  {
    $id: 'get_value',
    variable_getValue: {
      query: 'my-data'
    }
  },
  
  // Step 2: Transform data
  {
    $id: 'transformed_value',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'get_value' },
        ' processed'
      ]
    }
  },
  
  // Step 3: Store result
  {
    state_setValue: {
      name: 'data/items',
      value: { $ref: 'transformed_value' }
    }
  }
])
```

## Special Properties

### `$id` - Step Identification

Names a step so it can be referenced later:

```javascript
{
  $id: 'step_name',
  variable_getValue: { query: 'data' }
}
```

### `$ref` - Data Reference

References the result of a previous step by its `$id`:

```javascript
{
  state_setValue: {
    value: { $ref: 'step_name' }  // Uses result from step_name
  }
}
```

### `$sequenceRef` - Sequence Reference

References entire execution sequences (used in conditional logic):

```javascript
{
  action_ifElse: {
    if: [{ op: '==', from: 'status', to: 'active' }],
    then: [{ $sequenceRef: 0 }],  // Execute first sequence
    else: [{ $sequenceRef: 1 }]   // Execute second sequence
  }
}
```

### `$null` - Null Marker

Represents a null value in action data:

```javascript
{
  state_generateId: '$null'  // Special null marker
}
```

## Common Action Methods

### Data Retrieval

#### `variable_getValue`
Get value from variables store:
```javascript
{
  variable_getValue: {
    scope: 'local',
    query: 'variable-name'
  }
}
```

#### `action_getValue`
Get property from an action result:
```javascript
{
  action_getValue: {
    value: { $ref: 'previous_step' },
    query: 'id'
  }
}
```

#### `action_getPayloadValue`
Get value from action payload:
```javascript
{
  action_getPayloadValue: 'key'  // Gets payload.key
}
```

#### `action_getContextValue`
Get value from action context:
```javascript
{
  action_getContextValue: 'id'  // Gets context.id
}
```

### Data Transformation

#### `operator_eval`
Perform operations on values:
```javascript
{
  operator_eval: {
    name: '+',
    values: [
      { $ref: 'step1' },
      { $ref: 'step2' }
    ]
  }
}
```

**Supported operators**: `+`, `-`, `*`, `/`, `==`, `!=`, `>`, `>=`, `<`, `<=`, `!`, `%`, `++`, `--`, `**`, `!!`, `~`, `notNull`, `isNull`, `typeof`

#### `operator_compare`
Compare two values:
```javascript
{
  operator_compare: {
    value_1: { $ref: 'step1' },
    value_2: 'expected',
    op: '=='
  }
}
```

### State Management

#### `state_setValue`
Set value in state store:
```javascript
{
  state_setValue: {
    name: 'component/items',
    value: { $ref: 'data_step' },
    options: {
      id: 'component-123',
      update: {
        method: 'push'
      }
    }
  }
}
```

#### `state_getValue`
Get value from state store:
```javascript
{
  state_getValue: {
    name: 'component/items',
    id: 'component-123'
  }
}
```

#### `state_deleteValue`
Delete value from state:
```javascript
{
  state_deleteValue: {
    name: 'component/items',
    id: 'component-123',
    cascade: true
  }
}
```

#### `variable_setValue`
Set variable values (often for local scope):
```javascript
{
  variable_setValue: {
    scope: { $ref: 'component_id' },
    values: [
      {
        id: 'local-var',
        value: { $ref: 'data_step' }
      }
    ]
  }
}
```

### Component Operations

#### `component_remove`
Remove a component:
```javascript
{
  component_remove: {
    id: 'component-123'
  }
}
```

#### `component_renderChildren`
Render component children:
```javascript
{
  component_renderChildren: {
    id: 'component-123',
    items: [{ $ref: 'child_data' }]
  }
}
```

### Event Handling

#### `state_addListener`
Add data change listener:
```javascript
{
  state_addListener: {
    name: 'component/items',
    on: 'update',
    handler: 'my-handler-id'
  }
}
```

#### `state_deleteListener`
Remove data change listener:
```javascript
{
  state_deleteListener: {
    name: 'component/items',
    handlerId: 'my-handler-id'
  }
}
```

### Conditional Logic

#### `action_ifElse`
Conditional execution:
```javascript
{
  action_ifElse: {
    if: [
      { op: '==', from: { $ref: 'status_step' }, to: 'active' }
    ],
    then: [{ $sequenceRef: 0 }],
    else: [{ $sequenceRef: 1 }]
  }
}
```

### List Operations

#### `list_filter`
Filter array items:
```javascript
{
  list_filter: {
    items: { $ref: 'array_data' },
    options: [
      { name: 'active', value: true }
    ]
  }
}
```

#### `list_map`
Map over array items:
```javascript
{
  list_map: {
    items: { $ref: 'array_data' },
    actionId: 'transform-item'
  }
}
```

#### `list_push`
Push to array:
```javascript
{
  list_push: {
    target: { $ref: 'array_data' },
    source: { $ref: 'new_item' }
  }
}
```

#### `list_sort`
Sort array:
```javascript
{
  list_sort: {
    items: { $ref: 'array_data' },
    type: 'ascending'
  }
}
```

#### `list_splice`
Splice array:
```javascript
{
  list_splice: {
    target: { $ref: 'array_data' },
    source: { $ref: 'new_item' },
    start: 0,
    number: 1
  }
}
```

#### `list_indexOf`
Get index of item:
```javascript
{
  list_indexOf: {
    items: { $ref: 'array_data' },
    value: { $ref: 'search_item' }
  }
}
```

### Fetch Operations

#### `api_getAll`
Fetch all items from collection:
```javascript
{
  api_getAll: {
    collection: 'users',
    limit: 10,
    page: 1
  }
}
```

#### `api_getById`
Fetch specific items by ID:
```javascript
{
  api_getById: {
    collection: 'users',
    id: ['user-1', 'user-2'],
    expand: true
  }
}
```

### Query Operations

#### `query_fetch`
Fetch query results:
```javascript
{
  query_fetch: {
    id: 'my-query'
  }
}
```

#### `query_filter`
Filter query results:
```javascript
{
  query_filter: {
    id: 'my-query',
    componentId: 'component-123'
  }
}
```

### Route Operations

#### `route_navigate`
Navigate to route:
```javascript
{
  route_navigate: {
    to: '/my-page'
  }
}
```

#### `route_currentId`
Get current route ID:
```javascript
{
  route_currentId: '$null'
}
```

#### `route_currentPath`
Get current route path:
```javascript
{
  route_currentPath: '$null'
}
```

### String Operations

#### `string_replace`
Replace string content:
```javascript
{
  string_replace: {
    value: { $ref: 'text_step' },
    pattern: 'old',
    replacement: 'new'
  }
}
```

#### `regex_pattern`
Create regex pattern:
```javascript
{
  regex_pattern: {
    pattern: '[a-z]+',
    flags: 'g'
  }
}
```

### Icon Operations

#### `icon_render`
Render icon:
```javascript
{
  icon_render: 'icon-name'
}
```

### Editor Operations

#### `editor_getSchema`
Get editor schema:
```javascript
{
  editor_getSchema: 'schema-name'
}
```

### Token Operations

#### `token_textContent`
Get token text content:
```javascript
{
  token_textContent: 'token-id'
}
```

## Data Flow Patterns

### Sequential Processing

```javascript
const sequentialAction = createAction('process-data', [
  // Step 1: Get input
  {
    $id: 'input',
    action_getPayloadValue: 'data'
  },
  
  // Step 2: Validate
  {
    $id: 'validated',
    operator_eval: {
      name: 'notNull',
      values: [{ $ref: 'input' }]
    }
  },
  
  // Step 3: Transform
  {
    $id: 'transformed',
    string_replace: {
      value: { $ref: 'input' },
      pattern: ' ',
      replacement: '-'
    }
  },
  
  // Step 4: Store
  {
    state_setValue: {
      name: 'processed/data',
      value: { $ref: 'transformed' }
    }
  }
])
```

### Branching Logic

```javascript
const branchingAction = createAction('handle-status', [
  // Step 1: Get status
  {
    $id: 'status',
    action_getPayloadValue: 'status'
  },
  
  // Step 2: Conditional logic
  {
    action_ifElse: {
      if: [
        { op: '==', from: { $ref: 'status' }, to: 'active' }
      ],
      then: [{ $sequenceRef: 0 }],  // Active sequence
      else: [{ $sequenceRef: 1 }]   // Inactive sequence
    }
  }
])
```

### Local Scope Management

```javascript
const scopedAction = createAction('component-setup', [
  // Step 1: Create component
  {
    $id: 'component',
    state_setValue: {
      name: 'component/items',
      value: { id: 'my-component' }
    }
  },
  
  // Step 2: Get component ID
  {
    $id: 'component_id',
    action_getValue: {
      value: { $ref: 'component' },
      query: 'id'
    }
  },
  
  // Step 3: Set local variables
  {
    variable_setValue: {
      scope: { $ref: 'component_id' },
      values: [
        { id: 'local-data', value: { action_getPayloadValue: 'data' } },
        { id: 'local-key', value: { action_getPayloadValue: 'key' } }
      ]
    }
  }
])
```

## Best Practices

### 1. Use Descriptive Step Names

```javascript
// Good
{
  $id: 'user_input_data',
  action_getPayloadValue: 'userData'
}

// Avoid
{
  $id: 'step1',
  action_getPayloadValue: 'userData'
}
```

### 2. Chain References for Clarity

```javascript
// Clear data flow
{
  $id: 'raw_input',
  action_getPayloadValue: 'data'
},
{
  $id: 'validated_input',
  operator_eval: {
    name: 'notNull',
    values: [{ $ref: 'raw_input' }]
  }
},
{
  $id: 'formatted_output',
  string_replace: {
    value: { $ref: 'validated_input' },
    pattern: 'old',
    replacement: 'new'
  }
}
```

### 3. Use Local Scope for Component Data

```javascript
{
  variable_setValue: {
    scope: { $ref: 'component_id' },
    values: [
      { id: 'local-var', value: { $ref: 'data_step' } }
    ]
  }
}
```

### 4. Handle Errors with Conditionals

```javascript
{
  $id: 'validation_result',
  operator_compare: {
    value_1: { $ref: 'input_data' },
    value_2: '',
    op: '!='
  }
},
{
  action_ifElse: {
    if: [{ $ref: 'validation_result' }],
    then: [{ $sequenceRef: 0 }],  // Valid path
    else: [{ $sequenceRef: 1 }]   // Error path
  }
}
```

### 5. Keep Steps Focused

Each step should do one thing well:

```javascript
// Good: Each step has a single responsibility
{
  $id: 'get_data',
  variable_getValue: { query: 'data' }
},
{
  $id: 'transform_data',
  operator_eval: { ... }
},
{
  $id: 'store_data',
  state_setValue: { ... }
}

// Avoid: Multiple responsibilities in one step
{
  $id: 'do_everything',
  variable_getValue: { query: 'data' },
  // ... plus transformations and storage
}
```

### 6. Use Dependencies for External Requirements

```javascript
const action = createAction('my-action', [
  // ... action steps
], ['plugin-a', 'plugin-b'])
```

## Common Patterns

### Form Validation

```javascript
const validateForm = createAction('validate-form', [
  {
    $id: 'form_data',
    action_getPayloadValue: 'form'
  },
  {
    $id: 'is_valid',
    operator_eval: {
      name: '&&',
      values: [
        {
          operator_eval: {
            name: 'notNull',
            values: [{ action_getPayloadValue: 'email' }]
          }
        },
        {
          operator_eval: {
            name: 'notNull',
            values: [{ action_getPayloadValue: 'password' }]
          }
        }
      ]
    }
  },
  {
    action_ifElse: {
      if: [{ $ref: 'is_valid' }],
      then: [{ $sequenceRef: 0 }],
      else: [{ $sequenceRef: 1 }]
    }
  }
])
```

### Data Transformation Pipeline

```javascript
const transformPipeline = createAction('transform-data', [
  {
    $id: 'input',
    action_getPayloadValue: 'data'
  },
  {
    $id: 'trimmed',
    string_replace: {
      value: { $ref: 'input' },
      pattern: '^\\s+|\\s+$',
      replacement: ''
    }
  },
  {
    $id: 'normalized',
    string_replace: {
      value: { $ref: 'trimmed' },
      pattern: '\\s+',
      replacement: ' '
    }
  },
  {
    $id: 'final',
    string_replace: {
      value: { $ref: 'normalized' },
      pattern: ' ',
      replacement: '-'
    }
  },
  {
    state_setValue: {
      name: 'transformed/data',
      value: { $ref: 'final' }
    }
  }
])
```

### Component Lifecycle

```javascript
const componentLifecycle = createAction('component-lifecycle', [
  // Setup
  {
    $id: 'component',
    state_setValue: {
      name: 'component/items',
      value: { id: 'my-component' }
    }
  },
  {
    $id: 'component_id',
    action_getValue: {
      value: { $ref: 'component' },
      query: 'id'
    }
  },
  
  // Initialize local state
  {
    variable_setValue: {
      scope: { $ref: 'component_id' },
      values: [
        { id: 'initialized', value: true },
        { id: 'data', value: [] }
      ]
    }
  },
  
  // Add listeners
  {
    state_addListener: {
      name: 'data/items',
      on: 'update',
      handler: { $ref: 'component_id' }
    }
  }
])
```

## Reference System

The reference system is the core of action composition:

### Named References (`$id` + `$ref`)

```javascript
// Define a step with an ID
{
  $id: 'my_data',
  variable_getValue: { query: 'source' }
}

// Reference it later
{
  state_setValue: {
    value: { $ref: 'my_data' }
  }
}
```

### Numeric References

```javascript
// Reference by index (0-based)
{
  action_ifElse: {
    then: [{ $sequenceRef: 0 }],  // First sequence
    else: [{ $sequenceRef: 1 }]   // Second sequence
  }
}
```

### Payload References

```javascript
// Access incoming data
{
  action_getPayloadValue: 'key'           // payload.key
}
```

### Context References

```javascript
// Access execution context
{
  action_getContextValue: 'id'            // context.id
}
```

## Compilation Process

When you call `createAction`, it performs several transformations:

1. **Parsing**: Converts action objects into block format
2. **ID Generation**: Creates unique IDs for each block
3. **Reference Resolution**: Links `$ref` and `$sequenceRef` to actual blocks
4. **Hashing**: Generates deterministic hashes for optimization
5. **Sequencing**: Organizes blocks into execution order

The result is a compiled action that can be efficiently executed by the Dooksa runtime.

## Performance Tips

### 1. Reuse Compiled Actions

```javascript
// Compile once
const compiledAction = createAction('my-action', [...])

// Use multiple times
export default compiledAction
```

### 2. Minimize Step Count

```javascript
// Combine related operations
{
  $id: 'combined_op',
  operator_eval: {
    name: '+',
    values: [
      { action_getPayloadValue: 'a' },
      { action_getPayloadValue: 'b' }
    ]
  }
}
```

### 3. Use Local Scope for Temporary Data

```javascript
// Instead of global state
{
  variable_setValue: {
    scope: { $ref: 'component_id' },
    values: [{ id: 'temp', value: data }]
  }
}
```

## Debugging

### 1. Add Logging Steps

```javascript
{
  $id: 'debug_step',
  state_setValue: {
    name: 'debug/log',
    value: { $ref: 'previous_step' }
  }
}
```

### 2. Use Descriptive IDs

```javascript
// Good: Easy to trace
{
  $id: 'user_input_validation',
  operator_eval: { ... }
}

// Avoid: Hard to debug
{
  $id: 's1',
  operator_eval: { ... }
}
```

### 3. Test Each Step

```javascript
// Test individual steps
const testAction = createAction('test', [
  { $id: 'step1', ... },
  // Test step1 result
  { $id: 'step2', ... }
  // Test step2 result
])
```

## Conclusion

`createAction` provides a powerful, declarative way to build complex workflows. By understanding the reference system, available methods, and best practices, you can create maintainable, reusable action sequences that power your Dooksa applications.

For more details, see the [API Reference](./reference.md) and [Examples](./examples.md).
