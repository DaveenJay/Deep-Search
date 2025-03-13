/**
 * agents.js - Decision tree agent system for Deep Search
 * 
 * This file implements a decision tree of agents where each agent can evaluate
 * whether to handle a query or delegate to another agent in the tree.
 * It also supports agents consulting with each other to collaborate on complex queries.
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

// Store for agent communication history
const agentConversations = {};

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
 * Creates a unique conversation ID for tracking agent communications
 * @param {Array} agents - List of agent names involved in the conversation
 * @returns {string} A unique conversation ID
 */
function createConversationId(agentNames) {
    return `conv_${agentNames.sort().join('_')}_${Date.now()}`;
}

/**
 * Prepares a payload for delegation decision (whether an agent should handle, delegate, or consult)
 * @param {string} query - The user's search query
 * @param {object} currentAgent - The current agent making the decision
 * @param {Array} agentPath - The path of agents already consulted
 * @param {object} conversations - Previous conversations between agents
 * @returns {object} The prepared delegation decision payload
 */
function prepareDelegationPayload(query, currentAgent, agentPath, conversations = {}) {
    // Build a string of the agent path for context
    const pathDescription = agentPath.length > 0 
        ? `You have received this query after it was evaluated by: ${agentPath.join(' → ')}.` 
        : 'You are the first agent to evaluate this query.';
    
    // Get available agents to delegate to or consult with (excluding current agent)
    const availableAgents = Object.values(agents)
        .filter(agent => agent.name !== currentAgent.name)
        .map(agent => `${agent.name} (${agent.model}): ${agent.description}`);
    
    // If there are no available agents
    const agentOptions = availableAgents.length > 0 
        ? `You can delegate to or consult with these agents:\n${availableAgents.join('\n')}` 
        : 'There are no other agents available. You must handle this query yourself.';
    
    // Add any previous conversations for context
    let conversationContext = '';
    if (Object.keys(conversations).length > 0) {
        conversationContext = '\n\nPrevious agent conversations related to this query:\n';
        
        for (const [convId, conversation] of Object.entries(conversations)) {
            conversationContext += `\nConversation between ${conversation.participants.join(' and ')}:\n`;
            for (const message of conversation.messages) {
                conversationContext += `${message.agent}: ${message.content}\n`;
            }
        }
    }
    
    const payload = {
        model: currentAgent.model,
        messages: [
            {
                role: "system",
                content: `You are the ${currentAgent.name} (${currentAgent.model}). ${currentAgent.description}

${pathDescription}${conversationContext}

You need to decide whether to handle a user query yourself, delegate it to another agent, or consult with another agent for additional input.

${agentOptions}

Follow these steps:
1. Analyze the query carefully
2. Decide if you should:
   - HANDLE the query yourself if it aligns with your capabilities
   - DELEGATE the query if another agent is clearly better suited
   - CONSULT with another agent if you need their input but still want to be involved

3. Respond in EXACTLY one of these formats:

If handling yourself:
DECISION: HANDLE
DELEGATE_TO: NONE
REASON: [Brief explanation of your decision]

If delegating to another agent:
DECISION: DELEGATE
DELEGATE_TO: [Agent Name]
REASON: [Brief explanation of your decision]

If consulting with another agent:
DECISION: CONSULT
CONSULT_WITH: [Agent Name]
QUESTION: [Specific question or information you need from them]
REASON: [Brief explanation of why you need their input]

Example consultations:
DECISION: CONSULT
CONSULT_WITH: Web Search Agent
QUESTION: What are the latest research findings on quantum computing breakthroughs in 2024?
REASON: I need up-to-date information that only the Web Search Agent can provide.

Choose the option that will provide the best answer for the user.`
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
 * Prepares a consultation payload for agents to communicate with each other
 * @param {string} query - The original user query
 * @param {object} consultingAgent - The agent asking for consultation
 * @param {object} consultedAgent - The agent being consulted
 * @param {string} consultationQuestion - The specific question being asked
 * @param {string} conversationId - The ID of the conversation
 * @returns {object} The prepared consultation payload
 */
function prepareConsultationPayload(query, consultingAgent, consultedAgent, consultationQuestion, conversationId) {
    // Get any previous messages in this conversation
    const conversation = agentConversations[conversationId] || {
        participants: [consultingAgent.name, consultedAgent.name],
        messages: []
    };
    
    // Build the message history
    const messageHistory = conversation.messages.map(msg => {
        return {
            role: "assistant",
            content: `[${msg.agent}]: ${msg.content}`
        };
    });
    
    const payload = {
        model: consultedAgent.model,
        messages: [
            {
                role: "system",
                content: `You are the ${consultedAgent.name} (${consultedAgent.model}). ${consultedAgent.description}

You are being consulted by ${consultingAgent.name} regarding a user query. Your task is to provide information or analysis specifically on what the consulting agent is asking you.

Original user query: "${query}"

Respond directly to the question from the consulting agent. Be concise but thorough.`
            },
            ...messageHistory,
            {
                role: "user",
                content: `[${consultingAgent.name}]: ${consultationQuestion}`
            }
        ]
    };
    
    // Add web search options if the agent supports it
    if (consultedAgent.webSearch) {
        payload.web_search_options = consultedAgent.config.web_search_options;
    }
    
    return payload;
}

/**
 * Prepares a request payload for the selected agent to answer the query
 * @param {string} query - The user's search query
 * @param {object} selectedAgent - The agent to use for this query
 * @param {Array} agentPath - The path of agents that led to this agent
 * @param {object} conversations - Conversations between agents about this query
 * @returns {object} The prepared payload for the API request
 */
function prepareAnswerPayload(query, selectedAgent, agentPath, conversations = {}) {
    // Build a description of the agent path
    const pathDescription = agentPath.length > 0 
        ? `You were selected to answer this query after it was evaluated by: ${agentPath.join(' → ')}.` 
        : 'You were selected as the first and most appropriate agent to answer this query.';
    
    // Add consultation context if available
    let consultationContext = '';
    if (Object.keys(conversations).length > 0) {
        consultationContext = '\n\nYou have the following context from consultations with other agents:\n';
        
        for (const [convId, conversation] of Object.entries(conversations)) {
            consultationContext += `\nConsultation with ${conversation.participants.filter(p => p !== selectedAgent.name).join(' and ')}:\n`;
            for (const message of conversation.messages) {
                consultationContext += `${message.agent}: ${message.content}\n`;
            }
        }
    }
    
    // Base payload structure
    const payload = {
        model: selectedAgent.model,
        messages: [
            {
                role: "system",
                content: `You are the ${selectedAgent.name} (${selectedAgent.model}). ${selectedAgent.description}

${pathDescription}${consultationContext}

Provide a helpful, accurate, and informative response to the user's query. Format your response in Markdown to enhance readability. Use headings, lists, and emphasis where appropriate to organize information clearly.`
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
 * @returns {object} Object with decision type and related properties
 */
function extractDelegationDecision(content) {
    if (!content) {
        return { decision: 'HANDLE', delegateTo: 'NONE', reason: 'No response content' };
    }
    
    // Extract decision using regex
    const decisionMatch = content.match(/DECISION:\s*(HANDLE|DELEGATE|CONSULT)/i);
    const decision = decisionMatch ? decisionMatch[1].toUpperCase() : 'HANDLE';
    
    if (decision === 'CONSULT') {
        // Extract consultation target
        const consultMatch = content.match(/CONSULT_WITH:\s*(.*?)(?=$|\n)/im);
        const consultWith = consultMatch ? consultMatch[1].trim() : 'NONE';
        
        // Extract specific question
        const questionMatch = content.match(/QUESTION:\s*(.*?)(?=REASON:|\n\n|$)/ims);
        const question = questionMatch ? questionMatch[1].trim() : '';
        
        // Extract reason
        const reasonMatch = content.match(/REASON:\s*(.*?)(?=$|\n\n)/ims);
        const reason = reasonMatch ? reasonMatch[1].trim() : 'No reason provided';
        
        return { 
            decision, 
            consultWith, 
            question, 
            reason 
        };
    } else {
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
}

/**
 * Performs a search using a decision tree of agents with consultation capabilities
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
    // Track agent conversations
    const conversations = {};
    
    try {
        // Start with the root agent
        let currentAgent = getRootAgent();
        let maxDelegations = 3; // Prevent infinite delegation loops
        let maxConsultations = 3; // Prevent infinite consultation loops
        
        // Loop through the decision tree until an agent handles the query or we hit max delegations
        while (maxDelegations > 0) {
            console.log(`Agent ${currentAgent.name} is evaluating the query`);
            
            // Add the current agent to the path
            agentPath.push(currentAgent.name);
            
            // Prepare delegation decision payload
            const delegationPayload = prepareDelegationPayload(query, currentAgent, agentPath.slice(0, -1), conversations);
            
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
                delegateTo: decision.delegateTo || decision.consultWith || 'NONE',
                reason: decision.reason,
                question: decision.question || null
            });
            
            // If the agent decides to CONSULT with another agent
            if (decision.decision === 'CONSULT' && decision.consultWith !== 'NONE' && maxConsultations > 0) {
                const consultedAgent = getAgentByName(decision.consultWith);
                
                // If the consulted agent exists and isn't the current agent
                if (consultedAgent && consultedAgent.name !== currentAgent.name) {
                    console.log(`Agent ${currentAgent.name} is consulting with ${consultedAgent.name}`);
                    
                    // Create a conversation ID for this consultation
                    const conversationId = createConversationId([currentAgent.name, consultedAgent.name]);
                    
                    // Initialize the conversation if it doesn't exist
                    if (!agentConversations[conversationId]) {
                        agentConversations[conversationId] = {
                            participants: [currentAgent.name, consultedAgent.name],
                            messages: []
                        };
                    }
                    
                    // Add the question to the conversation
                    agentConversations[conversationId].messages.push({
                        agent: currentAgent.name,
                        content: decision.question
                    });
                    
                    // Prepare consultation payload
                    const consultationPayload = prepareConsultationPayload(
                        query, 
                        currentAgent, 
                        consultedAgent, 
                        decision.question,
                        conversationId
                    );
                    
                    // Make the consultation request
                    const consultationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(consultationPayload)
                    });
                    
                    if (!consultationResponse.ok) {
                        console.error(`Consultation with ${consultedAgent.name} failed. Continuing without consultation.`);
                    } else {
                        const consultationData = await consultationResponse.json();
                        const consultationAnswer = consultationData.choices[0].message.content;
                        
                        // Add the answer to the conversation
                        agentConversations[conversationId].messages.push({
                            agent: consultedAgent.name,
                            content: consultationAnswer
                        });
                        
                        // Store this conversation for the final answer
                        conversations[conversationId] = agentConversations[conversationId];
                        
                        console.log(`Consultation with ${consultedAgent.name} completed`);
                    }
                    
                    maxConsultations--;
                    
                    // Continue with the same agent after consultation
                    continue;
                }
            }
            
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
        const answerPayload = prepareAnswerPayload(query, currentAgent, agentPath.slice(0, -1), conversations);
        
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
            delegationDecisions: delegationDecisions,
            consultations: Object.values(conversations)
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