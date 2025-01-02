from agent import Agent
from scipy.stats import binom, uniform


class CoinTosser:
    def __init__(self, true_p):
        self.true_p = true_p

    def sample(self, n):
        """
        Sample from a binomial with n trials and probability p.
        """
        k = binom.rvs(n=n, p=self.true_p)
        return (k, n)


class Network:
    def __init__(self, dataGenerator, agentList, edgeList, hypothesis=(0.5, 1), curiousAgents=True, mistrust=0):
        self.dataGenerator = dataGenerator
        self.hypothesis = hypothesis
        self.curiousAgents = curiousAgents
        self.mistrust = mistrust
        self.agents = {}
        self.edges = {}
        for agentIdex in agentList : self.add_agent(agentIdex)
        for edge in edgeList: self.add_edge(edge)
        self.reset()

    def reset(self):
        """
        Resets all the agents in the network.
        """
        for agent in self.agents.values():
            agent.reset()

    def add_agent(self, agentIdex):
        """
        Adds new agent based on an index and initializes an empty set of edges for them. Priors are sampled from a uniform.
        """
        MAX_PARAMETER = 20
        a = uniform.rvs(0, MAX_PARAMETER, size=1)[0]
        b = uniform.rvs(0, MAX_PARAMETER, size=1)[0]
        self.agents[agentIdex] = Agent(prior=(a,b), hypothesis=self.hypothesis, curious=self.curiousAgents, mistrust=self.mistrust)
        self.edges[agentIdex] = []

    def add_edge(self, edge):
        """
        Adds an edge based on a tuple of indices.
        """
        agent1_id, agent2_id = edge
        self.edges[agent1_id].append(agent2_id)
        self.edges[agent2_id].append(agent1_id)

    def run_experiments(self, sampleSize=5):
        """
        Agents sample data from the network's data generator. 
        """
        SAMPLE_THRESHOLD = 0.5
        for _, agent in self.agents.items():
            if not agent.curious and agent.history[-1] < SAMPLE_THRESHOLD:
                continue  
            else:
                data = self.dataGenerator.sample(sampleSize)
                agent.merge_data(data)

    def combine_data(self):
        """
        All agents weigh and aggregate the data of their neighbors. Then they merge the results with their current data. 
        """
        combined_data = {}
        for agent_id, agent in self.agents.items():
            neighbor_ids = self.edges[agent_id]
            for id in neighbor_ids:
                neighbor = self.agents[id]
                neighbor_data = neighbor.data
                weighed_data = agent.weigh_data(neighbor_data, neighbor)
                agg_k = combined_data.get(agent_id, (0, 0))[0] + weighed_data[0]
                agg_n = combined_data.get(agent_id, (0, 0))[1] + weighed_data[1]
                combined_data[agent_id] = (agg_k, agg_n)

        for agent_id, data in combined_data.items():
            agent = self.agents[agent_id]
            agent.merge_data(data)

    def collective_belief_update(self):
        """
        Each agent updates their belief based on their current data.
        """
        for _, agent in self.agents.items():
            agent.update_belief()

    def run_round(self, sampleSize=20):
        """
        Runs one round of experimentation, data sharing, and belief updates.
        """
        self.run_experiments(sampleSize=sampleSize)
        self.combine_data()
        self.collective_belief_update()

    def get_status(self):
        """
        Returns the network's status. Checks if the network has reached a true or false consensus. If mistrust is not zero, checks for polarization.
        """
        hyps = [agent.history[-1] for agent in self.agents.values()]
        if all(hyp > 0.99 for hyp in hyps):
            return 'true_consensus'
        elif all(hyp < 0.5 for hyp in hyps):
            return 'false_consensus'
        elif self.mistrust != 0:
            prev_hyps = [agent.history[-2] for agent in self.agents.values()]
            if all(hyps[i] == prev_hyps[i] or hyps[i] > 0.99 for i in range(len(hyps))):
                return 'polarization'
            else:
                return 'learning'
