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
    App.player.turnOverTime += deltaTime;

    const ratio = BABYLON.Scalar.Clamp(
        App.player.turnOverTime / App.player.turnOverDuration,
        0,
        1
    );
    const ease = ratio * ratio * (3 - 2 * ratio);
    const targetPitch = Math.PI - 0.08;

    App.player.speed = Math.max(App.player.speed, App.player.cruiseSpeed + 12);
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