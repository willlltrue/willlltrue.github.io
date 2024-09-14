// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const wordInput = document.getElementById('wordInput');

// Game variables
const WIDTH = 800;
const HEIGHT = 600;
let score = 0;
let gameOver = false;
let gameWon = false;
let gameStarted = false;
let obstacles = [];
let words = [];

// Colors
const WHITE = 'white';
const BLACK = 'black';
const GREEN = 'green';
const BROWN = '#8B4513';
const ORANGE = 'orange';
const RED = 'red';

// Rabbit properties
const rabbitWidth = 50;
const rabbitHeight = 50;
let rabbitX = WIDTH / 2 - rabbitWidth / 2;
const rabbitY = HEIGHT - rabbitHeight - 20;
const rabbitSpeed = 5;
let rabbitHealth = 3;

// Obstacle properties
const obstacleWidth = 80;
const obstacleHeight = 40;
const obstacleSpeed = 3;

// Load sounds
const backgroundMusic = new Audio('background_music.mp3');
const rockHitSound = new Audio('rock_hit.mp3');
const carrotPickupSound = new Audio('carrot_pickup.mp3');
const bombExplosionSound = new Audio('bomb_explosion.mp3');
const hopSound = new Audio('hop.mp3');

backgroundMusic.loop = true;
backgroundMusic.play();

function drawButton(text, x, y, width, height, inactiveColor, activeColor) {
    ctx.fillStyle = (x < mouseX && mouseX < x + width && y < mouseY && mouseY < y + height) ? activeColor : inactiveColor;
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = BLACK;
    ctx.font = '24px "Noto Sans SC", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
}

function drawRabbit(x, y) {
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(x + rabbitWidth / 2, y + rabbitHeight / 2, rabbitWidth / 2, rabbitHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ears
    ctx.beginPath();
    ctx.ellipse(x + 20, y - 10, 10, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 10, 10, 20, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacle(obstacle) {
    if (obstacle.type === 'rock') {
        ctx.fillStyle = BROWN;
        ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    } else if (obstacle.type === 'carrot') {
        ctx.fillStyle = ORANGE;
        ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
        ctx.fillStyle = BLACK;
        ctx.font = '16px "Noto Sans SC", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obstacle.word, obstacle.x + obstacleWidth / 2, obstacle.y + obstacleHeight / 2);
    } else { // bomb
        ctx.fillStyle = BLACK;
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacleWidth / 2, obstacle.y + obstacleHeight / 2, obstacleWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Fuse
        ctx.strokeStyle = BROWN;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacleWidth / 2, obstacle.y + obstacleHeight / 4);
        ctx.lineTo(obstacle.x + 3 * obstacleWidth / 4, obstacle.y);
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacleWidth / 3, obstacle.y + obstacleHeight / 3, obstacleWidth / 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function showGameOver() {
    ctx.fillStyle = BLACK;
    ctx.font = '48px "Noto Sans SC", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', WIDTH / 2, HEIGHT / 2 - 50);
}

function showGameWon() {
    ctx.fillStyle = BLACK;
    ctx.font = '48px "Noto Sans SC", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('你赢了！', WIDTH / 2, HEIGHT / 2 - 50);
}

function getWords() {
    return new Promise(resolve => {
        const words = [];
        let currentWord = '';
        
        function drawInputScreen() {
            ctx.fillStyle = GREEN;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            
            ctx.fillStyle = BLACK;
            ctx.font = '24px "Noto Sans SC", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`请输入第 ${words.length + 1} 个单词:`, WIDTH / 2, HEIGHT / 2 - 50);
            
            ctx.fillStyle = WHITE;
            ctx.fillRect(WIDTH / 2 - 100, HEIGHT / 2 - 20, 200, 40);
            ctx.strokeStyle = BLACK;
            ctx.strokeRect(WIDTH / 2 - 100, HEIGHT / 2 - 20, 200, 40);
            
            ctx.fillStyle = BLACK;
            ctx.textAlign = 'left';
            ctx.fillText(currentWord, WIDTH / 2 - 90, HEIGHT / 2 + 5);
        }
        
        function handleInput() {
            wordInput.style.display = 'block';
            wordInput.value = '';
            wordInput.focus();
            
            function updateWord() {
                currentWord = wordInput.value;
                drawInputScreen();
            }
            
            wordInput.addEventListener('input', updateWord);
            
            function handleKeydown(e) {
                if (e.key === 'Enter' && currentWord.trim()) {
                    words.push(currentWord.trim());
                    currentWord = '';
                    wordInput.value = '';
                    if (words.length === 5) {
                        wordInput.removeEventListener('input', updateWord);
                        wordInput.removeEventListener('keydown', handleKeydown);
                        wordInput.style.display = 'none';
                        resolve(words);
                    } else {
                        drawInputScreen();
                        wordInput.focus();
                    }
                }
            }
            
            wordInput.addEventListener('keydown', handleKeydown);
            
            drawInputScreen();
        }
        
        handleInput();
    });
}

let mouseX = 0;
let mouseY = 0;
let mousePressed = false;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    mousePressed = true;
});

canvas.addEventListener('mouseup', () => {
    mousePressed = false;
});

async function gameLoop() {
    if (!gameStarted) {
        if (words.length < 5) {
            canvas.style.display = 'none';
            wordInput.style.display = 'block';
            words = await getWords();
            canvas.style.display = 'block';
            wordInput.style.display = 'none';
        } else {
            ctx.fillStyle = GREEN;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            drawButton('开始游戏', WIDTH / 2 - 100, HEIGHT / 2 - 25, 200, 50, '#C8C8C8', '#969696');
            if (mousePressed && WIDTH / 2 - 100 < mouseX && mouseX < WIDTH / 2 + 100 && HEIGHT / 2 - 25 < mouseY && mouseY < HEIGHT / 2 + 25) {
                gameStarted = true;
                gameOver = false;
                gameWon = false;
                score = 0;
                rabbitHealth = 3;
                rabbitX = WIDTH / 2 - rabbitWidth / 2;
                obstacles = [];
            }
        }
    } else if (!gameOver && !gameWon) {
        // Move rabbit
        if (keys.ArrowLeft && rabbitX > 0) {
            rabbitX -= rabbitSpeed;
            hopSound.play();
        }
        if (keys.ArrowRight && rabbitX < WIDTH - rabbitWidth) {
            rabbitX += rabbitSpeed;
            hopSound.play();
        }

        // Spawn obstacles
        if (Math.random() < 1/60) {
            const obstacleType = ['rock', 'carrot', 'bomb'][Math.floor(Math.random() * 3)];
            const obstacle = {
                x: Math.random() * (WIDTH - obstacleWidth),
                y: -obstacleHeight,
                type: obstacleType
            };
            if (obstacleType === 'carrot') {
                obstacle.word = words[Math.floor(Math.random() * words.length)];
            }
            obstacles.push(obstacle);
        }

        // Move and remove obstacles
        obstacles = obstacles.filter(obstacle => {
            obstacle.y += obstacleSpeed;
            return obstacle.y <= HEIGHT;
        });

        // Check for collisions
        obstacles = obstacles.filter(obstacle => {
            if (rabbitX < obstacle.x + obstacleWidth &&
                rabbitX + rabbitWidth > obstacle.x &&
                rabbitY < obstacle.y + obstacleHeight &&
                rabbitY + rabbitHeight > obstacle.y) {
                if (obstacle.type === 'rock') {
                    rabbitHealth--;
                    rockHitSound.play();
                } else if (obstacle.type === 'carrot') {
                    rabbitHealth = Math.min(rabbitHealth + 1, 3);
                    score++;
                    carrotPickupSound.play();
                } else { // bomb
                    gameOver = true;
                    bombExplosionSound.play();
                }
                return false;
            }
            return true;
        });

        if (rabbitHealth <= 0) {
            gameOver = true;
        }

        if (score >= 20) {
            gameWon = true;
        }

        // Draw everything
        ctx.fillStyle = GREEN;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        drawRabbit(rabbitX, rabbitY);
        obstacles.forEach(drawObstacle);

        // Display score and health
        ctx.fillStyle = BLACK;
        ctx.font = '24px "Noto Sans SC", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`分数: ${score}`, 10, 30);
        ctx.fillText(`生命: ${rabbitHealth}`, 10, 60);
    }

    if (gameOver) {
        showGameOver();
        drawButton('再玩一次', WIDTH / 2 - 100, HEIGHT / 2 + 50, 200, 50, '#C8C8C8', '#969696');
        if (mousePressed && WIDTH / 2 - 100 < mouseX && mouseX < WIDTH / 2 + 100 && HEIGHT / 2 + 50 < mouseY && mouseY < HEIGHT / 2 + 100) {
            gameStarted = true;
            gameOver = false;
            gameWon = false;
            score = 0;
            rabbitHealth = 3;
            rabbitX = WIDTH / 2 - rabbitWidth / 2;
            obstacles = [];
        }
    } else if (gameWon) {
        showGameWon();
        drawButton('再玩一次', WIDTH / 2 - 100, HEIGHT / 2 + 50, 200, 50, '#C8C8C8', '#969696');
        if (mousePressed && WIDTH / 2 - 100 < mouseX && mouseX < WIDTH / 2 + 100 && HEIGHT / 2 + 50 < mouseY && mouseY < HEIGHT / 2 + 100) {
            gameStarted = true;
            gameOver = false;
            gameWon = false;
            score = 0;
            rabbitHealth = 3;
            rabbitX = WIDTH / 2 - rabbitWidth / 2;
            obstacles = [];
        }
    }

    requestAnimationFrame(gameLoop);
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

gameLoop();