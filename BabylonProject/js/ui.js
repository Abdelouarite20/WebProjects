App.buyPower = function (type) {
    if (App.gameOver) {
        return;
    }

    if (type === "shield" && App.money >= 40) {
        App.money -= 40;
        App.player.shieldTime = 8;
    }

    if (type === "speed" && App.money >= 30) {
        App.money -= 30;
        App.player.speedTime = 8;
        App.player.speed = 34;
    }

    if (type === "bomb" && App.money >= 50) {
        App.money -= 50;
        App.bombFlash = 0.28;
        for (let i = App.enemies.length - 1; i >= 0; i--) {
            App.enemies[i].health -= 26;
            App.createExplosion(App.enemies[i].mesh.position, new BABYLON.Color3(1, 0.64, 0.18), 1.4);
            if (App.enemies[i].health <= 0) {
                App.destroyEnemy(i);
            }
        }
    }

    if (type === "allies" && App.money >= 60 && App.allies.length === 0) {
        App.money -= 60;
        App.allyDuration = 5;
        App.createAlly(-1);
        App.createAlly(1);
    }

    App.updateHud();
};

App.ensureSpeedometerRefs = function () {
    App.ui = App.ui || {};
    App.ui.speedometer = App.ui.speedometer || document.getElementById("speedometer");
    App.ui.speedometerTicks = App.ui.speedometerTicks || document.getElementById("speedometerTicks");
    App.ui.speedNeedleWrap = App.ui.speedNeedleWrap || document.getElementById("speedNeedleWrap");
    App.ui.speedValue = App.ui.speedValue || document.getElementById("speedValue");
};

App.clampValue = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
};

App.getSpeedometerConfig = function () {
    const minSpeed = Number(App.player?.minSpeed ?? 20);
    const maxSpeed = Number(App.player?.maxSpeed ?? 200);
    const range = Math.max(1, maxSpeed - minSpeed);

    let majorStep = 20;
    let minorStep = 10;

    if (range <= 80) {
        majorStep = 10;
        minorStep = 5;
    }

    return {
        minSpeed: minSpeed,
        maxSpeed: maxSpeed,
        minAngle: -130,
        maxAngle: 130,
        majorStep: majorStep,
        minorStep: minorStep,
        cruiseSpeed: minSpeed + range * 0.35,
        warningSpeed: minSpeed + range * 0.75,
        dangerSpeed: minSpeed + range * 0.9,
        signature: [minSpeed, maxSpeed, majorStep, minorStep].join("|")
    };
};

App.getDisplayedSpeed = function () {
    return Math.max(0, Number(App.player?.speed || 0));
};

App.speedToAngle = function (displaySpeed) {
    const cfg = App.getSpeedometerConfig();
    const clamped = App.clampValue(displaySpeed, cfg.minSpeed, cfg.maxSpeed);
    const ratio = (clamped - cfg.minSpeed) / (cfg.maxSpeed - cfg.minSpeed || 1);
    return cfg.minAngle + ratio * (cfg.maxAngle - cfg.minAngle);
};

App.buildSpeedometer = function () {
    App.ensureSpeedometerRefs();

    if (!App.ui.speedometerTicks) {
        return;
    }

    const cfg = App.getSpeedometerConfig();
    if (App.ui.speedometerTicks.dataset.signature === cfg.signature) {
        return;
    }

    const center = 101;
    const tickRadiusMajor = 78;
    const tickRadiusMinor = 84;
    const labelRadius = 61;

    App.ui.speedometerTicks.innerHTML = "";

    for (let speed = cfg.minSpeed; speed <= cfg.maxSpeed; speed += cfg.minorStep) {
        const relative = speed - cfg.minSpeed;
        const isMajor = relative % cfg.majorStep === 0 || speed === cfg.minSpeed || speed === cfg.maxSpeed;

        const angle = App.speedToAngle(speed);
        const radians = (angle - 90) * Math.PI / 180;

        const tickRadius = isMajor ? tickRadiusMajor : tickRadiusMinor;
        const tickX = center + Math.cos(radians) * tickRadius;
        const tickY = center + Math.sin(radians) * tickRadius;

        const tick = document.createElement("div");
        tick.className = `speedometer-tick ${isMajor ? "major" : "minor"}`;
        tick.style.left = `${tickX}px`;
        tick.style.top = `${tickY}px`;
        tick.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        App.ui.speedometerTicks.appendChild(tick);

        if (isMajor) {
            const labelX = center + Math.cos(radians) * labelRadius;
            const labelY = center + Math.sin(radians) * labelRadius;

            const label = document.createElement("div");
            label.className = "speedometer-mark";
            label.textContent = Math.round(speed);
            label.style.left = `${labelX}px`;
            label.style.top = `${labelY}px`;
            App.ui.speedometerTicks.appendChild(label);
        }
    }

    App.ui.speedometerTicks.dataset.signature = cfg.signature;
};

App.updateSpeedometerZone = function (displaySpeed) {
    App.ensureSpeedometerRefs();

    if (!App.ui.speedometer) {
        return;
    }

    const cfg = App.getSpeedometerConfig();
    let zone = "low";

    if (displaySpeed >= cfg.dangerSpeed) {
        zone = "danger";
    } else if (displaySpeed >= cfg.warningSpeed) {
        zone = "warning";
    } else if (displaySpeed >= cfg.cruiseSpeed) {
        zone = "cruise";
    }

    App.ui.speedometer.dataset.zone = zone;
};

App.updateHud = function () {
    App.ensureSpeedometerRefs();
    App.buildSpeedometer();

    App.ui.healthValue.textContent = Math.ceil(App.player.health);
    App.ui.moneyValue.textContent = App.money;
    App.ui.scoreValue.textContent = App.score;
    App.ui.timeValue.textContent = Math.floor(App.survivalTime);
    App.ui.levelValue.textContent = App.difficultyLevel;

    const exactSpeed = App.getDisplayedSpeed();
    const roundedSpeed = Math.round(exactSpeed);

    App.ui.speedValue.textContent = roundedSpeed;

    const needleAngle = App.speedToAngle(exactSpeed);
    App.ui.speedNeedleWrap.style.transform = `translate(-50%, -50%) rotate(${needleAngle}deg)`;

    App.updateSpeedometerZone(exactSpeed);
};

App.endGame = function () {
    App.gameOver = true;
    App.ui.gameOverPanel.classList.remove("hidden");
};

App.clearDynamicObjects = function () {
    App.enemies.forEach(enemy => enemy.mesh.dispose());
    App.playerBullets.forEach(bullet => bullet.mesh.dispose());
    App.enemyBullets.forEach(bullet => bullet.mesh.dispose());
    App.allies.forEach(ally => ally.mesh.dispose());
    App.explosions.forEach(explosion => explosion.mesh.dispose());
    App.particles.forEach(particle => particle.mesh.dispose());
};

App.restartGame = function () {
    App.clearDynamicObjects();

    App.enemies = [];
    App.playerBullets = [];
    App.enemyBullets = [];
    App.allies = [];
    App.explosions = [];
    App.particles = [];

    App.player.mesh.position = new BABYLON.Vector3(0, 7.5, -18);
    App.player.health = 100;
    App.player.speed = App.player.baseSpeed;
    App.player.shieldTime = 0;
    App.player.speedTime = 0;
    App.player.mesh.rotation = new BABYLON.Vector3(0.08, 0, 0);

    App.score = 0;
    App.money = 0;
    App.survivalTime = 0;
    App.difficultyLevel = 1;
    App.levelEnemiesSpawned = 0;
    App.levelEnemyTarget = 0;
    App.levelTransitionTime = 0;
    App.levelActive = false;
    App.gameOver = false;
    App.enemySpawnTimer = 0;
    App.enemySpawnDelay = 2.1;
    App.playerShootTimer = 0;
    App.allyDuration = 0;
    App.bombFlash = 0;

    App.ui.gameOverPanel.classList.add("hidden");
    App.startLevel(1);
    App.updateHud();
};