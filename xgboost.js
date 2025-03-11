class XGBoostNode {
    constructor() {
        this.leftChild = null;
        this.rightChild = null;
        this.splitFeature = null;
        this.splitValue = null;
        this.prediction = null;
        this.gain = 0;
        this.weight = 1.0; // For regularization
    }
}

class XGBoostTree {
    constructor(params = {}) {
        this.maxDepth = params.maxDepth || 6;
        this.minChildWeight = params.minChildWeight || 1;
        this.gamma = params.gamma || 0; // Minimum loss reduction for split
        this.lambda = params.lambda || 1; // L2 regularization
        this.eta = params.eta || 0.3; // Learning rate
        this.root = null;
    }

    // Calculate gradient and hessian for binary classification
    calculateGradientHessian(actual, predicted) {
        const prob = 1 / (1 + Math.exp(-predicted));
        const grad = prob - actual;
        const hess = prob * (1 - prob);
        return { gradient: grad, hessian: hess };
    }

    // Calculate gain for potential split
    calculateGain(gradientSum, hessianSum, leftGradSum, leftHessSum, rightGradSum, rightHessSum) {
        const gainLeft = (leftGradSum * leftGradSum) / (leftHessSum + this.lambda);
        const gainRight = (rightGradSum * rightGradSum) / (rightHessSum + this.lambda);
        const gainParent = (gradientSum * gradientSum) / (hessianSum + this.lambda);
        return (gainLeft + gainRight - gainParent) / 2 - this.gamma;
    }

    // Find best split for a node
    findBestSplit(features, gradients, hessians) {
        let bestGain = 0;
        let bestSplit = null;

        const totalGradSum = gradients.reduce((a, b) => a + b, 0);
        const totalHessSum = hessians.reduce((a, b) => a + b, 0);

        // For each feature
        for (let feature = 0; feature < features[0].length; feature++) {
            const featureValues = features.map(row => row[feature]);
            const uniqueValues = [...new Set(featureValues)].sort((a, b) => a - b);

            // Try each potential split point
            for (let i = 0; i < uniqueValues.length - 1; i++) {
                const splitValue = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
                
                let leftGradSum = 0, leftHessSum = 0;
                let rightGradSum = totalGradSum, rightHessSum = totalHessSum;

                // Calculate sums for left and right children
                for (let j = 0; j < features.length; j++) {
                    if (features[j][feature] <= splitValue) {
                        leftGradSum += gradients[j];
                        leftHessSum += hessians[j];
                        rightGradSum -= gradients[j];
                        rightHessSum -= hessians[j];
                    }
                }

                // Check minimum child weight
                if (leftHessSum < this.minChildWeight || rightHessSum < this.minChildWeight) {
                    continue;
                }

                const gain = this.calculateGain(
                    totalGradSum, totalHessSum,
                    leftGradSum, leftHessSum,
                    rightGradSum, rightHessSum
                );

                if (gain > bestGain) {
                    bestGain = gain;
                    bestSplit = {
                        feature,
                        value: splitValue,
                        gain,
                        leftGradSum,
                        leftHessSum,
                        rightGradSum,
                        rightHessSum
                    };
                }
            }
        }

        return bestSplit;
    }

    // Build tree recursively
    buildTree(features, gradients, hessians, depth = 0) {
        const node = new XGBoostNode();

        // Check stopping conditions
        if (depth >= this.maxDepth) {
            node.prediction = -this.eta * gradients.reduce((a, b) => a + b, 0) / 
                            (hessians.reduce((a, b) => a + b, 0) + this.lambda);
            return node;
        }

        const split = this.findBestSplit(features, gradients, hessians);
        
        if (!split || split.gain <= 0) {
            node.prediction = -this.eta * gradients.reduce((a, b) => a + b, 0) / 
                            (hessians.reduce((a, b) => a + b, 0) + this.lambda);
            return node;
        }

        node.splitFeature = split.feature;
        node.splitValue = split.value;
        node.gain = split.gain;

        // Split data
        const leftIndices = [];
        const rightIndices = [];
        
        for (let i = 0; i < features.length; i++) {
            if (features[i][split.feature] <= split.value) {
                leftIndices.push(i);
            } else {
                rightIndices.push(i);
            }
        }

        // Build child nodes
        const leftFeatures = leftIndices.map(i => features[i]);
        const leftGradients = leftIndices.map(i => gradients[i]);
        const leftHessians = leftIndices.map(i => hessians[i]);

        const rightFeatures = rightIndices.map(i => features[i]);
        const rightGradients = rightIndices.map(i => gradients[i]);
        const rightHessians = rightIndices.map(i => hessians[i]);

        node.leftChild = this.buildTree(leftFeatures, leftGradients, leftHessians, depth + 1);
        node.rightChild = this.buildTree(rightFeatures, rightGradients, rightHessians, depth + 1);

        return node;
    }

    // Make prediction for a single instance
    predict(features, node = this.root) {
        if (!node) return 0;

        if (node.prediction !== null) {
            return node.prediction;
        }

        if (features[node.splitFeature] <= node.splitValue) {
            return this.predict(features, node.leftChild);
        } else {
            return this.predict(features, node.rightChild);
        }
    }

    // Train the tree
    train(features, labels) {
        const predictions = new Array(features.length).fill(0);
        const gradients = [];
        const hessians = [];

        // Calculate initial gradients and hessians
        for (let i = 0; i < features.length; i++) {
            const gh = this.calculateGradientHessian(labels[i], predictions[i]);
            gradients.push(gh.gradient);
            hessians.push(gh.hessian);
        }

        this.root = this.buildTree(features, gradients, hessians);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XGBoostTree, XGBoostNode };
} 