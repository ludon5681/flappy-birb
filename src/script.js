WIDTH = 500 // window.innerWidth;
HEIGHT = 500 // window.innerHeight;
console.log(WIDTH, HEIGHT)

var currentScore = 0;

var instance = Crafty.init(WIDTH, HEIGHT, document.getElementById("canvas"))

function startGame() {
    createPlayer();
    makePipes();
    makeScore();
    document.addEventListener("keydown", function(e) {
        if (e.code == "Space") {
            window.player.addComponent("Gravity")
            window.player.gravity("platform")
            window.player.vy = -200;
            window.player.bind("KeyDown", function(e) {
                if (e.key === 32) {
                    this.vy = -300;
                }
            })
            document.getElementById("canvas").addEventListener("click", function() {
                console.log("i")
                window.player.vy = -200;
            })
        }
        for (pipe of bottomPipes) {
            pipe.entity.vx = -100;
        }
        for (pipe of topPipes) {
            pipe.entity.vx = -100;
        }
        for (marker of markers) {
            marker.entity.vx = -100;
        }
    })
}

function refreshGame() {
    
    window.player.destroy();
    createPlayer();
    for (pipe of bottomPipes) {
        pipe.entity.destroy();
    } for (pipe of topPipes) {
        pipe.entity.destroy();
    }
    for (marker of markers) {
        console.log(marker.entity.x + " " + marker.entity.y + " " + marker.entity.h + " " + marker.entity.w)
        marker.entity.destroy();
    }
    bottomPipes = [];
    topPipes = [];
    markers= [];
    makePipes();

    currentScore = 0;
    window.score.text(function() {
        return currentScore.toString();
    })
}

function createPlayer() {
    window.player = Crafty.e("2D, Canvas, Color, Keyboard, Mouse, Gravity, Collision, player")
        .attr({ x: WIDTH / 2, y: HEIGHT / 2, w: 10, h: 10 })
        .color("white")
        .checkHits("pipe, marker")
        .bind("EnterFrame", function() {
            if (this.y + this.h >= HEIGHT | this.y <= 0) {
                refreshGame(this);
            }
        })
        .bind("HitOn", function(hitData) {
            var highScore = document.getElementById("highScore");
            if (hitData[0].obj.w === 1) {
                currentScore++;
                window.score.text(function() {
                    return currentScore.toString();
                })
                if (parseInt(currentScore) > highScore.innerHTML) {
                    highScore.innerHTML = currentScore.toString();
                } 
            } else {
                refreshGame();
            }
        })
}
function checkBottomPipes() {
    return new Promise((res, rej) => {
        var entity = bottomPipes[0].entity
        if (entity.x < 0 - PIPE_WIDTH) {
            entity.x = WIDTH;
            entity.h = Math.floor(Math.random() * 400);
            while (entity.h < (HEIGHT / 100 * 25) | entity.h > HEIGHT - (HEIGHT / 100 * 25)) {
                entity.h = Math.floor(Math.random() * 400);
            }
            entity.y = HEIGHT - entity.h + (PIPES_GAP_VERTICAL / 2);
    
            var pipes = [bottomPipes[0], bottomPipes[1], bottomPipes[2]]
            bottomPipes[0] = pipes[1];
            bottomPipes[1] = pipes[2];
            bottomPipes[2] = pipes[0];
            res(true);
        }
        res(false);
    })
}
async function checkPipePosition() {
    var newPipe = await checkBottomPipes();

    if (newPipe === true) {
        var entity = topPipes[0].entity;
        entity.x = bottomPipes[2].entity.x;
        entity.h = HEIGHT - bottomPipes[2].entity.h;
        entity.y = 0 - (PIPES_GAP_VERTICAL / 2);
    
        var pipes = [topPipes[0], topPipes[1], topPipes[2]]
        topPipes[0] = pipes[1];
        topPipes[1] = pipes[2];
        topPipes[2] = pipes[0];


        var entity = markers[0].entity;
        entity.x = bottomPipes[2].entity.x;
        entity.h = HEIGHT;
        entity.y = 0;
    
        var tempMarkers = [markers[0], markers[1], markers[2]]
        markers[0] = tempMarkers[1];
        markers[1] = tempMarkers[2];
        markers[2] = tempMarkers[0];
    }
}

var NUM_PIPES = 3;
var PIPE_WIDTH = 40;
var PIPES_GAP = WIDTH / NUM_PIPES;
var PIPES_GAP_VERTICAL = 70;
var bottomPipes = [];
var topPipes = [];
var markers = [];
function makePipes() {
    
    for (i = 0; i < NUM_PIPES; i++) {
        var height = Math.floor(Math.random() * 400);
        while (height < (HEIGHT / 100 * 25) | height > HEIGHT - (HEIGHT / 100 * 25)) {
            height = Math.floor(Math.random() * 400);
        }
    
        bottomPipes.push({
            entity: Crafty.e("2D, Canvas, Color, Gravity, Collision, pipe")
                .attr({ x: WIDTH + (i * PIPES_GAP), y: HEIGHT - height + (PIPES_GAP_VERTICAL / 2), w: PIPE_WIDTH, h: height })
                .color("white")
                .bind("EnterFrame", function() {
                    checkPipePosition();
                })
        })
    }

    for (i = 0; i < NUM_PIPES; i++) {
        var height = HEIGHT - bottomPipes[i].entity.h;
    
        topPipes.push({
            entity: Crafty.e("2D, Canvas, Color, Gravity, Collision, pipe")
                .attr({ x: WIDTH + (i * PIPES_GAP), y: 0 - (PIPES_GAP_VERTICAL / 2), w: PIPE_WIDTH, h: height })
                .color("white")
        })
    }

    for (i = 0; i < NUM_PIPES; i++) {
        markers.push({ entity: Crafty.e("2D, Canvas, Gravity, Collision, marker")
            .attr({ x: WIDTH + (i * PIPES_GAP), y: 0, h: HEIGHT, w: 1 })
        })
    }
}

function makeScore() {
    var scoreSize = 30;
    window.score = Crafty.e("2D, Canvas, Text")
        .attr({ x: WIDTH / 2, y: HEIGHT / 8 })
        .text(function() {
            return currentScore.toString();
        })
        .textAlign("center")
        .textColor("white")
        .textFont({ size: `${scoreSize}px` });
}


startGame();