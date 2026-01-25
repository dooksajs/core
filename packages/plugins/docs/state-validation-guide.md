# State Validation Guide

This guide explains how validation works in the Dooksa state management system, including type validation, schema validation, and custom validation rules.

## Overview

Validation in Dooksa state is automatic and comprehensive. When you set data using `stateSetValue`, the system validates:

1. **Type Validation**: Ensures data matches the expected type
2. **Schema Validation**: Validates against schema constraints
3. **Relationship Validation**: Ensures relationships are valid
4. **Custom Validation**: Applies custom validation rules

All validation happens automatically - you don't need to call validation functions manually.

## Validation Types

### 1. Type Validation

Ensures data matches the expected type (string, number, boolean, object, array, collection).

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    active: { type: 'boolean' }
  }
}

// Valid
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    age: 30,
    active: true
  }
})

// Invalid - wrong types
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    age: 'thirty',  // Should be number
    active: 'yes'   // Should be boolean
  }
})
// Throws DataSchemaException
```

### 2. Schema Validation

Validates data against schema constraints like required fields, min/max values, patterns, etc.

```javascript
// Schema with constraints
{
  type: 'object',
  properties: {
    name: { 
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150
    },
    email: {
      type: 'string',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    }
  },
  required: ['name', 'email']
}

// Valid
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    email: 'john@example.com',
    age: 30
  }
})

// Invalid - missing required field
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    age: 30
    // Missing 'email'
  }
})
// Throws DataSchemaException

// Invalid - pattern mismatch
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    email: 'not-an-email'
  }
})
// Throws DataSchemaException
```

### 3. Relationship Validation

Ensures relationships reference valid data (when validation is strict).

```javascript
// Schema with relationship
{
  type: 'object',
  properties: {
    authorId: {
      type: 'string',
      relation: 'user/profiles'
    }
  }
}

// Valid - references existing user
stateSetValue({
  name: 'content/posts',
  value: { authorId: 'user-123' }
})

// Invalid - references non-existent user (if validation is strict)
// This would throw an error or create a broken relationship
```

### 4. Custom Validation

You can add custom validation logic using schema options or validation functions.

```javascript
// Custom validation using schema options
{
  type: 'object',
  properties: {
    password: {
      type: 'string',
      minLength: 8,
      customValidator: (value) => {
        // Custom validation logic
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumbers = /\d/.test(value)
        return hasUpperCase && hasLowerCase && hasNumbers
      }
    }
  }
}
```

## Validation Rules by Type

### String Validation

```javascript
{
  type: 'string',
  minLength: 3,           // Minimum length
  maxLength: 50,          // Maximum length
  pattern: '^[a-zA-Z]+$', // Regex pattern
  enum: ['active', 'inactive', 'pending'], // Allowed values
  default: 'active'       // Default value
}
```

**Examples:**
```javascript
// minLength
{ type: 'string', minLength: 3 }  // "ab" is invalid, "abc" is valid

// maxLength
{ type: 'string', maxLength: 10 }  // "12345678901" is invalid

// pattern (email)
{ type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }

// pattern (URL)
{ type: 'string', pattern: '^https?://.+' }

// enum
{ type: 'string', enum: ['active', 'inactive', 'pending'] }
```

### Number Validation

```javascript
{
  type: 'number',
  minimum: 0,              // Minimum value
  maximum: 100,            // Maximum value
  exclusiveMinimum: 0,     // Must be greater than
  exclusiveMaximum: 100,   // Must be less than
  multipleOf: 0.01,        // Must be multiple of
  default: 0               // Default value
}
```

**Examples:**
```javascript
// minimum/maximum
{ type: 'number', minimum: 0, maximum: 100 }  // 50 is valid, -1 is invalid

// exclusiveMinimum/exclusiveMaximum
{ type: 'number', exclusiveMinimum: 0 }  // 0 is invalid, 0.1 is valid

// multipleOf (currency)
{ type: 'number', multipleOf: 0.01 }  // 10.99 is valid, 10.999 is invalid

// integer
{ type: 'number', minimum: 1, maximum: 100 }  // No decimal part
```

### Boolean Validation

```javascript
{
  type: 'boolean',
  default: false  // Default value
}
```

**Examples:**
```javascript
// Simple boolean
{ type: 'boolean' }  // true or false

// With default
{ type: 'boolean', default: false }
```

### Array Validation

```javascript
{
  type: 'array',
  items: { type: 'string' },  // Type of items
  minItems: 1,                // Minimum number of items
  maxItems: 10,               // Maximum number of items
  uniqueItems: true,          // All items must be unique
  default: []                 // Default value
}
```

**Examples:**
```javascript
// Array of strings
{
  type: 'array',
  items: { type: 'string' }
}

// Array with constraints
{
  type: 'array',
  items: { type: 'string' },
  minItems: 1,
  maxItems: 5,
  uniqueItems: true
}

// Array of objects
{
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' }
    }
  }
}
```

### Object Validation

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email'],  // Required properties
  additionalProperties: false,   // Allow additional properties
  patternProperties: {           // Pattern-based properties
    '^[0-9]+$': { type: 'string' }
  }
}
```

**Examples:**
```javascript
// Object with properties
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  }
}

// Object with required properties
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email']  // age is optional
}

// Object with additionalProperties: false
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  additionalProperties: false  // Only name and age allowed
}

// Object with patternProperties
{
  type: 'object',
  patternProperties: {
    '^[0-9]+$': {  // Property names must be numeric
      type: 'object',
      properties: {
        id: { type: 'string' },
        value: { type: 'number' }
      }
    }
  }
}
```

### Collection Validation

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}
```

**Examples:**
```javascript
// Collection with auto-generated IDs
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_'
  }
}

// Collection with custom ID generator
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    default: () => 'custom-' + Date.now()
  }
}
```

## Validation Error Handling

### DataSchemaException

When validation fails, a `DataSchemaException` is thrown with detailed information:

```javascript
try {
  stateSetValue({
    name: 'user',
    value: {
      name: 'J',  // Too short (minLength: 2)
      email: 'not-an-email'
    }
  })
} catch (error) {
  console.error('Validation failed:', error.message)
  // Example: "Invalid data (user): required property missing: 'email'"
  
  // Error properties
  console.log(error.schemaPath)  // Path to the schema
  console.log(error.keyword)     // Type of validation that failed
  console.log(error.message)     // Human-readable message
  console.log(error.code)        // Error code
  console.log(error.expected)    // Expected value/type
  console.log(error.actual)      // Actual value/type
}
```

### Error Types

```javascript
// Type mismatch
{
  schemaPath: 'user/age',
  keyword: 'type',
  message: 'Type mismatch at user/age: expected number, got string',
  code: 'TYPE_MISMATCH',
  expected: 'number',
  actual: 'string'
}

// Required property missing
{
  schemaPath: 'user',
  keyword: 'required',
  message: 'Invalid data (user): required property missing: "email"',
  code: 'REQUIRED_PROPERTY_MISSING',
  property: 'email'
}

// Pattern mismatch
{
  schemaPath: 'user/email',
  keyword: 'pattern',
  message: 'Invalid data (user/email): does not match pattern',
  code: 'PATTERN_MISMATCH',
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
}

// Range violation
{
  schemaPath: 'user/age',
  keyword: 'minimum',
  message: 'Invalid data (user/age): value is less than minimum',
  code: 'RANGE_VIOLATION',
  minimum: 0,
  actual: -5
}

// Unique items violation
{
  schemaPath: 'tags',
  keyword: 'uniqueItems',
  message: 'Invalid data (tags): array contains duplicate items',
  code: 'UNIQUE_ITEMS_VIOLATION'
}

// Additional properties violation
{
  schemaPath: 'user',
  keyword: 'additionalProperties',
  message: 'Invalid data (user): additional property "extra" is not allowed',
  code: 'ADDITIONAL_PROPERTIES_VIOLATION',
  property: 'extra'
}
```

## Validation Examples

### Example 1: User Registration

```javascript
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              pattern: '^[a-zA-Z\\s]+$'
            },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
            },
            age: {
              type: 'number',
              minimum: 13,
              maximum: 120
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'guest'],
              default: 'user'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              default: 'active'
            }
          },
          required: ['name', 'email', 'age']
        },
        id: {
          prefix: 'user_'
        }
      }
    }
  }
})
```

**Validation Examples:**
```javascript
// Valid registration
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  }
})

// Invalid - name too short
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'J',
    email: 'john@example.com',
    age: 30
  }
})
// Throws: "Type mismatch at user/profiles/name: minLength violation"

// Invalid - bad email format
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'not-an-email',
    age: 30
  }
})
// Throws: "Pattern mismatch at user/profiles/email"

// Invalid - age below minimum
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 10
  }
})
// Throws: "Range violation at user/profiles/age: value is less than minimum"

// Invalid - missing required field
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
    // Missing age
  }
})
// Throws: "Required property missing: 'age'"
```

### Example 2: Product Validation

```javascript
createPlugin('product', {
  state: {
    schema: {
      products: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 100
            },
            description: {
              type: 'string',
              maxLength: 1000
            },
            price: {
              type: 'number',
              minimum: 0,
              maximum: 100000,
              multipleOf: 0.01
            },
            stock: {
              type: 'number',
              minimum: 0,
              default: 0
            },
            category: {
              type: 'string',
              enum: ['electronics', 'books', 'clothing', 'food']
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 10,
              uniqueItems: true
            }
          },
          required: ['name', 'price', 'category']
        }
      }
    }
  }
})
```

**Validation Examples:**
```javascript
// Valid product
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Wireless Mouse',
    price: 29.99,
    category: 'electronics',
    tags: ['computer', 'accessory']
  }
})

// Invalid - price with too many decimals
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Mouse',
    price: 29.999,  // Not multiple of 0.01
    category: 'electronics'
  }
})
// Throws: "Range violation at product/products/price: not multiple of 0.01"

// Invalid - invalid category
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Mouse',
    price: 29.99,
    category: 'invalid-category'
  }
})
// Throws: "Enum violation at product/products/category"

// Invalid - duplicate tags
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Mouse',
    price: 29.99,
    category: 'electronics',
    tags: ['computer', 'computer']  // Duplicate
  }
})
// Throws: "Unique items violation at product/products/tags"
```

### Example 3: Blog Post Validation

```javascript
createPlugin('blog', {
  state: {
    schema: {
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: {
              type: 'string',
              minLength: 5,
              maxLength: 200
            },
            content: {
              type: 'string',
              minLength: 10
            },
            authorId: {
              type: 'string',
              relation: 'user/profiles'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              uniqueItems: true
            },
            published: {
              type: 'boolean',
              default: false
            },
            publishedAt: {
              type: 'number',
              default: null
            }
          },
          required: ['title', 'content', 'authorId']
        }
      }
    }
  }
})
```

**Validation Examples:**
```javascript
// Valid post
stateSetValue({
  name: 'blog/posts',
  value: {
    title: 'Getting Started with Dooksa',
    content: 'Dooksa is a powerful state management system...',
    authorId: 'user-123'
  }
})

// Invalid - title too short
stateSetValue({
  name: 'blog/posts',
  value: {
    title: 'Hi',  // Too short (minLength: 5)
    content: 'Content here...',
    authorId: 'user-123'
  }
})
// Throws: "Length violation at blog/posts/title: minLength violation"

// Invalid - content too short
stateSetValue({
  name: 'blog/posts',
  value: {
    title: 'Valid Title',
    content: 'Short',  // Too short (minLength: 10)
    authorId: 'user-123'
  }
})
// Throws: "Length violation at blog/posts/content: minLength violation"

// Invalid - duplicate tags
stateSetValue({
  name: 'blog/posts',
  value: {
    title: 'Valid Title',
    content: 'Valid content here...',
    authorId: 'user-123',
    tags: ['javascript', 'javascript']  // Duplicate
  }
})
// Throws: "Unique items violation at blog/posts/tags"
```

## Custom Validation

### Custom Validators in Schema

You can add custom validation logic to schema properties:

```javascript
{
  type: 'object',
  properties: {
    password: {
      type: 'string',
      minLength: 8,
      customValidator: (value) => {
        // Must contain uppercase, lowercase, and number
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumbers = /\d/.test(value)
        return hasUpperCase && hasLowerCase && hasNumbers
      }
    },
    confirmPassword: {
      type: 'string',
      customValidator: (value, data) => {
        // Must match password
        return value === data.password
      }
    }
  }
}
```

### Custom Validation Functions

You can create custom validation functions that run after schema validation:

```javascript
function validateUserRegistration(data) {
  const errors = []
  
  // Check if email is unique
  const existingUser = stateFind({
    name: 'user/profiles',
    where: [
      { name: 'email', op: '==', value: data.email }
    ]
  })
  
  if (existingUser.length > 0) {
    errors.push('Email already exists')
  }
  
  // Check if age is appropriate for role
  if (data.role === 'admin' && data.age < 18) {
    errors.push('Admin must be at least 18 years old')
  }
  
  return errors
}

// Usage
const validationErrors = validateUserRegistration(userData)
if (validationErrors.length > 0) {
  throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
}
```

## Validation Flow

### 1. Type Check

First, the system checks if the data type matches the schema:

```javascript
// Schema
{ type: 'number' }

// Data
'42'  // String, not number
// ❌ Fails type check
```

### 2. Schema Validation

Then, it validates against schema constraints:

```javascript
// Schema
{ type: 'number', minimum: 0, maximum: 100 }

// Data
150  // Number, but out of range
// ❌ Fails schema validation
```

### 3. Relationship Validation

If the property has a relation, it validates the relationship:

```javascript
// Schema
{ type: 'string', relation: 'user/profiles' }

// Data
'user-999'  // String, but references non-existent user
// ❌ Fails relationship validation (if strict)
```

### 4. Custom Validation

Finally, custom validators run:

```javascript
// Schema
{
  type: 'string',
  customValidator: (value) => value.length > 10
}

// Data
'short'  // String, but too short
// ❌ Fails custom validation
```

## Validation Strategies

### Strict Validation (Default)

All validation rules are enforced:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    age: { type: 'number', minimum: 0 }
  },
  required: ['name', 'age']
}

// All violations throw errors
```

### Lenient Validation

Some validation rules can be made optional:

```javascript
// Schema with optional constraints
{
  type: 'object',
  properties: {
    name: { type: 'string' },  // No minLength
    age: { type: 'number' }    // No minimum
  }
}
```

### Conditional Validation

Use custom validators for conditional logic:

```javascript
{
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['user', 'admin'] },
    age: {
      type: 'number',
      customValidator: (value, data) => {
        if (data.role === 'admin') {
          return value >= 18
        }
        return true
      }
    }
  }
}
```

## Validation Best Practices

### 1. Be Specific with Constraints

```javascript
// Good - specific constraints
{
  type: 'string',
  minLength: 2,
  maxLength: 50,
  pattern: '^[a-zA-Z\\s]+$'
}

// Avoid - no constraints
{
  type: 'string'
}
```

### 2. Use Appropriate Types

```javascript
// Good - appropriate types
{
  age: { type: 'number', minimum: 0, maximum: 150 }
}

// Avoid - wrong type
{
  age: { type: 'string' }  // Should be number
}
```

### 3. Define Required Fields

```javascript
// Good - required fields defined
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email']
}

// Avoid - no required fields
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  }
}
```

### 4. Use Enums for Limited Options

```javascript
// Good - enum for limited options
{
  type: 'string',
  enum: ['active', 'inactive', 'pending']
}

// Avoid - no enum
{
  type: 'string'
}
```

### 5. Document Validation Rules

```javascript
// Good - documented
{
  type: 'object',
  properties: {
    email: {
      type: 'string',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      description: 'Valid email address format'
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150,
      description: 'User age in years (0-150)'
    }
  }
}
```

## Common Validation Patterns

### Pattern 1: Email Validation

```javascript
{
  type: 'string',
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
}
```

### Pattern 2: URL Validation

```javascript
{
  type: 'string',
  pattern: '^https?://.+'
}
```

### Pattern 3: Username Validation

```javascript
{
  type: 'string',
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$'
}
```

### Pattern 4: Password Validation

```javascript
{
  type: 'string',
  minLength: 8,
  customValidator: (value) => {
    return /[A-Z]/.test(value) &&  // Uppercase
           /[a-z]/.test(value) &&  // Lowercase
           /\d/.test(value)        // Number
  }
}
```

### Pattern 5: Phone Number Validation

```javascript
{
  type: 'string',
  pattern: '^\\+?[1-9]\\d{1,14}$'  // E.164 format
}
```

### Pattern 6: Date Validation

```javascript
{
  type: 'number',
  minimum: 0,  // Timestamp must be positive
  customValidator: (value) => {
    const date = new Date(value)
    return date instanceof Date && !isNaN(date)
  }
}
```

### Pattern 7: Currency Validation

```javascript
{
  type: 'number',
  minimum: 0,
  maximum: 1000000,
  multipleOf: 0.01
}
```

### Pattern 8: Percentage Validation

```javascript
{
  type: 'number',
  minimum: 0,
  maximum: 100,
  multipleOf: 0.01
}
```

## Testing Validation

### Test Valid Data

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('valid data passes validation', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            age: { type: 'number', minimum: 0 }
          }
        }
      }
    }
  })

  // Should not throw
  const result = plugin.stateSetValue({
    name: 'test/user',
    value: { name: 'John', age: 30 }
  })

  strictEqual(result.item.name, 'John')
  strictEqual(result.item.age, 30)
})
```

### Test Invalid Data

```javascript
test('invalid data throws error', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            age: { type: 'number', minimum: 0 }
          }
        }
      }
    }
  })

  // Should throw for too short name
  try {
    plugin.stateSetValue({
      name: 'test/user',
      value: { name: 'J', age: 30 }
    })
    // Should not reach here
    throw new Error('Expected validation to fail')
  } catch (error) {
    strictEqual(error.message.includes('minLength'), true)
  }
})
```

### Test Required Fields

```javascript
test('required fields are validated', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          },
          required: ['name', 'email']
        }
      }
    }
  })

  // Should throw for missing required field
  try {
    plugin.stateSetValue({
      name: 'test/user',
      value: { name: 'John' }  // Missing email
    })
    throw new Error('Expected validation to fail')
  } catch (error) {
    strictEqual(error.message.includes('required'), true)
  }
})
```

### Test Enum Validation

```javascript
test('enum values are validated', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        user: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending']
            }
          }
        }
      }
    }
  })

  // Should throw for invalid enum value
  try {
    plugin.stateSetValue({
      name: 'test/user',
      value: { status: 'archived' }  // Not in enum
    })
    throw new Error('Expected validation to fail')
  } catch (error) {
    strictEqual(error.message.includes('enum'), true)
  }
})
```

## Validation Performance

### 1. Validate Early

Validate data as early as possible:

```javascript
// Good - validate at the source
function createUser(data) {
  // Validate before setting
  const errors = validateUser(data)
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
  
  // Set validated data
  stateSetValue({
    name: 'user/profiles',
    value: data
  })
}

// Avoid - validate after setting
function createUser(data) {
  // Set unvalidated data
  stateSetValue({
    name: 'user/profiles',
    value: data
  })
  
  // Validate after (too late)
  const errors = validateUser(data)
}
```

### 2. Batch Validation

Validate multiple items at once:

```javascript
// Good - batch validation
function validateUsers(users) {
  const errors = []
  
  users.forEach((user, index) => {
    const userErrors = validateUser(user)
    if (userErrors.length > 0) {
      errors.push(`User ${index}: ${userErrors.join(', ')}`)
    }
  })
  
  return errors
}

// Avoid - validate one by one
function validateUsers(users) {
  users.forEach(user => {
    // Validates individually
    validateUser(user)
  })
}
```

### 3. Cache Validation Results

Cache validation results for repeated validations:

```javascript
// Good - cache validation functions
const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\+?[1-9]\d{1,14}$/.test(value)
}

// Use cached validators
function validateUser(data) {
  const errors = []
  
  if (!validators.email(data.email)) {
    errors.push('Invalid email')
  }
  
  return errors
}
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn about schema definitions
- Read [State Default Values Guide](state-default-values-guide.md) for default value configuration
- Read [State Data Types Guide](state-data-types-guide.md) for detailed type information
- Read [State Relationships Guide](state-relationships-guide.md) for relationship management