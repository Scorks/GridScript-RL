// Caroline Strickland
// 201215555

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
                    self.Q[x][y].push(self.config.initialValue);
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
            if (defaultMap[state[0]][state[1]] == 'T') { // if we are currently in a terminal state
              return episode; // end the episode
            }

            // 2. action = selectActionFromPolicy(state[0], state[1]);
            // first action chosen each episode should be random (exploring starts)
            if (t == 0) {
              action = Math.floor(Math.random() * 4); // gets a random number between 0 and 3 (possible actions)
            }
            else {
              action = self.selectActionFromPolicy(state[0], state[1]); // selects the best action for the given state
            }
            console.log(action);

            // 3. reward = self.env.getReward(state[0], state[1], action)
            reward = self.env.getReward(state[0], state[1], action);

            // 4. add [state, action, reward] to the episode
            episodeVals = [state, action, reward];
            episode.push.apply(episode, episodeVals);

            // 5. state = getNextState(state[0], state[1], action)
            console.log(state);
            state = self.getNextState(state[0], state[1], action);
        }

        // return the episode
        return episode;
    }

//---------------------------------------------------------------------------------------------------------

    // selects best action from the current policy
    self.selectActionFromPolicy = function(x, y) {
      bestActionValue = 0;
      bestAction = 0; // the current best action to take based on values
      for (var i = 0; i < self.P.length; i++) {
        if (self.P[x][y][i] > bestAction) {
          bestActionValue = self.P[x][y][i];
          bestAction = i;
        }
      }
      //return bestAction
      return 3;
    }

    // gets the next state given the current state and the chosen action
    self.getNextState = function(x, y, action) {
      if (action == 0) { // down
        y = y - 1;
      }
      else if (action == 1) { // up
        y = y + 1;
      }
      else if (action == 2) { // left
        x = x - 1;
      }
      else { // right
        x = x + 1;
      }
      return [x, y];
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
        return 1;
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
