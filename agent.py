from scipy.stats import beta

class Agent:
    def __init__(self, prior, hypothesis=(0.5, 1), curious=True, mistrust=0):
        self.initial_prior = prior
        self.hypothesis = hypothesis
        self.curious = curious
        self.mistrust = mistrust
        self.reset()

    def reset(self):
        """
        Resets the agent's prior, current data, and history.
        """
        self.prior = self.initial_prior
        self.reset_data()
        self.history = []
        self.update_history()

    def reset_data(self):
        """
        Resets agent's current data.
        """
        self.data = (0,0)
    
    def probability_hypothesis(self):
        """
        Calculates the agents belief in their hypothesis.
        """
        a, b = self.prior
        lower_b, upper_b = self.hypothesis[0], self.hypothesis[1]
        cdf_lower = beta.cdf(lower_b, a, b)
        cdf_upper = beta.cdf(upper_b, a, b)
        diff = cdf_upper - cdf_lower
        return diff
    
    def disagreement_hypotheses(self, source):
        """
        Calculates the disagreement between the agent's hypothesis and the source's hypothesis.
        """
        hyp1 = self.history[-1]
        hyp2 = source.history[-1]
        diff = abs(hyp1 - hyp2)
        return diff

    def weigh_data(self, data, source):
        """
        Weighs data according to the distance between the agent's confidence in the hypothesis and that of the agent who shared the data as well as the agent's mistrust factor.
        """
        diff = self.disagreement_hypotheses(source)
        weight = 1 - min(1, self.mistrust * diff)
        k, n = data
        return (k * weight, n * weight)

    def merge_data(self, data):
        """
        Merge data with current data.
        """
        k, n = self.data
        k_new, n_new = data
        self.data = k + k_new, n + n_new

    def update_history(self):
        """
        Appends current belief in the hypothesis to the history.
        """
        prob_h = self.probability_hypothesis()
        self.history.append(prob_h)

    def update_belief(self):
        """
        Uses beta-binomial conjugate to update the agent's beliefs based on their current data.
        """
        k, n = self.data
        a, b = self.prior
        self.prior = (a + k, b + (n - k))
        self.update_history()
        self.reset_data()
 
    ### The following methods are not in use.
    '''
    def marginal_likelihood(self, data):
        """
        Calculates the marginal likelihood / predictive distribution of data.
        """
        a, b = self.prior
        k, n = data
        nCk = math.comb(n, k)
        log_beta_prior = betaln(a, b)
        log_beta_posterior = betaln(a + k, b + n - k)
        log_marginal_likelihood = math.log(nCk) + log_beta_posterior - log_beta_prior

        marginal_likelihood = np.exp(log_marginal_likelihood)
        return marginal_likelihood
    
    def kl_divergence_beta(self, source):
        """
        Calculates the Kullback-Leibler divergence between two beta distributions.
        """
        a1, b1 = self.prior
        a2, b2 = source.prior
        term1 = betaln(a2, b2) - betaln(a1, b1)
        term2 = (a1 - a2) * (psi(a1) - psi(a1 + b1))
        term3 = (b1 - b2) * (psi(b1) - psi(a1 + b1))
        kl_d = term1 + term2 + term3
        weight = np.exp(-self.mistrust * kl_d)
        return weight
    '''