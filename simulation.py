import os
import itertools
import time
import multiprocessing
import pandas as pd
from network import CoinTosser, Network

def create_edges(layout, agents):
    num_agents = len(agents)
    if layout == 'connected':
        edges = [(i, j) for i in range(num_agents) for j in range(i + 1, num_agents)]
    elif layout == 'ring':
        edges = [(i, (i + 1) % num_agents) for i in range(num_agents)]
    elif layout == 'wheel':
        edges = [(i, (i + 1) % (num_agents - 1)) for i in range(num_agents - 1)]
        edges += [(i, num_agents - 1) for i in range(num_agents - 1)]
    else:
        raise ValueError('Layout must be "connected" or "ring" or "wheel".')
    return edges

def run_simulation(n_agents, true_p, layout, mistrust):
    # Initialize network
    agents = list(range(n_agents))
    edges = create_edges(layout, agents)
    tosser = CoinTosser(true_p)
    network = Network(tosser, agents, edges, hypothesis=(0.5, 1), curiousAgents=False, mistrust=mistrust)
    
    # Run until convergence
    converged = False
    rounds = 0
    while not converged:
        rounds += 1
        network.run_round()
        status = network.get_status()
        if status != 'learning':
            converged = True
    return {'n_agents': n_agents, 'true_p': true_p, 'layout': layout, 'mistrust': mistrust, 'result': status, 'rounds': rounds}


if __name__ == '__main__':
    # Parameter grid
    num_agents_list = [6, 10, 20]
    true_p_list = [0.55, 0.6, 0.7]
    network_layout = ['connected']
    mistrust_list = [1, 1.25, 1.5, 2, 2.5]
    n_simulations = 1000

    parameter_grid = list(itertools.product(num_agents_list, true_p_list, network_layout, mistrust_list))
    parameter_grid = parameter_grid * n_simulations

    start_time = time.time()

    # Set up multiprocessing
    num_cores = multiprocessing.cpu_count()
    pool = multiprocessing.Pool(num_cores)
    
    # Map simulation on parameter grid using multiprocessing starmap
    all_results = pool.starmap(run_simulation, parameter_grid)
    pool.close()
    pool.join()

    # Convert the results to a dataframe and save as CSV
    df = pd.DataFrame(all_results)
    wd = os.getcwd()
    path = os.path.join(wd, 'sim_data', 'mistrust_data.csv')
    df.to_csv(path, index=False)

    duration = time.time() - start_time
    print('Simulation complete.')
    print(f'Took {round(duration/60, 3)} minutes to run.')
    print(f'Saved data to {path}.')