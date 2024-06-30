let player1;
let player2;
let goals = [];
let maxGoals = 10;
let score1 = 0;
let score2 = 0;
let singlePlayerMode = true;
let gameStarted = false;
let squares = [];
let disintegrateSquares = [];
let disintegrateText;
let disintegrate = false;

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
    startDisintegration();
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
            text("Score: " + score2, 30, 30);re
        }
    } else {
        background(0);

        for (let i = 0; i < squares.length; i++) {
            squares[i].display();
            squares[i].move();
        }
    }

    if (disintegrate) {
        disintegrateText.show();
        for (let i = disintegrateSquares.length - 1; i >= 0; i--) {
            disintegrateSquares[i].display();
            disintegrateSquares[i].fall();
            if (disintegrateSquares[i].offScreen()) {
                disintegrateSquares.splice(i, 1);
            }
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
            }
            if (this.color === 'blue' && !allowBlueReturn) {
                this.active = false;
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

class DisintegrateText {
    constructor(x, y, size, text) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.text = text;
    }

    show() {
        fill(255);
        textSize(this.size);
        text(this.text, this.x, this.y);
    }
}

class DisintegrateSquare {
    constructor(x, y, speedY) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speedY = speedY;
    }

    display() {
        fill(255);
        rect(this.x, this.y, this.size, this.size);
    }

    fall() {
        this.y += this.speedY;
    }

    offScreen() {
        return this.y > height;
    }
}

function startDisintegration() {
    const textElem = document.getElementById('disintegrate');
    textElem.style.display = 'none'; // Hide the original text element

    const x = 5 * windowWidth / 100; // Set to your text's position (padding left)
    const y = 5.5 * windowWidth / 100; // Set to your text's position (padding top)
    const size = 2 * windowWidth / 100; // 3vw converted to pixels
    const text = "                  ";

    disintegrateText = new DisintegrateText(x, y, size, text);

    for (let i = 0; i < 100; i++) {
        const dx = x + (i % text.length) * 20; // Adjust spacing as needed
        const dy = y + Math.floor(i / text.length) * 20;
        const speedY = random(1, 3);
        disintegrateSquares.push(new DisintegrateSquare(dx, dy, speedY));
    }

    disintegrate = true;
}
