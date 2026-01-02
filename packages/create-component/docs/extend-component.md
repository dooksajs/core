# Extend Component

## Function Reference

### `extendComponent`

**Description**
Extends a component with additional data and options.

**Parameters**
- `component` (Required): The base component object to extend.
- `extend` (Optional, Default: `{}`): Configuration for extending the component.
  - `properties`: Additional properties to add.
  - `metadata`: Metadata for the extended component.
    - `id`: Unique identifier for the extended component.
    - `parentId`: ID of the parent component.
  - `options`: Options for the extended component.
  - `events`: Events for the extended component.
    - `clearDefaultEvents`: Boolean indicating whether to clear default events.
  - `children`: Child components.

**Returns**
The extended component object (`Component`).

# User Guide

The `extendComponent` function allows to extend from existing components, merging properties, events, styles, and options to create customized components tailored to specific application needs. This guide will walk you through the process of using the `extendComponent` function.

## 1. Understanding Component Extension Data Structure

The `extendComponent` function takes two parameters: a base component object ([`component`](./create-component.md)) and an extension configuration object (`extend`). The `extend` parameter is optional and allows for customization of the base component.

```javascript
const extendedComponentData = {
  // Base component data
  id: 'base-component',

  // Extension configuration
  extend: {
    metadata: {
      id: 'extended-id' // Override the base component ID
    },

    options: {
      // Additional or overridden options
      newOption: {
        name: 'newOption',
        value: 'newValue'
      }
    },

    properties: [
      // Additional or overridden properties
      {
        name: 'newProperty',
        value: 'newValue'
      }
    ],

    children: [
      // Override or add child components
      {
        id: 'childComponentId'
      }
    ]
  }
}
```

## 2. Extending a Component's Metadata

You can customize the component ID and parent ID by including `metadata` in the extension configuration object:

```javascript
const extendedComponentData = {
  ...
  extend: {
    metadata: {
      id: 'extended-id' // Override base component ID
      parentId: 'base-component-parentId' // Set new parent ID
    }
  }
}
```

## 3. Adding or Overriding Options

To add new options, properties, or override existing ones, include them in the `options` and `properties` fields within the extension configuration object:

```javascript
const extendedComponentData = {
  ...
  extend: {
    options: {
      // New or overridden option
      newOption: {
        name: 'newOption',
        value: 'newValue'
      }
    },

    properties: [
      // New or overridden property
      {
        name: 'newProperty',
        value: 'newValue'
      }
    ]
  }
}
```

## 4. Extending Child Components

To override or add child components, include the `children` field within the extension configuration object:

```javascript
const extendedComponentData = {
  ...
  extend: {
    children: [
      // Override existing child component
      { id: 'existingChildId', options: { newOption: 'newValue' } },

      // Add new child component
      { id: 'newChildId', tag: 'div' }
    ]
  }
}
```

## 5. Clearing Default Events

By default, extending a component does not change the event list. To override or extend events, add an `events` field within the extension configuration object and set `clearDefaultEvents` to `true`:

```javascript
const extendedComponentData = {
  ...
  extend: {
    events: [
      // Override or extend events
      {
        on: 'node/click',
        actionId: 'newClickAction'
      }
    ],

    clearDefaultEvents: true
  }
}
```

If `clearDefaultEvents` is not set to `true`, the new events will be appended to existing ones.

## 6. Using extendComponent Function

With your extension configuration ready, use the `extendComponent` function to create an extended component:

```javascript
const baseComponent = createComponent(baseComponentData);
const extendedComponent = extendComponent(baseComponent, extendedComponentData.extend)
```

By understanding and leveraging these features of the `extendComponent` function, you can build upon existing components in Dooksa to meet your application's requirements effectively.