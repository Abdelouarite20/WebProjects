App.playerCrashed = false;
App.playerRespawnDelay = 1.6;
App.crashColliders = App.crashColliders || [];

App.registerCrashCollider = function (node, padding) {
    if (!node) {
        return;
    }

    const colliderPadding = padding || 0;
    const meshes = [];

    if (node.getBoundingInfo) {
        meshes.push(node);
    }

    if (node.getChildMeshes) {
        node.getChildMeshes(false).forEach(function (child) {
            if (child && child.getBoundingInfo) {
                meshes.push(child);
            }
        });
    }

    meshes.forEach(function (mesh) {
        if (!mesh) {
            return;
        }

        mesh.metadata = mesh.metadata || {};
        mesh.metadata.isCrashCollider = true;
        mesh.metadata.crashPadding = colliderPadding;
        mesh.metadata.crashOwner = node;
        mesh.metadata.crashKind = node.metadata?.crashKind || mesh.metadata.crashKind;
        mesh.metadata.crashDestructible = node.metadata?.crashDestructible === true;
        mesh.metadata.crashExplosionOffset = node.metadata?.crashExplosionOffset || null;

        if (!App.crashColliders.includes(mesh)) {
            App.crashColliders.push(mesh);
        }
    });
};

App.getCrashMeshInfo = function (mesh) {
    if (!mesh || !mesh.getBoundingInfo) {
        return null;
    }

    const info = mesh.getBoundingInfo();
    const center = info.boundingBox.centerWorld.clone();
    const ext = info.boundingBox.extendSizeWorld;
    const radius = Math.max(ext.x, ext.y, ext.z) + (mesh.metadata?.crashPadding || 0);

    return {
        center: center,
        radius: radius
    };
};

App.getPlayerCrashCenter = function () {
    const forward = App.player.forward || App.getPlayerForward();
    return App.player.mesh.position.add(forward.scale(1.8));
};

App.getPlayerCrashRadius = function () {
    return App.player.collisionRadius || 2.2;
};

App.triggerObstacleCrash = function (mesh, forward) {
    if (!mesh || !mesh.metadata?.crashDestructible) {
        return;
    }

    const owner = mesh.metadata.crashOwner || mesh;
    if (!owner || owner._crashDestroyed) {
        return;
    }

    owner._crashDestroyed = true;

    let obstaclePosition = owner.getAbsolutePosition
        ? owner.getAbsolutePosition().clone()
        : mesh.getAbsolutePosition
            ? mesh.getAbsolutePosition().clone()
            : mesh.position.clone();

    if (mesh.metadata.crashExplosionOffset) {
        obstaclePosition.addInPlace(mesh.metadata.crashExplosionOffset);
    }

    const obstacleSize = mesh.metadata.crashKind === "house" ? 2.8 : 2.2;
    App.createCrashExplosion(obstaclePosition, forward, obstacleSize, owner, {
        shake: false,
        lightIntensity: 10 + obstacleSize * 2,
        debrisCount: mesh.metadata.crashKind === "house" ? 16 : 10
    });
    owner.dispose();
};

App.createCrashExplosion = function (position, forward, size, sourceNode, options) {
    const dir = (forward && forward.lengthSquared() > 0.001)
        ? forward.clone().normalize()
        : new BABYLON.Vector3(0, 0, 1);
    const crashOptions = options || {};

    App.createCrashParticleExplosion(position, size * 1.05);
    App.createExplosion(position, new BABYLON.Color3(1.0, 0.56, 0.16), size);
    App.createExplosion(position.add(dir.scale(1.4)), new BABYLON.Color3(1.0, 0.76, 0.28), size * 0.82);
    App.createExplosion(position.add(new BABYLON.Vector3(0.9, 0.35, -0.4)), new BABYLON.Color3(0.95, 0.34, 0.12), size * 0.64);
    App.createExplosion(position.add(new BABYLON.Vector3(-0.8, 0.22, 0.5)), new BABYLON.Color3(1.0, 0.42, 0.16), size * 0.58);

    if (App.spawnExplosionLight) {
        App.spawnExplosionLight(position, {
            intensity: crashOptions.lightIntensity || (14 + size * 2.4),
            range: 14 + size * 7,
            duration: 140 + size * 24
        });
    }

    if (crashOptions.shake !== false && App.shakeCamera) {
        App.shakeCamera(App.camera, {
            duration: 260 + size * 18,
            intensity: Math.min(0.4, 0.12 + size * 0.05)
        });
    }

    if (App.spawnCrashDebris) {
        App.spawnCrashDebris(
            position,
            sourceNode || App.player.mesh,
            crashOptions.debrisCount || Math.max(12, Math.floor(10 + size * 3)),
            {
                forward: dir,
                spread: 0.8 + size * 0.08,
                speed: 5 + size * 1.1,
                speedVariance: 8,
                gravity: 14,
                life: 1.5
            }
        );
    }
};

App.crashPlayer = function (hitPosition, size, sourceNode) {
    if (App.playerCrashed) {
        return;
    }

    App.playerCrashed = true;
    App.player.health = 0;
    App.updateHud();

    const forward = App.player.forward || App.getPlayerForward();
    const playerImpactPoint = App.getPlayerCrashCenter();
    const crashSize = size || 3.1;
    let crashPos = playerImpactPoint.clone();

    if (hitPosition) {
        crashPos = BABYLON.Vector3.Lerp(playerImpactPoint, hitPosition, 0.35);
        crashPos.y = Math.max(crashPos.y, App.player.mesh.position.y - 0.4);
    }

    App.createCrashExplosion(crashPos, forward, crashSize, sourceNode || App.player.mesh, {
        shake: true,
        lightIntensity: 14 + crashSize * 2.6,
        debrisCount: 16
    });

    App.player.mesh.setEnabled(false);

    setTimeout(function () {
        if (!App.player) {
            return;
        }

        App.player.mesh.setEnabled(true);
        App.player.mesh.position = new BABYLON.Vector3(0, 7.5, -18);
        App.player.mesh.rotation = new BABYLON.Vector3(0.08, 0, 0);
        App.player.health = 100;
        App.player.speed = App.player.baseSpeed;
        App.player.indicatedSpeed = App.player.baseSpeed;
        App.player.shieldTime = 0;
        App.player.speedTime = 0;
        App.player.turningOver = false;
        App.player.turnOverTime = 0;
        App.player.pitch = 0;
        App.player.yaw = 0;
        App.player.roll = 0;
        App.player.forward = new BABYLON.Vector3(0, 0, 1);
        App.player.propellerSpin = App.player.propellerMinSpin || 18;
        App.playerShootTimer = 0.35;
        App.playerCrashed = false;
        App.updateHud();
    }, App.playerRespawnDelay * 1000);
};

App.checkPlayerCrashCollisions = function () {
    if (App.playerCrashed) {
        return false;
    }

    const playerCenter = App.getPlayerCrashCenter();
    const playerRadius = App.getPlayerCrashRadius();

    for (let i = App.crashColliders.length - 1; i >= 0; i--) {
        const mesh = App.crashColliders[i];

        if (!mesh || (mesh.isDisposed && mesh.isDisposed())) {
            App.crashColliders.splice(i, 1);
            continue;
        }

        if (mesh === App.player.mesh || !mesh.isEnabled || !mesh.isEnabled()) {
            continue;
        }

        const meshInfo = App.getCrashMeshInfo(mesh);
        if (!meshInfo) {
            continue;
        }

        if (BABYLON.Vector3.Distance(playerCenter, meshInfo.center) < playerRadius + meshInfo.radius) {
            App.triggerObstacleCrash(mesh, App.player.forward || App.getPlayerForward());
            App.crashPlayer(meshInfo.center, 3.1, App.player.mesh);
            return true;
        }
    }

    for (let i = App.enemies.length - 1; i >= 0; i--) {
        const enemy = App.enemies[i];
        if (!enemy || !enemy.mesh) {
            continue;
        }

        if (BABYLON.Vector3.Distance(playerCenter, enemy.mesh.position) < playerRadius + 3.0) {
            const enemyImpact = enemy.mesh.position.clone();
            enemy.mesh.dispose();
            App.enemies.splice(i, 1);
            App.crashPlayer(enemyImpact, 3.1, App.player.mesh);
            return true;
        }
    }

    return false;
};

App.createPlayer = function () {
    const plane = App.createPlaneMesh(
        "player",
        new BABYLON.Color3(0.34, 0.39, 0.35),
        new BABYLON.Color3(0.28, 0.34, 0.29),
        new BABYLON.Color3(0.8, 0.72, 0.18)
    );

    plane.root.position = new BABYLON.Vector3(0, 36, -120);
    plane.root.rotation = new BABYLON.Vector3(0, 0, 0);

    App.player = {
        mesh: plane.root,
        propeller: plane.propeller,

        speed: 20,
        baseSpeed: 20,
        cruiseSpeed: 20,
        minSpeed: 20,
        maxSpeed: 200,

        indicatedSpeed: 20,

        health: 100,
        shieldTime: 0,
        speedTime: 0,

        yawSpeed: 1.45,
        pitchSpeed: 1.1,
        rollSpeed: 2.2,
        maxPitch: 0.7,

        minAltitude: 16,
        maxAltitude: 320,
        bounds: 1680,
        collisionRadius: 2.2,

        pitch: 0,
        yaw: 0,
        roll: 0,

        turningOver: false,
        turnOverTime: 0,
        turnOverDuration: 1.2,
        turnOverStartPitch: 0,
        turnOverStartYaw: 0,

        throttle: 0,
        forward: new BABYLON.Vector3(0, 0, 1),

        propellerSpin: 18,
        propellerMinSpin: 18,
        propellerMaxSpin: 95,
        propellerResponse: 6
    };
};

App.getPlayerForward = function () {
    return BABYLON.Vector3.TransformNormal(
        new BABYLON.Vector3(0, 0, 1),
        App.player.mesh.getWorldMatrix()
    ).normalize();
};

App.getPlayerDisplayedSpeed = function () {
    if (!App.player) {
        return 20;
    }

    const sourceSpeed = Number.isFinite(App.player.indicatedSpeed)
        ? App.player.indicatedSpeed
        : App.player.speed;

    return BABYLON.Scalar.Clamp(
        sourceSpeed,
        App.player.minSpeed || 20,
        App.player.maxSpeed || 200
    );
};

App.updateMouseAim = function () {
    if (!App.scene || !App.camera) {
        return;
    }

    const x = App.mouse.x || App.engine.getRenderWidth() * 0.5;
    const y = App.mouse.y || App.engine.getRenderHeight() * 0.5;
    const ray = App.scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), App.camera);
    App.mouse.aimPoint = ray.origin.add(ray.direction.scale(320));
};

App.updatePlayer = function (deltaTime) {
    if (App.playerCrashed) {
        return;
    }

    const turnLeft = App.keys["a"] || App.keys["arrowleft"];
    const turnRight = App.keys["d"] || App.keys["arrowright"];
    const pitchUp = App.keys["w"] || App.keys["arrowup"];
    const pitchDown = App.keys["s"] || App.keys["arrowdown"];
    const speedUp = App.keys["q"];
    const speedDown = App.keys["e"];

    if (App.player.turningOver) {
        App.updatePlayerTurnOver(deltaTime);
        return;
    }

    if (turnLeft) {
        App.player.yaw -= App.player.yawSpeed * deltaTime;
        App.player.roll = BABYLON.Scalar.Lerp(App.player.roll, 0.55, 0.08);
    } else if (turnRight) {
        App.player.yaw += App.player.yawSpeed * deltaTime;
        App.player.roll = BABYLON.Scalar.Lerp(App.player.roll, -0.55, 0.08);
    } else {
        App.player.roll = BABYLON.Scalar.Lerp(App.player.roll, 0, 0.08);
    }

    if (pitchUp) {
        App.player.pitch += App.player.pitchSpeed * deltaTime;
    }
    if (pitchDown) {
        App.player.pitch -= App.player.pitchSpeed * deltaTime;
    }

    App.player.pitch = BABYLON.Scalar.Clamp(
        App.player.pitch,
        -App.player.maxPitch,
        App.player.maxPitch
    );
    App.player.pitch = BABYLON.Scalar.Lerp(App.player.pitch, 0, 0.015);

    if (speedUp) {
        App.player.speed += 8 * deltaTime;
    } else if (App.player.speed > App.player.cruiseSpeed) {
        App.player.speed -= 8 * deltaTime;
    }

    if (speedDown && App.player.speed > App.player.cruiseSpeed) {
        App.player.speed -= 18 * deltaTime;
        if (App.player.speed < App.player.cruiseSpeed) {
            App.player.speed = App.player.cruiseSpeed;
        }
    }

    App.player.speed = BABYLON.Scalar.Clamp(
        App.player.speed,
        App.player.minSpeed,
        App.player.maxSpeed
    );
    App.player.indicatedSpeed = App.player.speed;

    App.player.mesh.rotation.x = -App.player.pitch;
    App.player.mesh.rotation.y = App.player.yaw;
    App.player.mesh.rotation.z = App.player.roll;

    App.updatePlanePropeller(App.player, deltaTime);

    App.player.forward = App.getPlayerForward();
    App.updateMouseAim();

    App.player.mesh.position.addInPlace(
        App.player.forward.scale(App.player.speed * deltaTime)
    );

    App.player.mesh.position.x = BABYLON.Scalar.Clamp(
        App.player.mesh.position.x,
        -App.player.bounds,
        App.player.bounds
    );
    App.player.mesh.position.z = BABYLON.Scalar.Clamp(
        App.player.mesh.position.z,
        -App.player.bounds,
        App.player.bounds
    );
    App.player.mesh.position.y = BABYLON.Scalar.Clamp(
        App.player.mesh.position.y,
        App.player.minAltitude,
        App.player.maxAltitude
    );

    if (App.checkPlayerCrashCollisions()) {
        return;
    }

    if (App.player.mesh.position.y === App.player.minAltitude && App.player.pitch < 0) {
        App.player.pitch = 0;
    }

    if (App.player.mesh.position.y === App.player.maxAltitude && App.player.pitch > 0) {
        App.startPlayerTurnOver();
    }

    App.playerShootTimer -= deltaTime;
    if ((App.mouse.down || App.keys[" "]) && App.playerShootTimer <= 0) {
        App.shootPlayerBullet(App.player.mesh, App.mouse.aimPoint);
        App.playerShootTimer = 0.16;
    }

    if (App.player.shieldTime > 0) {
        App.player.shieldTime -= deltaTime;
    }

    if (App.player.speedTime > 0) {
        App.player.speedTime -= deltaTime;
        if (App.player.speedTime <= 0) {
            App.player.maxSpeed = 200;
            App.player.speed = Math.min(App.player.speed, App.player.baseSpeed);
        }
    }
};

App.startPlayerTurnOver = function () {
    if (App.player.turningOver) {
        return;
    }

    App.player.turningOver = true;
    App.player.turnOverTime = 0;
    App.player.turnOverStartYaw = App.player.yaw;
    App.player.turnOverStartPitch = App.player.pitch;
    App.player.pitch = 0;
    App.player.roll = 0;
    App.player.mesh.position.y = App.player.maxAltitude;
};

App.updatePlayerTurnOver = function (deltaTime) {
    if (App.playerCrashed) {
        return;
    }

    App.player.turnOverTime += deltaTime;

    const ratio = BABYLON.Scalar.Clamp(
        App.player.turnOverTime / App.player.turnOverDuration,
        0,
        1
    );
    const ease = ratio * ratio * (3 - 2 * ratio);
    const targetPitch = Math.PI - 0.08;

    App.player.speed = Math.max(App.player.speed, App.player.cruiseSpeed + 12);
    App.player.indicatedSpeed = BABYLON.Scalar.Clamp(
        App.player.speed,
        App.player.minSpeed,
        App.player.maxSpeed
    );
    App.player.pitch = BABYLON.Scalar.Lerp(App.player.turnOverStartPitch, targetPitch, ease);
    App.player.yaw = App.player.turnOverStartYaw;
    App.player.roll = 0;

    App.player.mesh.rotation.x = -App.player.pitch;
    App.player.mesh.rotation.y = App.player.yaw;
    App.player.mesh.rotation.z = App.player.roll;

    App.updatePlanePropeller(App.player, deltaTime);

    App.player.forward = App.getPlayerForward();

    App.player.mesh.position.addInPlace(
        App.player.forward.scale(App.player.speed * deltaTime)
    );

    App.player.mesh.position.x = BABYLON.Scalar.Clamp(
        App.player.mesh.position.x,
        -App.player.bounds,
        App.player.bounds
    );
    App.player.mesh.position.z = BABYLON.Scalar.Clamp(
        App.player.mesh.position.z,
        -App.player.bounds,
        App.player.bounds
    );
    App.player.mesh.position.y = BABYLON.Scalar.Clamp(
        App.player.mesh.position.y,
        App.player.minAltitude,
        App.player.maxAltitude + 80
    );

    if (App.checkPlayerCrashCollisions()) {
        return;
    }

    if (ratio >= 1 || App.player.mesh.position.y <= App.player.maxAltitude - 12) {
        App.player.turningOver = false;
        App.player.yaw = App.player.turnOverStartYaw + Math.PI;
        App.player.pitch = -0.18;
        App.player.roll = 0;

        App.player.mesh.rotation.x = -App.player.pitch;
        App.player.mesh.rotation.y = App.player.yaw;
        App.player.mesh.rotation.z = App.player.roll;

        App.player.forward = App.getPlayerForward();
        App.player.mesh.position.y = Math.min(
            App.player.mesh.position.y,
            App.player.maxAltitude - 12
        );
    }
};