# createAction Quick Reference

## Basic Syntax

```javascript
import createAction from '@dooksa/create-action'

const action = createAction('action-id', [
  // ... steps
], [/* dependencies */])
```

## Special Properties

| Property | Purpose | Example |
|----------|---------|---------|
| `$id` | Name a step | `{ $id: 'step1', ... }` |
| `$ref` | Reference step result | `{ value: { $ref: 'step1' } }` |
| `$sequenceRef` | Reference sequence | `{ then: [{ $sequenceRef: 0 }] }` |
| `$null` | Null marker | `{ state_generateId: '$null' }` |

## Common Methods

### Data Access
- `variable_getValue` - Get from variables
- `action_getValue` - Get from action result
- `action_getPayloadValue` - Get from payload
- `action_getContextValue` - Get from context

### Transformations
- `operator_eval` - Perform operations
- `operator_compare` - Compare values
- `string_replace` - Replace text

### State Management
- `state_setValue` - Set state value
- `state_getValue` - Get state value
- `state_deleteValue` - Delete state value
- `variable_setValue` - Set variables

### Components
- `component_remove` - Remove component
- `component_renderChildren` - Render children

### Events
- `state_addListener` - Add listener
- `state_deleteListener` - Remove listener

### Logic
- `action_ifElse` - Conditional execution

### Lists
- `list_filter` - Filter array
- `list_map` - Map array
- `list_push` - Push to array
- `list_sort` - Sort array
- `list_splice` - Splice array
- `list_indexOf` - Find index

### Fetch
- `fetch_getAll` - Fetch all
- `fetch_getById` - Fetch by ID

### Routes
- `route_navigate` - Navigate
- `route_currentId` - Current ID
- `route_currentPath` - Current path

### Other
- `icon_render` - Render icon
- `editor_getSchema` - Get schema
- `token_textContent` - Get token text

## Data Flow Example

```javascript
const example = createAction('example', [
  // 1. Get input
  {
    $id: 'input',
    action_getPayloadValue: 'data'
  },
  
  // 2. Transform
  {
    $id: 'transformed',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'input' },
        ' processed'
      ]
    }
  },
  
  // 3. Store
  {
    state_setValue: {
      name: 'result',
      value: { $ref: 'transformed' }
    }
  }
])
```

## Pattern: Local Scope

```javascript
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
      { id: 'local-var', value: { $ref: 'data' } }
    ]
  }
}
```

## Pattern: Conditional

```javascript
{
  action_ifElse: {
    if: [
      { op: '==', from: { $ref: 'status' }, to: 'active' }
    ],
    then: [{ $sequenceRef: 0 }],
    else: [{ $sequenceRef: 1 }]
  }
}
```

## Operators

`+`, `-`, `*`, `/`, `==`, `!=`, `>`, `>=`, `<`, `<=`, `!`, `%`, `++`, `--`, `**`, `!!`, `~`, `notNull`, `isNull`, `typeof`

## Best Practices

1. **Use descriptive step names** - `$id: 'user_input'` not `$id: 's1'`
2. **Chain references** - Keep data flow clear
3. **Use local scope** - For component-specific data
4. **Handle errors** - Use conditionals for validation
5. **Keep steps focused** - One responsibility per step
6. **Document with comments** - Explain complex logic

## Common Use Cases

### Form Processing
Get → Validate → Transform → Store

### Component Setup
Create → Get ID → Set Local Vars → Add Listeners

### Data Pipeline
Fetch → Filter → Map → Sort → Store

### Conditional Workflow
Check Condition → Branch → Execute → Result

## Tips

- ✅ Compile once, use many times
- ✅ Use descriptive IDs for debugging
- ✅ Leverage local scope for temporary data
- ✅ Chain references for clarity
- ❌ Avoid overly complex single steps
- ❌ Don't use numeric IDs in production
- ❌ Avoid global state when local works

## See Also

- [Full Guide](./create-action-guide.md)
- [API Reference](./reference.md)
- [Examples](./examples.md)
