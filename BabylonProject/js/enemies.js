App.createEnemy = function () {
    const plane = App.createPlaneMesh(
        "enemy" + Math.random(),
        new BABYLON.Color3(0.54, 0.18, 0.16),
        new BABYLON.Color3(0.43, 0.15, 0.15),
        new BABYLON.Color3(0.86, 0.82, 0.75)
    );

    const angle = Math.random() * Math.PI * 2;
    const radius = 66 + Math.random() * 234;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 18 + Math.random() * 24;
    const enemySpeed = 12 + App.difficultyLevel * 0.8;

    plane.root.position = new BABYLON.Vector3(x, y, z);
    plane.root.rotation.y = Math.atan2(
        App.player.mesh.position.x - x,
        App.player.mesh.position.z - z
    );

    App.enemies.push({
        mesh: plane.root,
        propeller: plane.propeller,

        health: 35 + App.difficultyLevel * 5,
        speed: enemySpeed,
        minSpeed: 10,
        maxSpeed: Math.max(enemySpeed + 4, 24),

        propellerSpin: 14,
        propellerMinSpin: 14,
        propellerMaxSpin: 62,
        propellerResponse: 7,

        shootTimer: Math.random() * 0.7,
        precision: Math.min(0.52 + App.difficultyLevel * 0.05, 0.94),
        rocket: App.difficultyLevel >= 4 && Math.random() < 0.26,
        swayOffset: Math.random() * Math.PI * 2
    });

    App.levelEnemiesSpawned += 1;
};

App.destroyEnemy = function (index) {
    App.createExplosion(
        App.enemies[index].mesh.position,
        new BABYLON.Color3(1, 0.48, 0.12),
        1.8
    );
    App.enemies[index].mesh.dispose();
    App.enemies.splice(index, 1);
    App.score += 10;
    App.money += 15;
    App.updateHud();
};

App.damagePlayer = function (amount) {
    if (App.player.shieldTime > 0) {
        amount *= 0.28;
    }

    App.player.health -= amount;
    if (App.player.health < 0) {
        App.player.health = 0;
    }

    App.createExplosion(
        App.player.mesh.position.add(new BABYLON.Vector3(0, 0, 1.2)),
        new BABYLON.Color3(1, 0.58, 0.14),
        0.9
    );

    App.updateHud();
    if (App.player.health <= 0) {
        App.crashPlayer(App.player.mesh.position);
    }
};

App.updateEnemies = function (deltaTime) {
    if (App.levelActive && App.levelEnemiesSpawned < App.levelEnemyTarget) {
        App.enemySpawnTimer += deltaTime;
        if (App.enemySpawnTimer >= App.enemySpawnDelay) {
            App.createEnemy();
            App.enemySpawnTimer = 0;
        }
    }

    if (App.levelActive && App.levelEnemiesSpawned >= App.levelEnemyTarget && App.enemies.length === 0) {
        App.levelActive = false;
        App.levelTransitionTime = 0.8;
    }

    if (!App.levelActive && App.levelTransitionTime > 0) {
        App.levelTransitionTime -= deltaTime;
        if (App.levelTransitionTime <= 0) {
            App.startLevel(App.difficultyLevel + 1);
        }
    }

    for (let i = App.enemies.length - 1; i >= 0; i--) {
        const enemy = App.enemies[i];
        const toPlayer = App.player.mesh.position.subtract(enemy.mesh.position);
        const direction = toPlayer.normalize();

        enemy.mesh.position.addInPlace(direction.scale(enemy.speed * deltaTime));
        enemy.mesh.position.x += Math.sin(App.survivalTime * 1.4 + enemy.swayOffset) * 3.5 * deltaTime;
        enemy.mesh.position.y += Math.sin(App.survivalTime * 1.8 + enemy.swayOffset) * 1.8 * deltaTime;
        enemy.mesh.position.y = BABYLON.Scalar.Clamp(enemy.mesh.position.y, 10, 52);

        enemy.mesh.rotation.y = Math.atan2(direction.x, direction.z);
        enemy.mesh.rotation.x = -0.04 + direction.y * 0.2;
        enemy.mesh.rotation.z = Math.sin(App.survivalTime * 1.4 + enemy.swayOffset) * 0.18;

        App.updatePlanePropeller(enemy, deltaTime);

        enemy.shootTimer += deltaTime;

        const shootDelay = Math.max(1.7 - App.difficultyLevel * 0.08, 0.6);
        if (enemy.shootTimer >= shootDelay && toPlayer.length() < 90) {
            App.shootEnemyBullet(enemy);
            enemy.shootTimer = 0;
        }

        if (!App.playerCrashed && enemy.mesh.position.subtract(App.player.mesh.position).length() < 2.8) {
            const enemyImpact = enemy.mesh.position.clone();
            enemy.mesh.dispose();
            App.enemies.splice(i, 1);
            App.crashPlayer(enemyImpact, 3.1);
            continue;
        }

        const distanceFromCenter = Math.sqrt(
            enemy.mesh.position.x * enemy.mesh.position.x +
            enemy.mesh.position.z * enemy.mesh.position.z
        );

        if (distanceFromCenter > App.arenaRadius + 20) {
            enemy.mesh.position.x *= 0.92;
            enemy.mesh.position.z *= 0.92;
        }
    }
};