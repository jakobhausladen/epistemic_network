const plotlyColors = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
];

export class Network {
    constructor(parentDiv, numberOfNodes, radius, centerX, centerY, nodeSize=30, edgeThickness=1) {
        this.parentDiv = parentDiv;
        this.numberOfNodes = numberOfNodes;
        this.radius = radius;
        this.centerX = centerX;
        this.centerY = centerY;
        this.edges = new Map();
        this.lastClickedNode = null;
        this.nodeSize = nodeSize;
        this.edgeThickness = edgeThickness;
    }

    drawEdge(node1, node2) {
        const offset = this.nodeSize / 2;
        const x1 = parseFloat(node1.style.left) + offset;
        const y1 = parseFloat(node1.style.top) + offset;
        const x2 = parseFloat(node2.style.left) + offset;
        const y2 = parseFloat(node2.style.top) + offset;

        const edge = document.createElement('div');
        edge.classList.add('edge');

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        edge.style.width = `${length}px`;
        edge.style.height = `${this.edgeThickness}px`;

        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        edge.style.transform = `rotate(${angle}deg)`;
        edge.style.transformOrigin = '0 0';

        edge.style.left = `${x1}px`;
        edge.style.top = `${y1}px`;

        this.parentDiv.appendChild(edge);

        const nodeId1 = node1.dataset.id;
        const nodeId2 = node2.dataset.id;
        const edgeKey = `${nodeId1}-${nodeId2}`;
        this.edges.set(edgeKey, edge);
    }

    removeEdges(node) {
        const nodeId = node.dataset.id;
        this.edges.forEach((edge, key) => {
            if (key.startsWith(`${nodeId}-`) || key.endsWith(`-${nodeId}`)) {
                edge.remove();
                this.edges.delete(key);
            }
        });
    }

    createRemoveEdge(node) {
        if (node.classList.contains('deactivated')) return; // Skip if node is deactivated

        if (this.lastClickedNode) {
            if (this.lastClickedNode.classList.contains('deactivated')) {
                this.lastClickedNode = null;
                return; // Skip if last clicked node is deactivated
            }
            const nodeId1 = this.lastClickedNode.dataset.id;
            const nodeId2 = node.dataset.id;
            const edgeKey = `${nodeId1}-${nodeId2}`;
            const reverseEdgeKey = `${nodeId2}-${nodeId1}`;

            if (this.edges.has(edgeKey) || this.edges.has(reverseEdgeKey)) {
                // Remove the existing edge
                const edge = this.edges.get(edgeKey) || this.edges.get(reverseEdgeKey);
                edge.remove();
                this.edges.delete(edgeKey);
                this.edges.delete(reverseEdgeKey);
            } else {
                // Draw a new edge
                this.drawEdge(this.lastClickedNode, node);
            }
            this.lastClickedNode = null;
        } else {
            this.lastClickedNode = node;
        }
    }

    activateDeactivateNode(node) {
        if (node.classList.contains('deactivated')) {
            node.classList.remove('deactivated');
        } else {
            node.classList.add('deactivated');
            this.removeEdges(node);
        }
    }

    createNode(i) {
        const angleStep = (2 * Math.PI) / this.numberOfNodes;
        const angle = i * angleStep;
        const offset = this.nodeSize / 2;
        const x = this.centerX + this.radius * Math.cos(angle) - offset;
        const y = this.centerY + this.radius * Math.sin(angle) - offset;

        const node = document.createElement('div');
        node.classList.add('node');
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.width = `${this.nodeSize}px`;
        node.style.height = `${this.nodeSize}px`;
        node.style.borderRadius = `${this.nodeSize / 2}px`;

        node.dataset.id = i; // Unique id for each node

        node.style.backgroundColor = plotlyColors[i];

        // Single click for edge creation / removal
        node.addEventListener('click', () => {
            this.createRemoveEdge(node);
        });
        // Double click for activation / deactivation
        node.addEventListener('dblclick', () => this.activateDeactivateNode(node));

        return node;
    }

    clearEdges() {
        const nodes = this.parentDiv.querySelectorAll('.node');
        nodes.forEach(node => {
            this.removeEdges(node);
        });
    }

    drawAllEdges() {
        // Clear existing edges before adding new ones
        this.clearEdges();
        // Add edge for every possible combination
        const nodes = this.parentDiv.querySelectorAll('.node:not(.deactivated)');
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                this.drawEdge(nodes[i], nodes[j]);
            }
        }
    }

    drawRandomEdges() {
        function boundedNormalSample(max, std) {
            function normalSample(mean, std) {
                let u1 = Math.random();
                let u2 = Math.random();
                // Box-Muller transformation
                let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                return z0 * std + mean;
            }
            const mean = max / 2;
            let value = normalSample(mean, std);
            // Cut-offs at 0 and max
            if (value < 0) {
                value = 0;
            } else if (value > max) {
                value = max;
            }
            return value;
        }
    
        // Shuffles an array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        // Clear existing edges before adding new ones
        this.clearEdges();
    
        // Get all possible node combinations
        const nodes = this.parentDiv.querySelectorAll('.node:not(.deactivated)');
        const possibleEdges = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                possibleEdges.push([nodes[i], nodes[j]]);
            }
        }
    
        /*
        Sample the number n of edges to draw from a Normal centered around maxNumberEdges / 2
        Setting the std to maxNumberEdges / 6 ensures that 0 and maxNumberEdges are exactly 3 stds away from the mean
        */
        const maxNumberEdges = nodes.length * (nodes.length - 1) / 2;
        const std = maxNumberEdges / 6;
        let randNumberEdges = boundedNormalSample(maxNumberEdges, std);
        randNumberEdges = Math.round(randNumberEdges);
        randNumberEdges = Math.min(randNumberEdges, possibleEdges.length);
    
        // Draw n first entries of the shuffled possibleEdges array
        const randomEdges = shuffleArray(possibleEdges).slice(0, randNumberEdges);
        randomEdges.forEach(edge => {
            this.drawEdge(edge[0], edge[1]);
        });
    }
     
}
