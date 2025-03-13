# Deep Search Developer Guide

This guide explains how to work with the modular architecture of Deep Search.

## Architecture Overview

Deep Search uses a component-based architecture. Each UI element is represented by a JavaScript class that handles its own rendering, state, and event handling.

The key components and their responsibilities are:

1. **Header** (`components/header.js`): Renders the application title, logo, and API key button.

2. **Search** (`components/search.js`): Handles the search input field and triggers searches.

3. **Results** (`components/results.js`): Manages the display of search results, including references between searches.

4. **ApiKeyModal** (`components/apiKeyModal.js`): Handles API key input, storage, and validation.

5. **AgentProcessModal** (`components/agentProcessModal.js`): Displays details about how AI agents collaborated on responses.

6. **App** (`scripts/app.js`): Coordinates all components and handles the main application logic.

## How Components Work

Each component follows the same pattern:

```javascript
export class ComponentName {
    constructor(container, options) {
        this.container = container;
        // Store options and initialize properties
    }
    
    render() {
        // Create DOM elements
        // Add event listeners
        // Append to container
        return this;
    }
    
    // Other methods specific to component functionality
}
```

### Component Lifecycle

1. **Initialization**: The main app creates each component, passing in its container element.
2. **Rendering**: The component creates its DOM elements and event listeners when `render()` is called.
3. **Interaction**: The component handles its own user interactions.
4. **Callbacks**: Components communicate with others through callback functions passed in the constructor.

## Adding New Features

### Example: Adding a New Component

To add a new "History" component that shows search history:

1. Create `components/history.js`:

```javascript
export class History {
    constructor(container, onSearchSelect) {
        this.container = container;
        this.onSearchSelect = onSearchSelect;
        this.historyContainer = null;
    }
    
    render() {
        this.historyContainer = document.createElement('div');
        this.historyContainer.className = 'history-container';
        
        const title = document.createElement('h3');
        title.textContent = 'Search History';
        this.historyContainer.appendChild(title);
        
        this.container.appendChild(this.historyContainer);
        return this;
    }
    
    addHistoryItem(query, timestamp) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = query;
        item.addEventListener('click', () => this.onSearchSelect(query));
        this.historyContainer.appendChild(item);
    }
}
```

2. Import and use it in `app.js`:

```javascript
import { History } from '../components/history.js';

// In App class
constructor() {
    // existing code...
    this.history = null;
}

_initComponents() {
    // existing components...
    
    // Add history component
    this.history = new History(this.container, (query) => this.handleSearch(query));
    this.history.render();
}

// In handleSearch method
async handleSearch(query) {
    // existing code...
    
    // Add to history display
    this.history.addHistoryItem(query, new Date().toISOString());
    
    // rest of method...
}
```

3. Add styles for the new component in `styles/style.css`.

### Modifying Existing Components

To modify an existing component:

1. Locate the relevant component file
2. Make your changes to the class
3. If needed, update any consumers of the component

## Styling

All styles are defined in `styles/style.css`. The CSS uses custom properties (variables) for consistent theming:

```css
:root {
    --primary-color: #4285f4;
    --secondary-color: #34a853;
    /* more variables... */
}
```

When styling new components, follow these guidelines:

1. Use the existing CSS variables for colors, spacing, etc.
2. Add styles for your component at the end of the file, with a clear comment header
3. Use BEM-like naming (e.g., `.component-name__element--modifier`)

## Common Tasks

### Adding a New User Interface Element

1. Create a new component class if it's a significant UI element
2. Add it to the App class and initialize it
3. Define communication between components using callbacks

### Modifying the Search Behavior

Modify the `handleSearch` method in `app.js` and potentially the `triggerSearch` method in `search.js`.

### Changing the Result Display

Modify the `addResult` method in the `Results` class to change how search results appear.

## Troubleshooting

- **Components not appearing**: Check if `render()` is called and if the container element exists
- **Event listeners not working**: Verify that listeners are added in the component's `render()` method or a dedicated init method
- **Component communication issues**: Ensure callbacks are properly passed and called

## Performance Considerations

- Avoid unnecessary DOM manipulations
- Consider using DocumentFragment for batch DOM updates
- For large result sets, consider pagination or virtual scrolling 