# Decision Tree Implementation

## Overview

Deep Search now uses a true decision tree approach for agent selection. This document explains the implementation details, the flow of decision-making, and how the visualization works.

## Architecture

The decision tree system consists of:

1. **Agent Definitions**: Configured in `agents.js` with properties like name, model, description, and priority
2. **Decision Tree Flow**: A recursive process where agents evaluate queries and make delegation decisions
3. **Visualization Component**: A UI panel showing the decision path and reasoning

## Decision-Making Flow

1. **Start with Root Agent**:
   - The system begins with GPT-4o as the root agent
   - The agent evaluates whether to handle the query or delegate

2. **Delegation Process**:
   - If the agent decides to delegate, it specifies which agent should handle the query
   - The specified agent then makes its own evaluation
   - This continues until an agent decides to handle the query

3. **Decision Format**:
   Each agent responds with a structured decision:
   ```
   DECISION: [HANDLE/DELEGATE]
   DELEGATE_TO: [Agent Name or NONE if handling]
   REASON: [Brief explanation of the decision]
   ```

4. **Loop Prevention**:
   - The system tracks the agent path to prevent infinite loops
   - A maximum delegation depth prevents excessive chaining
   - Agents cannot delegate to agents already in the path

## Key Components

### 1. Agent System (`agents.js`)

- `getRootAgent()`: Returns the starting agent (GPT-4o)
- `prepareDelegationPayload()`: Creates the prompt for delegation decisions
- `extractDelegationDecision()`: Parses agent decisions
- `prepareAnswerPayload()`: Creates the prompt for the final answer
- `performAgentSearch()`: The main function orchestrating the process

### 2. UI Visualization

- **Agent Path Display**: Shows the sequence of agents consulted
- **Decision Reasoning**: Displays why agents chose to handle or delegate
- **Tree Visualization**: Visual representation of the decision path

## Data Structure

The result returned from `performAgentSearch()` includes:

```javascript
{
  content: string,            // The answer content
  citations: array,           // Web citations (if applicable)
  agent: string,              // The final agent that answered
  agentPath: array,           // The complete path of agents consulted
  delegationDecisions: array  // Details of each agent's decision
}
```

Each delegation decision includes:
```javascript
{
  agent: string,              // The agent making the decision
  decision: string,           // "HANDLE" or "DELEGATE"
  delegateTo: string,         // Which agent to delegate to
  reason: string              // Explanation for the decision
}
```

## Benefits of the Decision Tree Approach

1. **More Intelligent Routing**: Each agent makes decisions based on its specialized knowledge
2. **Transparent Process**: The full delegation path and reasoning are visible
3. **Flexible Architecture**: Easy to add new specialized agents to the system
4. **Self-Improving**: As models improve, their delegation decisions naturally improve

## Implementation Notes

1. **System Prompts**: Each agent receives a specialized system prompt for:
   - Making delegation decisions
   - Answering queries when selected

2. **Response Extraction**: The system uses regex to extract structured decisions from agent responses

3. **Visualization**: The UI displays the decision tree with color coding:
   - Root agent (blue)
   - Delegation steps (yellow)
   - Final handling agent (green)

## Future Enhancements

1. **Custom Delegation Criteria**: Allow users to adjust when agents delegate
2. **Interactive Tree**: Let users click on different points in the tree to see alternate paths
3. **Specialized Domain Agents**: Add more agents focused on specific knowledge domains
4. **Decision Confidence**: Have agents express confidence level in their decisions 