RLMC = function(env, config) {
    var self = {};
    self.config = config;   // learning configuration settings
    self.env = env;         // the environment we will learn about

    self.Q = [];            // values array Q[x][y][px][py][a] = value of doing action a at (x,y)
    self.P = [];            // policy array P[x][y][px][py][a] = probability of doing action a at (x,y)

    self.count = 0;
    self.terminalCounter = [];

    self.init = function() {
        // initialize all Q values to self.config.initialValue
        for (x=0; x<self.env.width; x++) {
            self.Q.push([]);
            for (y=0; y<self.env.height; y++) {
                self.Q[x].push([]);
                for (px=0; px<self.env.width; px++)
                {
                    self.Q[x][y].push([]);
                    for (py=0; py<self.env.height; py++)
                    {
                        self.Q[x][y][px].push([]);
                        for (a=0; a<self.env.actions.length; a++) {
                            self.Q[x][y][px][py].push(0);
                        }
                    }
                }

            }
        }

        // initialize all P
        for (x=0; x<self.env.width; x++) {
            self.P.push([]);
            for (y=0; y<self.env.height; y++) {
                self.P[x].push([]);
                for (px=0; px<self.env.width; px++)
                {
                    self.P[x][y].push([]);
                    for (py=0; py<self.env.height; py++)
                    {
                        self.P[x][y][px].push([]);
                        for (a=0; a<self.env.actions.length; a++) {
                            self.P[x][y][px][py].push(1.0 / self.env.actions.length);
                        }
                    }
                }

            }
        }

        // initialize all P
        for (x=0; x<self.env.episodes; x++) {
            self.terminalCounter.push([]);
            self.terminalCounter[x].push([]);
            self.terminalCounter[x].push([]);
        }
    }

    self.selectActionFromPolicy = function(x, y, px, py) {
        // look through the policy and get the maximums

        // epsilon greedy is super duper important
        if (Math.random() < self.config.epsilon) {
            return Math.floor(Math.random() * self.env.actions.length);
        }

        let maxActions = [];
        let maxVal = -100000;
        let policy = self.P[x][y][px][py];
        for (p=0; p<policy.length; p++) {
            if (policy[p] > maxVal) {
                maxActions = [p];
                maxVal = policy[p]
            } else if (policy[p] == maxVal) {
                maxActions.push(p);
            }
        }


        // return a random action from the maximums
        return maxActions[Math.floor(Math.random()*maxActions.length)];
    }

    self.getNextState = function(x, y, px, py, a) {
        let nx = x + self.env.actions[a][0];
        let ny = y + self.env.actions[a][1];

        // if the action leads us off the board or onto a blocked state, stay where we are
        if (self.env.isOOB(nx, ny) || self.env.isBlocked(nx, ny)) {
            return [x, y, px, py];
        } else {
            // we moved onto the puck location, so move the puck
            if (nx == px && ny == py) {
                let npx = px + self.env.actions[a][0];
                let npy = py + self.env.actions[a][1];

                // if the puck would be moved into a blocked space, then don't move anything
                if (self.env.isOOB(npx, npy) || self.env.isBlocked(npx, npy)) {
                    return [x, y, px, py];
                } else {
                    return [nx, ny, npx, npy];
                }
            } else {
                // otherwise the puck hasn't moved so don't update it
                return [nx, ny, px, py];
            }
        }
    }

    self.generateEpisode = function() {
        let episode = [];

        let state = [Math.floor(Math.random()*self.env.width),
            Math.floor(Math.random()*self.env.height),
            Math.floor(Math.random()*self.env.width),
            Math.floor(Math.random()*self.env.height)];

        while (self.env.isBlocked(state[0], state[1]) || self.env.isBlocked(state[2], state[3]))
        {
            state = [Math.floor(Math.random()*self.env.width),
                Math.floor(Math.random()*self.env.height),
                Math.floor(Math.random()*self.env.width),
                Math.floor(Math.random()*self.env.height)];
        }

        for (t=0; t<self.config.maxEpisodeTime; t++) {
            if (self.env.isTerminal(state[2], state[3])) {
              self.terminalCounter[self.count] = [true, t];
              self.count = self.count + 1;
              return episode;
            }

            let action = self.selectActionFromPolicy(state[0], state[1], state[2], state[3]);

            if (t == 0) {
                action = Math.floor(Math.random()*4);
            }

            let reward = self.env.getReward(state[0], state[1], action);

            let triplet = [[state[0], state[1], state[2], state[3]], action, reward];
            episode.push(triplet);
            state = self.getNextState(state[0], state[1], state[2], state[3], action);
        }
        self.terminalCounter[self.count] = [false, self.config.maxEpisodeTime];
        self.count = self.count + 1;
        return episode;
    }

    self.updateValues = function(episode) {

        for (t=0; t < episode.length; t++) {
            let state = episode[t][0];
            let a = episode[t][1];
            let R = -(episode.length - t);
            let x = state[0];
            let y = state[1];
            let px = state[2];
            let py = state[3];

            self.Q[x][y][px][py][a] += (self.config.stepSize) * (R - self.Q[x][y][px][py][a]);
        }
    }

    self.updatePolicy = function(episode) {

        var delta = 0.00001;

        for (t=0; t < episode.length; t++) {
            let state = episode[t][0];
            let a = episode[t][1];
            let R = -(episode.length - t);
            let x = state[0];
            let y = state[1];
            let px = state[2];
            let py = state[3];

            let maxVal = -100000;
            let values = self.Q[x][y][px][py];
            for (a=0; a<values.length; a++) {
                if (values[a] > maxVal) {
                    maxVal = values[a]
                }
            }

            let maxActions = [];
            for (a=0; a<values.length; a++) {
                if (Math.abs(values[a] - maxVal) < delta) {
                    maxActions.push(a);
                }
            }

            for (a=0; a<self.env.actions.length; a++) {
                self.P[x][y][px][py][a] = 0;
            }

            for (a=0; a<maxActions.length; a++) {
                self.P[x][y][px][py][maxActions[a]] = 1.0 / maxActions.length;
            }
        }
    }

    self.init();
    self.generateEpisode();
    return self;
}
