# JSDoc Guidelines for Dooksa

This document establishes comprehensive JSDoc documentation standards for the Dooksa project, emphasizing the use of typedefs for complex types while allowing simple inline types for primitives and basic unions.

## Overview

The Dooksa project is a monorepo with multiple packages. Consistent JSDoc documentation ensures:
- Better code maintainability
- Improved developer experience with IDE autocompletion
- Clear type information for complex data structures
- Professional documentation generation via TypeDoc

## Type Definition Standards

### When to Use Inline Types (Simple Cases)

**Use inline types for:**
- Primitive types: `{string}`, `{number}`, `{boolean}`, `{Object}`, `{Array}`
- Basic unions: `{string|number}`, `{string|string[]}`
- Simple arrays: `{string[]}`, `{number[]}`
- Wildcard types: `{*}` for any type
- Optional primitives: `{string} [param]`
- Nullable types: `{string|null}`

**Example:**
```javascript
/**
 * Get value from object using a query path
 * @param {*} value - Any value to retrieve from
 * @param {string|string[]} [query] - Query path or array of paths
 * @param {boolean} [strict=false] - Whether to use strict mode
 * @returns {*} The retrieved value or undefined
 */
function getValue(value, query, strict = false) {
  // Implementation
}
```

### When to Use typedef (Complex Cases)

**Must use typedef for:**
- Object types with 3+ properties
- Object types with nested objects
- Function signatures with parameters
- Callback types
- Generic types with complex constraints
- Types reused across multiple functions
- Configuration objects with many options

**Example:**
```javascript
/**
 * @typedef {Object} QueryOptions
 * @property {boolean} [strict=false] - Use strict mode
 * @property {string} [separator='.'] - Path separator
 * @property {number} [depth=Infinity] - Maximum depth
 */

/**
 * Get value from object using query options
 * @param {*} value - Any value to retrieve from
 * @param {string} query - Query path
 * @param {QueryOptions} [options] - Query options
 * @returns {*} The retrieved value
 */
function getValue(value, query, options) {
  // Implementation
}
```

## Type Naming Conventions

### PascalCase for Type Names
```javascript
// ✅ GOOD
/**
 * @typedef {Object} PluginOptions
 * @typedef {Object} UserConfig
 * @typedef {Object} StateMetadata
 */

// ❌ BAD
/**
 * @typedef {Object} pluginOptions
 * @typedef {Object} user_config
 */
```

### Descriptive Names
```javascript
// ✅ GOOD
/**
 * @typedef {Object} PluginMetadata
 * @typedef {Object} ComponentConfig
 */

// ❌ BAD
/**
 * @typedef {Object} Metadata
 * @typedef {Object} Config
 */
```

### Internal/Private Types
```javascript
// ✅ GOOD: Prefix internal types with underscore
/**
 * @typedef {Object} _InternalState
 * @property {Map} _cache - Internal cache
 * @property {number} _version - Internal version
 */

/**
 * @typedef {Object} PublicState
 * @property {Object} data - Public data
 * @property {number} timestamp - Last update
 */
```

## Type Organization

### Project-Level Types
Project-wide types should be defined in:
- `packages/types.js` for shared types across packages
- Package-specific `types.js` files for package-specific types

**Example: packages/types.js**
```javascript
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

### Package-Specific Types
Define package-specific types at the top of the main module file:

**Example: packages/create-plugin/src/create-plugin.js**
```javascript
/**
 * @typedef {Object} PluginOptions
 * @property {string} name - Plugin identifier
 * @property {Object.<string, Function>} methods - Public methods
 * @property {Object.<string, Function>} [privateMethods] - Private methods
 * @property {Object} [state] - State configuration
 */

/**
 * @typedef {Object} PluginResult
 * @property {Object} plugin - The created plugin
 * @property {string} name - Plugin name
 * @property {Object} metadata - Plugin metadata
 */

// Type definitions above, then functions below
```

### Function-Specific Callback Types
Define callback types immediately before the function that uses them:

**Example:**
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

## Callback Documentation

### Using @callback for Function Types

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

### Callback with Multiple Parameters
```javascript
/**
 * @callback ValidationCallback
 * @param {*} value - Value to validate
 * @param {string} field - Field name
 * @param {Object} context - Validation context
 * @returns {boolean|string} - True if valid, error message if invalid
 */

/**
 * Validate form fields
 * @param {Object} formData - Form data
 * @param {ValidationCallback} validator - Validation function
 * @returns {Object} Validation results
 */
function validateForm(formData, validator) {
  // Implementation
}
```

## Object Type Properties

### Property Documentation Format
```javascript
/**
 * @typedef {Object} UserConfig
 * @property {string} username - User's display name
 * @property {string} email - User's email address
 * @property {number} [age] - User's age (optional)
 * @property {Object} [preferences] - User preferences
 * @property {boolean} [preferences.darkMode=false] - Dark mode preference
 * @property {string[]} [preferences.tags] - User tags
 */
```

### Nested Object Properties
```javascript
/**
 * @typedef {Object} PluginConfig
 * @property {string} name - Plugin name
 * @property {Object} options - Plugin options
 * @property {boolean} [options.enabled=true] - Whether plugin is enabled
 * @property {number} [options.priority=0] - Plugin priority
 * @property {Object} [options.metadata] - Plugin metadata
 * @property {string} [options.metadata.author] - Plugin author
 */
```

## Array Types

### Simple Arrays
```javascript
// ✅ GOOD: Simple array of primitives
/**
 * @param {string[]} tags - Array of tags
 * @param {number[]} scores - Array of scores
 */
```

### Complex Arrays
```javascript
// ✅ GOOD: Array of objects using typedef
/**
 * @typedef {Object} TagItem
 * @property {string} name - Tag name
 * @property {number} count - Usage count
 */

/**
 * @param {TagItem[]} tags - Array of tag items
 */
```

### Object Arrays
```javascript
// ✅ GOOD: Object with array property
/**
 * @typedef {Object} DataCollection
 * @property {string} name - Collection name
 * @property {Object[]} items - Collection items
 * @property {string} items[].id - Item ID
 * @property {string} items[].value - Item value
 */
```

## Optional and Nullable Types

### Optional Parameters
```javascript
/**
 * @param {string} required - Required parameter
 * @param {number} [optional] - Optional parameter
 * @param {Object} [config={}] - Optional config object
 */
```

### Nullable Types
```javascript
/**
 * @param {string|null} value - String or null
 * @param {Object|undefined} config - Object or undefined
 */
```

### Union Types
```javascript
// ✅ GOOD: Simple unions
/**
 * @param {string|number} id - String or number ID
 * @param {string|string[]} tags - String or array of strings
 */

// ✅ GOOD: Complex unions using typedef
/**
 * @typedef {Object} StringConfig
 * @property {string} type - String type
 * @property {number} length - String length
 */

/**
 * @typedef {Object} NumberConfig
 * @property {string} type - Number type
 * @property {number} value - Number value
 */

/**
 * @param {StringConfig|NumberConfig} config - String or number config
 */
```

## Generic Types

### Simple Generics
```javascript
/**
 * @template T
 * @param {T} value - Value of generic type
 * @returns {T} Same value
 */
function identity(value) {
  return value;
}
```

### Complex Generics
```javascript
/**
 * @template K - Key type
 * @template V - Value type
 * @typedef {Object} GenericMap
 * @property {K} key - Map key
 * @property {V} value - Map value
 */

/**
 * Create a map entry
 * @template K
 * @template V
 * @param {K} key - Entry key
 * @param {V} value - Entry value
 * @returns {GenericMap<K, V>} Map entry
 */
function createEntry(key, value) {
  return { key, value };
}
```

## Function Signatures

### Function Parameters
```javascript
/**
 * @typedef {Object} FunctionConfig
 * @property {number} timeout - Timeout in ms
 * @property {boolean} retry - Whether to retry
 */

/**
 * @callback AsyncFunction
 * @param {...*} args - Function arguments
 * @returns {Promise<*>} Promise resolving to result
 */

/**
 * Wrap function with timeout and retry
 * @param {AsyncFunction} fn - Function to wrap
 * @param {FunctionConfig} config - Configuration
 * @returns {AsyncFunction} Wrapped function
 */
function wrapAsync(fn, config) {
  // Implementation
}
```

## Documentation Best Practices

### Function Documentation
```javascript
/**
 * [Brief description - one line]
 * 
 * [Detailed description - multiple lines if needed]
 * 
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter description
 * @returns {Type} Return value description
 * @throws {ErrorType} Error description
 * 
 * @example
 * // Example usage
 * const result = functionName(param1, param2);
 * 
 * @see {@link relatedFunction}
 */
function functionName(paramName, optionalParam) {
  // Implementation
}
```

### Class Documentation (if classes exist)
```javascript
/**
 * [Brief description]
 * 
 * @class
 * @param {Type} param - Constructor parameter
 */
class MyClass {
  /**
   * @param {Type} param - Constructor parameter
   */
  constructor(param) {
    // Implementation
  }
  
  /**
   * Method description
   * @param {Type} param - Method parameter
   * @returns {Type} Return value
   */
  method(param) {
    // Implementation
  }
}
```

## ESLint Integration

### Required ESLint Rules
The following rules should be configured in `eslint.config.js`:

```javascript
{
  "rules": {
    // Require JSDoc for exported functions
    "jsdoc/require-jsdoc": ["error", {
      "publicOnly": true,
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": true,
        "FunctionExpression": true
      }
    }],
    
    // Require param descriptions
    "jsdoc/require-param-description": "error",
    
    // Require return descriptions
    "jsdoc/require-returns-description": "error",
    
    // Require param types
    "jsdoc/require-param-type": "error",
    
    // Require return types
    "jsdoc/require-returns-type": "error",
    
    // Check for complex inline object types
    "jsdoc/no-types": "off",
    
    // Require consistent param order
    "jsdoc/check-param-names": "error",
    
    // Require valid JSDoc syntax
    "jsdoc/check-syntax": "error"
  }
}
```

### Recommended Rules for typedef Enforcement
```javascript
{
  "rules": {
    // Warn on complex inline object types (configurable)
    "jsdoc/require-returns-check": "error",
    
    // Encourage typedef usage
    "jsdoc/no-undefined-types": "error",
    
    // Check for missing typedefs
    "jsdoc/require-returns": "error"
  }
}
```

## Common Patterns

### Plugin Configuration
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

### State Management
```javascript
/**
 * @typedef {Object} StateConfig
 * @property {*} initial - Initial state value
 * @property {Function} [validator] - State validator
 * @property {boolean} [persistent=false] - Whether to persist
 */

/**
 * Create state manager
 * @param {StateConfig} config - State configuration
 * @returns {Object} State manager
 */
function createState(config) {
  // Implementation
}
```

## Migration Strategy

### Step 1: Identify Complex Types
Look for:
- Object types with 3+ properties
- Function signatures with parameters
- Callback types
- Reused type definitions

### Step 2: Create typedefs
Move complex inline types to typedefs at the top of the file.

### Step 3: Update Function Signatures
Replace complex inline types with typedef references.

### Step 4: Verify
- Run ESLint to check for issues
- Generate TypeDoc documentation
- Review generated output

## Examples

See `docs/jsdoc-examples.md` for real-world examples from the Dooksa codebase.

## References

- [JSDoc Documentation](https://jsdoc.app/)
- [TypeDoc Documentation](https://typedoc.org/)
- [ESLint Plugin JSDoc](https://github.com/gajus/eslint-plugin-jsdoc)
