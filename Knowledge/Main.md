# Deep Search Project Knowledge Base

Welcome to the Deep Search project knowledge base. This document serves as an entry point to understand the project structure and purpose.

## Project Overview

Deep Search is a web application that allows users to ask questions and get up-to-date answers using OpenAI's Web Search API.

## Current Components

1. **search.html** - The main search interface with the Deep Search logo and a search field at the bottom.
2. **API.js** - JavaScript module that connects to OpenAI's Web Search API.

## Recent Updates

- Implemented secure API key handling:
  - Removed hardcoded API key from the code
  - Added a form to collect the user's OpenAI API key after first search
  - Store API key securely in the browser's localStorage
  - Resume search automatically after API key is saved
- Fixed CORS and JavaScript issues:
  - Restructured JavaScript to use proper event listeners
  - Added detailed error handling for API requests
  - Added setup instructions for proper deployment
  - Improved error messaging for better user experience
- Added OpenAI Web Search API integration:
  - Created API.js to handle connections to OpenAI's Web Search API
  - Updated search.html to display search results with sources
  - Added loading indicator and results display area
  - Added error handling for API requests
- Removed the search button entirely:
  - Added functionality to trigger search when user presses Enter/Return key
  - Added visual feedback (pulse animation) when search is triggered
- Repositioned search button to be outside the search field (removed in later update)
- Implemented color blending effect:
  - Search field blends with background when empty
  - Becomes more prominent and solid when content is entered or focused
- Enhanced the search field design with:
  - Improved visual aesthetics (shadows, gradients, animations)
  - Better hover and focus states
  - Smooth transitions and interactive feedback
  - Subtle floating animation for the logo
- Modified `search.html` to move the search field to the bottom of the page
- Created `search.html` with a clean, modern interface featuring:
  - Deep Search logo (magnifying glass emoji)
  - Deep Search title
  - Search input field with "Ask anything..." placeholder

## Project Structure

```
Deep Search/
├── search.html         # Main search interface
├── API.js              # OpenAI Web Search API integration
└── Knowledge/          # Documentation and instructions
    └── Main.md         # This file - main entry point for documentation
```

## Development Guidelines

### API Keys and Security

- The application now prompts users to input their own OpenAI API key.
- API key handling:
  1. User's API key is stored in their browser's localStorage
  2. The key never leaves the user's device (client-side only)
  3. The key is used only for communicating with the OpenAI API
  4. Users can clear their localStorage to remove the saved key
- For production deployment, you might want to:
  1. Consider implementing a server-side proxy to handle API calls
  2. Add encryption for the locally stored API key
  3. Implement rate limiting to manage API usage costs

### Setup and Deployment

#### CORS Restrictions

When running this application locally, you will encounter CORS (Cross-Origin Resource Sharing) issues because:

1. Browsers enforce a security policy that prevents web pages from making requests to a different domain than the one that served the page.
2. When opening HTML files directly (using the `file://` protocol), the browser treats it as having no domain.
3. The OpenAI API requires proper authentication headers and doesn't allow direct requests from browsers without proper CORS headers.

#### Running Locally

To run the application locally, you have several options:

1. **Use a local web server**:
   - Python: `python -m http.server`
   - Node.js: Install `http-server` via npm and run `http-server`
   - VS Code: Use the "Live Server" extension

2. **Create a backend proxy**:
   - Develop a simple server in Node.js, Python, or your preferred language
   - Have the server handle the API requests to OpenAI
   - This is the recommended approach for production

3. **Use a CORS proxy service** (not recommended for production):
   - Various services exist that can proxy requests and add CORS headers
   - This is less secure and should only be used for development

### API Functionality

- The OpenAI Web Search API supports two models:
  - `gpt-4o-search-preview` (default, higher quality)
  - `gpt-4o-mini-search-preview` (lower cost)
- Search context size options:
  - `high` - Most comprehensive results, highest cost
  - `medium` - (default) Balanced approach
  - `low` - Fastest response, lowest cost

### Future Improvements

- Implement an option to change or clear the API key
- Add API key validation before attempting searches
- Create a backend proxy server to handle API requests securely
- Add user settings for location preferences
- Implement search history
- Create a results page with more detailed formatting
- Add authentication to manage API usage 