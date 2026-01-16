# @dooksa/create-action

Compile declarative action sequences into executable compiled actions for the Dooksa framework.

## Documentation

The create-action package includes comprehensive documentation:

- **[Quick Reference](docs/quick-reference.md)** - Fast lookup guide for common patterns
- **[User Guide](docs/create-action-guide.md)** - Complete tutorial with detailed examples
- **[API Reference](docs/reference.md)** - Full API documentation

## Quick Start

```javascript
import createAction from '@dooksa/create-action'

const myAction = createAction('my-action', [
  // Step 1: Get data from payload
  {
    $id: 'input_data',
    action_getPayloadValue: 'data'
  },
  
  // Step 2: Transform the data
  {
    $id: 'processed_data',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'input_data' },
        ' processed'
      ]
    }
  },
  
  // Step 3: Store result in state
  {
    state_setValue: {
      name: 'result/items',
      value: { $ref: 'processed_data' }
    }
  }
])
```

## Installation

```bash
npm install @dooksa/create-action
```

## What is createAction?

`createAction` is a powerful function that compiles declarative action sequences into executable compiled actions. It allows you to:

- ✅ Define complex workflows as simple JavaScript objects
- ✅ Create reusable, composable action logic
- ✅ Manage data flow between steps using references
- ✅ Handle conditional execution and branching
- ✅ Work with state, components, events, and more
- ✅ Compile once, execute many times efficiently

## Features

- **Declarative Syntax** - Define actions as plain JavaScript objects
- **Reference System** - Chain steps together with `$id` and `$ref`
- **Rich Method Library** - 36+ built-in action methods
- **Conditional Logic** - Branching with `action_ifElse`
- **Data Transformation** - String operations, math, comparisons
- **State Management** - Get, set, and delete state values
- **Component Operations** - Render, remove, manage children
- **Event Handling** - Add and remove listeners
- **List Operations** - Filter, map, sort, splice arrays
- **Fetch Operations** - Query and fetch data
- **Route Management** - Navigate and get route info
- **Type Safety** - Full TypeScript definitions included

## Basic Usage

### Simple Data Flow

```javascript
import createAction from '@dooksa/create-action'

const processUser = createAction('process-user', [
  {
    $id: 'user_id',
    action_getPayloadValue: 'userId'
  },
  {
    $id: 'user_data',
    state_getValue: {
      name: 'users',
      id: { $ref: 'user_id' }
    }
  },
  {
    state_setValue: {
      name: 'current_user',
      value: { $ref: 'user_data' }
    }
  }
])
```

### Conditional Execution

```javascript
const validateAndStore = createAction('validate-store', [
  {
    $id: 'input_value',
    action_getPayloadValue: 'value'
  },
  {
    $id: 'is_valid',
    operator_compare: {
      value_1: { $ref: 'input_value' },
      value_2: '',
      op: '!='
    }
  },
  {
    action_ifElse: {
      if: [{ $ref: 'is_valid' }],
      then: [{ $sequenceRef: 0 }],  // Valid path
      else: [{ $sequenceRef: 1 }]   // Error path
    }
  }
])
```

### Local Scope Management

```javascript
const setupComponent = createAction('setup-component', [
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
  {
    variable_setValue: {
      scope: { $ref: 'component_id' },
      values: [
        { id: 'initialized', value: true },
        { id: 'data', value: { action_getPayloadValue: 'initialData' } }
      ]
    }
  }
])
```

## Key Concepts

### Special Properties

- **`$id`** - Names a step for later reference
- **`$ref`** - References a previous step's result
- **`$sequenceRef`** - References execution sequences
- **`$null`** - Special null marker

### Common Methods

**Data Access:**
- `variable_getValue`, `action_getValue`
- `action_getPayloadValue`, `action_getContextValue`

**Transformations:**
- `operator_eval`, `operator_compare`
- `string_replace`, `regex_pattern`

**State Management:**
- `state_setValue`, `state_getValue`, `state_deleteValue`
- `variable_setValue`

**Components:**
- `component_remove`, `component_renderChildren`

**Events:**
- `state_addListener`, `state_deleteListener`

**Logic:**
- `action_ifElse`

**Lists:**
- `list_filter`, `list_map`, `list_push`, `list_sort`, `list_splice`, `list_indexOf`

**Fetch:**
- `api_getAll`, `api_getById`

**Routes:**
- `route_navigate`, `route_currentId`, `route_currentPath`

## API

### `createAction(id, data, dependencies?, methods?)`

Compiles action sequences into executable actions.

**Parameters:**
- `id` (string): Unique action identifier
- `data` (ActionValue[]): Array of action step objects
- `dependencies` (string[], optional): Required plugin dependencies
- `methods` (Object, optional): Allowed method names

**Returns:** `Action` object containing compiled blocks, sequences, and dependencies

### `availableMethods`

Object mapping all available action method names to `true`.

### `compileAction`

Advanced function for custom compilation scenarios.

## Examples

### Form Validation

```javascript
const validateForm = createAction('validate-form', [
  {
    $id: 'email',
    action_getPayloadValue: 'email'
  },
  {
    $id: 'password',
    action_getPayloadValue: 'password'
  },
  {
    $id: 'email_valid',
    operator_eval: {
      name: 'notNull',
      values: [{ $ref: 'email' }]
    }
  },
  {
    $id: 'password_valid',
    operator_eval: {
      name: 'notNull',
      values: [{ $ref: 'password' }]
    }
  },
  {
    $id: 'is_valid',
    operator_eval: {
      name: '&&',
      values: [
        { $ref: 'email_valid' },
        { $ref: 'password_valid' }
      ]
    }
  }
])
```

### Data Transformation Pipeline

```javascript
const transformData = createAction('transform-data', [
  {
    $id: 'raw_input',
    action_getPayloadValue: 'input'
  },
  {
    $id: 'trimmed',
    string_replace: {
      value: { $ref: 'raw_input' },
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
    state_setValue: {
      name: 'transformed/output',
      value: { $ref: 'normalized' }
    }
  }
])
```

## Performance

- **Compile Once** - Actions are compiled when `createAction` is called
- **Hash Optimization** - Duplicate blocks are eliminated
- **Reference Resolution** - All `$ref` resolved at compile time
- **Reusable** - Compiled actions can be executed multiple times

## Best Practices

1. **Use descriptive step names** - `$id: 'user_input'` not `$id: 's1'`
2. **Chain references** - Keep data flow clear and traceable
3. **Use local scope** - For component-specific data
4. **Handle errors** - Use conditionals for validation
5. **Keep steps focused** - One responsibility per step
6. **Document complex logic** - Add comments for clarity

## Troubleshooting

### Common Issues

**`$ref outside block sequence`**
- Ensure referenced step exists and index is valid

**`Invalid method`**
- Check method name against available methods or extend allowed methods

**`Circular references`**
- Ensure data flows in one direction, avoid loops

## Development

```bash
# Run tests
npm run test-unit

# Test coverage
npm run test-coverage-report
```

## License

AGPL-3.0-or-later

## Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.
