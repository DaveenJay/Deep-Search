# Deep Search

A search application with AI-powered results and agent collaboration.

Try DeepSearch using your API keys. `http://deepsearch.lol`

## Project Structure

The project uses a modular component-based architecture:

```
Deep Search/
├── components/         # Reusable UI components
│   ├── header.js       # Header component
│   ├── search.js       # Search input component
│   ├── results.js      # Search results display component
│   ├── apiKeyModal.js  # API key management modal
│   └── agentProcessModal.js  # Agent process visualization modal
├── styles/             # CSS styles
│   └── style.css       # Main stylesheet
├── scripts/            # JavaScript code
│   └── app.js          # Main application logic
├── assets/             # Static assets like images 
├── icons/              # App icons for various platforms
├── agents.js           # AI agent system (imported as module)
├── index.html          # Main HTML file
└── manifest.json       # PWA manifest file
```

## Component Architecture

The application is built using a component-based approach where each UI element is represented by a JavaScript class with its own rendering and event handling logic. This makes the codebase:

1. **Modular**: Each component is independent and can be developed, tested, and managed separately.
2. **Maintainable**: When you need to modify a feature, you know exactly which component to change.
3. **Reusable**: Components can be reused across the application or even in other projects.

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser or serve with a local HTTP server

```bash
python -m http.server 8000
```

3. Visit `http://localhost:8000` in your browser

## Using the Application

1. Set up your OpenAI API key when prompted
2. Enter your search query in the search box
3. View AI-generated results with citations and sources
4. Explore how AI agents collaborated on your search by clicking "Show how this was answered"

## Development

To modify or extend the application:

1. Each component file (`components/*.js`) contains a class with a `render()` method and event handlers
2. The main app (`scripts/app.js`) coordinates these components
3. Styles are defined in `styles/style.css` 
