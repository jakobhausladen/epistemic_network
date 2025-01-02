import { Network } from "./network.js";
import { handleSubmit } from "./simulation.js";
import { initialize_plot } from "./plot.js";


document.addEventListener("DOMContentLoaded", function() {
    const parentDiv = document.getElementById("ring");
    const numberOfNodes = 10;
    const radius = 180;
    const centerX = 200;
    const centerY = 200;
    const nodeSize = 32;
    const network = new Network(parentDiv, numberOfNodes, radius, centerX, centerY, nodeSize);

    // Add nodes to the network / ring div
    for (let i = 0; i < numberOfNodes; i++) {
        const node = network.createNode(i);
        ring.appendChild(node);
    }

    // Add random edges
    network.drawRandomEdges();

    // Create an initial empty Plotly plot
    const plot = document.getElementById('plot');
    initialize_plot(plot);

    
    document.getElementById('clear-button').addEventListener('click', (event) => network.clearEdges(event));
    document.getElementById('draw-all-button').addEventListener('click', (event) => network.drawAllEdges(event));
    document.getElementById('draw-random-button').addEventListener('click', (event) => network.drawRandomEdges(event));

    // Button triggers simulation
    document.getElementById('paramsForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevents the page from reloading
        handleSubmit(network.edges)
    });

});