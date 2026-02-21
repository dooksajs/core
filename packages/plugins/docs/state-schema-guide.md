# State Schema Guide

This guide explains how to define and use state schemas in the Dooksa state management system. It consolidates information about schema structure, data types, validation rules, default values, and relationships.

## Overview

A schema defines the structure, type, and validation rules for data stored in the state. Every state collection must have a schema that specifies:

- **Data Type**: What type of data is stored (string, number, boolean, object, array, collection)
- **Properties**: For objects, what properties are allowed
- **Validation Rules**: Constraints like required fields, unique items, pattern matching
- **Relationships**: Links to other data collections
- **Default Values**: Initial values for data
- **ID Generation**: How to generate IDs for collections

> **Note:** Dooksa schemas are inspired by and largely compliant with the JSON Schema specification.

## Schema Types

The Dooksa state system supports six primary data types:

### 1. Collection Type

Collections store multiple documents with unique IDs. Each document in a collection is an object with its own properties.

**Schema Definition:**
```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      email: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}
```

**Key Features:**
- Stores multiple documents (objects)
- Each document has a unique ID
- Supports auto-generated IDs
- Can define ID generation rules (prefix, suffix, custom functions)
- Enables relationships between collections
- Supports cascade operations

**When to Use:**
- You have multiple similar items that need individual access
- Items need unique identifiers
- You need to query/filter items
- You need relationships between data

### 2. Object Type

Objects store a single structured document without an ID. Useful for configuration, settings, or single-record data.

**Schema Definition:**
```javascript
{
  type: 'object',
  properties: {
    theme: { type: 'string' },
    notifications: { type: 'boolean' },
    settings: {
      type: 'object',
      properties: {
        fontSize: { type: 'number' },
        language: { type: 'string' }
      }
    }
  },
  additionalProperties: false // Optional: restrict to defined properties
}
```

**Key Features:**
- Single document per collection
- No ID required
- Supports nested objects
- Can define required properties
- Supports pattern properties for dynamic keys

**When to Use:**
- You need a single document
- No unique ID is required
- You're storing configuration/settings

### 3. Array Type

Arrays store ordered lists of values. Each item in the array must match the defined item schema.

**Schema Definition:**
```javascript
{
  type: 'array',
  items: {
    type: 'string'
  },
  uniqueItems: true // Optional: enforce uniqueness
}
```

**Key Features:**
- Ordered collection of items
- All items must match the item schema
- Supports unique items constraint
- Can define relationships

**When to Use:**
- You need an ordered list
- Items don't need unique IDs
- You need to maintain order

### 4. Primitive Types

Primitive types store simple values: strings, numbers, and booleans.

**Schema Definition:**
```javascript
// String
{ type: 'string', minLength: 3 }

// Number
{ type: 'number', minimum: 0 }

// Boolean
{ type: 'boolean', default: false }
```

## Validation Rules

Validation in Dooksa state is automatic. When you set data using `stateSetValue`, the system validates type, schema constraints, and relationships.

### String Validation

| Rule | Description | Example |
|------|-------------|---------|
| `minLength` | Minimum length | `{ type: 'string', minLength: 3 }` |
| `maxLength` | Maximum length | `{ type: 'string', maxLength: 50 }` |
| `pattern` | Regex pattern | `{ type: 'string', pattern: '^[a-z]+$' }` |
| `enum` | Allowed values | `{ type: 'string', enum: ['active', 'inactive'] }` |

**Example:**
```javascript
{
  type: 'string',
  minLength: 3,
  maxLength: 50,
  pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // Email
  enum: ['active', 'inactive', 'pending']
}
```

### Number Validation

| Rule | Description | Example |
|------|-------------|---------|
| `minimum` | Minimum value | `{ type: 'number', minimum: 0 }` |
| `maximum` | Maximum value | `{ type: 'number', maximum: 100 }` |
| `exclusiveMinimum` | Must be greater than | `{ type: 'number', exclusiveMinimum: 0 }` |
| `exclusiveMaximum` | Must be less than | `{ type: 'number', exclusiveMaximum: 100 }` |
| `multipleOf` | Must be multiple of | `{ type: 'number', multipleOf: 0.01 }` |

**Example:**
```javascript
{
  type: 'number',
  minimum: 0,
  maximum: 10000,
  multipleOf: 0.01 // Currency (2 decimal places)
}
```

### Array Validation

| Rule | Description | Example |
|------|-------------|---------|
| `minItems` | Minimum items | `{ type: 'array', minItems: 1 }` |
| `maxItems` | Maximum items | `{ type: 'array', maxItems: 10 }` |
| `uniqueItems` | No duplicates | `{ type: 'array', uniqueItems: true }` |

**Example:**
```javascript
{
  type: 'array',
  items: { type: 'string' },
  minItems: 1,
  maxItems: 5,
  uniqueItems: true
}
```

### Object Validation

| Rule | Description | Example |
|------|-------------|---------|
| `required` | Required properties | `{ required: ['name', 'email'] }` |
| `additionalProperties` | Allow extra props | `{ additionalProperties: false }` |
| `patternProperties` | Dynamic keys | `{ patternProperties: { '^[0-9]+$': { type: 'string' } } }` |

**Example:**
```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name'],
  additionalProperties: false,
  patternProperties: {
    '^[a-z]+$': { type: 'string' }
  }
}
```

### Custom Validation

You can add custom validation logic using schema options or validation functions.

```javascript
{
  type: 'string',
  customValidator: (value) => {
    // Custom logic
    return value.startsWith('PREFIX_')
  }
}
```

## Advanced Schema Features

### Default Values

Default values provide initial data for state properties.

**Property Default Values:**
```javascript
{
  type: 'object',
  properties: {
    status: { 
      type: 'string',
      default: 'active' // Static default
    },
    createdAt: {
      type: 'number',
      default: () => Date.now() // Function-based default
    }
  }
}
```

**Collection ID Generation:**
Collections can define how IDs are generated using the `id` property.

```javascript
{
  type: 'collection',
  items: { type: 'object', properties: {} },
  id: {
    prefix: 'user_',
    suffix: '_v1',
    // Custom generator function
    default: () => 'custom-' + Date.now()
  }
}
```

### Relationships

Relationships allow you to link data between collections.

**Defining a Relationship:**
Use the `relation` property to specify the target collection.

```javascript
// User profile references a single details document (One-to-One)
{
  type: 'object',
  properties: {
    detailsId: {
      type: 'string',
      relation: 'user/details' // References 'user/details' collection
    }
  }
}

// Post references multiple tags (One-to-Many / Many-to-Many)
{
  type: 'object',
  properties: {
    tagIds: {
      type: 'array',
      items: {
        type: 'string',
        relation: 'content/tags' // Each item references 'content/tags'
      }
    }
  }
}
```

> **Note:** Relationships must always use the full namespaced path (e.g., `pluginName/collectionName`) to ensure unambiguous resolution.

## Best Practices

1.  **Keep Schemas Simple**: Avoid deeply nested objects. Flatten your data using relationships instead.
2.  **Use Appropriate Types**: Choose the right type (Collection vs Object vs Array) for your data structure.
3.  **Define Required Fields**: Mark essential properties as required to ensure data integrity.
4.  **Use Default Values**: Provide sensible defaults for optional fields and use functional defaults for dynamic values (timestamps, IDs).
5.  **Validate Early**: Leverage schema validation to catch errors at the source.
6.  **Use Enums**: Restrict string values to a known set of options using `enum`.

## Next Steps

- Read [State Data Access Guide](state-data-access-guide.md) to learn how to read, write, and delete data
- Read [State Events and Listeners Guide](state-events-listeners-guide.md) for reactive programming
- Read [State Advanced Patterns](state-advanced-patterns.md) for complex use cases
