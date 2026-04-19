const CONFIG = {
    difficulty: {
        easy: {
            initialSpeed: 1.5,
            speedIncrease: 0.0003,
            enemyCount: 8,
            enemySpeedMultiplier: 1
        },
        medium: {
            initialSpeed: 2,
            speedIncrease: 0.0005,
            enemyCount: 12,
            enemySpeedMultiplier: 1.1
        },
        hard: {
            initialSpeed: 2.5,
            speedIncrease: 0.0007,
            enemyCount: 15,
            enemySpeedMultiplier: 1.2
        }
    },
    lives: 3,
    playerStartSize: 20,
    minEnemySize: 15,
    maxEnemySize: 60,
    growthRate: 0.5,
    smallEnemyRatio: 0.65,
    colors: {
        player: '#FFD700',
        enemySmaller: '#4ade80',
        enemyBigger: '#ef4444',
        water: ['#1e3a5f', '#2d5a8c', '#3a7bc8'],
        bubble: 'rgba(255, 255, 255, 0.3)',
        uiText: '#f8fafc',
        uiMuted: 'rgba(255, 255, 255, 0.6)',
        uiPanel: 'rgba(3, 18, 38, 0.55)',
        uiAccent: '#fbbf24'
    }
};

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    HIGHSCORES: 'highScores',
    RESPAWNING: 'respawning'
};

const HIGH_SCORE_KEY = 'crazyFishHighScores';

let currentState = GameState.MENU;
let selectedDifficulty = 'medium';
let canvas;
let ctx;
let player;
let enemies = [];
let particles = [];
let bubbles = [];
let powerUps = [];
let score = 0;
let startTime = 0;
let currentSpeed = 2;
let animationId;
let pausedAt = 0;
let totalPaused = 0;
let playerBoostUntil = 0;
let playerShieldUntil = 0;
let nextPowerUpAt = 0;
let speedPowerUpCount = 0;
let shieldPowerUpCount = 0;
let lives = CONFIG.lives;
let highScores = [];
let uiButtons = [];
let mouse = { x: 0, y: 0 };
let gameOverTimeMs = 0;
let respawnUntil = 0;
let respawnStartedAt = 0;
let menuBackground = null;

const getCtx = () => ctx;
const getCanvas = () => canvas;
const getPlayerSize = () => (player ? player.size : CONFIG.playerStartSize);
const getCurrentSpeed = () => currentSpeed;

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function getFishStyle(size, isPlayer, isSmaller) {
    if (isPlayer) {
        return {
            bodyDark: '#c0840a',
            bodyMid: '#facc15',
            bodyLight: '#fff0a8',
            fin: '#f59e0b',
            stroke: '#b45309',
            stripe: '#b45309',
            highlight: 'rgba(255, 255, 255, 0.7)'
        };
    }

    if (isSmaller) {
        return {
            bodyDark: size < 22 ? '#0f766e' : '#16a34a',
            bodyMid: size < 22 ? '#14b8a6' : '#4ade80',
            bodyLight: size < 22 ? '#99f6e4' : '#bbf7d0',
            fin: size < 22 ? '#0d9488' : '#22c55e',
            stroke: size < 22 ? '#0f766e' : '#15803d',
            stripe: size < 22 ? '#0f766e' : '#166534',
            highlight: 'rgba(255, 255, 255, 0.6)'
        };
    }

    return {
        bodyDark: size < 40 ? '#9f1239' : '#7f1d1d',
        bodyMid: size < 40 ? '#f43f5e' : '#ef4444',
        bodyLight: size < 40 ? '#fecdd3' : '#fecaca',
        fin: size < 40 ? '#e11d48' : '#dc2626',
        stroke: size < 40 ? '#881337' : '#7f1d1d',
        stripe: size < 40 ? '#881337' : '#991b1b',
        highlight: 'rgba(255, 255, 255, 0.55)'
    };
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    menuBackground = new Image();
    menuBackground.src = 'assets/images/background_menu fish.png';

    resizeCanvas();
    highScores = loadHighScores();
    setupEventListeners();
    startLoop();
}

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
}

function handleKeyDown(e) {
    if (e.key in keys) {
        e.preventDefault();
        keys[e.key] = true;
        return;
    }
    if (currentState === GameState.PLAYING) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            togglePause();
        }
        return;
    }
    if (currentState === GameState.PAUSED) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            resumeGame();
        } else if (e.key === 'm' || e.key === 'M') {
            quitRunToMenu();
        }
        return;
    }
    if (currentState === GameState.MENU) {
        if (e.key === '1') selectedDifficulty = 'easy';
        if (e.key === '2') selectedDifficulty = 'medium';
        if (e.key === '3') selectedDifficulty = 'hard';
        if (e.key === 'Enter') startGame();
        if (e.key === 'h' || e.key === 'H') showHighScores();
        return;
    }
    if (currentState === GameState.GAME_OVER) {
        if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') startGame();
        if (e.key === 'm' || e.key === 'M') showMenu();
        if (e.key === 'h' || e.key === 'H') showHighScores();
        return;
    }
    if (currentState === GameState.HIGHSCORES) {
        if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') showMenu();
    }
}

function handleKeyUp(e) {
    if (e.key in keys) {
        e.preventDefault();
        keys[e.key] = false;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}

function handleCanvasClick() {
    const button = getButtonAt(mouse.x, mouse.y);
    if (button && typeof button.onClick === 'function') {
        button.onClick();
    }
}

function isRunActive() {
    return currentState === GameState.PLAYING
        || currentState === GameState.PAUSED
        || currentState === GameState.RESPAWNING;
}

function recordCurrentRunScore(timeMs = getGameTime()) {
    addHighScore({
        score,
        timeMs,
        difficulty: selectedDifficulty,
        date: Date.now()
    });
}

function quitRunToMenu() {
    if (isRunActive()) {
        recordCurrentRunScore();
    }
    showMenu();
}

function showMenu() {
    currentState = GameState.MENU;
    resetPauseState();
}

function showHighScores() {
    currentState = GameState.HIGHSCORES;
    resetPauseState();
}

function startGame() {
    currentState = GameState.PLAYING;
    score = 0;
    startTime = Date.now();
    resetPauseState();

    const diff = CONFIG.difficulty[selectedDifficulty];
    currentSpeed = diff.initialSpeed;
    lives = CONFIG.lives;
    gameOverTimeMs = 0;

    player = new Fish(
        canvas.width / 2,
        canvas.height / 2,
        CONFIG.playerStartSize,
        true,
        getFishStyle,
        getPlayerSize,
        isBoostActive,
        isShieldActive,
        getCurrentSpeed,
        getCtx
    );

    enemies = [];
    const totalEnemies = CONFIG.difficulty[selectedDifficulty].enemyCount;
    const targetSmall = getTargetSmallEnemies(totalEnemies);
    for (let i = 0; i < totalEnemies; i++) {
        const type = i < targetSmall ? 'small' : 'big';
        createEnemy(type);
    }

    particles = [];
    bubbles = [];
    powerUps = [];
    playerBoostUntil = 0;
    playerShieldUntil = 0;
    scheduleNextPowerUp();
    speedPowerUpCount = 0;
    shieldPowerUpCount = 0;
}

function createEnemy(sizeType = 'any') {
    let x;
    let y;
    const size = getEnemySize(sizeType);

    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0:
            x = Math.random() * canvas.width;
            y = -size;
            break;
        case 1:
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            break;
        case 2:
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            break;
        case 3:
            x = -size;
            y = Math.random() * canvas.height;
            break;
        default:
            x = Math.random() * canvas.width;
            y = -size;
            break;
    }

    enemies.push(
        new Fish(
            x,
            y,
            size,
            false,
            getFishStyle,
            getPlayerSize,
            isBoostActive,
            isShieldActive,
            getCurrentSpeed,
            getCtx
        )
    );
}

function startLoop() {
    const loop = () => {
        animationId = requestAnimationFrame(loop);
        tick();
    };
    loop();
}

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updateBubbles();

    if (currentState === GameState.PLAYING) {
        updatePowerUps();
        updatePlayer();
        ensureSmallEnemyMajority();
        updateEnemies();
        checkCollisions();
        checkPowerUpPickup();
        updateParticles();
        updateSpeed();
        drawHUD();
    } else {
        drawAmbientParticles();
        if (currentState === GameState.MENU) {
            drawMenu();
        } else if (currentState === GameState.PAUSED) {
            drawHUD();
            drawPauseOverlay();
        } else if (currentState === GameState.RESPAWNING) {
            drawHUD();
            drawRespawnOverlay();
        } else if (currentState === GameState.GAME_OVER) {
            drawGameOver();
        } else if (currentState === GameState.HIGHSCORES) {
            drawHighScores();
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, CONFIG.colors.water[0]);
    gradient.addColorStop(0.5, CONFIG.colors.water[1]);
    gradient.addColorStop(1, CONFIG.colors.water[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = i * (canvas.height / 5);
        for (let x = 0; x <= canvas.width; x += 10) {
            const wave = Math.sin((x + Date.now() * 0.001 * (i + 1)) * 0.01) * 10;
            if (x === 0) {
                ctx.moveTo(x, y + wave);
            } else {
                ctx.lineTo(x, y + wave);
            }
        }
        ctx.stroke();
    }
}

function updatePlayer() {
    const speed = isBoostActive() ? 6.5 : 4;
    player.vx = 0;
    player.vy = 0;

    if (keys.ArrowLeft) player.vx = -speed;
    if (keys.ArrowRight) player.vx = speed;
    if (keys.ArrowUp) player.vy = -speed;
    if (keys.ArrowDown) player.vy = speed;

    if (player.vx !== 0 && player.vy !== 0) {
        const diagonal = Math.sqrt(2);
        player.vx /= diagonal;
        player.vy /= diagonal;
    }

    player.update();

    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

    player.draw();
}

function updateEnemies() {
    const diff = CONFIG.difficulty[selectedDifficulty];

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        const speedMult = diff.enemySpeedMultiplier;
        enemy.vx *= speedMult / (speedMult * 0.99 + 0.01);
        enemy.vy *= speedMult / (speedMult * 0.99 + 0.01);

        enemy.update();
        enemy.draw();

        if (enemy.x < -100 || enemy.x > canvas.width + 100 ||
            enemy.y < -100 || enemy.y > canvas.height + 100) {
            enemies.splice(i, 1);
            createEnemy(pickEnemyTypeForBalance());
        }
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size + enemy.size - 10) {
            const sizeEpsilon = 0.5;
            if (enemy.size <= player.size + sizeEpsilon) {
                score += Math.floor(enemy.size);
                player.size += CONFIG.growthRate;
                createParticles(enemy.x, enemy.y, CONFIG.colors.enemySmaller, 15);
                enemies.splice(i, 1);
                createEnemy();
            } else {
                if (isShieldActive()) {
                    createParticles(enemy.x, enemy.y, '#22c55e', 20);
                    enemies.splice(i, 1);
                    createEnemy();
                } else {
                    loseLife();
                }
            }
        }
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);

        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function updateBubbles() {
    if (Math.random() < 0.3) {
        bubbles.push(new Bubble(getCanvas));
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].update();
        bubbles[i].draw(ctx, CONFIG.colors.bubble);

        if (bubbles[i].isDead()) {
            bubbles.splice(i, 1);
        }
    }
}

function getGameTime() {
    if (!startTime) return 0;
    if (currentState === GameState.PAUSED && pausedAt) {
        return pausedAt - startTime - totalPaused;
    }
    if (currentState === GameState.RESPAWNING && respawnStartedAt) {
        return respawnStartedAt - startTime - totalPaused;
    }
    return Date.now() - startTime - totalPaused;
}

function isBoostActive() {
    return getGameTime() < playerBoostUntil;
}

function isShieldActive() {
    return getGameTime() < playerShieldUntil;
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    createParticles(player.x, player.y, CONFIG.colors.enemyBigger, 30);
    gameOverTimeMs = getGameTime();
    recordCurrentRunScore(gameOverTimeMs);
}

function scheduleNextPowerUp() {
    const now = getGameTime();
    const delay = 7000 + Math.random() * 7000;
    nextPowerUpAt = now + delay;
}

function updatePowerUps() {
    const now = getGameTime();
    if (now >= nextPowerUpAt && powerUps.length < 2) {
        let type;
        if (speedPowerUpCount === shieldPowerUpCount) {
            type = Math.random() < 0.5 ? 'speed' : 'shield';
        } else {
            type = speedPowerUpCount < shieldPowerUpCount ? 'speed' : 'shield';
        }
        powerUps.push(new PowerUp(type, getCanvas, getGameTime));
        if (type === 'speed') {
            speedPowerUpCount++;
        } else {
            shieldPowerUpCount++;
        }
        scheduleNextPowerUp();
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const item = powerUps[i];
        item.update();
        item.draw(ctx);
        if (item.isExpired()) {
            powerUps.splice(i, 1);
        }
    }
}

function checkPowerUpPickup() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const item = powerUps[i];
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.size + item.size) {
            powerUps.splice(i, 1);
            if (item.type === 'shield') {
                activateShield();
            } else {
                activateSpeedBoost();
            }
        }
    }
}

function activateSpeedBoost() {
    const now = getGameTime();
    playerBoostUntil = Math.max(playerBoostUntil, now + 10000);
}

function activateShield(duration = 10000) {
    const now = getGameTime();
    playerShieldUntil = Math.max(playerShieldUntil, now + duration);
}

function resetPauseState() {
    pausedAt = 0;
    totalPaused = 0;
    respawnUntil = 0;
    respawnStartedAt = 0;
    Object.keys(keys).forEach((k) => {
        keys[k] = false;
    });
}

function pauseGame() {
    if (currentState !== GameState.PLAYING) return;
    currentState = GameState.PAUSED;
    pausedAt = Date.now();
    Object.keys(keys).forEach((k) => {
        keys[k] = false;
    });
}

function resumeGame() {
    if (currentState !== GameState.PAUSED) return;
    totalPaused += Date.now() - pausedAt;
    pausedAt = 0;
    currentState = GameState.PLAYING;
}

function togglePause() {
    if (currentState === GameState.PLAYING) {
        pauseGame();
    } else if (currentState === GameState.PAUSED) {
        resumeGame();
    }
}

function getTargetSmallEnemies(total) {
    return Math.max(Math.floor(total * CONFIG.smallEnemyRatio), Math.floor(total / 2) + 1);
}

function getEnemySize(type) {
    const min = CONFIG.minEnemySize;
    const max = CONFIG.maxEnemySize;
    const playerSize = player ? player.size : CONFIG.playerStartSize;

    if (type === 'small') {
        const upper = Math.max(min, Math.min(max, playerSize * 0.9));
        return Math.random() * (upper - min) + min;
    }

    if (type === 'big') {
        const lower = Math.min(max, Math.max(min, playerSize * 1.1));
        if (lower >= max) return max;
        return Math.random() * (max - lower) + lower;
    }

    return Math.random() * (max - min) + min;
}

function pickEnemyTypeForBalance() {
    const total = enemies.length;
    const targetSmall = getTargetSmallEnemies(total + 1);
    const smallCount = enemies.filter(e => e.size < player.size).length;
    if (smallCount < targetSmall) {
        return 'small';
    }
    return Math.random() < 0.35 ? 'small' : 'big';
}

function ensureSmallEnemyMajority() {
    const total = enemies.length;
    if (total === 0) return;
    let smallCount = enemies.filter(e => e.size < player.size).length;
    const targetSmall = getTargetSmallEnemies(total);

    for (let i = enemies.length - 1; i >= 0 && smallCount < targetSmall; i--) {
        if (enemies[i].size >= player.size) {
            enemies.splice(i, 1);
            createEnemy('small');
            smallCount++;
        }
    }
}

function updateSpeed() {
    const diff = CONFIG.difficulty[selectedDifficulty];
    currentSpeed += diff.speedIncrease;
}

function loseLife() {
    lives -= 1;
    if (lives <= 0) {
        gameOver();
        return;
    }
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;
    respawnStartedAt = Date.now();
    respawnUntil = respawnStartedAt + 3000;
    currentState = GameState.RESPAWNING;
}

function updateRespawn() {
    if (currentState !== GameState.RESPAWNING) return;
    if (Date.now() >= respawnUntil) {
        totalPaused += Date.now() - respawnStartedAt;
        respawnStartedAt = 0;
        respawnUntil = 0;
        currentState = GameState.PLAYING;
        activateShield(4000);
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function drawHUD() {
    resetButtons();
    const padding = 20;
    const panelHeight = 44;
    ctx.save();
    ctx.fillStyle = CONFIG.colors.uiPanel;
    ctx.fillRect(0, 0, canvas.width, panelHeight + padding);
    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '600 16px Segoe UI';
    ctx.textBaseline = 'middle';

    const timeText = formatTime(getGameTime());
    const sizeText = Math.floor(player.size).toString();
    ctx.fillText(`Score: ${score}`, padding, panelHeight / 2 + 6);
    ctx.fillText(`Temps: ${timeText}`, 180, panelHeight / 2 + 6);
    ctx.fillText(`Taille: ${sizeText}`, 330, panelHeight / 2 + 6);
    ctx.fillText(`Vies: ${lives}`, 470, panelHeight / 2 + 6);

    drawButton({
        id: 'pause',
        x: canvas.width - 140,
        y: 10,
        width: 120,
        height: 30,
        label: 'Pause',
        onClick: () => togglePause()
    });

    ctx.restore();
}

function drawMenu() {
    resetButtons();
    ctx.save();
    if (menuBackground && menuBackground.complete && menuBackground.naturalWidth > 0) {
        ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = 'rgba(3, 18, 38, 0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '700 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🐟​CRAZY FISH🐟​', canvas.width / 2, canvas.height * 0.22);

    ctx.font = '400 18px Segoe UI';
    ctx.fillStyle = CONFIG.colors.uiMuted;
    ctx.fillText('Mangez les poissons plus petits et grandissez', canvas.width / 2, canvas.height * 0.28);

    const buttonWidth = Math.min(360, canvas.width * 0.6);
    const buttonHeight = 48;
    const startY = canvas.height * 0.38;
    const gap = 16;
    const difficulties = [
        { id: 'easy', label: 'Facile', color: '#22c55e' },
        { id: 'medium', label: 'Moyen', color: '#eab308' },
        { id: 'hard', label: 'Difficile', color: '#ef4444' }
    ];

    difficulties.forEach((diff, index) => {
        const y = startY + index * (buttonHeight + gap);
        drawButton({
            id: diff.id,
            x: (canvas.width - buttonWidth) / 2,
            y,
            width: buttonWidth,
            height: buttonHeight,
            label: diff.label,
            accent: diff.color,
            selected: selectedDifficulty === diff.id,
            onClick: () => {
                selectedDifficulty = diff.id;
                startGame();
            }
        });
    });

    drawButton({
        id: 'scores',
        x: (canvas.width - buttonWidth) / 2,
        y: startY + 3 * (buttonHeight + gap) + 10,
        width: buttonWidth,
        height: buttonHeight,
        label: 'Voir Hi-Scores (H)',
        onClick: () => showHighScores()
    });

    ctx.font = '400 14px Segoe UI';
    ctx.fillStyle = CONFIG.colors.uiMuted;
    ctx.fillText('Flèches pour bouger · P ou Esc pour pause', canvas.width / 2, canvas.height * 0.8);
    ctx.restore();
}

function drawGameOver() {
    resetButtons();
    ctx.save();
    ctx.fillStyle = 'rgba(8, 8, 16, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ef4444';
    ctx.font = '800 46px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height * 0.25);

    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '500 20px Segoe UI';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height * 0.36);
    const finalTime = gameOverTimeMs || getGameTime();
    ctx.fillText(`Temps: ${formatTime(finalTime)}`, canvas.width / 2, canvas.height * 0.41);
    ctx.fillText(`Taille: ${Math.floor(player.size)}`, canvas.width / 2, canvas.height * 0.46);

    const buttonWidth = Math.min(300, canvas.width * 0.5);
    const buttonHeight = 46;
    const baseY = canvas.height * 0.62;
    drawButton({
        id: 'restart',
        x: (canvas.width - buttonWidth) / 2,
        y: baseY,
        width: buttonWidth,
        height: buttonHeight,
        label: 'Rejouer (R)',
        onClick: () => startGame()
    });
    drawButton({
        id: 'menu',
        x: (canvas.width - buttonWidth) / 2,
        y: baseY + buttonHeight + 14,
        width: buttonWidth,
        height: buttonHeight,
        label: 'Menu (M)',
        onClick: () => showMenu()
    });
    drawButton({
        id: 'scores',
        x: (canvas.width - buttonWidth) / 2,
        y: baseY + 2 * (buttonHeight + 14),
        width: buttonWidth,
        height: buttonHeight,
        label: 'Hi-Scores (H)',
        onClick: () => showHighScores()
    });
    ctx.restore();
}

function drawHighScores() {
    resetButtons();
    ctx.save();
    ctx.fillStyle = 'rgba(3, 18, 38, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '700 42px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🎮​HI-SCORES🎮​', canvas.width / 2, canvas.height * 0.22);

    ctx.font = '500 18px Segoe UI';
    ctx.fillStyle = CONFIG.colors.uiMuted;
    ctx.fillText('Top 5', canvas.width / 2, canvas.height * 0.28);

    const listStartY = canvas.height * 0.36;
    const lineHeight = 28;
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.colors.uiText;
    if (highScores.length === 0) {
        ctx.textAlign = 'center';
        ctx.fillText('Aucun score pour le moment.', canvas.width / 2, listStartY);
    } else {
        for (let i = 0; i < Math.min(5, highScores.length); i++) {
            const entry = highScores[i];
            const y = listStartY + i * lineHeight;
            const left = canvas.width * 0.25;
            const difficultyLabel = formatDifficulty(entry.difficulty);
            const text = `${i + 1})  ${entry.score} pts  · ${formatTime(entry.timeMs)} · ${difficultyLabel}`;
            ctx.fillText(text, left, y);
        }
    }

    const buttonWidth = Math.min(260, canvas.width * 0.45);
    drawButton({
        id: 'menu',
        x: (canvas.width - buttonWidth) / 2,
        y: canvas.height * 0.72,
        width: buttonWidth,
        height: 44,
        label: 'Menu (M)',
        onClick: () => showMenu()
    });
    ctx.restore();
}

function drawPauseOverlay() {
    resetButtons();
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '800 40px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', canvas.width / 2, canvas.height * 0.38);
    const buttonWidth = Math.min(240, canvas.width * 0.4);
    drawButton({
        id: 'resume',
        x: (canvas.width - buttonWidth) / 2,
        y: canvas.height * 0.48,
        width: buttonWidth,
        height: 42,
        label: 'Reprendre (P)',
        onClick: () => resumeGame()
    });
    drawButton({
        id: 'menu',
        x: (canvas.width - buttonWidth) / 2,
        y: canvas.height * 0.56,
        width: buttonWidth,
        height: 42,
        label: 'Menu (M)',
        onClick: () => quitRunToMenu()
    });
    ctx.restore();
}

function drawRespawnOverlay() {
    updateRespawn();
    const remaining = Math.max(0, respawnUntil - Date.now());
    const count = Math.max(1, Math.ceil(remaining / 1000));
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '800 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`Reprise dans ${count}`, canvas.width / 2, canvas.height * 0.45);
    ctx.font = '600 20px Segoe UI';
    ctx.fillStyle = CONFIG.colors.uiMuted;
    const viesLabel = lives === 1 ? 'Il vous reste 1 vie' : `Il vous reste ${lives} vies`;
    ctx.fillText(viesLabel, canvas.width / 2, canvas.height * 0.53);
    ctx.restore();
}

function drawAmbientParticles() {
    updateParticles();
}

function drawButton({ id, x, y, width, height, label, onClick, accent, selected }) {
    const isHover = mouse.x >= x && mouse.x <= x + width && mouse.y >= y && mouse.y <= y + height;
    ctx.save();
    ctx.fillStyle = selected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = accent || 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = selected ? 3 : 2;
    if (isHover) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    }
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = CONFIG.colors.uiText;
    ctx.font = '600 18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();

    uiButtons.push({ id, x, y, width, height, onClick });
}

function resetButtons() {
    uiButtons = [];
}

function getButtonAt(x, y) {
    for (let i = uiButtons.length - 1; i >= 0; i--) {
        const b = uiButtons[i];
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
            return b;
        }
    }
    return null;
}

function loadHighScores() {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) return [];
    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
    } catch (err) {
        return [];
    }
    return [];
}

function saveHighScores(list) {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(list));
}

function addHighScore(entry) {
    const updated = [...highScores, entry].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeMs - b.timeMs;
    });
    highScores = updated.slice(0, 10);
    saveHighScores(highScores);
}

function formatDifficulty(value) {
    if (value === 'easy') return 'Facile';
    if (value === 'medium') return 'Moyen';
    if (value === 'hard') return 'Difficile';
    return value || 'Inconnu';
}

window.addEventListener('load', initGame);
