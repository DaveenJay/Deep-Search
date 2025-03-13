// Search Component
export class Search {
    constructor(container, onSearch) {
        this.container = container;
        this.onSearch = onSearch || (() => {});
        this.searchInput = null;
    }

    render() {
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        // Create search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.id = 'search-input';
        this.searchInput.className = 'search-input';
        this.searchInput.placeholder = 'Ask anything...';
        
        // Add the search input to the container
        searchContainer.appendChild(this.searchInput);
        this.container.appendChild(searchContainer);
        
        // Initialize event listeners
        this._initEventListeners();
        
        // Update disabled state based on API key
        this.updateDisabledState();
        
        return this;
    }
    
    // Get the current search query
    getQuery() {
        return this.searchInput.value.trim();
    }
    
    // Clear the search input
    clear() {
        this.searchInput.value = '';
        this.searchInput.classList.remove('has-content');
    }
    
    // Show a visual feedback when search is triggered
    showSearchAnimation() {
        this.searchInput.classList.add('search-triggered');
        setTimeout(() => this.searchInput.classList.remove('search-triggered'), 800);
    }
    
    // Update disabled state based on whether an API key exists
    updateDisabledState() {
        const hasApiKey = !!localStorage.getItem('openai_api_key');
        if (!hasApiKey) {
            this.searchInput.disabled = true;
            this.searchInput.placeholder = "API key required to search";
        } else {
            this.searchInput.disabled = false;
            this.searchInput.placeholder = "Ask anything...";
        }
    }
    
    // Initialize event listeners
    _initEventListeners() {
        // Track input for styling
        this.searchInput.addEventListener('input', () => {
            this.searchInput.classList[this.searchInput.value ? 'add' : 'remove']('has-content');
        });
        
        // Handle Enter key to trigger search
        this.searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.triggerSearch();
            }
        });
    }
    
    // Trigger the search
    triggerSearch() {
        const query = this.getQuery();
        if (!query) return;
        
        // Check if API key exists
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            if (window.showApiKeyPopup) {
                window.showApiKeyPopup();
            }
            return;
        }
        
        // Show animation feedback
        this.showSearchAnimation();
        
        // Clear the input after capturing the query
        this.clear();
        
        // Call the onSearch callback with the query
        this.onSearch(query);
    }
} 