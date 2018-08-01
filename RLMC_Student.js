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
       console.log(self.config.numPucks);
        // the episode should be in the following format:
        // episode[i] = [[state i x, state i y], action i, reward i]
        let episode = [];

         // state is represented as [x, y]
        let state = [0, 0]; // initialize to a random non-blocked state in the environment
        var isStateValid = true;
        while (isStateValid) {
          state = [Math.floor(Math.random()*(self.env.width-1)) + 1, Math.floor(Math.random()*(self.env.height-1)) + 1];
          if (!self.env.isBlocked(state[0], state[1])) {
            isStateValid = false;
          }
        }
         // generate an episode with an upper bound on time
        for (t=0; t<self.config.maxEpisodeTime; t++) {
            // episode generation pseudocode
            // references to functions not present should be implemented for convenience
             // 1. If this is a terminal state, end the episode
            if (self.env.isTerminal(state[0], state[1])) { // if we are currently in a terminal state
              break; // end the episode
            }
            // first action chosen each episode should be random (exploring start)
            if (t == 0) {
              action = Math.floor(Math.random() * self.env.actions.length); // gets a random number between 0 and 3 (possible actions)
            }
            else {
              var action = self.selectActionFromPolicy(state[0], state[1]); // selects the best action for the given state
            }
             // 3. reward = self.env.getReward(state[0], state[1], action)
            var reward = self.env.getReward(state[0], state[1], action);

             // 4. add [state, action, reward] to the episode
            episodeVals = [[state[0], state[1]], action, reward];
            // push current episode information into the episode array
            episode.push(episodeVals);
             // 5. state = getNextState(state[0], state[1], action)
            state = self.getNextState(state[0], state[1], action);
        }
         // return the episode
        return episode;
    }

 //---------------------------------------------------------------------------------------------------------

     // selects best action from the current policy
    self.selectActionFromPolicy = function(x, y) {
      bestActionValue = 0;
      bestAction = []; // the current best action to take based on values
      for (var i = 0; i<self.env.actions.length; i++) {
        if (self.P[x][y][i] > bestActionValue) {
          bestActionValue = self.P[x][y][i];
          bestAction = [];
          bestAction.push(i);
        }
        else if (self.P[x][y][i] == bestActionValue) {
          bestAction.push(i);
        }
      }
      if (bestAction.length == 1) {
        return bestAction[0]; // return the best action
      }
      else {
        action = Math.floor(Math.random() * bestAction.length); // gets a random number between 0 and bestAction.length-1 (possible max actions)
        return action;
      }
    }
     // gets the next state given the current state and the chosen action
    self.getNextState = function(x, y, action) {
      next_x = x + self.env.actions[action][0];
      next_y = y + self.env.actions[action][1];
      if (self.env.isOOB(next_x, next_y) || self.env.isBlocked(next_x, next_y)) {
        return [x, y];
      }
      else {
        return [next_x, next_y];
      }
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

        var sum = 0; // sum from t to the end of the episode
        for (t=0; t<episode.length; t++) {
          sum += episode[t][2];
        }
        // 2D array keeping track of visited states
        visitedPairs = [];
        for (x=0; x<self.env.width; x++) {
            visitedPairs.push([]);
            for (y=0; y<self.env.height; y++) {
                visitedPairs[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    visitedPairs[x][y].push(false);
                }
            }
        }

        for (t=0; t<episode.length; t++) {
          x = episode[t][0][0]; // x-coordinate of current position
          y = episode[t][0][1]; // y-coordinate of current position
          action = episode[t][1]; // action from the episode slice
          currentReward = episode[t][2];

          sum = sum - currentReward;
          if (visitedPairs[x][y][action] == false) { // if this is our first time visiting this (state, action) pair
            self.Q[x][y][action] = (self.Q[x][y][action] + (self.config.stepSize * (currentReward + sum - self.Q[x][y][action])));
            visitedPairs[x][y][action] = true; // set visited to true so we don't update this Q value again during this episode
          }
        }
        //   R = sum rewards from t to the end of the episode
        //   if (first time s,a appears in the episode)
        //   update Q with new target of R using self.config.stepSize
        return 1;
    }

  // searches for an array (needle) within a 2D array (haystack)

  self.searchForArray = function(haystack, needle) {
    var i, j, current;
    for(i = 0; i < haystack.length; ++i){
      if(needle.length === haystack[i].length){
        current = haystack[i];
        for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
        if(j === needle.length)
          return i;
        }
      }
      return -1;
    }

  // sums all items within an array
  self.sum = function(input) {

    if (toString.call(input) !== "[object Array]")
    return false;

    var total =  0;
    for(var i=0;i<input.length;i++) {
      if(isNaN(input[i])){
        continue;
      }
        total += Number(input[i]);
      }
      return total;
    }

     // Student TODO: Implement this function
    //
    // This function should update the policy to reflect the current values.
    // It should update the policy for
    //
    // Args:
    //    none
    //
    // Returns:
    //    none
    //
    self.updatePolicy = function(episode) {

      // 2D array keeping track of visited states
      visitedPairs = [];
      for (x=0; x<self.env.width; x++) {
          visitedPairs.push([]);
          for (y=0; y<self.env.height; y++) {
              visitedPairs[x].push([]);
              for (a=0; a<self.env.actions.length; a++) {
                  visitedPairs[x][y].push(false);
              }
          }
      }

      for (t=0; t<episode.length; t++) {
        x = episode[t][0][0]; // x-coordinate of current position
        y = episode[t][0][1]; // y-coordinate of current position
        action = episode[t][1]; // action from the episode slice

        if (visitedPairs[x][y][action] == false) { // if the state has not been visited before
          // maxActionValue = get maximum action value from Q[x][y]
          maxVal = -1000000;
          maxIndices = []
          for (a=0; a<self.env.actions.length; a++){
            if (self.Q[x][y][a] > maxVal) {
              maxVal = self.Q[x][y][a];
              maxIndices = [];
              maxIndices.push(a);
            }
            else if (self.Q[x][y][a] == maxVal) { // if it is equal
              maxIndices.push(a);
            }
            }
          }
          for (a=0; a<self.env.actions.length; a++) {
            self.P[x][y][a] = 0;
            }
          for (a=0; a<maxIndices.length; a++) {
            self.P[x][y][maxIndices[a]] = 1.0 / maxIndices.length
          }
          visitedPairs[x][y][action] = true;
          }
        }
     self.init();
    return self;
}
