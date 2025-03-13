// Header Component
export class Header {
    constructor(container) {
        this.container = container;
        this.apiKeyButton = null;
        this.settingsIcon = null;
        this.topContent = null;
        this.logo = null;
        this.title = null;
    }

    // Render the header component
    render() {
        // Create the top content container
        this.topContent = document.createElement('div');
        this.topContent.className = 'top-content';
        this.topContent.id = 'top-content';

        // Create the settings icon
        this.settingsIcon = document.createElement('div');
        this.settingsIcon.className = 'settings-icon';
        this.settingsIcon.id = 'show-settings';
        this.settingsIcon.textContent = '⚙️';
        
        // Create the logo
        this.logo = document.createElement('div');
        this.logo.className = 'logo';
        this.logo.textContent = '🔍';
        
        // Create the title
        this.title = document.createElement('h1');
        this.title.className = 'search-title';
        this.title.textContent = 'Deep Search';
        
        // Create the API key link
        this.apiKeyButton = document.createElement('div');
        this.apiKeyButton.className = 'api-key-link';
        this.apiKeyButton.id = 'show-api-key-form';
        this.apiKeyButton.textContent = '🔑 Set up OpenAI API';
        
        // Append elements to the top content
        this.topContent.appendChild(this.logo);
        this.topContent.appendChild(this.title);
        this.topContent.appendChild(this.apiKeyButton);
        
        // Append settings icon and top content to the container
        this.container.appendChild(this.settingsIcon);
        this.container.appendChild(this.topContent);
        
        // Initialize event listeners
        this._initEventListeners();
        
        return this;
    }
    
    // Handle showing/hiding the logo and title when search results are displayed
    setLoadingState(isLoading) {
        if (isLoading) {
            this.topContent.classList.add('loading-shown');
        } else {
            this.topContent.classList.remove('loading-shown');
        }
    }
    
    setResultsState(hasResults) {
        if (hasResults) {
            this.topContent.classList.add('results-shown');
        } else {
            this.topContent.classList.remove('results-shown');
        }
    }
    
    // Initialize event listeners for the header
    _initEventListeners() {
        // Click event for the API key button
        if (this.apiKeyButton) {
            this.apiKeyButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showApiKeyPopup) {
                    window.showApiKeyPopup();
                }
            });
        }
        
        // Click event for the settings icon
        if (this.settingsIcon) {
            this.settingsIcon.addEventListener('click', () => {
                if (window.showApiKeyPopup) {
                    window.showApiKeyPopup();
                }
            });
        }
    }
    
    // Update visibility of API key button based on whether an API key exists
    updateApiKeyVisibility() {
        const hasApiKey = !!localStorage.getItem('openai_api_key');
        if (hasApiKey) {
            this.apiKeyButton.style.display = 'none';
        } else {
            this.apiKeyButton.style.display = 'block';
        }
    }
} 