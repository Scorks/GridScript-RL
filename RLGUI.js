RLGUI = function (container, map) {

    var self = GUI(container);
    self.env = Environment(map);
    self.pixelWidth = 640;
    self.pixelHeight = 640;
    self.sqSize = self.pixelWidth / self.env.width;

    // the colors used to draw the map
    self.colors = ["#777777", "#00ff00", "#0000ff"];

    self.episodeTimer = 100;
    self.episode = [];
    self.lastEpisodeUpdate = performance.now();
    self.mouse = 'print';

    // draw the foreground, is called every 'frame'
    self.draw = function () {


        // start the draw timer
        var t0 = performance.now();
        // clear the foreground to white
        self.fg_ctx.clearRect(0, 0, self.bg.width, self.bg.height);

        // draw the tiles
        for (x = 0; x < self.env.width; x++) {
            for (y = 0; y < self.env.height; y++) {
                switch (self.env.get(x,y)) {
                    case 'X': self.drawTile(x, y, '#333333'); break;
                    case 'T': self.drawTile(x, y, '#00ff00'); break;
                }
            }
        }

        // draw the episode position
        if (self.episode.length > 0) {
            let x = parseInt((self.episode[0][0][0] + 0.5) * self.sqSize);
            let y = parseInt((self.episode[0][0][1] + 0.5) * self.sqSize);
            self.drawCircle(x, y, self.sqSize/3, '#ff0000', '#ff0000')
        }

        // draw the policy
        self.fg_ctx.fillStyle = "#000000";
        for (x = 0; x < self.env.width; x++) {
            for (y = 0; y < self.env.height; y++) {

                for (a = 0; a < self.env.actions.length; a++) {
                    if (self.env.get(x,y) == 'X') { continue; }
                    if (self.env.get(x,y) == 'T') { continue; }
                    self.drawPolicyLine(x, y, self.env.actions[a], self.mc.P[x][y][a]);
                }
            }
        }

        // draw horizontal lines
        self.fg_ctx.fillStyle = "#000000";
        for (y = 0; y <= self.env.height; y++) {
            self.fg_ctx.fillRect(0, y * self.sqSize, self.fg.width, 1);
        }
        for (x = 0; x <= self.env.width; x++) {
            self.fg_ctx.fillRect(x * self.sqSize, 0, 1, self.fg.height);
        }

        // do episode timer update
        let time = performance.now();
        if (self.episode.length > 0 && ((time - self.lastEpisodeUpdate) > self.episodeTimer)) {
            self.episode.shift();
            self.lastEpisodeUpdate = time;
        }
    }

    self.drawPolicyLine = function(x, y, a, p) {
        if (p == 0) { return; }
        let px = parseInt((x + 0.5) * self.sqSize);
        let py = parseInt((y + 0.5) * self.sqSize);
        let width = self.sqSize*a[0] * p * 0.45;
        let height = self.sqSize*a[1] * p * 0.45;
        if (width == 0) { width = 1; }
        if (height == 0) { height = 1; }
        self.fg_ctx.fillRect(px, py, width, height);
    }

    self.drawTile = function (x, y, color) {
        self.fg_ctx.fillStyle = color;
        self.fg_ctx.fillRect(x * self.sqSize, y * self.sqSize, self.sqSize, self.sqSize);
    }

    self.drawCircle = function(x, y, radius, fillColor, borderColor, borderWidth) {
        self.fg_ctx.fillStyle = fillColor;
        self.fg_ctx.strokeStyle = borderColor;
        self.fg_ctx.beginPath();
        self.fg_ctx.arc(x, y, radius, 0, 2*Math.PI, false);
        self.fg_ctx.fill();
        self.fg_ctx.lineWidth = borderWidth;
        self.fg_ctx.stroke();
    }

    self.doEpisodes = function() {

        let config = self.getConfig();
        self.mc.config = config;

        for (i=0; i<config.episodes; i++) {
            let episode = self.mc.generateEpisode();
            self.mc.updateValues(episode);
            self.mc.updatePolicy(episode);
        }

        episode = self.mc.generateEpisode();
        self.episode = episode;
    }

    self.getConfig = function() {
        return {
            stepSize        : parseFloat(document.getElementById('selectstep').value),
            episodes        : parseInt(document.getElementById('selectepisodes').value),
            maxEpisodeTime  : parseInt(document.getElementById('selecttime').value),
            numPucks        : parseInt(document.getElementById('selectPucks').value)
        };
    }


    setMouse = function(method) {
        self.mouse = method;
    }

    self.addEventListeners = function() {

        self.fg.addEventListener('mousedown', function (evt) {
            var mousePos = self.getMousePos(self.fg, evt);
            var x = Math.floor(mousePos.x / self.sqSize);
            var y = Math.floor(mousePos.y / self.sqSize);
            if (evt.which == 1) {
                if (self.mouse == 'print') {
                    console.log('Values[' + x + '][' + y + ']:\n', self.mc.Q[x][y]);
                    console.log('Policy[' + x + '][' + y + ']:\n', self.mc.P[x][y]);
                }
                else if (self.mouse == 'wall') { self.env.set(x, y, 'X'); }
                else if (self.mouse == 'clear') { self.env.set(x, y, -1); }
                else if (self.mouse == 'terminal') { self.env.set(x, y, 'T'); }
            }
        }, false);

        self.fg.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    self.setHTML = function() {
        self.createCanvas(self.env.width * self.sqSize + 1, self.env.height * self.sqSize + 1);
        self.bannerDiv  = self.create('div', 'BannerContainer',    self.fg.width + 30,   0, 400,  40);
        self.controlDiv = self.create('div', 'ControlContainer',   self.fg.width + 30,  60, 400, 600);

        self.bannerDiv.innerHTML  = "<b>GridWorld Monte-Carlo ES RL with Pucks";
        self.controlDiv.innerHTML += "<label id='labelmouse'>Mouse Mode:</label>";
        self.controlDiv.innerHTML += "<label id='labelstep'>Step Size:</label>";
        self.controlDiv.innerHTML += "<label id='labeltime'>Max Episode Time:</label>";
        self.controlDiv.innerHTML += "<label id='labelepisodes'>Num Episodes:</label>";
        self.controlDiv.innerHTML += "<label id='labelPucks'>Num Pucks:</label>"; // PUCK ADDITION
        self.controlDiv.innerHTML += "<select id='selectmouse' onchange='setMouse(value)';> \
                                        <option value='print'>Print Values</option> \
                                        <option value='wall'>Insert Wall</option> \
                                        <option value='clear'>Insert Clear</option> \
                                        <option value='terminal'>Insert Terminal</option></select>";
        self.controlDiv.innerHTML += "<input id='selectstep' type='number' min='0' max='1' step='0.1' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectepisodes' type='number' min='1' max='100000' step='1' value='1'>";
        self.controlDiv.innerHTML += "<input id='selecttime' type='number' min='1' max='1000' step='1' value='100'>";
        self.controlDiv.innerHTML += "<input id='selectPucks' type='number' min='0' max='2' step='1' value='0'>";

        self.controlDiv.innerHTML += "<button id='graphButton'>Perform Policy Iteration</button>";


        var stylePrefix = 'position:absolute;';
        var ch = '25px', c1l = '0px', c2l = '150px', c3l = '425px', c1w = '140px', c2w = '250px', c3w = '150px';

        document.getElementById('labelmouse').style     = stylePrefix + ' left:' + c1l + '; top:0;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectmouse').style    = stylePrefix + ' left:' + c2l + '; top:0;   width:' + c2w + '; height:' + ch + ';';

        document.getElementById('labelstep').style      = stylePrefix + ' left:' + c1l + '; top:40;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selectstep').style    = stylePrefix + ' left:' + c2l + '; top:40;   width:' + c2w + '; height:' + ch + '; text-align: center;';

        document.getElementById('labelepisodes').style  = stylePrefix + ' left:' + c1l + '; top:80;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectepisodes').style = stylePrefix + ' left:' + c2l + '; top:80;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        document.getElementById('labeltime').style      = stylePrefix + ' left:' + c1l + '; top:120;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selecttime').style     = stylePrefix + ' left:' + c2l + '; top:120;   width:' + c2w + '; height:' + ch + '; text-align: center;';

        document.getElementById('labelPucks').style      = stylePrefix + ' left:' + c1l + '; top:160;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectPucks').style     = stylePrefix + ' left:' + c2l + '; top:160;   width:' + c2w + '; height:' + ch + '; text-align: center;';

        document.getElementById('graphButton').style    = stylePrefix + ' left:0px; top:200;  width:200px' + '; height:' + ch + ';';

        document.getElementById('graphButton').onclick  = function() { self.doEpisodes(); }
    }

    self.setHTML();
    self.addEventListeners();
    self.mc = RLMC(self.env, self.getConfig());

    return self;
}
