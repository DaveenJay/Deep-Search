// Agent Process Modal Component
export class AgentProcessModal {
    constructor(container) {
        this.container = container;
        this.overlay = null;
        this.popup = null;
        this.closeBtn = null;
        this.visualizationContainer = null;
    }

    render() {
        // Create agent process overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'agent-process-overlay';
        this.overlay.id = 'agent-process-overlay';
        
        // Create popup
        this.popup = document.createElement('div');
        this.popup.className = 'agent-process-popup';
        
        // Create close button
        this.closeBtn = document.createElement('div');
        this.closeBtn.className = 'agent-process-popup-close';
        this.closeBtn.id = 'close-agent-process';
        this.closeBtn.textContent = '×';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'How this was answered';
        
        // Create visualization container
        this.visualizationContainer = document.createElement('div');
        this.visualizationContainer.id = 'agentProcessVisualization';
        
        // Assemble the popup
        this.popup.appendChild(this.closeBtn);
        this.popup.appendChild(title);
        this.popup.appendChild(this.visualizationContainer);
        
        // Add popup to overlay
        this.overlay.appendChild(this.popup);
        
        // Add overlay to container
        this.container.appendChild(this.overlay);
        
        // Initialize event listeners
        this._initEventListeners();
        
        return this;
    }
    
    // Show the modal
    show() {
        this.overlay.classList.add('show');
    }
    
    // Hide the modal
    hide() {
        this.overlay.classList.remove('show');
    }
    
    // Initialize event listeners
    _initEventListeners() {
        // Close button click
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        // Close when clicking outside the popup
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    }
} 