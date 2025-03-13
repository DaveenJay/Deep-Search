// Results Component
export class Results {
    constructor(container) {
        this.container = container;
        this.resultsContainer = null;
        this.conversationContainer = null;
        this.inlineLoadingIndicator = null;
        this.loadingIndicator = null;
        this.searchHistory = [];
    }

    render() {
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'results-container';
        this.resultsContainer.id = 'results';
        
        // Create conversation container for results
        this.conversationContainer = document.createElement('div');
        this.conversationContainer.id = 'conversation-container';
        
        // Create inline loading indicator
        this.inlineLoadingIndicator = document.createElement('div');
        this.inlineLoadingIndicator.id = 'loading-indicator-inline';
        this.inlineLoadingIndicator.className = 'loading-indicator-inline';
        const inlineSpinner = document.createElement('div');
        inlineSpinner.className = 'spinner';
        this.inlineLoadingIndicator.appendChild(inlineSpinner);
        
        // Create global loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'loading-indicator';
        this.loadingIndicator.id = 'loading';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        this.loadingIndicator.appendChild(spinner);
        
        // Append elements to containers
        this.resultsContainer.appendChild(this.conversationContainer);
        this.resultsContainer.appendChild(this.inlineLoadingIndicator);
        this.container.appendChild(this.resultsContainer);
        this.container.appendChild(this.loadingIndicator);
        
        return this;
    }
    
    // Add a search query to history
    addToSearchHistory(query) {
        const searchItem = {
            id: 'search-' + Date.now(),
            query: query,
            timestamp: new Date().toISOString(),
            referencesIds: []
        };
        
        // Check for references to previous searches
        if (this.searchHistory.length > 0) {
            // Simple heuristic: check if query mentions keywords from previous searches
            this.searchHistory.forEach(prevSearch => {
                const keywordsFromPrevQuery = prevSearch.query.toLowerCase().split(' ')
                    .filter(word => word.length > 3);
                const currentQueryLower = query.toLowerCase();
                
                // Check if current query contains significant words from previous query
                const hasReference = keywordsFromPrevQuery.some(keyword => 
                    currentQueryLower.includes(keyword)
                );
                
                if (hasReference) {
                    searchItem.referencesIds.push(prevSearch.id);
                }
            });
        }
        
        // Add to search history
        this.searchHistory.push(searchItem);
        
        return searchItem;
    }
    
    // Show loading indicator
    showLoading(isFirstSearch = false) {
        if (isFirstSearch) {
            this.loadingIndicator.classList.add('show');
        } else {
            this.inlineLoadingIndicator.classList.add('show');
            this.inlineLoadingIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Hide loading indicators
    hideLoading() {
        this.loadingIndicator.classList.remove('show');
        this.inlineLoadingIndicator.classList.remove('show');
    }
    
    // Show the results container
    show() {
        this.resultsContainer.classList.add('show');
    }
    
    // Hide the results container
    hide() {
        this.resultsContainer.classList.remove('show');
    }
    
    // Add a search result 
    addResult(result, query, searchItem) {
        // Create a new result item container
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.resultId = searchItem.id || 'result-' + Date.now();
        
        // Create the header with query
        const header = document.createElement('div');
        header.className = 'result-header';
        
        // Create query text with reference indicators if applicable
        let queryHTML = `<div class="result-query">You asked: "${query}"</div>`;
        
        // Add references section if this query references previous searches
        if (searchItem && searchItem.referencesIds && searchItem.referencesIds.length > 0) {
            queryHTML += `<div class="result-references">`;
            queryHTML += `<div class="references-indicator">References previous questions</div>`;
            queryHTML += `<div class="reference-items">`;
            
            searchItem.referencesIds.forEach(refId => {
                const referencedSearch = this.searchHistory.find(item => item.id === refId);
                if (referencedSearch) {
                    queryHTML += `<div class="reference-item" data-ref-id="${refId}">
                        <span class="reference-icon">↩️</span>
                        <span class="reference-text">${referencedSearch.query}</span>
                    </div>`;
                }
            });
            
            queryHTML += `</div></div>`;
        }
        
        header.innerHTML = queryHTML;
        resultItem.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'result-content';
        
        // Convert the content to Markdown
        content.innerHTML = marked.parse(result.content);
        resultItem.appendChild(content);
        
        // Add consultation indicator badge if the result involved consultations
        if (result.consultations && result.consultations.length > 0) {
            const consultationBadge = document.createElement('div');
            consultationBadge.className = 'consultation-badge';
            consultationBadge.innerHTML = `<span class="consultation-icon">🔄</span> Generated with agent collaboration (${result.consultations.length})`;
            content.insertBefore(consultationBadge, content.firstChild);
        }
        
        // Add sources if available
        if (result.citations && result.citations.length > 0) {
            // Create toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-sources';
            toggleBtn.innerHTML = `Show <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">(${result.citations.length})</span><span class="chevron-down">↓</span>`;
            resultItem.appendChild(toggleBtn);
            
            // Create citations container
            const citationsContainer = document.createElement('div');
            citationsContainer.className = 'result-citations';
            citationsContainer.style.display = 'none';
            resultItem.appendChild(citationsContainer);
            
            // Add citation header
            const citationHeader = document.createElement('div');
            citationHeader.className = 'citation-header';
            citationHeader.textContent = 'Sources';
            citationsContainer.appendChild(citationHeader);
            
            // Add each citation
            result.citations.forEach(citation => {
                const citationElement = document.createElement('div');
                citationElement.className = 'citation';
                
                const link = document.createElement('a');
                link.href = citation.url;
                link.target = '_blank';
                link.textContent = citation.title || citation.url;
                
                citationElement.appendChild(link);
                citationsContainer.appendChild(citationElement);
            });
            
            // Add click event to toggle sources visibility
            toggleBtn.onclick = function() {
                const isVisible = citationsContainer.style.display === 'block';
                citationsContainer.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    this.innerHTML = `Hide <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">(${result.citations.length})</span><span class="chevron-down">↓</span>`;
                    this.classList.add('sources-visible');
                } else {
                    this.innerHTML = `Show <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">(${result.citations.length})</span><span class="chevron-down">↓</span>`;
                    this.classList.remove('sources-visible');
                }
            };
        }
        
        // Add agent button for this specific result
        const agentButton = document.createElement('button');
        agentButton.className = 'agent-process-btn';
        agentButton.innerHTML = '🤖 Show how this was answered';
        agentButton.dataset.resultId = resultItem.dataset.resultId;
        resultItem.appendChild(agentButton);
        
        // Add click event for the agent button
        agentButton.addEventListener('click', () => {
            // Show the agent process overlay
            const agentProcessOverlay = document.getElementById('agent-process-overlay');
            if (agentProcessOverlay) {
                this.updateAgentProcessVisualization(result, query);
                agentProcessOverlay.classList.add('show');
            }
        });
        
        // Check if this is the first result or additional result
        const isFirstResult = this.conversationContainer.children.length === 0;
        
        // If the search references previous searches, add visual connection lines
        if (searchItem && searchItem.referencesIds && searchItem.referencesIds.length > 0) {
            // Add a class for styling
            resultItem.classList.add('has-references');
            
            // After we add this result, we'll create visual connectors to referenced results
            setTimeout(() => {
                searchItem.referencesIds.forEach(refId => {
                    const referencedElement = document.querySelector(`[data-result-id="${refId}"]`);
                    if (referencedElement) {
                        this.createReferenceConnector(resultItem, referencedElement);
                    }
                });
            }, 100);
        }
        
        // Get the current scroll position before adding new content
        const scrollPosition = window.scrollY;
        const containerHeight = isFirstResult ? 0 : this.conversationContainer.scrollHeight;
        
        // Append the new result
        this.conversationContainer.appendChild(resultItem);
        
        // Handle scrolling behavior
        if (isFirstResult) {
            // For first result, just scroll to it
            resultItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // For additional results, maintain first result position by adjusting scroll
            const newHeight = this.conversationContainer.scrollHeight;
            const heightDifference = newHeight - containerHeight;
            window.scrollTo({
                top: scrollPosition + heightDifference,
                behavior: 'smooth'
            });
        }
        
        // After the header is added to the DOM, attach click handlers to reference items
        setTimeout(() => {
            const referenceItems = resultItem.querySelectorAll('.reference-item');
            referenceItems.forEach(item => {
                item.addEventListener('click', () => {
                    const refId = item.dataset.refId;
                    if (refId) {
                        // Find the referenced result
                        const referencedElement = document.querySelector(`[data-result-id="${refId}"]`);
                        if (referencedElement) {
                            // Scroll to the referenced element
                            referencedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Highlight the referenced element
                            referencedElement.classList.add('highlight');
                            setTimeout(() => {
                                referencedElement.classList.remove('highlight');
                            }, 1500);
                        }
                    }
                });
            });
        }, 0);
        
        return resultItem;
    }
    
    // Add an error message as a result
    addErrorResult(error, query) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <p><strong>Error:</strong> ${error.message || 'There was an error processing your search.'}</p>
            <p>This may be due to an invalid API key or CORS restrictions.</p>
        `;
        
        // Create a result item to wrap the error
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        // Add a header with the query
        const header = document.createElement('div');
        header.className = 'result-header';
        header.innerHTML = `<div class="result-query">You asked: "${query}"</div>`;
        resultItem.appendChild(header);
        
        // Add content wrapper
        const content = document.createElement('div');
        content.className = 'result-content';
        content.appendChild(errorMessage);
        resultItem.appendChild(content);
        
        // Check if this is the first result
        const isFirstResult = this.conversationContainer.children.length === 0;
        
        if (!isFirstResult) {
            // Get the current scroll position before adding new content
            const scrollPosition = window.scrollY;
            const containerHeight = this.conversationContainer.scrollHeight;
            
            // Add to conversation
            this.conversationContainer.appendChild(resultItem);
            
            // For additional results, maintain first result position by adjusting scroll
            const newHeight = this.conversationContainer.scrollHeight;
            const heightDifference = newHeight - containerHeight;
            window.scrollTo({
                top: scrollPosition + heightDifference,
                behavior: 'smooth'
            });
        } else {
            // For the first error, show in the main content
            this.conversationContainer.innerHTML = '';
            this.conversationContainer.appendChild(resultItem);
            
            // Scroll to the new result
            resultItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        return resultItem;
    }
    
    // Create visual connectors between related search results
    createReferenceConnector(fromElement, toElement) {
        // Calculate positions for the connector
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create a connector element
        const connector = document.createElement('div');
        connector.className = 'result-connector';
        
        // Position the connector
        document.body.appendChild(connector);
        
        // Set styles to position the connector
        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top;
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.bottom;
        
        // Calculate distance and angle
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Apply styles
        connector.style.position = 'absolute';
        connector.style.width = `${distance}px`;
        connector.style.height = '2px';
        connector.style.backgroundColor = '#4285f4';
        connector.style.top = `${startY + window.scrollY}px`;
        connector.style.left = `${startX}px`;
        connector.style.transform = `rotate(${angle}deg)`;
        connector.style.transformOrigin = '0 0';
        connector.style.opacity = '0.6';
        connector.style.zIndex = '5';
        connector.style.pointerEvents = 'none';
    }
    
    // Update agent process visualization
    updateAgentProcessVisualization(result, query) {
        const agentProcessEl = document.getElementById('agentProcessVisualization');
        if (!agentProcessEl) return;
        
        agentProcessEl.innerHTML = '';
        
        // Create query section
        const querySection = document.createElement('div');
        querySection.className = 'agent-query-section';
        querySection.innerHTML = `
            <h4>Query</h4>
            <div class="agent-query-content">${query}</div>
        `;
        agentProcessEl.appendChild(querySection);
        
        // Create summary section with metrics
        const summarySection = document.createElement('div');
        summarySection.className = 'agent-summary-section';
        
        // Calculate metrics
        const totalSteps = result.delegationDecisions ? result.delegationDecisions.length + 1 : 1;
        const totalConsultations = result.consultations ? result.consultations.length : 0;
        const finalAgent = result.finalAgent || result.agent;
        
        // Build agent path
        let agentPath = [];
        if (result.delegationDecisions && result.delegationDecisions.length > 0) {
            agentPath.push(result.delegationDecisions[0].fromAgent);
            result.delegationDecisions.forEach(decision => {
                agentPath.push(decision.toAgent);
            });
        } else {
            agentPath.push(finalAgent);
        }
        
        // Create agent path HTML
        let agentPathHTML = '<div class="agent-path">';
        agentPath.forEach((agent, index) => {
            const isLast = index === agentPath.length - 1;
            agentPathHTML += `
                <span class="agent-path-item ${isLast ? 'final-agent' : ''}">${agent}</span>
            `;
            if (!isLast) {
                agentPathHTML += '<span class="agent-path-arrow">→</span>';
            }
        });
        agentPathHTML += '</div>';
        
        summarySection.innerHTML = `
            <h4>Summary</h4>
            <div class="agent-summary-content">
                <div class="summary-metric">
                    <span class="metric-label">Total Steps</span>
                    <span class="metric-value">${totalSteps}</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">Consultations</span>
                    <span class="metric-value">${totalConsultations}</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">Final Agent</span>
                    <span class="metric-value">${finalAgent}</span>
                </div>
                <div class="summary-metric full-width">
                    <span class="metric-label">Agent Path</span>
                    ${agentPathHTML}
                </div>
            </div>
        `;
        agentProcessEl.appendChild(summarySection);
        
        // Add token usage section if available
        if (result.rawResponse && result.rawResponse.usage) {
            const usage = result.rawResponse.usage;
            const usageSection = document.createElement('div');
            usageSection.className = 'agent-usage-section';
            usageSection.innerHTML = `
                <h4>Token Usage</h4>
                <div class="agent-usage-content">
                    <div class="usage-metric">
                        <span class="metric-label">Prompt Tokens</span>
                        <span class="metric-value">${usage.prompt_tokens}</span>
                    </div>
                    <div class="usage-metric">
                        <span class="metric-label">Completion Tokens</span>
                        <span class="metric-value">${usage.completion_tokens}</span>
                    </div>
                    <div class="usage-metric">
                        <span class="metric-label">Total Tokens</span>
                        <span class="metric-value">${usage.total_tokens}</span>
                    </div>
                </div>
            `;
            agentProcessEl.appendChild(usageSection);
        }
        
        // More agent visualization code would go here...
        // (This is just a simplified version of the visualization to keep this example manageable)
    }
    
    // Initialize resize and scroll event handlers for connectors
    initConnectorHandlers() {
        // Update connectors on window resize
        window.addEventListener('resize', () => {
            // Remove all existing connectors
            document.querySelectorAll('.result-connector').forEach(connector => {
                connector.remove();
            });
            
            // Recreate connectors for all results with references
            const resultsWithReferences = document.querySelectorAll('.has-references');
            resultsWithReferences.forEach(result => {
                const resultId = result.dataset.resultId;
                const searchItem = this.searchHistory.find(item => item.id === resultId);
                
                if (searchItem && searchItem.referencesIds) {
                    searchItem.referencesIds.forEach(refId => {
                        const referencedElement = document.querySelector(`[data-result-id="${refId}"]`);
                        if (referencedElement) {
                            this.createReferenceConnector(result, referencedElement);
                        }
                    });
                }
            });
        });
        
        // Remove connectors on scroll for performance
        window.addEventListener('scroll', () => {
            document.querySelectorAll('.result-connector').forEach(connector => {
                connector.remove();
            });
        });
    }
} 