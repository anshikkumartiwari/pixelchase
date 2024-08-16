let player1;
let player2;
let goals = [];
let maxGoals = 10;
let score1 = 0;
let score2 = 0;
let singlePlayerMode = true;
let gameStarted = false;
let squares = [];
let timerDuration = 0;
let timerStartTime = 0;
let timerRunning = false;
let timerInterval;

let allowRedReturn = false;
let allowBlueReturn = false;

function startGame() {
    let modeSelector = document.getElementById("mode");
    singlePlayerMode = modeSelector.value === "single";

    player1 = new Player(width / 3, height / 2, 255, 0, 0, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, 'red');
    if (!singlePlayerMode) {
        player2 = new Player(2 * width / 3, height / 2, 0, 0, 255, 87, 83, 68, 65, 'blue');
    }
    for (let i = 0; i < maxGoals; i++) {
        goals[i] = new Goal(random(width), random(height));
    }

    gameStarted = true;
    document.getElementById("container").style.display = "none";
    document.getElementById("header").style.display = "none"; 
    document.getElementById("gameOverlay").style.display = "block"; 

    let timerSelect = document.getElementById("timerSelect");
    let timerValue = timerSelect ? parseInt(timerSelect.value) : 0;
    timerDuration = timerValue * 1000;
    timerStartTime = millis();
    timerRunning = true;
    startTimer();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        let elapsedTime = millis() - timerStartTime;
        let remainingTime = max(0, timerDuration - elapsedTime);

        let seconds = Math.floor(remainingTime / 1000);
        let displayTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        document.getElementById("timerDisplay").innerText = `Time: ${displayTime}`;

        
        if (timerDuration > 0 && remainingTime <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            endGame();
        }
    }, 1000);
}


function endGame() {
    gameStarted = false;
    document.getElementById("gameResult").style.display = "block";
    
    let resultText;
    
    if (singlePlayerMode) {
        resultText = `Time's up! Your score is: ${score1}`;
    } else {
        resultText = `Game Over! Scores: Red ${score1} - Blue ${score2}. `;
        if (score1 > score2) {
            resultText += "Red wins!";
        } else if (score2 > score1) {
            resultText += "Blue wins!";
        } else {
            resultText += "It's a tie!";
        }
    }
    
    document.getElementById("gameResult").innerText = resultText;

    
    document.getElementById("header").style.display = "block";
}



function keyPressed() {
    if (gameStarted) {
        player1.handleKeyPress();
        if (!singlePlayerMode) {
            player2.handleKeyPress();
        }
    }
}

function checkCheatCode() {
    const cheatInput = document.getElementById("cheatInput").value;
    if (cheatInput === "rtrue") {
        allowRedReturn = true;
    } else if (cheatInput === "btrue") {
        allowBlueReturn = true;
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 25; i++) {
        squares.push(new Square());
    }
}

function draw() {
    if (gameStarted) {
        background(0);
        player1.show();
        player1.move();
        if (!singlePlayerMode) {
            player2.show();
            player2.move();
        }

        for (let i = 0; i < goals.length; i++) {
            goals[i].show();
            if (player1.hits(goals[i])) {
                score1++;
                goals[i].newLocation();
            }
            if (!singlePlayerMode && player2.hits(goals[i])) {
                score2++;
                goals[i].newLocation();
            }
        }

        fill(255, 0, 0);
        textSize(16);
        text("Score: " + score1, width - 100, 30);
        if (!singlePlayerMode) {
            fill(0, 0, 255);
            text("Score: " + score2, 30, 30);
        }
    } else {
        background(0);
        for (let i = 0; i < squares.length; i++) {
            squares[i].display();
            squares[i].move();
        }
    }
}

class Player {
    constructor(x, y, r, g, b, upKey, downKey, rightKey, leftKey, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.speed = 1;
        this.angle = 0;
        this.upKey = upKey;
        this.downKey = downKey;
        this.rightKey = rightKey;
        this.leftKey = leftKey;
        this.color = color;
        this.active = true;
    }

    handleKeyPress() {
        if (this.active) {
            if (keyCode === this.upKey) {
                this.speedUp();
            } else if (keyCode === this.downKey) {
                this.speedDown();
            } else if (keyCode === this.rightKey) {
                this.rotate(PI / 4);
            } else if (keyCode === this.leftKey) {
                this.rotate(-PI / 4);
            }
        }
    }

    speedUp() {
        this.speed *= 1.1;
    }

    speedDown() {
        this.speed *= 0.9;
    }

    rotate(angle) {
        this.angle += angle;
    }

    move() {
        if (this.active) {
            this.x += this.speed * cos(this.angle);
            this.y += this.speed * sin(this.angle);
            this.checkBoundary();
        }
    }

    show() {
        fill(this.r, this.g, this.b);
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        rect(0, 0, 10, 10);
        pop();
    }

    checkBoundary() {
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            if (this.color === 'red' && !allowRedReturn) {
                this.active = false;
                allowRedReturn = false; 
            }
            if (this.color === 'blue' && !allowBlueReturn) {
                this.active = false;
                allowBlueReturn = false; 
            }

            
            if (!singlePlayerMode && !allowRedReturn && !allowBlueReturn) {
                endGame();
            }

            
            if (singlePlayerMode && !allowRedReturn) {
                endGame();
            }
        }
    }

    hits(goal) {
        let d = dist(this.x, this.y, goal.x, goal.y);
        return d < 15;
    }
}

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        fill(255);
        rect(this.x, this.y, 10, 10);
    }

    newLocation() {
        this.x = random(width);
        this.y = random(height);
    }
}

class Square {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.speedX = random(-1, 1);
        this.speedY = random(-1, 1);
        this.size = 10;
    }

    display() {
        fill(255);
        rect(this.x, this.y, this.size, this.size);
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = width;
        }
        if (this.y > height) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = height;
        }
    }
}
