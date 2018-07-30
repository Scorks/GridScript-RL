// Caroline Strickland
// 201215555
 RLMC = function(env, config) {
    var self = {};
    self.config = config;   // learning configuration settings
    self.env = env;         // the environment we will learn about
    self.Q = [];            // values array Q[x][y][a] = value of doing action a at (x,y)
    self.P = [];            // policy array P[x][y][a] = probability of doing action a at (x,y)
    self.R = [];            // Results array R[x][y][a] = averaging for self.Q at (x,y) and action a

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
        // initialize Results array with 0s
       for (x=0; x<self.env.width; x++) {
           self.R.push([]);
           for (y=0; y<self.env.height; y++) {
               self.R[x].push([]);
               for (a=0; a<self.env.actions.length; a++) {
                   self.R[x][y].push(0);
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
            // first action chosen each episode should be random (exploring start)
            if (t == 0) {
              action = Math.floor(Math.random() * 4); // gets a random number between 0 and 3 (possible actions)
            }
            else {
              var action = self.selectActionFromPolicy(state[0], state[1]); // selects the best action for the given state
            }
             // 3. reward = self.env.getReward(state[0], state[1], action)
            var reward = self.env.getReward(state[0], state[1], action);
             // 4. add [state, action, reward] to the episode
            episodeVals = [state, action, reward];
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
      for (var i = 0; i<4; i++) {
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
      if (action == 0) { // down
        if (y == self.env.height-1) { // already at the bottom of the grid
          return [x, y];
        }
        else if(defaultMap[x][y + 1] == 'X'){ // there is a wall in the way
          return [x, y];
        }
        else {
          y = y + 1;
        }
      }
      else if (action == 1) { // up
        if (y == 0) {
          return [x, y];
        }
        else if(defaultMap[x][y - 1] == 'X'){ // there is a wall in the way
          return [x, y];
        }
        else {
         y = y - 1;
        }
      }
      else if (action == 2) { // left
        if (x == 0) {
          return [x, y];
        }
        else if(defaultMap[x - 1][y] == 'X'){ // there is a wall in the way
          return [x, y];
        }
        else {
          x = x - 1;
        }
      }
      else { // right
        if (x == self.env.width-1) {
          return [x, y];
        }
        else if(defaultMap[x + 1][y] == 'X'){ // there is a wall in the way
          return [x, y];
        }
        else {
          x = x + 1;
        }
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
        summedRewards = [];
        visitedPairs = []; // visited (state, action) pairs
        var sum = 0; // sum from t to the end of the episode
        for (t=0; t<episode.length; t++) {
          summedRewards.push(episode[t][2]); // push all reward values into an array
        }

        sum = self.sum(summedRewards);

        for (t=0; t<episode.length; t++) {
          var checkPair = [episode[t][0][0], episode[t][0][1], episode[t][2]];
          if (self.searchForArray(visitedPairs, checkPair) == -1) { // if (state, action) pair has not been visited
            console.log("wasn't in there...");
            self.R[episode[t][0][0]][episode[t][0][1]][episode[t][2]] += sum;
            self.R[episode[t][0][0]][episode[t][0][1]][episode[t][2]] = (self.R[episode[t][0][0]][episode[t][0][1]][episode[t][2]] / 2);
            self.Q[episode[t][0][0]][episode[t][0][1]][episode[t][2]] = self.R[episode[t][0][0]][episode[t][0][1]][episode[t][2]];
            visitedPairs.push(checkPair);
            summedRewards.shift();
            sum = 0;
            for (i=0; i<summedRewards.length; i++) { // sum all rewards into the array
              sum = sum + summedRewards[i];
            }
          }
          else {
            console.log("was in there...");
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
        // policy update pseudocode
        var visitedStates = [] // states that have been accounted for
        for (t=0; t<episode.length; t++) {
          // for (each state (x,y) in the episode)
          if (self.searchForArray(visitedStates, episode[t][0]) == -1) { // if the state has not been visited before
              //   maxActionValue = get maximum action value from Q[x][y]
              var maxActionValue = 0;
              var maxActions = []; //   maxActions = [which actions gave maxActionValue]
              for (a=0; a<self.Q[episode[t][0][0]][episode[t][0][1]].length; a++) { // for action a in self.Q[x][y]
                if (self.Q[episode[t][0][0]][episode[t][0][1]][a] > maxActionValue) { // if Q value of a > maxActionValue
                  maxActionValue = self.Q[episode[t][0][0]][episode[t][0][1]][a]; // update maxActionValue
                  maxActions = [] // reset maxActions array
                  maxActions.push(a); // push the new value
                }
                else if (self.Q[episode[t][0][0]][episode[t][0][1]][a] == maxActionValue) {
                  maxActions.push(a); // push the new value
                }
              }
              for (a=0; a<self.env.actions.length; a++) { // for each action a
                if (self.searchForArray(maxActions, a) == -1) { // if (a in maxActions)
                  self.P[episode[t][0][0]][episode[t][0][1]][a] = 1.0 / maxActions.length;  // P[x][y][a] = 1.0/maxActions.length
                }
                else {
                  self.P[episode[t][0][0]][episode[t][0][1]][a] = 0; // else P[x][y][a] = 0
                }
              }
            }
            visitedStates.push(episode[t][0]); // note that this state has already been visited
          }
        }
     self.init();
    return self;
}
