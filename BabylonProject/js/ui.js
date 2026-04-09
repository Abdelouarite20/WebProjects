App.buyPower = function (type) {

    if (type === "shield" && App.money >= 40) {
        App.money -= 40;
        App.player.shieldTime = 8;
    }

    if (type === "speed" && App.money >= 30) {
        App.money -= 30;
        App.player.speedTime = 8;
        App.player.speed = Math.max(App.player.speed, 34);
        App.player.indicatedSpeed = App.player.speed;
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

App.speedIndicatorConfig = App.speedIndicatorConfig || {
    minSpeed: 20,
    maxSpeed: 200,
    minAngle: -132,
    maxAngle: 132,
    majorTickStep: 20,
    minorTickStep: 10
};

App.clampSpeedIndicatorSpeed = function (speed) {
    const config = App.speedIndicatorConfig;
    const safeSpeed = Number.isFinite(speed) ? speed : config.minSpeed;
    return BABYLON.Scalar.Clamp(safeSpeed, config.minSpeed, config.maxSpeed);
};

App.getDisplayedAirspeed = function () {
    if (!App.player) {
        return App.speedIndicatorConfig.minSpeed;
    }

    const sourceSpeed = Number.isFinite(App.player.indicatedSpeed)
        ? App.player.indicatedSpeed
        : App.player.speed;

    return App.clampSpeedIndicatorSpeed(sourceSpeed);
};

App.getSpeedZone = function (speed) {
    if (speed <= 45) {
        return "low";
    }
    if (speed <= 130) {
        return "cruise";
    }
    if (speed <= 170) {
        return "warning";
    }
    return "danger";
};

App.getSpeedZoneColors = function (zone) {
    if (zone === "low") {
        return {
            ring: "#4db7ff",
            innerRing: "rgba(108, 200, 255, 0.92)",
            value: "#cfeeff",
            accent: "#88d8ff",
            glow: "rgba(64, 170, 255, 0.42)",
            needle: "#79d6ff",
            badge: "rgba(36, 104, 156, 0.82)"
        };
    }

    if (zone === "cruise") {
        return {
            ring: "#57df98",
            innerRing: "rgba(113, 238, 176, 0.95)",
            value: "#e6fff0",
            accent: "#9effc7",
            glow: "rgba(64, 210, 130, 0.36)",
            needle: "#ff774f",
            badge: "rgba(31, 112, 78, 0.82)"
        };
    }

    if (zone === "warning") {
        return {
            ring: "#ffbc4c",
            innerRing: "rgba(255, 205, 114, 0.95)",
            value: "#fff0c5",
            accent: "#ffd47c",
            glow: "rgba(255, 181, 58, 0.38)",
            needle: "#ff8c45",
            badge: "rgba(138, 92, 19, 0.85)"
        };
    }

    return {
        ring: "#ff6457",
        innerRing: "rgba(255, 135, 126, 0.95)",
        value: "#ffd8d4",
        accent: "#ff9d96",
        glow: "rgba(255, 89, 76, 0.42)",
        needle: "#ff675d",
        badge: "rgba(132, 33, 28, 0.86)"
    };
};

App.getSpeedIndicatorRatio = function (speed) {
    const config = App.speedIndicatorConfig;
    const clamped = App.clampSpeedIndicatorSpeed(speed);
    return (clamped - config.minSpeed) / (config.maxSpeed - config.minSpeed);
};

App.getSpeedIndicatorAngle = function (speed) {
    const config = App.speedIndicatorConfig;
    const ratio = App.getSpeedIndicatorRatio(speed);
    return config.minAngle + (config.maxAngle - config.minAngle) * ratio;
};

App.addSpeedIndicatorTick = function (dial, value, isMajor) {
    const GUI = BABYLON.GUI;
    const angleDeg = App.getSpeedIndicatorAngle(value);
    const angleRad = BABYLON.Tools.ToRadians(angleDeg);
    const zone = App.getSpeedZone(value);
    const colors = App.getSpeedZoneColors(zone);
    const tickLength = isMajor ? 20 : 10;
    const tickWidth = isMajor ? 3 : 2;
    const tickRadius = isMajor ? 94 : 96;

    const tick = new GUI.Rectangle("speedTick_" + value + "_" + (isMajor ? "major" : "minor"));
    tick.width = tickWidth + "px";
    tick.height = tickLength + "px";
    tick.thickness = 0;
    tick.background = isMajor ? colors.accent : "rgba(220, 232, 246, 0.52)";
    tick.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    tick.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    tick.top = -(tickRadius - tickLength * 0.5) + "px";
    tick.transformCenterX = 0.5;
    tick.transformCenterY = 1.0;
    tick.rotation = angleRad;
    dial.addControl(tick);

    if (isMajor) {
        const labelRadius = 70;
        const label = new GUI.TextBlock("speedLabel_" + value, String(value));
        label.color = "#edf5ff";
        label.fontSize = 15;
        label.fontWeight = "700";
        label.width = "42px";
        label.height = "22px";
        label.left = Math.cos(angleRad) * labelRadius + "px";
        label.top = Math.sin(angleRad) * labelRadius + "px";
        dial.addControl(label);
    }
};

App.buildSpeedIndicator = function () {
    if (App.speedIndicator) {
        return App.speedIndicator;
    }

    const GUI = BABYLON.GUI;
    App.hudTexture = App.hudTexture || GUI.AdvancedDynamicTexture.CreateFullscreenUI("planeHUD", true, App.scene);

    const panel = new GUI.Rectangle("speedPanel");
    panel.width = "300px";
    panel.height = "300px";
    panel.thickness = 0;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.left = "14px";
    panel.top = "-12px";
    App.hudTexture.addControl(panel);

    const shadow = new GUI.Ellipse("speedShadow");
    shadow.width = "268px";
    shadow.height = "268px";
    shadow.thickness = 0;
    shadow.background = "rgba(0, 0, 0, 0.28)";
    shadow.alpha = 0.8;
    panel.addControl(shadow);

    const bezel = new GUI.Ellipse("speedBezel");
    bezel.width = "252px";
    bezel.height = "252px";
    bezel.thickness = 3;
    bezel.color = "rgba(255, 255, 255, 0.22)";
    bezel.background = "rgba(6, 11, 18, 0.92)";
    panel.addControl(bezel);

    const bezelInner = new GUI.Ellipse("speedBezelInner");
    bezelInner.width = "232px";
    bezelInner.height = "232px";
    bezelInner.thickness = 2;
    bezelInner.color = "rgba(163, 192, 222, 0.18)";
    bezelInner.background = "rgba(9, 14, 24, 0.96)";
    bezel.addControl(bezelInner);

    const glowRing = new GUI.Ellipse("speedGlowRing");
    glowRing.width = "214px";
    glowRing.height = "214px";
    glowRing.thickness = 2;
    glowRing.color = "rgba(255, 255, 255, 0.10)";
    glowRing.background = "transparent";
    bezelInner.addControl(glowRing);

    const glass = new GUI.Ellipse("speedGlass");
    glass.width = "210px";
    glass.height = "210px";
    glass.thickness = 0;
    glass.background = "rgba(255, 255, 255, 0.02)";
    bezelInner.addControl(glass);

    const glassHighlight = new GUI.Ellipse("speedGlassHighlight");
    glassHighlight.width = "180px";
    glassHighlight.height = "92px";
    glassHighlight.thickness = 0;
    glassHighlight.background = "rgba(255, 255, 255, 0.055)";
    glassHighlight.top = "-64px";
    bezelInner.addControl(glassHighlight);

    const title = new GUI.TextBlock("speedTitle", "AIRSPEED");
    title.color = "#f3f8ff";
    title.fontSize = 18;
    title.fontWeight = "700";
    title.top = "-88px";
    bezelInner.addControl(title);

    const subtitle = new GUI.TextBlock("speedSubtitle", "COMBAT HUD");
    subtitle.color = "rgba(210, 225, 241, 0.62)";
    subtitle.fontSize = 11;
    subtitle.top = "-68px";
    bezelInner.addControl(subtitle);

    for (let value = App.speedIndicatorConfig.minSpeed; value <= App.speedIndicatorConfig.maxSpeed; value += App.speedIndicatorConfig.minorTickStep) {
        const isMajor = value % App.speedIndicatorConfig.majorTickStep === 0;
        App.addSpeedIndicatorTick(bezelInner, value, isMajor);
    }

    const needleShadow = new GUI.Rectangle("speedNeedleShadow");
    needleShadow.width = "8px";
    needleShadow.height = "98px";
    needleShadow.thickness = 0;
    needleShadow.background = "rgba(0, 0, 0, 0.42)";
    needleShadow.cornerRadius = 5;
    needleShadow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    needleShadow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    needleShadow.top = "-43px";
    needleShadow.left = "2px";
    needleShadow.transformCenterX = 0.5;
    needleShadow.transformCenterY = 1.0;
    bezelInner.addControl(needleShadow);

    const needle = new GUI.Rectangle("speedNeedle");
    needle.width = "6px";
    needle.height = "94px";
    needle.thickness = 0;
    needle.background = "#ff7650";
    needle.cornerRadius = 4;
    needle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    needle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    needle.top = "-42px";
    needle.transformCenterX = 0.5;
    needle.transformCenterY = 1.0;
    bezelInner.addControl(needle);

    const needleCore = new GUI.Rectangle("speedNeedleCore");
    needleCore.width = "2px";
    needleCore.height = "70px";
    needleCore.thickness = 0;
    needleCore.background = "rgba(255, 247, 236, 0.88)";
    needleCore.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    needleCore.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    needleCore.top = "8px";
    needle.addControl(needleCore);

    const tail = new GUI.Rectangle("speedNeedleTail");
    tail.width = "4px";
    tail.height = "24px";
    tail.thickness = 0;
    tail.background = "rgba(255, 255, 255, 0.18)";
    tail.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    tail.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    tail.top = "12px";
    tail.transformCenterX = 0.5;
    tail.transformCenterY = 0;
    bezelInner.addControl(tail);

    const hubOuter = new GUI.Ellipse("speedHubOuter");
    hubOuter.width = "28px";
    hubOuter.height = "28px";
    hubOuter.thickness = 2;
    hubOuter.color = "rgba(255, 255, 255, 0.22)";
    hubOuter.background = "#0d131b";
    bezelInner.addControl(hubOuter);

    const hubInner = new GUI.Ellipse("speedHubInner");
    hubInner.width = "14px";
    hubInner.height = "14px";
    hubInner.thickness = 1;
    hubInner.color = "rgba(255, 255, 255, 0.55)";
    hubInner.background = "#202a34";
    hubOuter.addControl(hubInner);

    const readout = new GUI.Rectangle("speedReadout");
    readout.width = "122px";
    readout.height = "76px";
    readout.thickness = 1;
    readout.cornerRadius = 13;
    readout.color = "rgba(255, 255, 255, 0.10)";
    readout.background = "rgba(11, 16, 25, 0.96)";
    readout.top = "66px";
    bezelInner.addControl(readout);

    const speedValue = new GUI.TextBlock("speedValue", "020");
    speedValue.color = "#eafff3";
    speedValue.fontSize = 36;
    speedValue.fontWeight = "800";
    speedValue.top = "-10px";
    readout.addControl(speedValue);

    const speedUnit = new GUI.TextBlock("speedUnit", "SPD");
    speedUnit.color = "rgba(240, 246, 255, 0.70)";
    speedUnit.fontSize = 12;
    speedUnit.top = "14px";
    readout.addControl(speedUnit);

    const speedZone = new GUI.Rectangle("speedZoneBadge");
    speedZone.width = "76px";
    speedZone.height = "24px";
    speedZone.thickness = 0;
    speedZone.cornerRadius = 12;
    speedZone.background = "rgba(36, 104, 156, 0.82)";
    speedZone.top = "104px";
    bezelInner.addControl(speedZone);

    const speedZoneText = new GUI.TextBlock("speedZoneText", "LOW");
    speedZoneText.color = "#ffffff";
    speedZoneText.fontSize = 11;
    speedZoneText.fontWeight = "700";
    speedZone.addControl(speedZoneText);

    const minLabel = new GUI.TextBlock("speedMinLabel", "MIN 20");
    minLabel.color = "rgba(208, 222, 237, 0.58)";
    minLabel.fontSize = 10;
    minLabel.left = "-70px";
    minLabel.top = "98px";
    bezelInner.addControl(minLabel);

    const maxLabel = new GUI.TextBlock("speedMaxLabel", "MAX 200");
    maxLabel.color = "rgba(208, 222, 237, 0.58)";
    maxLabel.fontSize = 10;
    maxLabel.left = "70px";
    maxLabel.top = "98px";
    bezelInner.addControl(maxLabel);

    App.speedIndicator = {
        panel: panel,
        bezel: bezel,
        bezelInner: bezelInner,
        glowRing: glowRing,
        needle: needle,
        needleShadow: needleShadow,
        tail: tail,
        speedValue: speedValue,
        speedZone: speedZone,
        speedZoneText: speedZoneText,
        readout: readout,
        setSpeed(speed) {
            const clamped = App.clampSpeedIndicatorSpeed(speed);
            const rounded = Math.round(clamped);
            const angleDeg = App.getSpeedIndicatorAngle(clamped);
            const zone = App.getSpeedZone(clamped);
            const colors = App.getSpeedZoneColors(zone);

            const angleRad = BABYLON.Tools.ToRadians(angleDeg);

            this.needle.rotation = angleRad;
            this.needleShadow.rotation = angleRad;
            this.tail.rotation = angleRad;

            this.speedValue.text = String(rounded).padStart(3, "0");
            this.speedZoneText.text = zone.toUpperCase();

            this.bezel.color = colors.ring;
            this.bezelInner.color = "rgba(255, 255, 255, 0.14)";
            this.glowRing.color = colors.innerRing;
            this.needle.background = colors.needle;
            this.speedValue.color = colors.value;
            this.speedZone.background = colors.badge;

            this.readout.color = colors.glow;
            this.readout.shadowColor = colors.glow;
            this.readout.shadowBlur = 14;
            this.readout.shadowOffsetX = 0;
            this.readout.shadowOffsetY = 0;

            this.speedValue.shadowColor = colors.glow;
            this.speedValue.shadowBlur = 8;
            this.speedValue.shadowOffsetX = 0;
            this.speedValue.shadowOffsetY = 0;
        },
        dispose() {
            this.panel.dispose();
        }
    };

    App.speedIndicator.setSpeed(App.getDisplayedAirspeed());
    return App.speedIndicator;
};

App.updateHud = function () {
    App.ui.healthValue.textContent = Math.ceil(App.player.health);
    App.ui.moneyValue.textContent = App.money;
    App.ui.scoreValue.textContent = App.score;
    App.ui.timeValue.textContent = Math.floor(App.survivalTime);
    App.ui.levelValue.textContent = App.difficultyLevel;

    App.buildSpeedIndicator().setSpeed(App.getDisplayedAirspeed());
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

    App.playerCrashed = false;
    App.player.mesh.setEnabled(true);
    App.player.mesh.position = new BABYLON.Vector3(0, 7.5, -18);
    App.player.health = 100;
    App.player.speed = App.player.baseSpeed;
    App.player.indicatedSpeed = App.player.baseSpeed;
    App.player.shieldTime = 0;
    App.player.speedTime = 0;
    App.player.turningOver = false;
    App.player.pitch = 0;
    App.player.yaw = 0;
    App.player.roll = 0;
    App.player.propellerSpin = App.player.propellerMinSpin || 18;
    App.player.mesh.rotation = new BABYLON.Vector3(0.08, 0, 0);

    App.score = 0;
    App.money = 0;
    App.survivalTime = 0;
    App.difficultyLevel = 1;
    App.levelEnemiesSpawned = 0;
    App.levelEnemyTarget = 0;
    App.levelTransitionTime = 0;
    App.levelActive = false;
    App.enemySpawnTimer = 0;
    App.enemySpawnDelay = 2.1;
    App.playerShootTimer = 0;
    App.allyDuration = 0;
    App.bombFlash = 0;
    App.startLevel(1);
    App.updateHud();
};
