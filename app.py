from flask import Flask, render_template, request, jsonify
import numpy as np
from network import CoinTosser, Network
from easteregg import check_pentagram


def run_simulation_web(true_p, agentList, edgeList, n_sim, n_exp, n_tosses, hypothesis, curious, mistrust):
    histories = []
    for _ in range(n_sim):
        tosser = CoinTosser(true_p)
        network = Network(tosser, agentList, edgeList, hypothesis=hypothesis, curiousAgents=curious, mistrust=mistrust)
        network.reset()
        for _ in range(n_exp):
            network.run_round(n_tosses)
        histories.append([agent.history for agent in network.agents.values()])
    
    # Dimensions: (simulations, agents, trials)
    histories = np.array(histories)
    avg_histories = np.mean(histories, axis=0)
    response_data = avg_histories.tolist()
    return response_data


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run_simulation', methods=['POST'])
def run_simulation():
    # Requested Data
    data = request.get_json()

    # Network state
    agentList = data.get('activeNodes')
    agentList = [int(agentIndex) for agentIndex in agentList]
    edgeList = data.get('edges')
    edgeList = [tuple(map(int, edge.split("-"))) for edge in data.get('edges')]

    # Parameters
    true_p = float(data.get('true_p'))
    lower_b = float(data.get('lower_b'))
    upper_b =  float(data.get('upper_b'))
    curious =  int(data.get('curious'))
    n_sim = int(data.get('n_sim'))
    n_exp =  int(data.get('n_exp'))
    n_tosses =  int(data.get('n_tosses'))
    mistrust =  float(data.get('mistrust'))

    if check_pentagram(agentList, edgeList):
         response_data = 'summon_bayes'
    else:
        # Run simulation and return (averaged) agent histories
        response_data = run_simulation_web(true_p, agentList, edgeList, n_sim, n_exp, n_tosses, (lower_b, upper_b), curious, mistrust)
    return jsonify(response_data), 200


if __name__ == '__main__':
    app.run(debug=True)

