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