# JSDoc Examples from Dooksa Codebase

This document provides real-world examples from the Dooksa project, showing both good and bad patterns for JSDoc documentation.

## Table of Contents

- [Simple Utility Functions](#simple-utility-functions)
- [Complex Plugin Functions](#complex-plugin-functions)
- [Callback Documentation](#callback-documentation)
- [Configuration Objects](#configuration-objects)
- [Type Definitions](#type-definitions)

## Simple Utility Functions

### Example 1: capitalise.js

**Current State (Needs Improvement):**
```javascript
// packages/utils/src/capitalise.js

/**
 * Capitalise first letter of string
 * @param {string} str - String to capitalise
 * @returns {string} Capitalised string
 */
export function capitalise (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

**✅ GOOD: Simple inline types (already correct)**
- Uses simple inline types for primitives
- Clear parameter and return descriptions
- No complex types that need typedef

**Status:** ✅ Already follows guidelines

---

### Example 2: get-value.js

**Current State:**
```javascript
// packages/utils/src/get-value.js

/**
 * Get value from object using query path
 * @param {*} value - Any value
 * @param {string|string[]} [query] - Query path or paths
 * @param {Object} [options] - Options object
 * @param {boolean} [options.strict] - Strict mode
 * @param {string} [options.separator] - Path separator
 * @returns {*} The retrieved value
 */
export function getValue (value, query, options = {}) {
  // Implementation
}
```

**❌ BAD: Complex inline object type**
- The `options` parameter has multiple properties inline
- This should use a typedef for better reusability and clarity

**✅ GOOD: Refactored with typedef**
```javascript
// packages/utils/src/get-value.js

/**
 * @typedef {Object} GetValueOptions
 * @property {boolean} [strict] - Strict mode
 * @property {string} [separator] - Path separator
 */

/**
 * Get value from object using query path
 * @param {*} value - Any value
 * @param {string|string[]} [query] - Query path or paths
 * @param {GetValueOptions} [options] - Options object
 * @returns {*} The retrieved value
 */
export function getValue (value, query, options = {}) {
  // Implementation
}
```

**Benefits:**
- Reusable type definition
- Clearer documentation
- Better IDE support
- Easier to extend in the future

---

### Example 3: sort-object.js

**Current State:**
```javascript
// packages/utils/src/sort-object.js

/**
 * Sort object keys alphabetically
 * @param {Object} obj - Object to sort
 * @param {Object} [options] - Sorting options
 * @param {string} [options.order] - Sort order ('asc' or 'desc')
 * @param {boolean} [options.recursive] - Sort recursively
 * @returns {Object} Sorted object
 */
export function sortObject (obj, options = {}) {
  // Implementation
}
```

**❌ BAD: Complex inline object type**
- Multiple properties in inline type
- Should use typedef

**✅ GOOD: Refactored with typedef**
```javascript
// packages/utils/src/sort-object.js

/**
 * @typedef {Object} SortOptions
 * @property {string} [order='asc'] - Sort order ('asc' or 'desc')
 * @property {boolean} [recursive=false] - Sort recursively
 */

/**
 * Sort object keys alphabetically
 * @param {Object} obj - Object to sort
 * @param {SortOptions} [options] - Sorting options
 * @returns {Object} Sorted object
 */
export function sortObject (obj, options = {}) {
  // Implementation
}
```

---

## Complex Plugin Functions

### Example 4: create-plugin.js

**Current State:**
```javascript
// packages/create-plugin/src/create-plugin.js

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
export function createPlugin (options) {
  // Implementation
}
```

**❌ BAD: Very complex inline object type**
- 5 properties with complex types
- Should definitely use typedef
- Hard to read and maintain

**✅ GOOD: Refactored with typedef**
```javascript
// packages/create-plugin/src/create-plugin.js

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
export function createPlugin (options) {
  // Implementation
}
```

**Benefits:**
- Much cleaner function signature
- Type can be reused across multiple functions
- Better documentation generation
- Easier to understand at a glance

---

### Example 5: parse-schema.js

**Current State:**
```javascript
// packages/create-plugin/src/parse-schema.js

/**
 * Parse plugin schema
 * @param {Object} schema - Plugin schema
 * @param {Object} [options] - Parsing options
 * @param {boolean} [options.validate=true] - Validate schema
 * @param {boolean} [options.normalize=true] - Normalize schema
 * @param {string[]} [options.plugins] - Plugin list
 * @returns {Object} Parsed schema
 */
export function parseSchema (schema, options = {}) {
  // Implementation
}
```

**❌ BAD: Complex inline object type**
- Multiple properties in options
- Should use typedef

**✅ GOOD: Refactored with typedef**
```javascript
// packages/create-plugin/src/parse-schema.js

/**
 * @typedef {Object} ParseOptions
 * @property {boolean} [validate=true] - Validate schema
 * @property {boolean} [normalize=true] - Normalize schema
 * @property {string[]} [plugins] - Plugin list
 */

/**
 * Parse plugin schema
 * @param {Object} schema - Plugin schema
 * @param {ParseOptions} [options] - Parsing options
 * @returns {Object} Parsed schema
 */
export function parseSchema (schema, options = {}) {
  // Implementation
}
```

---

## Callback Documentation

### Example 6: Event Handlers (Hypothetical)

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

---

### Example 7: Data Transformation (Hypothetical)

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

## Configuration Objects

### Example 8: Plugin Configuration (Hypothetical)

**❌ BAD: Very complex inline type**
```javascript
/**
 * Configure plugin
 * @param {Object} config - Configuration object
 * @param {string} config.name - Plugin name
 * @param {Object.<string, Function>} config.methods - Methods
 * @param {Object.<string, Function>} [config.privateMethods] - Private methods
 * @param {Object} [config.state] - State config
 * @param {Object} [config.metadata] - Metadata
 * @param {string} [config.metadata.version] - Version
 * @param {string} [config.metadata.author] - Author
 * @param {string[]} [config.metadata.dependencies] - Dependencies
 * @returns {Object} Configured plugin
 */
function configurePlugin(config) {
  // Implementation
}
```

**✅ GOOD: Using nested typedefs**
```javascript
/**
 * @typedef {Object} PluginMetadata
 * @property {string} version - Plugin version
 * @property {string} author - Plugin author
 * @property {string[]} dependencies - Plugin dependencies
 */

/**
 * @typedef {Object} PluginOptions
 * @property {string} name - Plugin identifier
 * @property {Object.<string, Function>} methods - Public methods
 * @property {Object.<string, Function>} [privateMethods] - Private methods
 * @property {Object} [state] - State configuration
 * @property {PluginMetadata} [metadata] - Plugin metadata
 */

/**
 * Configure plugin
 * @param {PluginOptions} config - Configuration object
 * @returns {Object} Configured plugin
 */
function configurePlugin(config) {
  // Implementation
}
```

---

### Example 9: Build Configuration (Hypothetical)

**❌ BAD: Complex inline type**
```javascript
/**
 * Build application
 * @param {Object} options - Build options
 * @param {string} options.entry - Entry point
 * @param {string} options.output - Output directory
 * @param {string[]} options.plugins - Build plugins
 * @param {Object} [options.optimization] - Optimization settings
 * @param {boolean} [options.optimization.minify] - Minify output
 * @param {number} [options.optimization.level] - Optimization level
 * @returns {Promise<void>}
 */
function build(options) {
  // Implementation
}
```

**✅ GOOD: Using typedef**
```javascript
/**
 * @typedef {Object} OptimizationOptions
 * @property {boolean} [minify=true] - Minify output
 * @property {number} [level=2] - Optimization level
 */

/**
 * @typedef {Object} BuildOptions
 * @property {string} entry - Entry point
 * @property {string} output - Output directory
 * @property {string[]} plugins - Build plugins
 * @property {OptimizationOptions} [optimization] - Optimization settings
 */

/**
 * Build application
 * @param {BuildOptions} options - Build options
 * @returns {Promise<void>}
 */
function build(options) {
  // Implementation
}
```

---

## Type Definitions

### Example 10: Shared Types (packages/types.js)

**Current State:**
```javascript
// packages/types.js

/**
 * @typedef {Object} DooksaPlugin
 * @property {string} name - Plugin identifier
 * @property {Object.<string, Function>} methods - Public methods
 * @property {Object.<string, Function>} [privateMethods] - Private methods
 * @property {Object} [state] - State configuration
 * @property {Object} [metadata] - Plugin metadata
 */

/**
 * @typedef {Object} PluginMetadata
 * @property {string} version - Plugin version
 * @property {string} author - Plugin author
 * @property {string[]} dependencies - Plugin dependencies
 */
```

**✅ GOOD: Already follows guidelines**
- Project-level types in dedicated file
- Descriptive type names
- Clear property documentation
- Reusable across packages

**Status:** ✅ Already follows guidelines

---

### Example 11: Package-Specific Types

**Current State:**
```javascript
// packages/create-component/src/types.js

/**
 * @typedef {Object} ComponentOptions
 * @property {string} name - Component name
 * @property {Object} props - Component props
 * @property {Object} [state] - Component state
 * @property {Object} [methods] - Component methods
 */

/**
 * @typedef {Object} ComponentResult
 * @property {Object} component - The created component
 * @property {string} name - Component name
 * @property {Object} metadata - Component metadata
 */
```

**✅ GOOD: Already follows guidelines**
- Package-specific types in dedicated file
- Clear separation of concerns
- Descriptive names
- Proper property documentation

**Status:** ✅ Already follows guidelines

---

## Common Patterns

### Pattern 1: Simple Utility (No Changes Needed)

```javascript
/**
 * Generate unique ID
 * @param {string} [prefix=''] - ID prefix
 * @returns {string} Unique ID
 */
function generateId(prefix = '') {
  // Implementation
}
```

**Status:** ✅ Already follows guidelines

---

### Pattern 2: Object with Optional Properties (Needs typedef)

**❌ BEFORE:**
```javascript
/**
 * Create user
 * @param {Object} options - User options
 * @param {string} options.name - User name
 * @param {string} options.email - User email
 * @param {number} [options.age] - User age
 * @param {Object} [options.preferences] - User preferences
 * @returns {Object} User object
 */
function createUser(options) {
  // Implementation
}
```

**✅ AFTER:**
```javascript
/**
 * @typedef {Object} UserPreferences
 * @property {boolean} [darkMode=false] - Dark mode preference
 * @property {string[]} [tags] - User tags
 */

/**
 * @typedef {Object} UserOptions
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {number} [age] - User age
 * @property {UserPreferences} [preferences] - User preferences
 */

/**
 * Create user
 * @param {UserOptions} options - User options
 * @returns {Object} User object
 */
function createUser(options) {
  // Implementation
}
```

---

### Pattern 3: Function with Callback (Needs @callback)

**❌ BEFORE:**
```javascript
/**
 * Process data asynchronously
 * @param {*} data - Data to process
 * @param {function(Error, *): void} callback - Callback function
 * @returns {void}
 */
function processData(data, callback) {
  // Implementation
}
```

**✅ AFTER:**
```javascript
/**
 * @callback ProcessCallback
 * @param {Error} error - Error object
 * @param {*} result - Processing result
 * @returns {void}
 */

/**
 * Process data asynchronously
 * @param {*} data - Data to process
 * @param {ProcessCallback} callback - Callback function
 * @returns {void}
 */
function processData(data, callback) {
  // Implementation
}
```

---

### Pattern 4: Complex Configuration (Needs nested typedefs)

**❌ BEFORE:**
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

**✅ AFTER:**
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

---

## Migration Checklist

When refactoring existing code, follow this checklist:

### ✅ Simple Cases (No Changes)
- [ ] Primitive types: `{string}`, `{number}`, `{boolean}`
- [ ] Basic unions: `{string|number}`
- [ ] Simple arrays: `{string[]}`
- [ ] Optional primitives: `{string} [param]`
- [ ] Wildcard: `{*}`

### ⚠️ Needs typedef (Complex Cases)
- [ ] Object with 3+ properties
- [ ] Object with nested objects
- [ ] Function signatures with parameters
- [ ] Callback types
- [ ] Reused type definitions
- [ ] Configuration objects with many options

### ✅ Already Correct
- [ ] Project-level types in `packages/types.js`
- [ ] Package-specific types in `types.js` files
- [ ] Simple utility functions with inline types

---

## Summary

### Key Takeaways

1. **Use inline types for:**
   - Primitives: `{string}`, `{number}`, `{boolean}`
   - Simple unions: `{string|number}`
   - Simple arrays: `{string[]}`
   - Optional primitives: `{string} [param]`

2. **Use typedef for:**
   - Objects with 3+ properties
   - Objects with nested objects
   - Function signatures
   - Callback types
   - Reused types

3. **Naming conventions:**
   - PascalCase: `PluginOptions`, `UserConfig`
   - Descriptive: `PluginMetadata` not `Metadata`
   - Internal: `_InternalState` with underscore prefix

4. **Organization:**
   - Project types: `packages/types.js`
   - Package types: `types.js` files
   - Function callbacks: Before the function

### Files That Need Refactoring

Based on the implementation plan, these files need updates:

1. **packages/utils/src/**
   - `get-value.js` - Add typedef for options
   - `sort-object.js` - Add typedef for options
   - Others may need review

2. **packages/create-plugin/src/**
   - `create-plugin.js` - Add typedef for PluginOptions
   - `parse-schema.js` - Add typedef for ParseOptions
   - `create-plugin-helpers.js` - Review for complex types

3. **packages/create-component/src/**
   - Review all functions for complex types
   - Add typedefs where needed

4. **packages/create-app/src/**
   - Review all functions for complex types
   - Add typedefs where needed

### Files That Already Follow Guidelines

1. **packages/types.js** - ✅ Project-level types
2. **packages/create-plugin/types.js** - ✅ Package-specific types
3. **packages/create-component/src/types.js** - ✅ Package-specific types
4. **packages/create-app/types/index.js** - ✅ Package-specific types
5. **packages/utils/src/capitalise.js** - ✅ Simple inline types

---

## Next Steps

1. Review each file in the refactoring list
2. Identify complex inline types
3. Create appropriate typedefs
4. Update function signatures
5. Run ESLint to verify
6. Generate TypeDoc documentation
7. Review generated output

For detailed guidelines, see `docs/jsdoc-guidelines.md`.
