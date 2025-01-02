const defaultLayout = {
    autosize: true,
    margin: {l: 20, r: 20, t: 20, b: 20},
    width: 400,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {range: [0, 100]},
    yaxis: {range: [0, 1]},
    legend: {
        x: 1,
        y: 0.02,
        xanchor: 'right',
        yanchor: 'bottom'
    },
    showlegend: false,
    hovermode: 'closest',
};

const defaultConfig = {
    displayModeBar: false
};


// Initialize the plot element with empty plot
export function initialize_plot(plot, layout=defaultLayout, config=defaultConfig) {
    layout.width = plot.clientWidth;
    Plotly.newPlot(plot, [], layout, config);
};


// Update the plot element with plot based on simulation data
export function updatePlotlyChart(plot, data, n_exp, layout=defaultLayout, config=defaultConfig) {
    layout.width = plot.clientWidth;
    layout.xaxis = {range: [0, n_exp]}
    const xValues = Array.from({length: n_exp+1}, (_, i) => i);

    // Iterate over the data to create traces for each Agent
    const traces = [];
    data.forEach((yData, index) => {
        const trace = {
            x: xValues,
            y: yData,
            type: 'scatter',
            name: `Agent ${index + 1}`
        };
        traces.push(trace);
    });

    Plotly.newPlot(plot, traces, layout, config);
}


export function summonBayes(plot) {
    const bayesImageUrl = '/static/img/bayes_image.jpg';
    plot.innerHTML = `<img src="${bayesImageUrl}" alt="Image of Thomas Bayes" style="width: 100%; height: auto; display: block; margin: 0 auto;">`;
    
    // Remove the image after 4 seconds
    setTimeout(() => {
        plot.innerHTML = '';
        initialize_plot(plot);
    }, 4000);
}


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
let isAnimating = false;

export async function updateNodeColor(histories) {
    if (isAnimating) {
        return; // Exit if animation is already running
    }
    isAnimating = true; // Indicate animation is running

    // Color scale using a d3 interpolation function
    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu) 
        .domain([0, 1]);
    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    const ring = document.getElementById('ring');
    const nodes = ring.querySelectorAll('.node:not(.deactivated)');
    try {
        for (let i = 0; i < histories[0].length; i++) {
            for (let k = 0; k < nodes.length; k++) {
                nodes[k].style.backgroundColor = colorScale(histories[k][i]);
            }
            await sleep(50);
        }
        await sleep(1000);
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].style.backgroundColor = plotlyColors[i];
        }
    } finally {
        isAnimating = false;
    }
}
