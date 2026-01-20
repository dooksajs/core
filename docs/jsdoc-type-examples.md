# JSDoc Type Examples: typedef vs Inline Types

This document provides comprehensive examples showing when to use typedef versus inline types in JSDoc documentation.

## Quick Reference

### Use Inline Types For:
- Primitives: `{string}`, `{number}`, `{boolean}`, `{Object}`, `{Array}`
- Basic unions: `{string|number}`, `{string|string[]}`
- Simple arrays: `{string[]}`, `{number[]}`
- Wildcard: `{*}` for any type
- Optional primitives: `{string} [param]`
- Nullable types: `{string|null}`

### Use typedef For:
- Object types with 3+ properties
- Object types with nested objects
- Function signatures with parameters
- Callback types
- Generic types with complex constraints
- Types reused across multiple functions
- Configuration objects with many options

---

## Inline Type Examples

### Example 1: Simple Primitives

**✅ GOOD: Inline types for primitives**
```javascript
/**
 * Capitalise first letter of string
 * @param {string} str - String to capitalise
 * @returns {string} Capitalised string
 */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

**Why it's good:**
- Single primitive type
- No complex structure
- Clear and concise

---

### Example 2: Optional Primitives

**✅ GOOD: Optional primitive parameters**
```javascript
/**
 * Generate unique ID
 * @param {string} [prefix=''] - ID prefix
 * @returns {string} Unique ID
 */
function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9)
}
```

**Why it's good:**
- Optional primitive is clear inline
- Default value is shown
- No complex structure

---

### Example 3: Simple Unions

**✅ GOOD: Simple union types**
```javascript
/**
 * Get value from object
 * @param {*} value - Any value
 * @param {string|string[]} query - Query path or paths
 * @returns {*} The retrieved value
 */
function getValue(value, query) {
  // Implementation
}
```

**Why it's good:**
- Union is simple and readable
- No complex structure
- Clear intent

---

### Example 4: Simple Arrays

**✅ GOOD: Array of primitives**
```javascript
/**
 * Filter array by values
 * @param {Array} arr - Array to filter
 * @param {string[]} exclude - Values to exclude
 * @returns {Array} Filtered array
 */
function filterArray(arr, exclude) {
  return arr.filter(item => !exclude.includes(item))
}
```

**Why it's good:**
- Simple array type
- No complex structure
- Clear intent

---

## typedef Examples

### Example 5: Object with 3+ Properties

**❌ BAD: Complex inline object type**
```javascript
/**
 * Create plugin
 * @param {Object} options - Plugin configuration
 * @param {string} options.name - Plugin name
 * @param {Object.<string, Function>} options.methods - Public methods
 * @param {Object.<string, Function>} [options.privateMethods] - Private methods
 * @param {Object} [options.state] - State configuration
 * @param {Object} [options.metadata] - Plugin metadata
 * @returns {Object} The created plugin
 */
function createPlugin(options) {
  // Implementation
}
```

**Problems:**
- 5 properties inline
- Hard to read
- Not reusable
- Difficult to maintain

**✅ GOOD: Using typedef**
```javascript
/**
 * @typedef {Object} PluginOptions
 * @property {string} name - Plugin identifier
 * @property {Object.<string, Function>} methods - Public methods
 * @property {Object.<string, Function>} [privateMethods] - Private methods
 * @property {Object} [state] - State configuration
 * @property {Object} [metadata] - Plugin metadata
 */

/**
 * Creates a plugin with the given options
 * @param {PluginOptions} options - Plugin configuration
 * @returns {Object} The created plugin
 */
function createPlugin(options) {
  // Implementation
}
```

**Benefits:**
- Clean function signature
- Reusable type
- Better documentation
- Easier to extend

---

### Example 6: Object with Nested Objects

**❌ BAD: Nested inline object type**
```javascript
/**
 * Configure application
 * @param {Object} config - Configuration
 * @param {Object} config.server - Server settings
 * @param {string} config.server.host - Server host
 * @param {number} config.server.port - Server port
 * @param {Object} [config.database] - Database settings
 * @param {string} [config.database.host] - Database host
 * @param {number} [config.database.port] - Database port
 * @returns {Object} Configured app
 */
function configureApp(config) {
  // Implementation
}
```

**Problems:**
- Deeply nested structure
- Very hard to read
- Not reusable
- Difficult to maintain

**✅ GOOD: Using nested typedefs**
```javascript
/**
 * @typedef {Object} ServerConfig
 * @property {string} host - Server host
 * @property {number} port - Server port
 */

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} host - Database host
 * @property {number} port - Database port
 */

/**
 * @typedef {Object} AppConfig
 * @property {ServerConfig} server - Server settings
 * @property {DatabaseConfig} [database] - Database settings
 */

/**
 * Configure application
 * @param {AppConfig} config - Configuration
 * @returns {Object} Configured app
 */
function configureApp(config) {
  // Implementation
}
```

**Benefits:**
- Each type is clear and focused
- Reusable across functions
- Easy to understand
- Easy to extend

---

### Example 7: Callback Types

**❌ BAD: Complex inline function type**
```javascript
/**
 * Add event listener
 * @param {string} eventName - Event name
 * @param {function(Event, Object): void} callback - Event callback
 * @returns {Function} Unsubscribe function
 */
function on(eventName, callback) {
  // Implementation
}
```

**Problems:**
- Function signature is complex
- Hard to read
- Not reusable
- Difficult to document parameters

**✅ GOOD: Using @callback**
```javascript
/**
 * @callback EventCallback
 * @param {Event} event - Event object
 * @param {Object} data - Event data
 * @returns {void}
 */

/**
 * Add event listener
 * @param {string} eventName - Event name
 * @param {EventCallback} callback - Event callback
 * @returns {Function} Unsubscribe function
 */
function on(eventName, callback) {
  // Implementation
}
```

**Benefits:**
- Clear callback signature
- Reusable type
- Better parameter documentation
- Easier to understand

---

### Example 8: Function with Multiple Parameters

**❌ BAD: Complex inline function type**
```javascript
/**
 * Transform data using a callback
 * @param {*} data - Data to transform
 * @param {function(*, Object): *} transformer - Transformation function
 * @returns {*} Transformed data
 */
function transform(data, transformer) {
  // Implementation
}
```

**✅ GOOD: Using @callback**
```javascript
/**
 * @callback DataTransformer
 * @param {*} input - Data to transform
 * @param {Object} [options] - Transformation options
 * @returns {*} Transformed data
 */

/**
 * Transform data using a callback
 * @param {*} data - Data to transform
 * @param {DataTransformer} transformer - Transformation function
 * @returns {*} Transformed data
 */
function transform(data, transformer) {
  // Implementation
}
```

---

### Example 9: Reused Type Definitions

**❌ BAD: Duplicate inline types**
```javascript
/**
 * Configure plugin A
 * @param {Object} options - Plugin options
 * @param {string} options.name - Plugin name
 * @param {Object.<string, Function>} options.methods - Methods
 * @returns {Object} Configured plugin
 */
function configurePluginA(options) {
  // Implementation
}

/**
 * Configure plugin B
 * @param {Object} options - Plugin options
 * @param {string} options.name - Plugin name
 * @param {Object.<string, Function>} options.methods - Methods
 * @returns {Object} Configured plugin
 */
function configurePluginB(options) {
  // Implementation
}
```

**Problems:**
- Duplicate type definitions
- Inconsistent documentation
- Hard to maintain
- Changes need to be made in multiple places

**✅ GOOD: Using shared typedef**
```javascript
/**
 * @typedef {Object} PluginOptions
 * @property {string} name - Plugin name
 * @property {Object.<string, Function>} methods - Methods
 */

/**
 * Configure plugin A
 * @param {PluginOptions} options - Plugin options
 * @returns {Object} Configured plugin
 */
function configurePluginA(options) {
  // Implementation
}

/**
 * Configure plugin B
 * @param {PluginOptions} options - Plugin options
 * @returns {Object} Configured plugin
 */
function configurePluginB(options) {
  // Implementation
}
```

**Benefits:**
- Single source of truth
- Consistent documentation
- Easy to maintain
- Changes affect all functions

---

### Example 10: Generic Types

**❌ BAD: Complex inline generic type**
```javascript
/**
 * Create map entry
 * @param {string} key - Entry key
 * @param {*} value - Entry value
 * @returns {{key: string, value: *}} Map entry
 */
function createEntry(key, value) {
  return { key, value }
}
```

**✅ GOOD: Using typedef with generics**
```javascript
/**
 * @template K - Key type
 * @template V - Value type
 * @typedef {Object} GenericMap
 * @property {K} key - Map key
 * @property {V} value - Map value
 */

/**
 * Create map entry
 * @template K
 * @template V
 * @param {K} key - Entry key
 * @param {V} value - Entry value
 * @returns {GenericMap<K, V>} Map entry
 */
function createEntry(key, value) {
  return { key, value }
}
```

---

## Comparison Table

| Scenario | Inline Type | typedef | Recommendation |
|----------|-------------|---------|----------------|
| Single primitive | `{string}` | Not needed | ✅ Inline |
| Optional primitive | `{string} [param]` | Not needed | ✅ Inline |
| Simple union | `{string\|number}` | Not needed | ✅ Inline |
| Simple array | `{string[]}` | Not needed | ✅ Inline |
| Object with 2 properties | `{Object}` with inline props | Optional | ⚠️ Either |
| Object with 3+ properties | Complex inline | Clean typedef | ✅ typedef |
| Nested objects | Very complex inline | Nested typedefs | ✅ typedef |
| Function signature | `function(...)` | `@callback` | ✅ typedef |
| Reused types | Duplicated inline | Single typedef | ✅ typedef |
| Generic types | Complex inline | `@template` + typedef | ✅ typedef |

---

## Decision Flowchart

```
Start: Need to document a type?
    ↓
Is it a primitive? (string, number, boolean, Object, Array)
    ↓
Yes → Use inline type
    ↓
No → Is it a simple union? (string|number)
    ↓
Yes → Use inline type
    ↓
No → Is it a simple array? (string[])
    ↓
Yes → Use inline type
    ↓
No → Is it an object with 3+ properties?
    ↓
Yes → Use typedef
    ↓
No → Is it a nested object?
    ↓
Yes → Use typedef
    ↓
No → Is it a function signature?
    ↓
Yes → Use @callback
    ↓
No → Is it reused across functions?
    ↓
Yes → Use typedef
    ↓
No → Consider using typedef for clarity
```

---

## Real-World Examples

### Example 11: Query Options

**Scenario:** Function with optional configuration object

**❌ BAD: Inline (2 properties - borderline)**
```javascript
/**
 * Get value from object
 * @param {*} value - Any value
 * @param {string} query - Query path
 * @param {Object} [options] - Options
 * @param {boolean} [options.strict] - Strict mode
 * @param {string} [options.separator] - Path separator
 * @returns {*} The retrieved value
 */
function getValue(value, query, options) {
  // Implementation
}
```

**✅ GOOD: Using typedef (better for 2+ properties)**
```javascript
/**
 * @typedef {Object} QueryOptions
 * @property {boolean} [strict] - Strict mode
 * @property {string} [separator] - Path separator
 */

/**
 * Get value from object
 * @param {*} value - Any value
 * @param {string} query - Query path
 * @param {QueryOptions} [options] - Options
 * @returns {*} The retrieved value
 */
function getValue(value, query, options) {
  // Implementation
}
```

**Decision:** Use typedef when you have 2+ properties, especially if they might grow.

---

### Example 12: Sort Options

**Scenario:** Function with sorting options

**❌ BAD: Inline (2 properties)**
```javascript
/**
 * Sort object keys
 * @param {Object} obj - Object to sort
 * @param {Object} [options] - Sorting options
 * @param {string} [options.order] - Sort order
 * @param {boolean} [options.recursive] - Sort recursively
 * @returns {Object} Sorted object
 */
function sortObject(obj, options) {
  // Implementation
}
```

**✅ GOOD: Using typedef**
```javascript
/**
 * @typedef {Object} SortOptions
 * @property {string} [order='asc'] - Sort order ('asc' or 'desc')
 * @property {boolean} [recursive=false] - Sort recursively
 */

/**
 * Sort object keys
 * @param {Object} obj - Object to sort
 * @param {SortOptions} [options] - Sorting options
 * @returns {Object} Sorted object
 */
function sortObject(obj, options) {
  // Implementation
}
```

**Decision:** Use typedef for consistency and future extensibility.

---

### Example 13: Validation Options

**Scenario:** Function with validation configuration

**❌ BAD: Inline (4 properties)**
```javascript
/**
 * Validate form data
 * @param {Object} data - Form data
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.required] - Require all fields
 * @param {boolean} [options.trim] - Trim whitespace
 * @param {number} [options.minLength] - Minimum length
 * @param {string[]} [options.exclude] - Fields to exclude
 * @returns {Object} Validation results
 */
function validateForm(data, options) {
  // Implementation
}
```

**✅ GOOD: Using typedef**
```javascript
/**
 * @typedef {Object} ValidationOptions
 * @property {boolean} [required=true] - Require all fields
 * @property {boolean} [trim=true] - Trim whitespace
 * @property {number} [minLength=0] - Minimum length
 * @property {string[]} [exclude] - Fields to exclude
 */

/**
 * Validate form data
 * @param {Object} data - Form data
 * @param {ValidationOptions} [options] - Validation options
 * @returns {Object} Validation results
 */
function validateForm(data, options) {
  // Implementation
}
```

**Decision:** Definitely use typedef for 4+ properties.

---

### Example 14: API Request

**Scenario:** Function with request configuration

**❌ BAD: Inline (5+ properties)**
```javascript
/**
 * Make API request
 * @param {string} url - API endpoint
 * @param {Object} [options] - Request options
 * @param {string} [options.method] - HTTP method
 * @param {Object} [options.headers] - Request headers
 * @param {*} [options.body] - Request body
 * @param {number} [options.timeout] - Timeout in ms
 * @param {boolean} [options.retry] - Retry on failure
 * @returns {Promise} API response
 */
function apiRequest(url, options) {
  // Implementation
}
```

**✅ GOOD: Using typedef**
```javascript
/**
 * @typedef {Object} RequestOptions
 * @property {string} [method='GET'] - HTTP method
 * @property {Object} [headers] - Request headers
 * @property {*} [body] - Request body
 * @property {number} [timeout=5000] - Timeout in ms
 * @property {boolean} [retry=false] - Retry on failure
 */

/**
 * Make API request
 * @param {string} url - API endpoint
 * @param {RequestOptions} [options] - Request options
 * @returns {Promise} API response
 */
function apiRequest(url, options) {
  // Implementation
}
```

**Decision:** Definitely use typedef for 5+ properties.

---

## Edge Cases

### Case 1: Single Property Object

**Option A: Inline**
```javascript
/**
 * @param {Object} [options] - Options
 * @param {boolean} [options.enabled] - Whether enabled
 */
function doSomething(options) {}
```

**Option B: typedef**
```javascript
/**
 * @typedef {Object} Options
 * @property {boolean} [enabled] - Whether enabled
 */

/**
 * @param {Options} [options] - Options
 */
function doSomething(options) {}
```

**Recommendation:** Use inline for single property unless:
- The property might grow
- The type is reused elsewhere
- You want consistency with other functions

---

### Case 2: Two Property Object

**Option A: Inline**
```javascript
/**
 * @param {Object} [options] - Options
 * @param {boolean} [options.enabled] - Whether enabled
 * @param {number} [options.priority] - Priority level
 */
function doSomething(options) {}
```

**Option B: typedef**
```javascript
/**
 * @typedef {Object} Options
 * @property {boolean} [enabled] - Whether enabled
 * @property {number} [priority] - Priority level
 */

/**
 * @param {Options} [options] - Options
 */
function doSomething(options) {}
```

**Recommendation:** Use typedef for consistency and future extensibility.

---

### Case 3: Three Property Object

**Option A: Inline (BAD)**
```javascript
/**
 * @param {Object} [options] - Options
 * @param {boolean} [options.enabled] - Whether enabled
 * @param {number} [options.priority] - Priority level
 * @param {string} [options.mode] - Operation mode
 */
function doSomething(options) {}
```

**Option B: typedef (GOOD)**
```javascript
/**
 * @typedef {Object} Options
 * @property {boolean} [enabled] - Whether enabled
 * @property {number} [priority] - Priority level
 * @property {string} [mode] - Operation mode
 */

/**
 * @param {Options} [options] - Options
 */
function doSomething(options) {}
```

**Recommendation:** Always use typedef for 3+ properties.

---

## Best Practices Summary

### ✅ DO Use Inline Types For:
1. Single primitives: `{string}`, `{number}`, `{boolean}`
2. Optional primitives: `{string} [param]`
3. Simple unions: `{string|number}`, `{string|string[]}`
4. Simple arrays: `{string[]}`, `{number[]}`
5. Wildcard: `{*}` for any type
6. Nullable types: `{string|null}`

### ✅ DO Use typedef For:
1. Objects with 3+ properties
2. Objects with nested objects
3. Function signatures with parameters
4. Callback types (`@callback`)
5. Generic types with complex constraints
6. Types reused across multiple functions
7. Configuration objects with many options

### ⚠️ DECIDE Based On Context:
1. Objects with 1-2 properties (consider typedef for consistency)
2. Simple callback types (consider @callback for clarity)
3. Types that might grow (use typedef for future-proofing)

### ❌ DON'T Use:
1. Very complex inline object types (hard to read)
2. Inline function types with multiple parameters (use @callback)
3. Duplicated inline types (use shared typedef)
4. Deeply nested inline objects (use nested typedefs)

---

## Migration Guide

### Step 1: Identify Candidates
Look for:
- Objects with 3+ properties inline
- Function signatures with complex parameters
- Callback types using `function(...)`
- Reused type definitions
- Nested object structures

### Step 2: Create typedefs
Create typedefs at the top of the file:
```javascript
/**
 * @typedef {Object} OptionsName
 * @property {Type} propName - Property description
 */
```

### Step 3: Update Function Signatures
Replace inline types with typedef references:
```javascript
// Before
function doSomething(options) { ... }

// After
function doSomething(options: OptionsName) { ... }
```

### Step 4: Verify
- Run ESLint
- Generate TypeDoc
- Review generated documentation

---

## Common Mistakes

### Mistake 1: Using typedef for single primitives
```javascript
// ❌ BAD: Overkill
/**
 * @typedef {string} StringValue
 */

/**
 * @param {StringValue} value - String value
 */
function doSomething(value) {}

// ✅ GOOD: Simple inline
/**
 * @param {string} value - String value
 */
function doSomething(value) {}
```

### Mistake 2: Using inline for complex objects
```javascript
// ❌ BAD: Hard to read
/**
 * @param {Object} options - Options
 * @param {string} options.name - Name
 * @param {number} options.age - Age
 * @param {string} options.email - Email
 * @param {Object} options.preferences - Preferences
 * @param {boolean} options.preferences.darkMode - Dark mode
 */
function doSomething(options) {}

// ✅ GOOD: Clear typedef
/**
 * @typedef {Object} UserPreferences
 * @property {boolean} darkMode - Dark mode
 */

/**
 * @typedef {Object} UserOptions
 * @property {string} name - Name
 * @property {number} age - Age
 * @property {string} email - Email
 * @property {UserPreferences} preferences - Preferences
 */

/**
 * @param {UserOptions} options - Options
 */
function doSomething(options) {}
```

### Mistake 3: Not using @callback for function types
```javascript
// ❌ BAD: Complex inline function type
/**
 * @param {function(Error, *): void} callback - Callback
 */
function doSomething(callback) {}

// ✅ GOOD: Using @callback
/**
 * @callback ResultCallback
 * @param {Error} error - Error object
 * @param {*} result - Result value
 * @returns {void}
 */

/**
 * @param {ResultCallback} callback - Callback
 */
function doSomething(callback) {}
```

---

## Quick Decision Guide

| Type | Example | Use |
|------|---------|-----|
| Primitive | `{string}` | Inline |
| Optional primitive | `{string} [param]` | Inline |
| Simple union | `{string\|number}` | Inline |
| Simple array | `{string[]}` | Inline |
| Object (1 prop) | `{Object}` with 1 inline prop | Inline or typedef |
| Object (2 props) | `{Object}` with 2 inline props | typedef (recommended) |
| Object (3+ props) | `{Object}` with 3+ inline props | typedef (required) |
| Nested object | Deeply nested inline | typedef (required) |
| Function signature | `function(...)` | @callback |
| Reused type | Duplicated inline | typedef (required) |
| Generic type | Complex inline | typedef + @template |

---

## References

- [JSDoc typedef](https://jsdoc.app/tags-typedef.html)
- [JSDoc callback](https://jsdoc.app/tags-callback.html)
- [JSDoc template](https://jsdoc.app/tags-template.html)
- [ESLint Plugin JSDoc](https://github.com/gajus/eslint-plugin-jsdoc)

For more examples, see `docs/jsdoc-examples.md`.
