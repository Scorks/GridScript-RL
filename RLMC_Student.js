RLMC = function(env, config) {
    var self = {};
    self.config = config;   // learning configuration settings
    self.env = env;         // the environment we will learn about
    
    self.Q = [];            // values array Q[x][y][a] = value of doing action a at (x,y)
    self.P = [];            // policy array P[x][y][a] = probability of doing action a at (x,y)
    
    self.init = function() {
        // initialize all Q values to self.config.initialValue
        for (x=0; x<self.env.width; x++) {
            self.Q.push([]);
            for (y=0; y<self.env.height; y++) {
                self.Q[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.Q[x][y].push(0);
                }
            }
        }

        // initialize Policy to equiprobable actions
        for (x=0; x<self.env.width; x++) {
            self.P.push([]);
            for (y=0; y<self.env.height; y++) {
                self.P[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.P[x][y].push(1.0 / self.env.actions.length);
                }
            }
        }
    }

    self.generateEpisode = function() {
        // the episode should be in the following format:
        // episode[i] = [[state i x, state i y], action i, reward i]
        let episode = [];

        // state is represented as [x, y]
        let state = [0, 0]; // initialize to a random non-blocked state in the environment

        // generate an episode with an upper bound on time
        for (t=0; t<self.config.maxEpisodeTime; t++) {
            // episode generation pseudocode
            // references to functions not present should be implemented for convenience
            // 1. If this is a terminal state, end the episode
            // 2. action = selectActionFromPolicy(state[0], state[1]);
            //    note: first action chosen each episode should be random (exploring starts)
            // 3. reward = self.env.getReward(state[0], state[1], action)
            // 4. add [state, action, reward] to the episode
            // 5. state = getNextState(state[0], state[1], action)
        }

        // return the episode
        return episode;
    }

    // Student TODO: Implement this function
    //
    // This funtion should update the self.Q values
    //
    // Args:
    //    episode - an array with the following format:
    //              episode[t] = [[state t x, state t y], action t, reward t]
    //
    // Returns:
    //    none
    //
    self.updateValues = function(episode) {
        // value update pseudocode
        // for (t=0; t<episode.length; t++)
        //   R = sum rewards from t to the end of the episode
        //   if (first time s,a appears in the episode)
        //   update Q with new target of R using self.config.stepSize
    }

    // Student TODO: Implement this function
    //
    // This funtion should update the policy to reflect the current values.
    // It should update the policy for
    //
    // Args:
    //    none
    //
    // Returns:
    //    none
    //
    self.updatePolicy = function(episode) {
        // policy update pseudocode
        // for (each state (x,y) in the episode)
        //   maxActionValue = get maximum action value from Q[x][y]
        //   maxActions = [which actions gave maxActionValue]
        //   
        //   for each action a
        //     if (a in maxActions) P[x][y][a] = 1.0/maxActions.length
        //     else                 P[x][y][a] = 0
    }

    self.init();
    return self;
}