
# Create component

The createComponent function is for creating Dooksa components. 

- [Function reference](#function-reference)
- [User Guide](#user-guide)
  - [Understanding Component Data Structure](#understanding-component-data-structure)
  - [Basic Component Creation](basic-component-creation)
  - [Component Properties](component-properties)
  - [Component Options](component-options)
  - [Component Events](component-events)
    - [Event types](event-types)
  - [Load custom web components](load-custom-web-components)
  - [Component Initialization Function](component-initialization-function)
  - [Extending Components with Mixins](extending-components-with-mixins)

## Function Reference

### `createComponent`

**Description**
Creates a Dooksa component.

**Parameters**
- `data` (Required): An object containing data for the component.
  - `id` (String): The unique identifier for the component.
  - `tag` (String): The HTML tag associated with the component.
  - `properties` (Array): Array of properties for the component.
    - Each property object includes:
      - `name` (String): Name of the property.
      - `value`: Value of the property.
  - `options` (Optional): Custom options for the component.
    - Each option is an object with the following properties:
      - `name` (String): The name of the optional property.
      - `values` (Object, Optional): Possible values for the option.
      - `toggle` (Boolean, Optional): If true, the option is a toggle.
      - `value` (Any, Optional): A single value to set for the option.
      - `replace` (Boolean, Optional): Replaces other values with the same attribute if true.
      - `computedValue` (Function, Optional): Computed property function.

- `mixins` (Optional): An array of mixins to extend the component with.
  - Each mixin object includes:
    - `metadata`: Metadata for the mixin.
    - `data`: Data for the mixin.

**Returns**
A `Component` object representing the created component.


## User Guide

The `createComponent` function is a powerful tool in Dooksa that allows developers to create custom Dooksa components.

### 1. Understanding Component Data Structure

The `createComponent` function requires a data object containing essential information about the new component, such as its ID, tag name:

```javascript
const createComponentData = {
  id: 'my-component', // Unique identifier for your component
  tag: 'div', // Element tag name (e.g., 'div', 'span')
}
```

### 2. Basic Component Creation

To create a basic component, provide the `createComponentData` object to the `createComponent` function:

```javascript
const myComponent = createComponent(createComponentData)
```

The returned `myComponent` object contains all necessary information and metadata for your custom Dooksa component.

### 3. Component Properties

Properties are default values set on existing or add new component attributes.

```javascript
createComponentData.properties = [
  { 
    name: 'data-test',
    value: 'test'
  }
]
```

### 4. Component Options

Options exposes attribute or property values to the Dooksa user.

```javascript
createComponentData.options = {
  // Example option with a list of possible values
  width: {
    name: 'width',
    values: {
      100: '100%',
      50: '50%',
      30: '30%'
    }
  },

  // Example option with toggle option
  hidden: {
    name: 'hidden',
    toggle: true,
  },

  // Example option with setting a single value
  hover: {
    name: 'className',
    value: 'accordion-hover'
  },

  // Example option with user input value
  title: {
    name: 'title'
  },

  // Example option that replaces other values with the same attribute
  button: {
    name: 'className',
    value: 'button',
    replace: true
  },

  // Example option that has a computed property
  show: {
    name: 'size',
    /**
     * Show number of items
     * @param {number} size
     * @returns {string}
     */
    computedValue (size) {
      return size.toString()
    }
  }
}
```

### 5. Component Events

Add custom events to your components using the `events` field

```javascript
createComponentData.events = [
  {
    on: 'component/created', // Name of event
    actionId: 'my-action' // Unique identifier for the event action
  },
  {
    on: 'node/click',
    actionId: 'my-click-action'
  }
]
```

#### Event types

Add custom event emitter types on your computer using the `eventTypes` field

The pattern of `eventTypes` are `eventTypePrefix/eventTarget`

There are three `eventTypePrefix`:

- `observerProperty`: This event prefix observes any changes to the component setters
- `observerAttribute`: This event prefix observes any changes to the components attributes
- `node`: This event prefix observes any EventTarget

The `eventTarget` is related to each respected prefix, e.g. node/click

```javascript
createComponentData.eventTypes = {
  'observerProperty/checked': true
  'observerAttribute/data-icon': true,
  'node/click': true
}
```

### 6. Load custom web components

In the `component` function, you can create or fetch your custom web component

```javascript
createComponentData.component = () => {
  class PopupInfo extends HTMLElement {
    constructor() {
      super();
    }
    // Element functionality written in here
  }

  customElements.define("popup-info", PopupInfo);
}
```
Here is an example of dynamically load a web component

```javascript
createComponentData.component = import('iconify-icon')
```

### 7. Component Initialization Function

In the `initialize` function, you can set up your custom component, add event listeners, or perform any other required setup tasks.

```javascript
createComponentData.initialize = (context, emit) => {
  // Add content to the component using context and emit custom events
  const popupInfo = document.createElement('popup-info')
  popupInfo.setAttribute('data-text', 'My Component')

  // Emit a custom event when clicking on the popupInfo element
  popupInfo.addEventListener('click', () => {
    // emit Dooksa event 
    emit({
      name: 'node/click',
      id: context.id,
      context,
      payload: { message: 'Component clicked' }
    })
  })

  return popupInfo
}
```

### 8. Extending Components with Mixins

Mixins allow you to extend existing components by merging their properties, events, styles, and options into the new component.

```javascript
const ariaLabelMixin = createMixin({
  metadata: {
    id: 'aria-label'
  },
  data: {
    options: {
      ariaLabel: {
        name: 'aria-label'
      },
      ariaLabelled: {
        name: 'aria-labelled'
      }
    }
  }
})

const extendedComponentOne = createComponent(createComponentDataOne, [ariaLabelMixin])
const extendedComponentTwo = createComponent(createComponentDataTwo, [ariaLabelMixin])
```

By understanding and leveraging these features of the `createComponent` function, you can create custom Dooksa components tailored to your application's needs.