const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // Snake size
let snake = [{ x: 10 * box, y: 10 * box }];
let food = generateFood();
let direction = "RIGHT";
let score = 0;
let gameInterval;
let speed = 150; // Start speed (ms)
let isGameRunning = false;

// Load sound effects
const eatSound = new Audio("eat.mp3");
const gameOverSound = new Audio("gameover.mp3");

// Listen for key presses
document.addEventListener("keydown", changeDirection);
document.addEventListener("keydown", toggleGame);

// Change direction using only letters (A, W, S, D)
function changeDirection(event) {
    const key = event.key.toLowerCase(); // Convert to lowercase for consistency

    if (key === "a" && direction !== "RIGHT") direction = "LEFT";
    else if (key === "w" && direction !== "DOWN") direction = "UP";
    else if (key === "d" && direction !== "LEFT") direction = "RIGHT";
    else if (key === "s" && direction !== "UP") direction = "DOWN";
}

// Start/Pause the game
function toggleGame(event) {
    if (event.keyCode === 32) { // Spacebar to start/pause
        if (isGameRunning) {
            clearInterval(gameInterval);
            isGameRunning = false;
        } else {
            gameInterval = setInterval(drawGame, speed);
            isGameRunning = true;
        }
    }
}

// Generate random food that does not spawn on the snake
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } while (checkCollision(newFood, snake)); 
    return newFood;
}

// Main game loop
function drawGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "lime" : "green";
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });

    // Move snake
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    // Check if snake eats food
    if (headX === food.x && headY === food.y) {
        score++;
        food = generateFood();
        eatSound.play(); 

        // Increase speed every 3 points
        if (score % 3 === 0 && speed > 50) {
            speed -= 10; 
            clearInterval(gameInterval);
            gameInterval = setInterval(drawGame, speed);
        }
    } else {
        snake.pop(); 
    }

    let newHead = { x: headX, y: headY };

    // Check for collisions (walls or itself)
    if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height || checkCollision(newHead, snake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
    document.getElementById("score").innerText = "Score: " + score;
}

// Check if the snake collides with itself
function checkCollision(head, array) {
    return array.some(segment => head.x === segment.x && head.y === segment.y);
}

// Game Over
function gameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    gameOverSound.play(); 

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 4, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 4 + 20, canvas.height / 2 + 40);
    ctx.fillText("Press Space to Restart", canvas.width / 6, canvas.height / 2 + 80);

    // Restart the game on Spacebar
    document.addEventListener("keydown", restartGame);
}

// Restart the game
function restartGame(event) {
    if (event.keyCode === 32) {
        snake = [{ x: 10 * box, y: 10 * box }];
        direction = "RIGHT";
        score = 0;
        speed = 150;
        food = generateFood();
        document.getElementById("score").innerText = "Score: 0";
        document.removeEventListener("keydown", restartGame);
        toggleGame({ keyCode: 32 }); // Restart game
    }
}

// Start game when page loads
setTimeout(() => toggleGame({ keyCode: 32 }), 1000);
