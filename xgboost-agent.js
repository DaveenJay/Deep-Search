const { XGBoostTree, XGBoostNode } = require('./xgboost.js');

class XGBoostAgent extends Agent {
    constructor(id, name, parentId = null) {
        super(id, name, parentId);
        this.xgboostTree = new XGBoostTree({
            maxDepth: 6,
            minChildWeight: 1,
            gamma: 0.1,
            lambda: 1,
            eta: 0.3
        });
        this.features = [];
        this.labels = [];
        this.predictions = [];
        this.confidenceThreshold = 0.7; // Minimum confidence required for an answer
        this.maxRetries = 3; // Maximum number of agent retries
        this.attemptedApproaches = new Set(); // Track attempted solution approaches
    }

    // Add training data point
    addDataPoint(features, label) {
        this.features.push(features);
        this.labels.push(label);
    }

    // Train the XGBoost model
    async train() {
        if (this.features.length === 0) {
            throw new Error('No training data available');
        }

        this.xgboostTree.train(this.features, this.labels);
        this.status = 'trained';
    }

    // Make prediction with confidence score
    predict(features) {
        if (this.status !== 'trained') {
            throw new Error('Model not trained yet');
        }
        const rawPrediction = this.xgboostTree.predict(features);
        const confidence = 1 / (1 + Math.exp(-Math.abs(rawPrediction)));
        return { prediction: rawPrediction, confidence };
    }

    // Handle missing values in features
    handleMissingValues(features) {
        const processedFeatures = [...features];
        for (let i = 0; i < features.length; i++) {
            if (features[i] === null || features[i] === undefined) {
                const availableValues = this.features.map(f => f[i]).filter(v => v !== null && v !== undefined);
                if (availableValues.length > 0) {
                    const mean = availableValues.reduce((a, b) => a + b, 0) / availableValues.length;
                    processedFeatures[i] = mean;
                } else {
                    processedFeatures[i] = 0;
                }
            }
        }
        return processedFeatures;
    }

    // Get specialized agent based on the current context
    getSpecializedAgent(context) {
        const specializations = [
            { name: 'Detail Analyzer', role: 'Deep dive into specific aspects', approach: 'detailed_analysis' },
            { name: 'Pattern Recognizer', role: 'Identify patterns and relationships', approach: 'pattern_recognition' },
            { name: 'Context Explorer', role: 'Explore broader context', approach: 'context_exploration' },
            { name: 'Alternative Perspective', role: 'Consider different viewpoints', approach: 'alternative_view' },
            { name: 'Solution Synthesizer', role: 'Combine multiple approaches', approach: 'synthesis' }
        ];

        // Filter out already attempted approaches
        const availableSpecializations = specializations.filter(
            spec => !this.attemptedApproaches.has(spec.approach)
        );

        if (availableSpecializations.length === 0) {
            return null; // No more specializations available
        }

        // Select the most appropriate specialization based on context
        const selected = availableSpecializations[0]; // For now, just take the first available one
        this.attemptedApproaches.add(selected.approach);

        return selected;
    }

    // Override the base Agent's thinking process to incorporate XGBoost and uncertainty handling
    async think(input) {
        this.thinking = "Analyzing input using XGBoost model...";
        
        try {
            const features = this.preprocessInput(input);
            const processedFeatures = this.handleMissingValues(features);
            
            if (this.status === 'trained') {
                const { prediction, confidence } = this.predict(processedFeatures);
                this.thinking += `\nConfidence level: ${(confidence * 100).toFixed(1)}%`;
                
                // Check if we have sufficient confidence
                if (confidence >= this.confidenceThreshold) {
                    return {
                        action: 'answer',
                        thinking: this.thinking,
                        answer: `Prediction: ${prediction > 0 ? 'Positive' : 'Negative'} with ${(confidence * 100).toFixed(1)}% confidence`
                    };
                } else {
                    // Get next specialized agent
                    const nextSpecialist = this.getSpecializedAgent(input);
                    
                    if (nextSpecialist) {
                        this.thinking += `\nConfidence too low (${(confidence * 100).toFixed(1)}%). Delegating to ${nextSpecialist.name}.`;
                        return {
                            action: 'branch',
                            thinking: this.thinking,
                            subAgents: [{
                                name: nextSpecialist.name,
                                role: nextSpecialist.role,
                                context: {
                                    previousConfidence: confidence,
                                    attemptedApproaches: Array.from(this.attemptedApproaches)
                                }
                            }]
                        };
                    } else {
                        // If we've exhausted all specialists, provide best guess with warning
                        this.thinking += '\nAll specialized approaches attempted. Providing best available answer with low confidence.';
                        return {
                            action: 'answer',
                            thinking: this.thinking,
                            answer: `Low confidence prediction: ${prediction > 0 ? 'Positive' : 'Negative'} (${(confidence * 100).toFixed(1)}% confidence). Consider seeking additional information or expert review.`
                        };
                    }
                }
            } else {
                // If not trained, collect training data
                this.addDataPoint(processedFeatures, null);
                return {
                    action: 'branch',
                    thinking: 'Insufficient training data. Initiating data collection...',
                    subAgents: [
                        { name: 'Data Collector', role: 'Gather training examples' },
                        { name: 'Knowledge Expert', role: 'Provide domain expertise' }
                    ]
                };
            }
        } catch (error) {
            this.thinking += `\nError: ${error.message}`;
            // On error, try to delegate to a different type of agent
            return {
                action: 'branch',
                thinking: this.thinking + '\nAttempting alternative approach...',
                subAgents: [
                    { name: 'Error Recovery Specialist', role: 'Handle error cases and try alternative methods' }
                ]
            };
        }
    }

    // Enhanced preprocessing with more sophisticated feature extraction
    preprocessInput(input) {
        const features = [];
        
        // Basic features
        features.push(input.length); // Length of input
        features.push(input.split(/\s+/).length); // Word count
        features.push((input.match(/[^a-zA-Z0-9\s]/g) || []).length); // Special characters
        
        // Word length statistics
        const words = input.split(/\s+/);
        const wordLengths = words.map(w => w.length);
        features.push(wordLengths.reduce((sum, len) => sum + len, 0) / words.length); // Average word length
        features.push(Math.max(...wordLengths)); // Maximum word length
        features.push(Math.min(...wordLengths)); // Minimum word length
        
        // Complexity indicators
        features.push((input.match(/[A-Z]/g) || []).length); // Capital letters
        features.push((input.match(/\d/g) || []).length); // Numbers
        features.push((input.match(/[.!?]/g) || []).length); // Sentence endings
        
        return features;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XGBoostAgent };
} 