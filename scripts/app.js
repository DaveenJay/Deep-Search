// Main App Script
import { Header } from '../components/header.js';
import { Search } from '../components/search.js';
import { Results } from '../components/results.js';
import { ApiKeyModal } from '../components/apiKeyModal.js';
import { AgentProcessModal } from '../components/agentProcessModal.js';

// Main App class
class App {
    constructor() {
        // Use existing container or create one if it doesn't exist
        this.container = document.getElementById('app-container');
        if (!this.container) {
            console.warn('App container not found, creating one');
            this.container = document.createElement('div');
            this.container.id = 'app-container';
            this.container.className = 'container';
            document.body.appendChild(this.container);
        }
        
        this.header = null;
        this.search = null;
        this.results = null;
        this.apiKeyModal = null;
        this.agentProcessModal = null;
        this.lastSearchQuery = '';
    }
    
    // Initialize the app
    async init() {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', () => {
                    this._initComponents();
                    resolve();
                });
            });
        } else {
            this._initComponents();
            return Promise.resolve();
        }
    }
    
    // Initialize all components
    _initComponents() {
        // Render header
        this.header = new Header(this.container);
        this.header.render();
        
        // Render search
        this.search = new Search(this.container, (query) => this.handleSearch(query));
        this.search.render();
        
        // Render results container
        this.results = new Results(this.container);
        this.results.render();
        
        // Initialize connectors event handlers
        this.results.initConnectorHandlers();
        
        // Render API key modal
        this.apiKeyModal = new ApiKeyModal(this.container, (apiKey, lastQuery) => {
            // Update components that depend on API key
            this.header.updateApiKeyVisibility();
            this.search.updateDisabledState();
            
            // Resume search if there was one pending
            if (apiKey && lastQuery) {
                this.handleSearch(lastQuery);
            }
        });
        this.apiKeyModal.render();
        
        // Render agent process modal
        this.agentProcessModal = new AgentProcessModal(this.container);
        this.agentProcessModal.render();
        
        // Check if API key exists
        this.updateApiKeyState();
        
        // Show API key popup on first visit if no key exists
        this._checkFirstVisit();
    }
    
    // Update components based on API key state
    updateApiKeyState() {
        const hasApiKey = !!localStorage.getItem('openai_api_key');
        this.header.updateApiKeyVisibility();
        this.search.updateDisabledState();
    }
    
    // Check if this is the first visit and show API key popup if needed
    _checkFirstVisit() {
        if (!localStorage.getItem('openai_api_key') && !sessionStorage.getItem('apiKeyPopupShown')) {
            // Set a session flag to not show this again in the same session
            sessionStorage.setItem('apiKeyPopupShown', 'true');
            
            // Wait a bit to let the page load smoothly, then show the popup
            setTimeout(() => {
                this.apiKeyModal.show();
            }, 1000);
        }
    }
    
    // Handle search
    async handleSearch(query) {
        if (!query) return;
        
        this.lastSearchQuery = query;
        
        // Check for API key
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            this.apiKeyModal.setLastSearchQuery(query);
            this.apiKeyModal.show();
            return;
        }
        
        // Add to search history
        const searchItem = this.results.addToSearchHistory(query);
        
        // Show loading indicator (different for first search vs subsequent searches)
        const isFirstSearch = !this.results.resultsContainer.classList.contains('show');
        if (isFirstSearch) {
            this.header.setLoadingState(true);
        }
        this.results.showLoading(isFirstSearch);
        
        try {
            // Use agent search if available
            if (window.performAgentSearch) {
                const result = await window.performAgentSearch(query, apiKey);
                this._handleSearchSuccess(result, query, searchItem);
            } else {
                // Fallback to basic search
                await this._fallbackSearch(query, apiKey, searchItem);
            }
        } catch (error) {
            this._handleSearchError(error, query, searchItem);
        } finally {
            // Hide loading indicators
            this.results.hideLoading();
            this.header.setLoadingState(false);
            
            // Check if results are showing
            if (this.results.resultsContainer.classList.contains('show')) {
                this.header.setResultsState(true);
            }
        }
    }
    
    // Handle successful search
    _handleSearchSuccess(result, query, searchItem) {
        // Show the results container
        this.results.show();
        
        // Add the result
        this.results.addResult(result, query, searchItem);
        
        // Now we have results
        this.header.setResultsState(true);
    }
    
    // Handle search error
    _handleSearchError(error, query, searchItem) {
        console.error('Search error:', error);
        
        // Add error result
        this.results.addErrorResult(error, query || this.lastSearchQuery);
        
        // Show the results container (if not already shown)
        this.results.show();
        
        // Now we have results (even if it's an error)
        this.header.setResultsState(true);
        
        // If the error is related to API key, show the API key form
        if (error.message === 'API_KEY_REQUIRED' || error.message.includes('API key')) {
            this.apiKeyModal.setLastSearchQuery(query || this.lastSearchQuery);
            this.apiKeyModal.show();
        }
    }
    
    // Fallback search method if agents.js is not loaded
    async _fallbackSearch(query, apiKey, searchItem) {
        const payload = {
            model: "gpt-4o-search-preview",
            web_search_options: {
                search_context_size: "medium"
            },
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that provides accurate information. Format your responses in Markdown to enhance readability. Use headings, lists, and emphasis where appropriate to organize information clearly."
                },
                {
                    role: "user",
                    content: query
                }
            ]
        };
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const result = data.choices[0];
        const content = result.message.content;
        const annotations = result.message.annotations || [];
        
        // Extract citations
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
        
        const formattedResult = {
            content: content,
            citations: citations,
            rawResponse: data,
            agent: "Fallback Agent (gpt-4o-search-preview)"
        };
        
        this._handleSearchSuccess(formattedResult, query, searchItem);
    }
}

// Initialize the app
const app = new App();
app.init().then(() => {
    console.log('Deep Search app initialized');
});

// Export the app instance
export default app; 