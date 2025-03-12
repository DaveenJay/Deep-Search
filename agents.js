/**
 * agents.js - Decision tree agent system for Deep Search
 * 
 * This file implements a decision tree of agents where each agent can evaluate
 * whether to handle a query or delegate to another agent in the tree.
 */

// Define our available agents
const agents = {
    webSearch: {
        name: "Web Search Agent",
        model: "gpt-4o-search-preview",
        description: "Uses GPT-4o with web search capabilities for queries requiring up-to-date information",
        webSearch: true,
        priority: 1,
        config: {
            web_search_options: {
                search_context_size: "medium"
            }
        }
    },
    gpt4o: {
        name: "GPT-4o Agent",
        model: "gpt-4o",
        description: "Uses GPT-4o for complex reasoning and detailed responses without web search",
        webSearch: false,
        priority: 2,
        config: {}
    },
    gpt4oMini: {
        name: "GPT-4o Mini Agent",
        model: "gpt-4o-mini",
        description: "Uses GPT-4o Mini for simpler queries requiring less reasoning but faster response",
        webSearch: false,
        priority: 3,
        config: {}
    }
};

/**
 * Gets an agent by its name
 * @param {string} agentName - The name of the agent to get
 * @returns {object} The agent object or null if not found
 */
function getAgentByName(agentName) {
    return Object.values(agents).find(agent => agent.name === agentName) || null;
}

/**
 * Determines the root agent of the decision tree
 * @returns {object} The root agent configuration
 */
function getRootAgent() {
    // We start with GPT-4o as the root of our decision tree
    return agents.gpt4o;
}

/**
 * Prepares a payload for delegation decision (whether an agent should handle or delegate)
 * @param {string} query - The user's search query
 * @param {object} currentAgent - The current agent making the decision
 * @param {Array} agentPath - The path of agents already consulted
 * @returns {object} The prepared delegation decision payload
 */
function prepareDelegationPayload(query, currentAgent, agentPath) {
    // Build a string of the agent path for context
    const pathDescription = agentPath.length > 0 
        ? `You have received this query after it was evaluated by: ${agentPath.join(' → ')}.` 
        : 'You are the first agent to evaluate this query.';
    
    // Get available agents to delegate to (excluding current and already consulted agents)
    const availableAgents = Object.values(agents)
        .filter(agent => agent.name !== currentAgent.name && !agentPath.includes(agent.name))
        .map(agent => `${agent.name} (${agent.model}): ${agent.description}`);
    
    // If there are no available agents to delegate to
    const delegationOptions = availableAgents.length > 0 
        ? `You can delegate to these agents:\n${availableAgents.join('\n')}` 
        : 'There are no other agents available to delegate to. You must handle this query.';
    
    const payload = {
        model: currentAgent.model,
        messages: [
            {
                role: "system",
                content: `You are the ${currentAgent.name} (${currentAgent.model}). ${currentAgent.description}

${pathDescription}

You need to decide whether to handle a user query yourself or delegate it to another agent.

${delegationOptions}

Follow these steps:
1. Briefly analyze the query
2. Decide if you are the most appropriate agent to answer it
3. Respond in EXACTLY this format:

DECISION: [HANDLE/DELEGATE]
DELEGATE_TO: [Agent Name or NONE if handling yourself]
REASON: [Brief explanation of your decision]

Example if handling yourself:
DECISION: HANDLE
DELEGATE_TO: NONE
REASON: This query requires complex reasoning which I am well-suited for.

Example if delegating:
DECISION: DELEGATE
DELEGATE_TO: Web Search Agent
REASON: This query requires current information that I don't have access to.`
            },
            {
                role: "user",
                content: query
            }
        ]
    };
    
    // Add web search options if the agent supports it
    if (currentAgent.webSearch) {
        payload.web_search_options = currentAgent.config.web_search_options;
    }
    
    return payload;
}

/**
 * Prepares a request payload for the selected agent to answer the query
 * @param {string} query - The user's search query
 * @param {object} selectedAgent - The agent to use for this query
 * @param {Array} agentPath - The path of agents that led to this agent
 * @returns {object} The prepared payload for the API request
 */
function prepareAnswerPayload(query, selectedAgent, agentPath) {
    // Build a description of the agent path
    const pathDescription = agentPath.length > 0 
        ? `You were selected to answer this query after it was evaluated by: ${agentPath.join(' → ')}.` 
        : 'You were selected as the first and most appropriate agent to answer this query.';
    
    // Base payload structure
    const payload = {
        model: selectedAgent.model,
        messages: [
            {
                role: "system",
                content: `You are the ${selectedAgent.name} (${selectedAgent.model}). ${selectedAgent.description}

${pathDescription}

Provide a helpful, accurate, and informative response to the user's query. Format your response in Markdown to enhance readability. Use headings, lists, and emphasis where appropriate to organize information clearly.

IMPORTANT - STRUCTURED DATA VISUALIZATION:
For queries that involve data that can be better visualized (like comparisons, statistics, timelines, ratings, pros/cons, etc.), include a JSON block in your response with the structured data.

Use the following format to include structured data:
\`\`\`json-visualization
{
  "visualization_type": "[table|chart|timeline|comparison|rating|pros-cons|stat-cards|icon-list]",
  "title": "Title for this visualization",
  "description": "Optional description of this visualization",
  "data": [
    // Array of structured data objects appropriate for the chosen visualization type
  ]
}
\`\`\`

Different visualization_type options:
1. "table" - For tabular data with columns and rows
2. "chart" - For numerical data that can be visualized as a chart (specify "chart_type": "bar|line|pie")
3. "timeline" - For chronological events
4. "comparison" - For comparing multiple items on various attributes
5. "rating" - For showing ratings/scores
6. "pros-cons" - For listing advantages and disadvantages
7. "stat-cards" - For key metrics or statistics with icons
8. "icon-list" - For lists where each item would benefit from an icon

Your JSON data structure should match the requirements of the chosen visualization type. You can include multiple visualizations in one response.

Remember to provide your full text response as well - the JSON is a supplement, not a replacement for the main content.`
            },
            {
                role: "user",
                content: query
            }
        ]
    };
    
    // Add web search options if the agent supports it
    if (selectedAgent.webSearch) {
        payload.web_search_options = selectedAgent.config.web_search_options;
    }
    
    return payload;
}

/**
 * Extracts delegation decision from an agent's response
 * @param {string} content - The content from the delegation decision response
 * @returns {object} Object with decision, delegateTo, and reason properties
 */
function extractDelegationDecision(content) {
    if (!content) {
        return { decision: 'HANDLE', delegateTo: 'NONE', reason: 'No response content' };
    }
    
    // Extract decision using regex
    const decisionMatch = content.match(/DECISION:\s*(HANDLE|DELEGATE)/i);
    const decision = decisionMatch ? decisionMatch[1].toUpperCase() : 'HANDLE';
    
    // Extract delegation target
    const delegateMatch = content.match(/DELEGATE_TO:\s*(.*?)(?=$|\n)/im);
    let delegateTo = delegateMatch ? delegateMatch[1].trim() : 'NONE';
    
    // If the decision is HANDLE, ensure delegateTo is NONE
    if (decision === 'HANDLE') {
        delegateTo = 'NONE';
    }
    
    // Extract reason
    const reasonMatch = content.match(/REASON:\s*(.*?)(?=$|\n|\r)/ims);
    const reason = reasonMatch ? reasonMatch[1].trim() : 'No reason provided';
    
    return { decision, delegateTo, reason };
}

/**
 * Performs a search using a decision tree of agents
 * @param {string} query - The user's search query
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise} A promise that resolves to the search results
 */
async function performAgentSearch(query, apiKey) {
    if (!query.trim()) {
        throw new Error("Empty query");
    }
    
    if (!apiKey) {
        throw new Error("API_KEY_REQUIRED");
    }
    
    // Keep track of the agent decision path
    const agentPath = [];
    // Keep track of delegation decisions for visualization
    const delegationDecisions = [];
    
    try {
        // Start with the root agent
        let currentAgent = getRootAgent();
        let maxDelegations = 3; // Prevent infinite delegation loops
        
        // Loop through the decision tree until an agent handles the query or we hit max delegations
        while (maxDelegations > 0) {
            console.log(`Agent ${currentAgent.name} is evaluating the query`);
            
            // Add the current agent to the path
            agentPath.push(currentAgent.name);
            
            // Prepare delegation decision payload
            const delegationPayload = prepareDelegationPayload(query, currentAgent, agentPath.slice(0, -1));
            
            // Make the delegation decision request
            const delegationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(delegationPayload)
            });
            
            if (!delegationResponse.ok) {
                const errorData = await delegationResponse.json();
                throw new Error(`OpenAI API Error during delegation decision: ${errorData.error?.message || delegationResponse.statusText}`);
            }
            
            const delegationData = await delegationResponse.json();
            const delegationContent = delegationData.choices[0].message.content;
            
            // Extract the delegation decision
            const decision = extractDelegationDecision(delegationContent);
            console.log(`Agent ${currentAgent.name} decision:`, decision);
            
            // Store this decision for visualization
            delegationDecisions.push({
                agent: currentAgent.name,
                decision: decision.decision,
                delegateTo: decision.delegateTo,
                reason: decision.reason
            });
            
            // If the agent decides to handle the query, we're done with delegation
            if (decision.decision === 'HANDLE' || decision.delegateTo === 'NONE') {
                break;
            }
            
            // Otherwise, find the agent to delegate to
            const nextAgent = getAgentByName(decision.delegateTo);
            
            // If we can't find the agent or it's already in our path (loop), stop delegation
            if (!nextAgent || agentPath.includes(nextAgent.name)) {
                console.log(`Cannot delegate to ${decision.delegateTo}. Handling with current agent.`);
                break;
            }
            
            // Update current agent and continue delegation
            currentAgent = nextAgent;
            maxDelegations--;
        }
        
        // Now that we have our final agent, prepare the answer payload
        console.log(`Final agent ${currentAgent.name} will answer the query`);
        const answerPayload = prepareAnswerPayload(query, currentAgent, agentPath.slice(0, -1));
        
        // Make the answer request
        const answerResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(answerPayload)
        });
        
        if (!answerResponse.ok) {
            const errorData = await answerResponse.json();
            throw new Error(`OpenAI API Error during answer: ${errorData.error?.message || answerResponse.statusText}`);
        }
        
        const answerData = await answerResponse.json();
        
        // Process the response
        const result = answerData.choices[0];
        const content = result.message.content;
        const annotations = result.message.annotations || [];
        
        // Extract citations from annotations (for web search results)
        const citations = annotations
            .filter(annotation => annotation.type === "url_citation")
            .map(annotation => {
                const citation = annotation.url_citation;
                return {
                    url: citation.url,
                    title: citation.title,
                    startIndex: citation.start_index,
                    endIndex: citation.end_index
                };
            });
        
        // Create the result object
        return {
            content: content,
            citations: citations,
            rawResponse: answerData,
            agent: currentAgent.name,
            agentPath: agentPath,
            delegationDecisions: delegationDecisions
        };
        
    } catch (error) {
        console.error(`Error in agent search:`, error);
        throw error;
    }
}

/**
 * Legacy function kept for backward compatibility
 * @param {string} query - The user's search query
 * @returns {object} The selected agent configuration
 */
function selectAgent(query) {
    // This is kept for backward compatibility but will use the root agent approach now
    return getRootAgent();
}

// Export the functions for use in other files
export { selectAgent, performAgentSearch, agents }; 