import { updatePlotlyChart, summonBayes, updateNodeColor } from "./plot.js";

/*
Sends a fetch request to the server passing the network state and parameters as data in the body
Then starts learning animation and updates the plot based in the data it receives in the response
*/
export function handleSubmit(edges) {
    // Get params from form
    const form = document.getElementById('paramsForm');

    // Collect form data
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Get network state
    const activeNodes = [];
    document.querySelectorAll('.node:not(.deactivated)').forEach(node => {
        activeNodes.push(node.dataset.id);
    });
    
    const edgeList = [];
    edges.forEach((_, key) => {
        edgeList.push(key);
    });

    const combinedData = { ...formObject, activeNodes: activeNodes, edges: edgeList };

    // Send the combined data as JSON
    fetch('/run_simulation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(combinedData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Update the plot
        if (data === 'summon_bayes') {
            summonBayes(plot);
        } else {
            updateNodeColor(data);
            const n_exp = combinedData['n_exp'];
            updatePlotlyChart(plot, data, n_exp);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}