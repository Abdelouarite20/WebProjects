const CONFIG = {
    difficulty: {
        easy: {
            initialSpeed: 1.5,
            speedIncrease: 0.0003,
            enemyCount: 8,
            enemySpeedMultiplier: 1,
            maxSpeed: 3.8
        },
        medium: {
            initialSpeed: 2,
            speedIncrease: 0.0005,
            enemyCount: 12,
            enemySpeedMultiplier: 1.1,
            maxSpeed: 5.2
        },
        hard: {
            initialSpeed: 2.5,
            speedIncrease: 0.0007,
            enemyCount: 15,
            enemySpeedMultiplier: 1.2,
            maxSpeed: 6.6
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
const DEFAULT_DIFFICULTY = 'medium';
const MAX_BUBBLES = 40;
const BUBBLE_SPAWN_CHANCE = 0.08;
const BACKGROUND_WAVE_COUNT = 5;
const BACKGROUND_WAVE_STEP = 18;
const FRAME_DURATION_MS = 1000 / 60;
const MAX_FRAME_DELTA_MS = 50;
const PLAYER_MAX_SIZE_RATIO = 0.22;

let currentState = GameState.MENU;
let selectedDifficulty = DEFAULT_DIFFICULTY;
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
let backgroundGradient = null;
let waveRows = [];
let lastFrameTime = 0;

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
    ctx = canvas.getContext('2d', { alpha: false }) || canvas.getContext('2d');

    menuBackground = new Image();
    menuBackground.src = 'assets/images/background_menu fish.png';

    resizeCanvas();
    highScores = loadHighScores();
    setupEventListeners();
    setupPlatformBanner();
    startLoop();
}

function setupPlatformBanner() {
    const banner = document.getElementById('platform-banner');
    const playerNameDisplay = document.getElementById('player-name');
    const returnBtn = document.getElementById('return-btn');

    const username = localStorage.getItem('username');

    if (username) {
        banner.classList.remove('hidden');
        playerNameDisplay.textContent = username;
    }

    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
    }
}

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const width = Math.max(320, container.clientWidth || 0);
    const height = Math.max(240, container.clientHeight || 0);

    canvas.width = width;
    canvas.height = height;
    clampWorldToCanvas();
    rebuildBackgroundCache();
}

function getMaxPlayerSize() {
    if (!canvas) return CONFIG.maxEnemySize;
    return Math.max(CONFIG.playerStartSize, Math.min(canvas.width, canvas.height) * PLAYER_MAX_SIZE_RATIO);
}

function clampPlayerSize() {
    if (!player) return;
    player.size = Math.min(player.size, getMaxPlayerSize());
}

function hasInvalidNumbers(...values) {
    return values.some((value) => !Number.isFinite(value));
}

function clampEntityToCanvas(entity) {
    if (!entity || !canvas) return;

    if (!Number.isFinite(entity.x)) entity.x = canvas.width / 2;
    if (!Number.isFinite(entity.y)) entity.y = canvas.height / 2;
    if (!Number.isFinite(entity.size) || entity.size <= 0) {
        entity.size = CONFIG.playerStartSize;
    }

    entity.x = Math.max(entity.size, Math.min(canvas.width - entity.size, entity.x));
    entity.y = Math.max(entity.size, Math.min(canvas.height - entity.size, entity.y));
}

function clampWorldToCanvas() {
    clampPlayerSize();
    clampEntityToCanvas(player);
    enemies.forEach(clampEntityToCanvas);
    powerUps.forEach((item) => {
        if (!item) return;
        item.x = Math.max(item.size, Math.min(canvas.width - item.size, item.x));
        item.y = Math.max(item.size, Math.min(canvas.height - item.size, item.y));
    });
}

function rebuildBackgroundCache() {
    if (!ctx || !canvas) return;

    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, CONFIG.colors.water[0]);
    backgroundGradient.addColorStop(0.5, CONFIG.colors.water[1]);
    backgroundGradient.addColorStop(1, CONFIG.colors.water[2]);

    waveRows = [];
    for (let i = 0; i < BACKGROUND_WAVE_COUNT; i++) {
        const points = [];
        for (let x = 0; x <= canvas.width + BACKGROUND_WAVE_STEP; x += BACKGROUND_WAVE_STEP) {
            points.push(x);
        }
        waveRows.push({
            amplitude: 8 + i * 1.5,
            baseY: i * (canvas.height / BACKGROUND_WAVE_COUNT),
            points,
            speedFactor: i + 1
        });
    }
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

async function recordCurrentRunScore(timeMs = getGameTime()) {
    // 1. Sauvegarde locale pour le menu in-game
    addHighScore({
        score,
        timeMs,
        difficulty: selectedDifficulty,
        date: Date.now()
    });

    // 2. Sauvegarde dynamique sur le Backend de la Plateforme (Miage Platform)
    const username = localStorage.getItem('username');
    if (!username) {
        console.log("Joueur non connecté au global, score API ignoré.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/scores/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Envoi automatique du Cookie HttpOnly
            body: JSON.stringify({
                game: 'Crazy Fish',
                points: score
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log("Score Canvas sauvegardé sur le serveur central !");
        } else {
            console.error("Refus serveur :", data.error);
        }
    } catch (e) {
        console.error("Erreur serveur API", e);
    }
}

function quitRunToMenu() {
    if (isRunActive()) {
        recordCurrentRunScore();
    }
    showMenu();
}

function showMenu() {
    currentState = GameState.MENU;
    selectedDifficulty = DEFAULT_DIFFICULTY;
    lastFrameTime = 0;
    resetPointerState();
    resetPauseState();
}

function showHighScores() {
    currentState = GameState.HIGHSCORES;
    lastFrameTime = 0;
    resetPointerState();
    resetPauseState();
}

function startGame() {
    currentState = GameState.PLAYING;
    score = 0;
    startTime = Date.now();
    lastFrameTime = 0;
    resetPointerState();
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
    const loop = (now) => {
        animationId = requestAnimationFrame(loop);
        tick(now);
    };
    animationId = requestAnimationFrame(loop);
}

function tick(now = performance.now()) {
    const deltaMs = lastFrameTime ? Math.min(now - lastFrameTime, MAX_FRAME_DELTA_MS) : FRAME_DURATION_MS;
    const deltaScale = deltaMs / FRAME_DURATION_MS;
    lastFrameTime = now;

    if (currentState === GameState.MENU) {
        drawMenu();
        return;
    }

    drawBackground(now);

    if (currentState === GameState.PLAYING) {
        updateBubbles(deltaScale);
    } else {
        drawBubbles();
    }

    if (currentState === GameState.PLAYING) {
        updatePowerUps(deltaScale);
        updatePlayer(deltaScale);
        ensureSmallEnemyMajority();
        updateEnemies(deltaScale);
        checkCollisions();
        checkPowerUpPickup();
        updateParticles(deltaScale);
        updateSpeed(deltaScale);
        drawHUD();
    } else {
        drawAmbientParticles(deltaScale);
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

function drawBackground(now = performance.now()) {
    if (!backgroundGradient) {
        rebuildBackgroundCache();
    }

    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    const time = now * 0.001;

    for (let i = 0; i < waveRows.length; i++) {
        const row = waveRows[i];
        ctx.beginPath();
        for (let j = 0; j < row.points.length; j++) {
            const x = row.points[j];
            const wave = Math.sin((x + time * row.speedFactor * 60) * 0.01) * row.amplitude;
            if (j === 0) {
                ctx.moveTo(x, row.baseY + wave);
            } else {
                ctx.lineTo(x, row.baseY + wave);
            }
        }
        ctx.stroke();
    }
}

function updatePlayer(deltaScale = 1) {
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

    player.update(deltaScale);

    if (hasInvalidNumbers(player.x, player.y, player.vx, player.vy, player.size)) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.vx = 0;
        player.vy = 0;
        player.size = CONFIG.playerStartSize;
    }

    clampPlayerSize();
    clampEntityToCanvas(player);

    player.draw();
}

function updateEnemies(deltaScale = 1) {
    const diff = CONFIG.difficulty[selectedDifficulty];

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (hasInvalidNumbers(enemy.x, enemy.y, enemy.vx, enemy.vy, enemy.size)) {
            enemies.splice(i, 1);
            createEnemy(pickEnemyTypeForBalance());
            continue;
        }

        enemy.syncSpeed(diff.enemySpeedMultiplier);

        enemy.update(deltaScale);
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
                clampPlayerSize();
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
                    return;
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

function updateParticles(deltaScale = 1) {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(deltaScale);
        particles[i].draw(ctx);

        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function updateBubbles(deltaScale = 1) {
    if (bubbles.length < MAX_BUBBLES && Math.random() < BUBBLE_SPAWN_CHANCE) {
        bubbles.push(new Bubble(getCanvas));
    }

    drawBubbles(deltaScale, true);
}

function drawBubbles(deltaScale = 1, shouldUpdate = false) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        if (shouldUpdate) {
            bubble.update(deltaScale);
        }
        bubble.draw(ctx, CONFIG.colors.bubble);

        if (bubble.isDead()) {
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

function updatePowerUps(deltaScale = 1) {
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
        item.update(deltaScale);
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

function resetPointerState() {
    mouse.x = -1;
    mouse.y = -1;
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
    const smallCount = countSmallEnemies();
    if (smallCount < targetSmall) {
        return 'small';
    }
    return Math.random() < 0.35 ? 'small' : 'big';
}

function ensureSmallEnemyMajority() {
    const total = enemies.length;
    if (total === 0) return;
    let smallCount = countSmallEnemies();
    const targetSmall = getTargetSmallEnemies(total);

    for (let i = enemies.length - 1; i >= 0 && smallCount < targetSmall; i--) {
        if (enemies[i].size >= player.size) {
            enemies.splice(i, 1);
            createEnemy('small');
            smallCount++;
        }
    }
}

function countSmallEnemies() {
    if (!player) return 0;

    let count = 0;
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].size < player.size) {
            count++;
        }
    }
    return count;
}

function updateSpeed(deltaScale = 1) {
    const diff = CONFIG.difficulty[selectedDifficulty];
    currentSpeed = Math.min(diff.maxSpeed, currentSpeed + diff.speedIncrease * deltaScale);
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
    ctx.fillStyle = '#0b1f33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

function drawAmbientParticles(deltaScale = 1) {
    updateParticles(deltaScale);
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
