const gameArea = document.getElementById('game-area');
const scoreElement = document.getElementById('score');
const healthElement = document.createElement('div');
const plane = document.createElement('div');
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let gameLoop;
let score = 0;
let health = 3;
let isGameRunning = false;

function initGame() {
    if (isGameRunning) return;
    isGameRunning = true;

    gameArea.innerHTML = '';
    plane.style.cssText = `
        position: absolute;
        width: 40px;
        height: 30px;
        background-color: blue;
        left: 180px;
        bottom: 20px;
        clip-path: polygon(0% 30%, 50% 0%, 100% 30%, 100% 100%, 0% 100%);
    `;
    gameArea.appendChild(plane);

    healthElement.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 18px;
        font-weight: bold;
        color: red;
    `;
    gameArea.appendChild(healthElement);

    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    score = 0;
    health = 3;
    updateScore();
    updateHealth();

    document.addEventListener('keydown', handleKeyDown);
    gameLoop = setInterval(updateGame, 20);
}

function handleKeyDown(e) {
    if (e.key.startsWith('Arrow')) {
        movePlane(e);
    } else if (e.code === 'Space') {
        firePlayerBullet();
    }
}

function movePlane(e) {
    const key = e.key;
    const step = 8; // Increased from 5 to 8 for faster movement
    const rect = plane.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    switch (key) {
        case 'ArrowLeft':
            if (rect.left > gameRect.left) plane.style.left = `${parseInt(plane.style.left) - step}px`;
            break;
        case 'ArrowRight':
            if (rect.right < gameRect.right) plane.style.left = `${parseInt(plane.style.left) + step}px`;
            break;
        case 'ArrowUp':
            if (rect.top > gameRect.top) plane.style.bottom = `${parseInt(plane.style.bottom) + step}px`;
            break;
        case 'ArrowDown':
            if (rect.bottom < gameRect.bottom) plane.style.bottom = `${parseInt(plane.style.bottom) - step}px`;
            break;
    }
}

function firePlayerBullet() {
    const bullet = createBullet(plane, 'green', true);
    playerBullets.push(bullet);
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.style.cssText = `
        position: absolute;
        width: 30px;
        height: 22px;
        background-color: red;
        top: 0;
        left: ${Math.random() * 370}px;
        clip-path: polygon(0% 0%, 50% 100%, 100% 0%);
    `;
    gameArea.appendChild(enemy);
    enemies.push(enemy);
}

function createBullet(shooter, color, isPlayerBullet) {
    const bullet = document.createElement('div');
    const shooterRect = shooter.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    bullet.style.cssText = `
        position: absolute;
        width: 3px;
        height: 8px;
        background-color: ${color};
        left: ${shooterRect.left + shooterRect.width / 2 - gameRect.left - 1.5}px;
        ${isPlayerBullet ? 'bottom' : 'top'}: ${isPlayerBullet ? 
            gameRect.bottom - shooterRect.bottom : 
            shooterRect.bottom - gameRect.top}px;
    `;
    gameArea.appendChild(bullet);
    return bullet;
}

function updateGame() {
    score++;
    updateScore();

    updateBullets(playerBullets, true);
    updateBullets(enemyBullets, false);
    updateEnemies();

    if (Math.random() < 0.02) createEnemy();
    if (Math.random() < 0.05) fireEnemyBullets();
}

function updateBullets(bullets, isPlayerBullet) {
    bullets.forEach((bullet, index) => {
        const pos = parseInt(bullet.style[isPlayerBullet ? 'bottom' : 'top']) || 0;
        if ((isPlayerBullet && pos > 400) || (!isPlayerBullet && pos > 380)) {
            bullet.remove();
            bullets.splice(index, 1);
        } else {
            if (isPlayerBullet) {
                bullet.style.bottom = `${pos + 5}px`;
            } else {
                bullet.style.top = `${pos + 5}px`;
            }
            if (isPlayerBullet) {
                checkPlayerBulletCollision(bullet);
            } else {
                checkEnemyBulletCollision(bullet);
            }
        }
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const top = parseInt(enemy.style.top) || 0;
        if (top > 370) {
            enemy.remove();
            enemies.splice(index, 1);
        } else {
            enemy.style.top = `${top + 1}px`;
            checkEnemyCollision(enemy);
        }
    });
}

function fireEnemyBullets() {
    enemies.forEach(enemy => {
        if (Math.random() < 0.1) {
            const bullet = createBullet(enemy, 'orange', false);
            enemyBullets.push(bullet);
        }
    });
}

function checkPlayerBulletCollision(bullet) {
    const bulletRect = bullet.getBoundingClientRect();
    enemies.forEach((enemy, index) => {
        const enemyRect = enemy.getBoundingClientRect();
        if (
            bulletRect.left < enemyRect.right &&
            bulletRect.right > enemyRect.left &&
            bulletRect.top < enemyRect.bottom &&
            bulletRect.bottom > enemyRect.top
        ) {
            score += 10;
            updateScore();
            bullet.remove();
            playerBullets.splice(playerBullets.indexOf(bullet), 1);
            enemy.remove();
            enemies.splice(index, 1);
        }
    });
}

function checkEnemyBulletCollision(bullet) {
    const bulletRect = bullet.getBoundingClientRect();
    const planeRect = plane.getBoundingClientRect();
    if (
        bulletRect.left < planeRect.right &&
        bulletRect.right > planeRect.left &&
        bulletRect.top < planeRect.bottom &&
        bulletRect.bottom > planeRect.top
    ) {
        bullet.remove();
        enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
        decreaseHealth();
    }
}

function checkEnemyCollision(enemy) {
    const planeRect = plane.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    if (
        planeRect.left < enemyRect.right &&
        planeRect.right > enemyRect.left &&
        planeRect.top < enemyRect.bottom &&
        planeRect.bottom > enemyRect.top
    ) {
        decreaseHealth();
        enemy.remove();
        enemies.splice(enemies.indexOf(enemy), 1);
    }
}

function decreaseHealth() {
    health--;
    updateHealth();
    if (health <= 0) {
        gameOver();
    }
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    document.removeEventListener('keydown', handleKeyDown);
    alert(`Game Over! Your score: ${score}`);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function updateHealth() {
    healthElement.textContent = `Health: ${'❤️'.repeat(health)}`;
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isGameRunning) initGame();
});