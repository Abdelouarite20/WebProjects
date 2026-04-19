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

    App.updateHud(true);
};

App.speedIndicatorConfig = App.speedIndicatorConfig || {
    minSpeed: 20,
    maxSpeed: 200,
    dialMinValue: 0,
    dialMaxValue: 200,
    dialStartAngle: 270,
    dialEndAngle: 600,
    majorTickStep: 20,
    minorTickStep: 20,
    needleOffsetDeg: 168,
    anglePoints: [
        { speed: 20, angle: 273 },
        { speed: 60, angle: 352.5 },
        { speed: 100, angle: 435 },
        { speed: 140, angle: 517.5 },
        { speed: 180, angle: 558.75 },
        { speed: 200, angle: 600 }
    ]
};

App.getDisplayedAirspeed = function () {
    if (!App.player) {
        return App.speedIndicatorConfig.minSpeed;
    }

    const sourceSpeed = Number.isFinite(App.player.indicatedSpeed)
        ? App.player.indicatedSpeed
        : App.player.speed;

    return BABYLON.Scalar.Clamp(
        sourceSpeed,
        App.speedIndicatorConfig.minSpeed,
        App.speedIndicatorConfig.maxSpeed
    );
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
            ring: "#59b7ff",
            inner: "rgba(117, 208, 255, 0.92)",
            badge: "rgba(39, 101, 150, 0.86)",
            value: "#d5f0ff",
            needle: "#8ad9ff",
            glow: "rgba(68, 177, 255, 0.36)"
        };
    }

    if (zone === "cruise") {
        return {
            ring: "#65dea0",
            inner: "rgba(132, 239, 188, 0.95)",
            badge: "rgba(35, 108, 79, 0.86)",
            value: "#e8fff2",
            needle: "#ff7a52",
            glow: "rgba(82, 223, 148, 0.3)"
        };
    }

    if (zone === "warning") {
        return {
            ring: "#ffbe58",
            inner: "rgba(255, 211, 122, 0.95)",
            badge: "rgba(129, 89, 24, 0.88)",
            value: "#fff0c8",
            needle: "#ff8f4b",
            glow: "rgba(255, 190, 84, 0.34)"
        };
    }

    return {
        ring: "#ff695d",
        inner: "rgba(255, 144, 132, 0.95)",
        badge: "rgba(135, 38, 31, 0.9)",
        value: "#ffd8d4",
        needle: "#ff6b60",
        glow: "rgba(255, 98, 88, 0.38)"
    };
};

App.getSpeedIndicatorAngle = function (speed) {
    const points = App.speedIndicatorConfig.anglePoints;
    const clamped = BABYLON.Scalar.Clamp(
        speed,
        App.speedIndicatorConfig.minSpeed,
        App.speedIndicatorConfig.maxSpeed
    );

    if (clamped <= points[0].speed) {
        return points[0].angle;
    }

    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        if (clamped <= next.speed) {
            const ratio = (clamped - current.speed) / (next.speed - current.speed);
            return current.angle + (next.angle - current.angle) * ratio;
        }
    }

    return points[points.length - 1].angle;
};

App.getSpeedIndicatorDialAngle = function (value) {
    const clamped = BABYLON.Scalar.Clamp(
        value,
        App.speedIndicatorConfig.dialMinValue,
        App.speedIndicatorConfig.dialMaxValue
    );
    const ratio = (clamped - App.speedIndicatorConfig.dialMinValue)
        / (App.speedIndicatorConfig.dialMaxValue - App.speedIndicatorConfig.dialMinValue);

    return App.speedIndicatorConfig.dialStartAngle
        + (App.speedIndicatorConfig.dialEndAngle - App.speedIndicatorConfig.dialStartAngle) * ratio;
};

App.addSpeedIndicatorTick = function (dial, value, isMajor) {
    const GUI = BABYLON.GUI;
    const angleDeg = App.getSpeedIndicatorDialAngle(value);
    const angleRad = BABYLON.Tools.ToRadians(angleDeg - 180);
    const zone = App.getSpeedZone(value);
    const colors = App.getSpeedZoneColors(zone);
    const tickLength = isMajor ? 10 : 6;
    const tickWidth = isMajor ? 4 : 2;
    const tickRadius = isMajor ? 96 : 98;

    const tick = new GUI.Rectangle("speedTick_" + value + "_" + (isMajor ? "major" : "minor"));
    const tickCenterRadius = tickRadius - tickLength * 0.5;
    tick.width = tickWidth + "px";
    tick.height = tickLength + "px";
    tick.thickness = 0;
    tick.background = isMajor ? "rgba(244, 251, 255, 0.96)" : "rgba(224, 234, 247, 0.7)";
    tick.shadowColor = isMajor ? colors.glow : "rgba(220, 235, 255, 0.18)";
    tick.shadowBlur = isMajor ? 8 : 4;
    tick.shadowOffsetX = 0;
    tick.shadowOffsetY = 0;
    tick.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    tick.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    const zeroTickXOffset = value === 0 ? -4 : 0;
    tick.left = Math.cos(angleRad) * tickCenterRadius + zeroTickXOffset + "px";
    tick.top = Math.sin(angleRad) * tickCenterRadius + "px";
    tick.transformCenterX = 0.5;
    tick.transformCenterY = 0.5;
    tick.rotation = angleRad - Math.PI * 0.5;
    dial.addControl(tick);

    if (isMajor) {
        const connectorRadius = 90;
        const connector = new GUI.Rectangle("speedLabelConnector_" + value);
        connector.width = "6px";
        connector.height = "2px";
        connector.thickness = 0;
        connector.background = "rgba(244, 251, 255, 0.92)";
        connector.shadowColor = colors.glow;
        connector.shadowBlur = 6;
        connector.shadowOffsetX = 0;
        connector.shadowOffsetY = 0;
        connector.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        connector.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        const zeroXOffset = value === 0 ? -4 : 0;
        connector.left = Math.cos(angleRad) * connectorRadius + zeroXOffset + "px";
        connector.top = Math.sin(angleRad) * connectorRadius + "px";
        connector.rotation = angleRad;
        dial.addControl(connector);

        const labelRadius = 73;
        const label = new GUI.TextBlock("speedLabel_" + value, String(value));
        label.color = "#edf5ff";
        label.fontSize = 15;
        label.fontWeight = "700";
        label.width = "46px";
        label.height = "26px";
        label.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        label.left = Math.cos(angleRad) * labelRadius + zeroXOffset + "px";
        const labelYOffset = value === 0 ? 6 : 0;
        label.top = Math.sin(angleRad) * labelRadius + labelYOffset + "px";
        label.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        label.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        label.paddingLeft = "0px";
        label.paddingRight = "0px";
        label.paddingTop = "0px";
        label.paddingBottom = "0px";
        dial.addControl(label);
    }
};

App.buildSpeedIndicator = function () {
    if (App.speedIndicator) {
        return App.speedIndicator;
    }

    const GUI = BABYLON.GUI;
    App.hudTexture = App.hudTexture || GUI.AdvancedDynamicTexture.CreateFullscreenUI("planeHUD", true, App.scene);
    App.hudTexture.idealWidth = 1920;
    App.hudTexture.idealHeight = 1080;

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
    shadow.width = "276px";
    shadow.height = "276px";
    shadow.thickness = 0;
    shadow.background = "rgba(0, 0, 0, 0.42)";
    shadow.alpha = 0.95;
    shadow.top = "6px";
    shadow.left = "4px";
    panel.addControl(shadow);

    const bezel = new GUI.Ellipse("speedBezel");
    bezel.width = "252px";
    bezel.height = "252px";
    bezel.thickness = 4;
    bezel.color = "rgba(227, 236, 246, 0.44)";
    bezel.background = "rgba(22, 28, 37, 0.99)";
    bezel.shadowColor = "rgba(0, 0, 0, 0.52)";
    bezel.shadowBlur = 22;
    bezel.shadowOffsetX = 0;
    bezel.shadowOffsetY = 10;
    panel.addControl(bezel);

    const bezelTrim = new GUI.Ellipse("speedBezelTrim");
    bezelTrim.width = "242px";
    bezelTrim.height = "242px";
    bezelTrim.thickness = 2;
    bezelTrim.color = "rgba(255, 255, 255, 0.12)";
    bezelTrim.background = "rgba(72, 82, 96, 0.14)";
    bezel.addControl(bezelTrim);

    [
        { name: "Top", left: "0px", top: "-103px", slotRotation: 0 },
        { name: "Right", left: "103px", top: "0px", slotRotation: Math.PI * 0.5 },
        { name: "Bottom", left: "0px", top: "103px", slotRotation: 0 },
        { name: "Left", left: "-103px", top: "0px", slotRotation: Math.PI * 0.5 }
    ].forEach(cfg => {
        const screw = new GUI.Ellipse("speedBezelScrew" + cfg.name);
        screw.width = "10px";
        screw.height = "10px";
        screw.thickness = 1;
        screw.color = "rgba(255, 255, 255, 0.18)";
        screw.background = "rgba(64, 72, 84, 0.92)";
        screw.left = cfg.left;
        screw.top = cfg.top;
        bezel.addControl(screw);

        const screwSlot = new GUI.Rectangle("speedBezelScrewSlot" + cfg.name);
        screwSlot.width = "5px";
        screwSlot.height = "1px";
        screwSlot.thickness = 0;
        screwSlot.background = "rgba(12, 16, 22, 0.72)";
        screwSlot.rotation = cfg.slotRotation;
        screw.addControl(screwSlot);
    });

    const bezelInner = new GUI.Ellipse("speedBezelInner");
    bezelInner.width = "232px";
    bezelInner.height = "232px";
    bezelInner.thickness = 2;
    bezelInner.color = "rgba(196, 210, 228, 0.22)";
    bezelInner.background = "rgba(8, 12, 18, 0.99)";
    bezel.addControl(bezelInner);

    const faceRing = new GUI.Ellipse("speedFaceRing");
    faceRing.width = "220px";
    faceRing.height = "220px";
    faceRing.thickness = 1;
    faceRing.color = "rgba(255, 255, 255, 0.08)";
    faceRing.background = "rgba(16, 22, 31, 0.55)";
    bezelInner.addControl(faceRing);

    const glowRing = new GUI.Ellipse("speedGlowRing");
    glowRing.width = "214px";
    glowRing.height = "214px";
    glowRing.thickness = 2;
    glowRing.color = "rgba(214, 228, 244, 0.12)";
    glowRing.background = "transparent";
    bezelInner.addControl(glowRing);

    const glass = new GUI.Ellipse("speedGlass");
    glass.width = "210px";
    glass.height = "210px";
    glass.thickness = 0;
    glass.background = "rgba(255, 255, 255, 0.02)";
    bezelInner.addControl(glass);

    const lowerShade = new GUI.Ellipse("speedLowerShade");
    lowerShade.width = "196px";
    lowerShade.height = "110px";
    lowerShade.thickness = 0;
    lowerShade.background = "rgba(0, 0, 0, 0.24)";
    lowerShade.top = "48px";
    bezelInner.addControl(lowerShade);

    const glassHighlight = new GUI.Ellipse("speedGlassHighlight");
    glassHighlight.width = "182px";
    glassHighlight.height = "84px";
    glassHighlight.thickness = 0;
    glassHighlight.background = "rgba(255, 255, 255, 0.045)";
    glassHighlight.top = "-66px";
    glassHighlight.left = "-8px";
    bezelInner.addControl(glassHighlight);

    const title = new GUI.TextBlock("speedTitle", "AIRSPEED");
    title.color = "#f7fbff";
    title.fontSize = 16;
    title.fontWeight = "800";
    title.letterSpacing = 2;
    title.shadowColor = "rgba(0, 0, 0, 0.35)";
    title.shadowBlur = 4;
    title.shadowOffsetX = 0;
    title.shadowOffsetY = 1;
    title.top = "-28px";
    bezelInner.addControl(title);

    for (let value = App.speedIndicatorConfig.dialMinValue; value <= App.speedIndicatorConfig.dialMaxValue; value += App.speedIndicatorConfig.majorTickStep) {
        App.addSpeedIndicatorTick(bezelInner, value, true);
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
    hubOuter.width = "30px";
    hubOuter.height = "30px";
    hubOuter.thickness = 2;
    hubOuter.color = "rgba(255, 255, 255, 0.34)";
    hubOuter.background = "#141c26";
    hubOuter.shadowColor = "rgba(0, 0, 0, 0.42)";
    hubOuter.shadowBlur = 12;
    hubOuter.shadowOffsetX = 0;
    hubOuter.shadowOffsetY = 2;
    bezelInner.addControl(hubOuter);

    const hubInner = new GUI.Ellipse("speedHubInner");
    hubInner.width = "14px";
    hubInner.height = "14px";
    hubInner.thickness = 1;
    hubInner.color = "rgba(255, 255, 255, 0.54)";
    hubInner.background = "#313d4b";
    hubOuter.addControl(hubInner);

    const hubCenter = new GUI.Ellipse("speedHubCenter");
    hubCenter.width = "6px";
    hubCenter.height = "6px";
    hubCenter.thickness = 0;
    hubCenter.background = "rgba(201, 214, 227, 0.95)";
    hubInner.addControl(hubCenter);

    const speedZone = new GUI.Rectangle("speedZoneBadge");
    speedZone.width = "84px";
    speedZone.height = "26px";
    speedZone.thickness = 1;
    speedZone.cornerRadius = 13;
    speedZone.color = "rgba(255, 255, 255, 0.16)";
    speedZone.background = "rgba(22, 47, 70, 0.94)";
    speedZone.top = "104px";
    speedZone.shadowColor = "rgba(0, 0, 0, 0.25)";
    speedZone.shadowBlur = 10;
    speedZone.shadowOffsetX = 0;
    speedZone.shadowOffsetY = 2;
    bezelInner.addControl(speedZone);

    const speedZoneText = new GUI.TextBlock("speedZoneText", "LOW");
    speedZoneText.color = "#ffffff";
    speedZoneText.fontSize = 11;
    speedZoneText.fontWeight = "700";
    speedZoneText.letterSpacing = 1;
    speedZone.addControl(speedZoneText);

    App.speedIndicator = {
        panel: panel,
        bezel: bezel,
        bezelInner: bezelInner,
        glowRing: glowRing,
        needle: needle,
        needleShadow: needleShadow,
        tail: tail,
        speedZone: speedZone,
        speedZoneText: speedZoneText,
        setSpeed(speed) {
            const clamped = BABYLON.Scalar.Clamp(
                speed,
                App.speedIndicatorConfig.minSpeed,
                App.speedIndicatorConfig.maxSpeed
            );
            const angleDeg = App.getSpeedIndicatorAngle(clamped);
            const zone = App.getSpeedZone(clamped);
            const colors = App.getSpeedZoneColors(zone);
            const angleRad = BABYLON.Tools.ToRadians(angleDeg - 90);

            if (this.lastZone === zone && this.lastAngle !== undefined && Math.abs(this.lastAngle - angleDeg) < 0.35) {
                return;
            }

            this.lastAngle = angleDeg;
            this.lastZone = zone;

            this.needle.rotation = angleRad;
            this.needleShadow.rotation = angleRad;
            this.tail.rotation = angleRad;

            this.speedZoneText.text = zone.toUpperCase();

            this.bezel.color = colors.ring;
            this.glowRing.color = colors.inner;
            this.needle.background = colors.needle;
            this.speedZone.background = colors.badge;

        },
        dispose() {
            this.panel.dispose();
        }
    };

    App.speedIndicator.setSpeed(App.getDisplayedAirspeed());
    return App.speedIndicator;
};

App.updateHud = function (force = false) {
    if (!App.player) {
        return;
    }

    const cache = App.hudCache;
    const now = performance.now();
    const nextHealth = Math.ceil(App.player.health);
    const nextMoney = App.money;
    const nextScore = App.score;
    const nextTime = Math.floor(App.survivalTime);
    const nextLevel = App.difficultyLevel;
    const nextSpeed = Math.round(App.getDisplayedAirspeed() * 2) / 2;
    const nextZone = App.getSpeedZone(nextSpeed);
    const textChanged = force
        || cache.health !== nextHealth
        || cache.money !== nextMoney
        || cache.score !== nextScore
        || cache.time !== nextTime
        || cache.level !== nextLevel;

    if (textChanged || now - cache.lastRenderAt >= App.performance.hudRefreshMs) {
        if (cache.health !== nextHealth) {
            App.ui.healthValue.textContent = nextHealth;
            cache.health = nextHealth;
        }
        if (cache.money !== nextMoney) {
            App.ui.moneyValue.textContent = nextMoney;
            cache.money = nextMoney;
        }
        if (cache.score !== nextScore) {
            App.ui.scoreValue.textContent = nextScore;
            cache.score = nextScore;
        }
        if (cache.time !== nextTime) {
            App.ui.timeValue.textContent = nextTime;
            cache.time = nextTime;
        }
        if (cache.level !== nextLevel) {
            App.ui.levelValue.textContent = nextLevel;
            cache.level = nextLevel;
        }
        cache.lastRenderAt = now;
    }

    if (force || cache.speed !== nextSpeed || cache.speedZone !== nextZone) {
        App.buildSpeedIndicator().setSpeed(nextSpeed);
        cache.speed = nextSpeed;
        cache.speedZone = nextZone;
    }
};

App.clearDynamicObjects = function () {
    App.enemies.forEach(enemy => enemy.mesh.dispose());
    App.playerBullets.forEach(bullet => App.disposeProjectile(bullet));
    App.enemyBullets.forEach(bullet => App.disposeProjectile(bullet));
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
    App.updateHud(true);
};
