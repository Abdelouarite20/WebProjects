App.getProjectileMaterials = function () {
    if (App.projectileMaterials) {
        return App.projectileMaterials;
    }

    const makeMat = function (name, options) {
        const mat = new BABYLON.StandardMaterial(name, App.scene);
        mat.diffuseColor = options.diffuseColor || BABYLON.Color3.Black();
        mat.emissiveColor = options.emissiveColor || BABYLON.Color3.Black();
        mat.specularColor = options.specularColor || BABYLON.Color3.Black();
        mat.alpha = options.alpha !== undefined ? options.alpha : 1;
        mat.disableLighting = options.disableLighting !== undefined ? options.disableLighting : true;
        return mat;
    };

    App.projectileMaterials = {
        playerCore: makeMat("playerBulletCoreMat", {
            diffuseColor: new BABYLON.Color3(1.0, 0.96, 0.72),
            emissiveColor: new BABYLON.Color3(1.0, 0.92, 0.38)
        }),
        playerGlow: makeMat("playerBulletGlowMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.82, 0.18),
            alpha: 0.32
        }),
        playerTip: makeMat("playerBulletTipMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.98, 0.9)
        }),

        enemyCore: makeMat("enemyBulletCoreMat", {
            diffuseColor: new BABYLON.Color3(1.0, 0.55, 0.44),
            emissiveColor: new BABYLON.Color3(1.0, 0.24, 0.18)
        }),
        enemyGlow: makeMat("enemyBulletGlowMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.18, 0.12),
            alpha: 0.28
        }),
        enemyTip: makeMat("enemyBulletTipMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.86, 0.82)
        }),

        rocketCore: makeMat("rocketCoreMat", {
            diffuseColor: new BABYLON.Color3(0.28, 0.3, 0.34),
            emissiveColor: new BABYLON.Color3(0.25, 0.18, 0.12),
            disableLighting: false
        }),
        rocketNose: makeMat("rocketNoseMat", {
            diffuseColor: new BABYLON.Color3(0.86, 0.42, 0.16),
            emissiveColor: new BABYLON.Color3(0.8, 0.32, 0.12)
        }),
        rocketFlame: makeMat("rocketFlameMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.62, 0.16),
            alpha: 0.46
        }),

        trailYellow: makeMat("trailYellowMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.82, 0.22),
            alpha: 0.22
        }),
        trailRed: makeMat("trailRedMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.26, 0.14),
            alpha: 0.18
        }),
        trailSmoke: makeMat("trailSmokeMat", {
            diffuseColor: new BABYLON.Color3(0.16, 0.16, 0.18),
            emissiveColor: new BABYLON.Color3(0.1, 0.1, 0.1),
            alpha: 0.14,
            disableLighting: false
        }),

        muzzleYellow: makeMat("muzzleYellowMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.88, 0.42),
            alpha: 0.55
        }),
        muzzleRed: makeMat("muzzleRedMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.34, 0.2),
            alpha: 0.5
        })
    };

    return App.projectileMaterials;
};

App.orientMeshToVelocity = function (mesh, velocity) {
    if (!mesh || !velocity || velocity.lengthSquared() < 0.0001) {
        return;
    }

    const direction = velocity.normalize();
    mesh.lookAt(mesh.position.add(direction));
};

App.createTrail = function (position, color, direction, length, thickness, alpha, materialOverride) {
    const trail = BABYLON.MeshBuilder.CreateBox("trail", {
        width: thickness || 0.12,
        height: thickness || 0.12,
        depth: length || 1.2
    }, App.scene);

    trail.position = position.clone();
    trail.isPickable = false;
    trail.alwaysSelectAsActiveMesh = true;

    if (direction && direction.lengthSquared() > 0.0001) {
        App.orientMeshToVelocity(trail, direction.clone());
    }

    if (materialOverride) {
        trail.material = materialOverride;
    } else {
        const mat = new BABYLON.StandardMaterial("trailMat" + Math.random(), App.scene);
        mat.emissiveColor = color;
        mat.alpha = alpha !== undefined ? alpha : 0.24;
        mat.specularColor = BABYLON.Color3.Black();
        mat.disableLighting = true;
        trail.material = mat;
    }

    App.particles.push({ mesh: trail, life: 0.08 });
};

App.createMuzzleFlash = function (position, direction, material, scale) {
    const flash = BABYLON.MeshBuilder.CreateSphere("muzzleFlash", {
        diameter: scale || 0.85,
        segments: 8
    }, App.scene);

    flash.position = position.clone();
    flash.material = material;
    flash.isPickable = false;
    flash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    App.particles.push({ mesh: flash, life: 0.05 });

    if (direction && direction.lengthSquared() > 0.0001) {
        const streak = BABYLON.MeshBuilder.CreateBox("muzzleStreak", {
            width: (scale || 0.85) * 0.24,
            height: (scale || 0.85) * 0.24,
            depth: (scale || 0.85) * 1.6
        }, App.scene);

        streak.position = position.clone().add(direction.normalize().scale((scale || 0.85) * 0.45));
        streak.material = material;
        streak.isPickable = false;
        App.orientMeshToVelocity(streak, direction.clone());

        App.particles.push({ mesh: streak, life: 0.04 });
    }
};

App.createBullet = function (position, velocity, color, damage, size, type) {
    const mats = App.getProjectileMaterials();
    const bulletType = type || "player";
    const direction = velocity.clone().normalize();

    const root = BABYLON.MeshBuilder.CreateBox("bullet", {
        width: size * 0.34,
        height: size * 0.34,
        depth: size * 2.8
    }, App.scene);

    root.position = position.clone();
    root.isPickable = false;
    root.alwaysSelectAsActiveMesh = true;
    App.orientMeshToVelocity(root, direction.clone());

    let coreMat = mats.playerCore;
    let glowMat = mats.playerGlow;
    let tipMat = mats.playerTip;
    let trailMat = mats.trailYellow;
    let trailLength = 1.9;
    let trailThickness = size * 0.9;
    let trailAlpha = 0.22;
    let trailInterval = 0.012;
    let lifeDistance = 1100;

    if (bulletType === "enemy") {
        coreMat = mats.enemyCore;
        glowMat = mats.enemyGlow;
        tipMat = mats.enemyTip;
        trailMat = mats.trailRed;
        trailLength = 1.35;
        trailThickness = size * 0.82;
        trailAlpha = 0.18;
        trailInterval = 0.018;
        lifeDistance = 950;
    }

    if (bulletType === "rocket") {
        root.scaling.set(1.15, 1.15, 1.45);
        coreMat = mats.rocketCore;
        glowMat = mats.rocketFlame;
        tipMat = mats.rocketNose;
        trailMat = mats.trailSmoke;
        trailLength = 2.5;
        trailThickness = size * 1.05;
        trailAlpha = 0.14;
        trailInterval = 0.026;
        lifeDistance = 980;
    }

    root.material = coreMat;

    const glow = BABYLON.MeshBuilder.CreateBox("bulletGlow", {
        width: size * 0.72,
        height: size * 0.72,
        depth: size * 4.4
    }, App.scene);
    glow.parent = root;
    glow.position.z = 0;
    glow.material = glowMat;
    glow.isPickable = false;

    const tip = BABYLON.MeshBuilder.CreateSphere("bulletTip", {
        diameter: size * 0.7,
        segments: 8
    }, App.scene);
    tip.parent = root;
    tip.position.z = size * 1.35;
    tip.material = tipMat;
    tip.isPickable = false;

    if (bulletType === "rocket") {
        const flame = BABYLON.MeshBuilder.CreateBox("rocketFlame", {
            width: size * 0.52,
            height: size * 0.52,
            depth: size * 2.6
        }, App.scene);
        flame.parent = root;
        flame.position.z = -size * 1.8;
        flame.material = mats.rocketFlame;
        flame.isPickable = false;
    }

    return {
        mesh: root,
        velocity: velocity,
        damage: damage,
        type: bulletType,
        trailMaterial: trailMat,
        trailLength: trailLength,
        trailThickness: trailThickness,
        trailAlpha: trailAlpha,
        trailInterval: trailInterval,
        trailTimer: 0,
        maxDistance: lifeDistance
    };
};

App.shootPlayerBullet = function (originMesh, aimPoint) {
    const mats = App.getProjectileMaterials();

    let forward = BABYLON.Vector3.TransformNormal(
        new BABYLON.Vector3(0, 0, 1),
        originMesh.getWorldMatrix()
    ).normalize();

    if (aimPoint) {
        const aimedDirection = aimPoint.subtract(originMesh.position);
        if (aimedDirection.lengthSquared() > 0.001) {
            forward = aimedDirection.normalize();
        }
    }

    const muzzle = originMesh.position.add(forward.scale(6.2));
    App.createMuzzleFlash(muzzle, forward, mats.muzzleYellow, 0.9);

    const bullet = App.createBullet(
        muzzle,
        forward.scale(2.2),
        new BABYLON.Color3(1, 0.94, 0.25),
        12,
        0.22,
        "player"
    );

    App.playerBullets.push(bullet);
};

App.shootEnemyBullet = function (enemy) {
    const mats = App.getProjectileMaterials();

    const start = enemy.mesh.position.add(new BABYLON.Vector3(0, 0, -3.4));
    const direction = App.player.mesh.position.subtract(start);
    direction.y *= 0.48;
    direction.normalize();

    const miss = 1 - enemy.precision;
    direction.x += (Math.random() - 0.5) * miss;
    direction.y += (Math.random() - 0.5) * miss * 0.4;
    direction.z += (Math.random() - 0.5) * miss;
    direction.normalize();

    const isRocket = !!enemy.rocket;
    const speed = isRocket ? 1.05 : 1.18;
    const damage = isRocket ? 18 : 8;
    const size = isRocket ? 0.4 : 0.2;

    App.createMuzzleFlash(
        start,
        direction,
        isRocket ? mats.muzzleRed : mats.muzzleRed,
        isRocket ? 1.0 : 0.68
    );

    App.enemyBullets.push(
        App.createBullet(
            start,
            direction.scale(speed),
            isRocket ? new BABYLON.Color3(1, 0.42, 0.12) : new BABYLON.Color3(1, 0.18, 0.16),
            damage,
            size,
            isRocket ? "rocket" : "enemy"
        )
    );
};

App.updatePlayerBullets = function (deltaTime) {
    for (let i = App.playerBullets.length - 1; i >= 0; i--) {
        const bullet = App.playerBullets[i];

        bullet.mesh.position.addInPlace(bullet.velocity.scale(70 * deltaTime));
        App.orientMeshToVelocity(bullet.mesh, bullet.velocity.clone());

        bullet.trailTimer -= deltaTime;
        if (bullet.trailTimer <= 0) {
            App.createTrail(
                bullet.mesh.position,
                new BABYLON.Color3(1, 0.85, 0.2),
                bullet.velocity.clone(),
                bullet.trailLength,
                bullet.trailThickness,
                bullet.trailAlpha,
                bullet.trailMaterial
            );
            bullet.trailTimer = bullet.trailInterval;
        }

        let removed = false;

        for (let j = App.enemies.length - 1; j >= 0; j--) {
            if (bullet.mesh.position.subtract(App.enemies[j].mesh.position).length() < 8) {
                App.enemies[j].health -= bullet.damage;
                App.createExplosion(bullet.mesh.position, new BABYLON.Color3(1, 0.94, 0.2), 0.55);
                bullet.mesh.dispose();
                App.playerBullets.splice(i, 1);
                removed = true;

                if (App.enemies[j].health <= 0) {
                    App.destroyEnemy(j);
                }
                break;
            }
        }

        if (!removed && bullet.mesh.position.length() > bullet.maxDistance) {
            bullet.mesh.dispose();
            App.playerBullets.splice(i, 1);
        }
    }
};

App.updateEnemyBullets = function (deltaTime) {
    for (let i = App.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = App.enemyBullets[i];
        const moveSpeed = bullet.type === "rocket" ? 52 : 52;

        bullet.mesh.position.addInPlace(bullet.velocity.scale(moveSpeed * deltaTime));
        App.orientMeshToVelocity(bullet.mesh, bullet.velocity.clone());

        bullet.trailTimer -= deltaTime;
        if (bullet.trailTimer <= 0) {
            App.createTrail(
                bullet.mesh.position,
                bullet.type === "rocket" ? new BABYLON.Color3(0.18, 0.18, 0.18) : new BABYLON.Color3(1, 0.35, 0.2),
                bullet.velocity.clone(),
                bullet.trailLength,
                bullet.trailThickness,
                bullet.trailAlpha,
                bullet.trailMaterial
            );
            bullet.trailTimer = bullet.trailInterval;
        }

        if (bullet.mesh.position.subtract(App.player.mesh.position).length() < 1.5) {
            App.damagePlayer(bullet.damage);
            App.createExplosion(
                bullet.mesh.position,
                bullet.type === "rocket" ? new BABYLON.Color3(1, 0.55, 0.18) : new BABYLON.Color3(1, 0.4, 0.18),
                bullet.type === "rocket" ? 0.95 : 0.7
            );
            bullet.mesh.dispose();
            App.enemyBullets.splice(i, 1);
            continue;
        }

        if (
            bullet.mesh.position.z < -60 ||
            Math.abs(bullet.mesh.position.x) > 80 ||
            bullet.mesh.position.y < 0 ||
            bullet.mesh.position.length() > bullet.maxDistance
        ) {
            bullet.mesh.dispose();
            App.enemyBullets.splice(i, 1);
        }
    }
};