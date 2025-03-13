// API Key Modal Component
export class ApiKeyModal {
    constructor(container, onApiKeySaved) {
        this.container = container;
        this.onApiKeySaved = onApiKeySaved || (() => {});
        this.overlay = null;
        this.popup = null;
        this.apiKeyInput = null;
        this.toggleVisibilityBtn = null;
        this.submitBtn = null;
        this.deleteBtn = null;
        this.errorMsg = null;
        this.successMsg = null;
        this.deletedMsg = null;
        this.closeBtn = null;
        this.lastSearchQuery = '';
    }

    render() {
        // Create API Key overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'api-key-overlay';
        this.overlay.id = 'api-key-overlay';
        
        // Create API Key popup
        this.popup = document.createElement('div');
        this.popup.className = 'api-key-popup';
        
        // Create close button
        this.closeBtn = document.createElement('div');
        this.closeBtn.className = 'api-key-popup-close';
        this.closeBtn.id = 'close-api-key-popup';
        this.closeBtn.textContent = '×';
        
        // Create popup title
        const title = document.createElement('h3');
        title.textContent = 'Connect to OpenAI';
        
        // Create input group
        const inputGroup = document.createElement('div');
        inputGroup.className = 'api-key-input-group';
        
        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = 'api-key-input';
        inputLabel.textContent = 'Enter your OpenAI API key';
        
        this.apiKeyInput = document.createElement('input');
        this.apiKeyInput.type = 'password';
        this.apiKeyInput.id = 'api-key-input';
        this.apiKeyInput.className = 'api-key-input';
        this.apiKeyInput.placeholder = 'sk-...';
        this.apiKeyInput.autocomplete = 'off';
        this.apiKeyInput.spellcheck = false;
        
        this.toggleVisibilityBtn = document.createElement('button');
        this.toggleVisibilityBtn.id = 'toggle-api-key-visibility';
        this.toggleVisibilityBtn.className = 'toggle-api-key-visibility';
        this.toggleVisibilityBtn.textContent = '👁️';
        
        inputGroup.appendChild(inputLabel);
        inputGroup.appendChild(this.apiKeyInput);
        inputGroup.appendChild(this.toggleVisibilityBtn);
        
        // Create error message
        this.errorMsg = document.createElement('div');
        this.errorMsg.className = 'api-key-error';
        this.errorMsg.id = 'api-key-error';
        this.errorMsg.textContent = 'Please enter a valid API key starting with \'sk-\'';
        
        // Create action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'api-key-actions';
        
        this.submitBtn = document.createElement('button');
        this.submitBtn.id = 'submit-api-key';
        this.submitBtn.className = 'submit-api-key';
        this.submitBtn.textContent = 'Connect';
        
        this.deleteBtn = document.createElement('button');
        this.deleteBtn.id = 'delete-api-key';
        this.deleteBtn.className = 'delete-api-key';
        this.deleteBtn.textContent = 'Remove Key';
        
        actionsDiv.appendChild(this.submitBtn);
        actionsDiv.appendChild(this.deleteBtn);
        
        // Create status messages
        const statusDiv = document.createElement('div');
        statusDiv.className = 'api-key-status';
        
        this.successMsg = document.createElement('div');
        this.successMsg.className = 'api-key-success';
        this.successMsg.id = 'api-key-success';
        this.successMsg.textContent = 'Connected successfully!';
        
        this.deletedMsg = document.createElement('div');
        this.deletedMsg.className = 'api-key-deleted';
        this.deletedMsg.id = 'api-key-deleted';
        this.deletedMsg.textContent = 'API key removed.';
        
        statusDiv.appendChild(this.successMsg);
        statusDiv.appendChild(this.deletedMsg);
        
        // Create info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'api-key-info';
        
        const infoPara1 = document.createElement('p');
        infoPara1.textContent = 'Your key is stored locally in your browser and not sent to any servers.';
        
        const infoPara2 = document.createElement('p');
        const infoLink = document.createElement('a');
        infoLink.href = 'https://platform.openai.com/api-keys';
        infoLink.target = '_blank';
        infoLink.textContent = 'Get an API key →';
        infoPara2.appendChild(infoLink);
        
        infoDiv.appendChild(infoPara1);
        infoDiv.appendChild(infoPara2);
        
        // Assemble the popup
        this.popup.appendChild(this.closeBtn);
        this.popup.appendChild(title);
        this.popup.appendChild(inputGroup);
        this.popup.appendChild(this.errorMsg);
        this.popup.appendChild(actionsDiv);
        this.popup.appendChild(statusDiv);
        this.popup.appendChild(infoDiv);
        
        // Add popup to overlay
        this.overlay.appendChild(this.popup);
        
        // Add overlay to container
        this.container.appendChild(this.overlay);
        
        // Initialize event listeners
        this._initEventListeners();
        
        // Make the show method available globally
        window.showApiKeyPopup = () => this.show();
        
        return this;
    }
    
    // Show the API key popup
    show() {
        this.overlay.classList.add('show');
        
        // If API key exists, show asterisks in the input
        const apiKey = localStorage.getItem('openai_api_key');
        if (apiKey) {
            // Just fill with placeholder asterisks
            this.apiKeyInput.placeholder = "••••••••••••••••••••••";
            this.apiKeyInput.value = "";
        } else {
            this.apiKeyInput.placeholder = "sk-...";
            this.apiKeyInput.value = "";
        }
        
        // Hide any previous success/error messages
        this.successMsg.classList.remove('show');
        this.deletedMsg.classList.remove('show');
        this.errorMsg.classList.remove('show');
        
        // Focus the input
        setTimeout(() => this.apiKeyInput.focus(), 100);
    }
    
    // Hide the API key popup
    hide() {
        this.overlay.classList.remove('show');
    }
    
    // Set the last search query (for resuming search after API key is entered)
    setLastSearchQuery(query) {
        this.lastSearchQuery = query;
    }
    
    // Initialize event listeners
    _initEventListeners() {
        // Hide popup when clicking the close button
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        // Hide popup when clicking outside of it
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
        
        // Toggle visibility button
        this.toggleVisibilityBtn.addEventListener('click', () => {
            if (this.apiKeyInput.type === "password") {
                this.apiKeyInput.type = "text";
                this.toggleVisibilityBtn.textContent = "🔒";
            } else {
                this.apiKeyInput.type = "password";
                this.toggleVisibilityBtn.textContent = "👁️";
            }
        });
        
        // Submit button
        this.submitBtn.addEventListener('click', () => {
            this._saveApiKey();
        });
        
        // Delete button
        this.deleteBtn.addEventListener('click', () => {
            this._deleteApiKey();
        });
        
        // API key input enter key
        this.apiKeyInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this._saveApiKey();
            }
            // Hide error message when typing
            this.errorMsg.classList.remove('show');
        });
    }
    
    // Save the API key
    _saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        // Validate API key format (basic validation)
        if (!apiKey || !apiKey.startsWith('sk-')) {
            this.errorMsg.classList.add('show');
            this.deletedMsg.classList.remove('show');
            this.successMsg.classList.remove('show');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('openai_api_key', apiKey);
        
        // Show success message
        this.successMsg.classList.add('show');
        this.errorMsg.classList.remove('show');
        this.deletedMsg.classList.remove('show');
        
        // Clear the input and reset type to password
        this.apiKeyInput.value = "";
        this.apiKeyInput.type = "password";
        this.toggleVisibilityBtn.textContent = "👁️";
        
        // Notify callback
        this.onApiKeySaved(apiKey, this.lastSearchQuery);
        
        // Hide the popup after a delay
        setTimeout(() => {
            this.hide();
        }, 1500);
    }
    
    // Delete the API key
    _deleteApiKey() {
        localStorage.removeItem('openai_api_key');
        
        // Show deleted message
        this.deletedMsg.classList.add('show');
        this.successMsg.classList.remove('show');
        this.errorMsg.classList.remove('show');
        
        // Clear the input
        this.apiKeyInput.value = "";
        this.apiKeyInput.placeholder = "sk-...";
        
        // Notify callback with null to indicate deletion
        this.onApiKeySaved(null);
    }
} 