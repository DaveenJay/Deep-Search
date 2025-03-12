# Agent Selection System

The Deep Search application uses a sophisticated decision tree approach where agents actively evaluate queries and decide whether to handle them or delegate to other specialized agents.

## Available Agents

### 1. Web Search Agent
- **Model**: gpt-4o-search-preview
- **Use Case**: Queries requiring up-to-date information from the web
- **Features**: Includes web search capabilities with citation support
- **Priority**: 1 (highest)

### 2. GPT-4o Agent
- **Model**: gpt-4o
- **Use Case**: Complex queries requiring sophisticated reasoning
- **Features**: Advanced reasoning capabilities without web search
- **Priority**: 2

### 3. GPT-4o Mini Agent
- **Model**: gpt-4o-mini
- **Use Case**: Simpler queries where speed is more important than depth
- **Features**: Faster response times, more economical
- **Priority**: 3

## Decision Tree Process

The agent system functions as a true decision tree where agents evaluate queries and make delegation decisions:

1. **Root Agent Evaluation**:
   - The process starts with the root agent (GPT-4o)
   - The agent analyzes the query and decides whether to:
     - Handle the query itself
     - Delegate to a more specialized agent

2. **Delegation Decision**:
   - If the agent decides to delegate, it specifies which agent should handle the query
   - The decision includes a reason for delegation
   - The query is passed to the next agent in the decision tree

3. **Cascading Evaluation**:
   - Each agent in the path makes its own evaluation and decision
   - This creates a chain of delegation decisions until an agent decides to handle the query
   - The system prevents infinite loops by tracking the agent path

4. **Final Answer**:
   - The last agent in the chain provides the final answer
   - The response includes details about the full delegation path

This approach creates a collaborative system where each agent can focus on its strengths and delegate when another agent would be more effective.

## Agent Decision Format

When an agent evaluates a query, it responds in a structured format:

```
DECISION: [HANDLE/DELEGATE]
DELEGATE_TO: [Agent Name or NONE if handling]
REASON: [Brief explanation of the decision]
```

For example:
```
DECISION: DELEGATE
DELEGATE_TO: Web Search Agent
REASON: This query asks about current events which requires web search capabilities.
```

## Agent Delegation Criteria

Each agent uses these criteria to make delegation decisions:

- **GPT-4o Agent** (Root):
  - Delegates to Web Search Agent for queries requiring current information
  - Delegates to GPT-4o Mini for simple factual questions
  - Handles complex reasoning tasks itself

- **Web Search Agent**:
  - Usually handles queries delegated to it (specialized for web search)
  - May delegate complex interpretations back to GPT-4o

- **GPT-4o Mini Agent**:
  - Handles simple factual or straightforward queries
  - Delegates complex queries to GPT-4o
  - Delegates current information queries to Web Search Agent

## Implementation

The agent selection system is implemented in `agents.js` and consists of these main functions:

1. `getRootAgent()`: Determines the starting point of the decision tree
2. `prepareDelegationPayload(query, currentAgent, agentPath)`: Creates the payload for delegation decisions
3. `extractDelegationDecision(content)`: Parses the agent's delegation decision
4. `prepareAnswerPayload(query, selectedAgent, agentPath)`: Creates the payload for the final answer
5. `performAgentSearch(query, apiKey)`: Coordinates the entire decision tree process

## Response Format

When the system returns a result, it includes:

- `content`: The actual answer content
- `citations`: Any web sources cited (for web search results)
- `agent`: Which agent provided the final answer
- `agentPath`: The full path of agents that evaluated the query
- `delegationDecisions`: Details about each agent's evaluation and decision

## Benefits of the Decision Tree Approach

This approach offers several advantages:

1. **Specialized handling**: Each agent can focus on what it does best
2. **Transparent reasoning**: Each step in the decision tree is documented with reasons
3. **Flexible routing**: Queries naturally flow to the most appropriate agent
4. **Contextual awareness**: Each agent knows the path that led to it being consulted

## Extending the System

To add new agents to this decision tree:

1. Add a new agent configuration to the `agents` object
2. The existing agents will automatically consider the new agent in their delegation decisions
3. New agents will be able to participate in the delegation process 