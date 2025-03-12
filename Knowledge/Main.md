# Deep Search Knowledge Base

This document serves as a guide to the Deep Search application codebase and its structure.

## Project Structure

- `index.html`: Main HTML file that contains the application structure
- `style.css`: CSS file containing all styling for the application
- `agents.js`: JavaScript module that handles the agent selection and search functionality

## Recent Changes

### Structured Data Visualization (Latest Change)

Added a powerful structured data visualization system that enhances how information is presented. The visualization system:

1. Automatically extracts structured JSON data from agent responses
2. Renders various visualization types:
   - Tables for tabular data
   - Comparison cards for side-by-side comparisons
   - Rating visualizations with star ratings
   - Pros/cons lists with visual indicators
   - Stat cards with auto-assigned icons
   - Icon lists for enhanced readability
   - Timelines for chronological data
   - Chart placeholders (with future support for Chart.js)

This system enables the agent to present data in more visually appealing and easier-to-understand formats, particularly for:
- Statistical comparisons
- Feature comparisons
- Ratings and reviews
- Complex datasets
- Step-by-step processes

See `Knowledge/Structured_Data_Visualization.md` for detailed documentation.

### Design Restoration (Previous Change)

The visual design of search results was restored to match the original cleaner, more minimalist aesthetic while maintaining the conversation functionality. Key changes include:

1. Removed boxed styling from search result items in favor of a flatter design
2. Restored the original header and content layout
3. Simplified the sources container to match the original design
4. Updated JavaScript to generate the DOM structure consistent with the original design

See `Knowledge/Design_Restoration.md` for detailed documentation.

### Conversation Search

The search experience has been enhanced to provide a conversation-like interface. Key changes include:

1. Search results are appended to previous results instead of replacing them
2. Each search result has its own header showing the query and its own sources section
3. Loading indicators appear inline between search results for subsequent searches
4. The UI maintains the same visual design while supporting multiple results

See `Knowledge/Conversation_Search.md` for detailed documentation on this feature.

### UI Element Removal

The following UI elements were removed from the results section:
1. "Powered by: GPT-4o Agent" text that previously showed which agent was used
2. "New search" button that allowed returning to the search page

This simplifies the UI and removes the need to start a new search, encouraging users to continue with their current session.

### CSS Extraction

The CSS styles were moved from the inline `<style>` tag in `index.html` to a separate `style.css` file. This separation of concerns makes the codebase more maintainable by:

1. Reducing the size of the HTML file
2. Allowing the CSS to be cached separately by browsers
3. Making it easier to find and modify styles
4. Following the standard practice of separating structure (HTML) from presentation (CSS)

No functional changes were made - only the location of the styles was changed.

## Application Overview

Deep Search is a web application that allows users to search for information using different AI agents depending on the query type. It features:

1. A clean, minimalist UI with a search input at the bottom of the page
2. Support for multiple AI agents that handle different types of queries
3. An API key configuration for connecting to OpenAI APIs
4. A visualization panel for the agent decision process
5. Markdown rendering for formatted responses
6. Rich data visualizations for structured information

## How to Use

1. Enter your OpenAI API key in the settings
2. Type a query in the search box and press Enter
3. View the results rendered with Markdown formatting
4. Toggle sources to see references if available
5. Click "New search" to start over

## API Integration

The application uses the OpenAI API. Users must provide their own API key, which is stored locally in the browser's localStorage.

# Deep Search Project Documentation

## Project Overview

Deep Search is an advanced AI-powered search application that utilizes a decision tree agent system to intelligently route user queries to the most appropriate OpenAI model. Rather than relying on a single AI model for all queries, Deep Search implements a hierarchical approach where agents can evaluate queries and delegate to specialized agents when appropriate.

## Key Components

The project consists of these main components:

### 1. Agent System
- Implements a decision tree structure where agents evaluate queries and make delegation decisions
- Each agent can either handle a query directly or delegate to another agent
- Specialized agents include Web Search Agent (with browsing capability), GPT-4o Agent (for complex reasoning), and GPT-4o Mini Agent (for faster, simpler responses)
- See `Knowledge/agent-system.md` for detailed documentation
- See `Knowledge/decision-tree-implementation.md` for technical implementation details

### 2. UI Components
- Modern, responsive interface built with React
- Includes components for query input, response display, and agent visualization
- Features a panel showing the delegation path and agent decision-making process
- See `Knowledge/ui-components.md` for detailed documentation

### 3. API Integration
- Secure integration with OpenAI API
- Handles authentication, rate limiting, and error handling
- Manages concurrent requests efficiently

## Project Structure

```
deep-search/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── utils/            # Utility functions
│   ├── agents.js         # Agent decision tree implementation
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
├── Knowledge/            # Documentation
│   ├── MAIN.md           # This overview file
│   ├── agent-system.md   # Agent selection system documentation
│   ├── ui-components.md  # UI components documentation
│   └── decision-tree-implementation.md  # Decision tree implementation details
└── README.md             # Project README
```

## Configuration

The application requires the following configuration:

1. **OpenAI API Key**: Required for accessing the OpenAI API.
2. **Agent Configuration**: Defined in `agents.js`, including model specifications and delegation criteria.
3. **Environmental Variables**: Set in `.env` file (not tracked in source control).

## Development Guidelines

When making changes to this project:

1. **Agent System**:
   - Maintain the decision tree structure where agents evaluate and delegate
   - Use the standardized delegation format for consistency
   - Ensure loop prevention by checking the agent path

2. **UI Components**:
   - Keep the design clean and user-friendly
   - Ensure responsive design for all screen sizes
   - Maintain accessibility standards

3. **Documentation**:
   - Update the Knowledge files whenever making significant changes
   - Keep MAIN.md as the central entry point to documentation
   - Document complex logic with clear explanations

## Future Improvements

Planned improvements include:

1. **Enhanced Agent Customization**:
   - Allow users to adjust the decision criteria for agent delegation
   - Provide more transparency into agent decision-making

2. **Additional Specialized Agents**:
   - Add more specialized agents for specific domains
   - Implement task-specific agents for enhanced performance

3. **UI Enhancements**:
   - Add more detailed visualization of the agent decision tree
   - Implement user preferences for response formatting

## Git Operations History

### March 12, 2024

- Removed commit `e83dfddc5fd60dba25fb8006bfc60d70d72d621e` with message "Added API security documentation and .gitignore file" using `git reset --hard HEAD~1`.
- Current HEAD is now at commit `9f5a5bc` with message "Updates to Search". 