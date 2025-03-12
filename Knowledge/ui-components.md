# UI Components Documentation

## Overview

The Deep Search application features a clean, modern user interface designed to provide an intuitive experience for interacting with AI agents. The UI components are built with React and focus on clear presentation of both the query interface and the decision tree visualization.

## Main Components

### 1. Search Interface

- **QueryInput**: A text input field where users enter their search queries
  - Features placeholder text guiding users on query formulation
  - Includes submit button with loading state indicator
  - Accessible with keyboard support and screen reader compatibility

- **APIKeyInput**: A secure field for entering and managing OpenAI API keys
  - Stores API key in browser localStorage for persistence
  - Includes input validation and masked display

### 2. Results Display

- **ResponseDisplay**: Renders AI responses with formatting
  - Supports markdown rendering
  - Handles code blocks with syntax highlighting
  - Displays web citations (when applicable) with expandable source information

### 3. Agent Decision Tree Visualization

- **AgentPathVisualizer**: Visualizes the agent decision tree process
  - Shows the complete path of agent evaluations
  - Displays which agents were consulted in sequence
  - Indicates delegation decisions and reasoning
  - Uses color coding to distinguish between agents
  
- **DecisionTreeDisplay**: A detailed view showing:
  - The root agent that initially evaluated the query
  - Each delegation step in the decision path
  - Arrows indicating the flow of delegation
  - The final agent that handled the query
  - Reasons provided for each delegation decision

- **AgentDetailsPanel**: Provides information about the selected agent
  - Shows agent name, model, and description
  - Displays statistics like response time
  - Shows delegation criteria used by the agent

## State Management

The UI manages several key states:

1. **Query State**: Tracks the current query text and submission status
2. **Response State**: Contains the full response data including agent information
3. **Agent Path State**: Maintains the full decision tree traversal for visualization
4. **Loading States**: Manages various loading indicators during API calls

## Responsive Design

- **Mobile View**: Single-column layout with collapsible sections
- **Tablet View**: Two-column layout with side-by-side query and results
- **Desktop View**: Full layout with expanded decision tree visualization

## Accessibility Features

- ARIA attributes for screen reader compatibility
- Keyboard navigation support
- Sufficient color contrast ratios
- Focus management for interactive elements

## Theme

- Light and dark mode support
- Consistent color scheme matching the Deep Search brand
- Typography using system fonts for optimal performance
- Consistent spacing and component sizing

## Future UI Enhancements

1. **Interactive Decision Tree**:
   - Allow users to click on agents in the visualization to see detailed information
   - Enable manual agent selection to override the automatic delegation
   - Provide comparison view of how different agents would answer the same query

2. **Advanced Customization**:
   - UI for adjusting agent delegation criteria
   - Customizable display preferences for responses
   - Saved query history with agent path information 