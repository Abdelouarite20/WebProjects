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
        mat.backFaceCulling = options.backFaceCulling !== undefined ? options.backFaceCulling : true;
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

        rocketBody: makeMat("rocketBodyMat", {
            diffuseColor: new BABYLON.Color3(0.76, 0.78, 0.82),
            emissiveColor: new BABYLON.Color3(0.08, 0.08, 0.1),
            specularColor: new BABYLON.Color3(0.95, 0.95, 0.98),
            disableLighting: false
        }),
        rocketBand: makeMat("rocketBandMat", {
            diffuseColor: new BABYLON.Color3(0.22, 0.24, 0.3),
            emissiveColor: new BABYLON.Color3(0.1, 0.08, 0.08),
            specularColor: new BABYLON.Color3(0.55, 0.55, 0.6),
            disableLighting: false
        }),
        rocketNose: makeMat("rocketNoseMat", {
            diffuseColor: new BABYLON.Color3(0.9, 0.42, 0.14),
            emissiveColor: new BABYLON.Color3(0.34, 0.12, 0.04),
            specularColor: new BABYLON.Color3(0.85, 0.76, 0.68),
            disableLighting: false
        }),
        rocketNozzle: makeMat("rocketNozzleMat", {
            diffuseColor: new BABYLON.Color3(0.16, 0.17, 0.19),
            emissiveColor: new BABYLON.Color3(0.05, 0.05, 0.05),
            specularColor: new BABYLON.Color3(0.22, 0.22, 0.24),
            disableLighting: false
        }),
        rocketFin: makeMat("rocketFinMat", {
            diffuseColor: new BABYLON.Color3(0.24, 0.25, 0.29),
            emissiveColor: new BABYLON.Color3(0.06, 0.06, 0.07),
            specularColor: new BABYLON.Color3(0.45, 0.45, 0.5),
            disableLighting: false
        }),
        rocketFinAccent: makeMat("rocketFinAccentMat", {
            diffuseColor: new BABYLON.Color3(0.78, 0.34, 0.12),
            emissiveColor: new BABYLON.Color3(0.16, 0.06, 0.02),
            specularColor: new BABYLON.Color3(0.5, 0.38, 0.28),
            disableLighting: false
        }),
        rocketExhaustCore: makeMat("rocketExhaustCoreMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.92, 0.66),
            alpha: 0.86,
            backFaceCulling: false
        }),
        rocketExhaustGlow: makeMat("rocketExhaustGlowMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.56, 0.16),
            alpha: 0.34,
            backFaceCulling: false
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

    const direction = BABYLON.TmpVectors.Vector3[0];
    const target = BABYLON.TmpVectors.Vector3[1];

    direction.copyFrom(velocity);
    direction.normalize();
    target.copyFrom(mesh.position);
    target.addInPlace(direction);
    mesh.lookAt(target);
};

App.createTrail = function (position, color, direction, length, thickness, alpha, materialOverride) {
    if (App.particles.length >= App.performance.maxTrailParticles) {
        return;
    }

    const trail = BABYLON.MeshBuilder.CreateBox("trail", {
        width: thickness || 0.12,
        height: thickness || 0.12,
        depth: length || 1.2
    }, App.scene);

    trail.position.copyFrom(position);
    trail.isPickable = false;

    if (direction && direction.lengthSquared() > 0.0001) {
        App.orientMeshToVelocity(trail, direction);
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
    if (App.particles.length >= App.performance.maxParticles) {
        return;
    }

    const flash = BABYLON.MeshBuilder.CreateSphere("muzzleFlash", {
        diameter: scale || 0.85,
        segments: 8
    }, App.scene);

    flash.position.copyFrom(position);
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

        const streakOffset = BABYLON.TmpVectors.Vector3[2];
        streakOffset.copyFrom(direction);
        streakOffset.normalize();
        streakOffset.scaleInPlace((scale || 0.85) * 0.45);
        streak.position.copyFrom(position);
        streak.position.addInPlace(streakOffset);
        streak.material = material;
        streak.isPickable = false;
        App.orientMeshToVelocity(streak, direction);

        App.particles.push({ mesh: streak, life: 0.04 });
    }
};

App.createRocketSmokeTrail = function (root, size, accentColor) {
    if (!App.getEffectTextures) {
        return null;
    }

    const textures = App.getEffectTextures();
    if (!textures || !textures.smoke) {
        return null;
    }

    const density = App.performance.effectDensity || 1;
    const smoke = new BABYLON.ParticleSystem("rocketSmoke" + Math.random(), Math.max(80, Math.floor(140 * density)), App.scene);
    smoke.particleTexture = textures.smoke;
    smoke.emitter = root;
    smoke.minEmitBox = new BABYLON.Vector3(0, 0, -size * 2.55);
    smoke.maxEmitBox = new BABYLON.Vector3(0, 0, -size * 2.55);
    smoke.color1 = new BABYLON.Color4(1.0, 0.64, 0.2, 0.92);
    smoke.color2 = new BABYLON.Color4(0.24, 0.24, 0.26, 0.76);
    smoke.colorDead = new BABYLON.Color4(0.05, 0.05, 0.05, 0.0);

    if (accentColor) {
        smoke.color1 = new BABYLON.Color4(
            Math.min(1, 0.55 + accentColor.r * 0.52),
            Math.min(1, 0.32 + accentColor.g * 0.7),
            Math.min(1, 0.12 + accentColor.b * 0.45),
            0.92
        );
    }

    smoke.minSize = size * 0.46;
    smoke.maxSize = size * 1.22;
    smoke.minLifeTime = 0.08;
    smoke.maxLifeTime = 0.32;
    smoke.emitRate = 130 * density;
    smoke.minEmitPower = 0.25;
    smoke.maxEmitPower = 0.95;
    smoke.direction1 = new BABYLON.Vector3(-0.18, -0.18, -2.4);
    smoke.direction2 = new BABYLON.Vector3(0.18, 0.18, -3.15);
    smoke.gravity = BABYLON.Vector3.Zero();
    smoke.updateSpeed = 0.015;
    smoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    smoke.disposeOnStop = true;

    if ("isLocal" in smoke) {
        smoke.isLocal = true;
    }

    smoke.start();
    return smoke;
};

App.createRocketVisual = function (root, size, accentColor) {
    const mats = App.getProjectileMaterials();
    const rocketAccent = accentColor ? accentColor.clone() : new BABYLON.Color3(1, 0.44, 0.14);
    const bodyLength = size * 4.6;
    const bodyFront = bodyLength * 0.5;

    const noseMat = mats.rocketNose.clone("rocketNoseInstMat" + Math.random());
    noseMat.diffuseColor = BABYLON.Color3.Lerp(rocketAccent, new BABYLON.Color3(0.98, 0.86, 0.76), 0.28);
    noseMat.emissiveColor = rocketAccent.scale(0.42);

    const bandMat = mats.rocketBand.clone("rocketBandInstMat" + Math.random());
    bandMat.diffuseColor = BABYLON.Color3.Lerp(mats.rocketBand.diffuseColor, rocketAccent, 0.28);
    bandMat.emissiveColor = rocketAccent.scale(0.14);

    const finAccentMat = mats.rocketFinAccent.clone("rocketFinAccentInstMat" + Math.random());
    finAccentMat.diffuseColor = BABYLON.Color3.Lerp(rocketAccent, new BABYLON.Color3(0.7, 0.22, 0.08), 0.18);
    finAccentMat.emissiveColor = rocketAccent.scale(0.16);

    const exhaustCoreMat = mats.rocketExhaustCore.clone("rocketExhaustCoreInstMat" + Math.random());
    exhaustCoreMat.emissiveColor = BABYLON.Color3.Lerp(new BABYLON.Color3(1.0, 0.96, 0.74), rocketAccent, 0.22);

    const exhaustGlowMat = mats.rocketExhaustGlow.clone("rocketExhaustGlowInstMat" + Math.random());
    exhaustGlowMat.emissiveColor = BABYLON.Color3.Lerp(new BABYLON.Color3(1.0, 0.62, 0.18), rocketAccent, 0.32);

    const body = BABYLON.MeshBuilder.CreateCylinder("rocketBody", {
        height: bodyLength,
        diameterTop: size * 0.66,
        diameterBottom: size * 0.8,
        tessellation: 12
    }, App.scene);
    body.parent = root;
    body.rotation.x = Math.PI / 2;
    body.material = mats.rocketBody;
    body.isPickable = false;

    const bandFront = BABYLON.MeshBuilder.CreateCylinder("rocketBandFront", {
        height: size * 0.26,
        diameter: size * 0.84,
        tessellation: 12
    }, App.scene);
    bandFront.parent = root;
    bandFront.rotation.x = Math.PI / 2;
    bandFront.position.z = size * 0.42;
    bandFront.material = bandMat;
    bandFront.isPickable = false;

    const bandRear = BABYLON.MeshBuilder.CreateCylinder("rocketBandRear", {
        height: size * 0.22,
        diameter: size * 0.86,
        tessellation: 12
    }, App.scene);
    bandRear.parent = root;
    bandRear.rotation.x = Math.PI / 2;
    bandRear.position.z = -size * 0.46;
    bandRear.material = bandMat;
    bandRear.isPickable = false;

    const nose = BABYLON.MeshBuilder.CreateCylinder("rocketNose", {
        height: size * 1.18,
        diameterTop: 0,
        diameterBottom: size * 0.66,
        tessellation: 12
    }, App.scene);
    nose.parent = root;
    nose.rotation.x = Math.PI / 2;
    nose.position.z = bodyFront + size * 0.52;
    nose.material = noseMat;
    nose.isPickable = false;

    const nozzle = BABYLON.MeshBuilder.CreateCylinder("rocketNozzle", {
        height: size * 0.52,
        diameterTop: size * 0.48,
        diameterBottom: size * 0.34,
        tessellation: 12
    }, App.scene);
    nozzle.parent = root;
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.z = -bodyFront - size * 0.08;
    nozzle.material = mats.rocketNozzle;
    nozzle.isPickable = false;

    for (let i = 0; i < 4; i++) {
        const fin = BABYLON.MeshBuilder.CreateBox("rocketFin" + i, {
            width: size * 0.8,
            height: size * 0.1,
            depth: size * 0.48
        }, App.scene);
        fin.parent = root;
        fin.position.z = -size * 0.92;
        fin.material = i % 2 === 0 ? mats.rocketFin : finAccentMat;
        fin.isPickable = false;

        if (i < 2) {
            fin.position.x = (i === 0 ? 1 : -1) * size * 0.42;
        } else {
            fin.position.y = (i === 2 ? 1 : -1) * size * 0.42;
            fin.rotation.z = Math.PI / 2;
        }
    }

    const flameCore = BABYLON.MeshBuilder.CreateCylinder("rocketFlameCore", {
        height: size * 1.05,
        diameterTop: 0,
        diameterBottom: size * 0.28,
        tessellation: 10
    }, App.scene);
    flameCore.parent = root;
    flameCore.rotation.x = -Math.PI / 2;
    flameCore.position.z = -bodyFront - size * 0.66;
    flameCore.material = exhaustCoreMat;
    flameCore.isPickable = false;

    const flameGlow = BABYLON.MeshBuilder.CreateCylinder("rocketFlameGlow", {
        height: size * 1.7,
        diameterTop: 0,
        diameterBottom: size * 0.48,
        tessellation: 10
    }, App.scene);
    flameGlow.parent = root;
    flameGlow.rotation.x = -Math.PI / 2;
    flameGlow.position.z = -bodyFront - size * 0.9;
    flameGlow.material = exhaustGlowMat;
    flameGlow.isPickable = false;

    return {
        core: flameCore,
        glow: flameGlow,
        pulseTime: Math.random() * Math.PI * 2
    };
};

App.updateRocketVisual = function (bullet, deltaTime) {
    if (!bullet || !bullet.engineFx) {
        return;
    }

    bullet.engineFx.pulseTime += deltaTime * 18;
    const pulse = 0.92 + Math.sin(bullet.engineFx.pulseTime) * 0.2;

    bullet.engineFx.core.scaling.set(
        0.94 + pulse * 0.08,
        0.94 + pulse * 0.08,
        0.82 + pulse * 0.46
    );
    bullet.engineFx.glow.scaling.set(
        1.04 + pulse * 0.12,
        1.04 + pulse * 0.12,
        0.92 + pulse * 0.88
    );

    if (bullet.engineFx.core.material) {
        bullet.engineFx.core.material.alpha = 0.72 + pulse * 0.14;
    }

    if (bullet.engineFx.glow.material) {
        bullet.engineFx.glow.material.alpha = 0.22 + pulse * 0.16;
    }
};

App.disposeProjectile = function (bullet) {
    if (!bullet) {
        return;
    }

    if (bullet.smokeSystem) {
        bullet.smokeSystem.stop();
        bullet.smokeSystem = null;
    }

    if (bullet.mesh && (!bullet.mesh.isDisposed || !bullet.mesh.isDisposed())) {
        bullet.mesh.dispose();
    }
};

App.createBullet = function (position, velocity, color, damage, size, type) {
    const mats = App.getProjectileMaterials();
    const bulletType = type || "player";
    const direction = velocity.clone().normalize();
    const root = new BABYLON.TransformNode("projectileRoot", App.scene);

    root.position.copyFrom(position);
    App.orientMeshToVelocity(root, direction.clone());

    let coreMat = mats.playerCore;
    let glowMat = mats.playerGlow;
    let tipMat = mats.playerTip;
    let trailMat = mats.trailYellow;
    let trailColor = new BABYLON.Color3(1, 0.85, 0.2);
    let trailLength = 1.9;
    let trailThickness = size * 0.9;
    let trailAlpha = 0.22;
    let trailInterval = 0.012;
    let lifeDistance = 1100;
    let impactColor = color || new BABYLON.Color3(1, 0.94, 0.25);
    let impactSize = 0.55;
    let smokeSystem = null;
    let engineFx = null;

    if (bulletType === "enemy") {
        coreMat = mats.enemyCore;
        glowMat = mats.enemyGlow;
        tipMat = mats.enemyTip;
        trailMat = mats.trailRed;
        trailColor = new BABYLON.Color3(1, 0.35, 0.2);
        trailLength = 1.35;
        trailThickness = size * 0.82;
        trailAlpha = 0.18;
        trailInterval = 0.018;
        lifeDistance = 950;
        impactColor = color || new BABYLON.Color3(1, 0.4, 0.18);
        impactSize = 0.7;
    }

    if (bulletType === "rocket") {
        trailMat = mats.trailSmoke;
        trailColor = new BABYLON.Color3(0.18, 0.18, 0.18);
        trailLength = 2.6;
        trailThickness = size * 1.05;
        trailAlpha = 0.14;
        trailInterval = 0.026;
        lifeDistance = 980;
        impactColor = color || new BABYLON.Color3(1, 0.55, 0.18);
        impactSize = 1.15;
        engineFx = App.createRocketVisual(root, size, color);
        smokeSystem = App.createRocketSmokeTrail(root, size, color);
    } else {
        const core = BABYLON.MeshBuilder.CreateBox("bulletCore", {
            width: size * 0.34,
            height: size * 0.34,
            depth: size * 2.8
        }, App.scene);
        core.parent = root;
        core.material = coreMat;
        core.isPickable = false;

        const glow = BABYLON.MeshBuilder.CreateBox("bulletGlow", {
            width: size * 0.72,
            height: size * 0.72,
            depth: size * 4.4
        }, App.scene);
        glow.parent = root;
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
    }

    return {
        mesh: root,
        velocity: velocity,
        damage: damage,
        type: bulletType,
        trailMaterial: trailMat,
        trailColor: trailColor,
        trailLength: trailLength,
        trailThickness: trailThickness,
        trailAlpha: trailAlpha,
        trailInterval: trailInterval,
        trailTimer: 0,
        maxDistance: lifeDistance,
        impactColor: impactColor,
        impactSize: impactSize,
        smokeSystem: smokeSystem,
        engineFx: engineFx
    };
};

App.shootPlayerBullet = function (originMesh, aimPoint) {
    const mats = App.getProjectileMaterials();

    const planeForward = BABYLON.Vector3.TransformNormal(
        new BABYLON.Vector3(0, 0, 1),
        originMesh.getWorldMatrix()
    ).normalize();

    const muzzle = originMesh.position.add(planeForward.scale(6.2));
    let bulletDirection = planeForward.clone();

    if (aimPoint) {
        const aimedDirection = aimPoint.subtract(muzzle);
        if (aimedDirection.lengthSquared() > 0.001) {
            bulletDirection = aimedDirection.normalize();
        }
    }

    App.createMuzzleFlash(muzzle, bulletDirection, mats.muzzleYellow, 0.9);

    const bullet = App.createBullet(
        muzzle,
        bulletDirection.scale(2.2),
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
    const size = isRocket ? 0.62 : 0.2;

    App.createMuzzleFlash(
        start,
        direction,
        mats.muzzleRed,
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
        const step = 70 * deltaTime;

        bullet.mesh.position.x += bullet.velocity.x * step;
        bullet.mesh.position.y += bullet.velocity.y * step;
        bullet.mesh.position.z += bullet.velocity.z * step;
        App.orientMeshToVelocity(bullet.mesh, bullet.velocity);

        bullet.trailTimer -= deltaTime;
        if (bullet.trailTimer <= 0) {
            App.createTrail(
                bullet.mesh.position,
                bullet.trailColor,
                bullet.velocity,
                bullet.trailLength,
                bullet.trailThickness,
                bullet.trailAlpha,
                bullet.trailMaterial
            );
            bullet.trailTimer = bullet.trailInterval;
        }

        let removed = false;

        for (let j = App.enemies.length - 1; j >= 0; j--) {
            const enemyPosition = App.enemies[j].mesh.position;
            const dx = bullet.mesh.position.x - enemyPosition.x;
            const dy = bullet.mesh.position.y - enemyPosition.y;
            const dz = bullet.mesh.position.z - enemyPosition.z;
            if ((dx * dx) + (dy * dy) + (dz * dz) < 64) {
                App.enemies[j].health -= bullet.damage;
                App.createExplosion(bullet.mesh.position, bullet.impactColor, bullet.impactSize);
                App.disposeProjectile(bullet);
                App.playerBullets.splice(i, 1);
                removed = true;

                if (App.enemies[j].health <= 0) {
                    App.destroyEnemy(j);
                }
                break;
            }
        }

        const travelDistanceSq =
            (bullet.mesh.position.x * bullet.mesh.position.x) +
            (bullet.mesh.position.y * bullet.mesh.position.y) +
            (bullet.mesh.position.z * bullet.mesh.position.z);

        if (!removed && travelDistanceSq > bullet.maxDistance * bullet.maxDistance) {
            App.disposeProjectile(bullet);
            App.playerBullets.splice(i, 1);
        }
    }
};

App.updateEnemyBullets = function (deltaTime) {
    for (let i = App.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = App.enemyBullets[i];
        const moveSpeed = 52;
        const step = moveSpeed * deltaTime;

        bullet.mesh.position.x += bullet.velocity.x * step;
        bullet.mesh.position.y += bullet.velocity.y * step;
        bullet.mesh.position.z += bullet.velocity.z * step;
        App.orientMeshToVelocity(bullet.mesh, bullet.velocity);

        if (bullet.type === "rocket") {
            App.updateRocketVisual(bullet, deltaTime);
        }

        bullet.trailTimer -= deltaTime;
        if (bullet.trailTimer <= 0 && (bullet.type !== "rocket" || !bullet.smokeSystem)) {
            App.createTrail(
                bullet.mesh.position,
                bullet.trailColor,
                bullet.velocity,
                bullet.trailLength,
                bullet.trailThickness,
                bullet.trailAlpha,
                bullet.trailMaterial
            );
            bullet.trailTimer = bullet.trailInterval;
        }

        const dx = bullet.mesh.position.x - App.player.mesh.position.x;
        const dy = bullet.mesh.position.y - App.player.mesh.position.y;
        const dz = bullet.mesh.position.z - App.player.mesh.position.z;
        if ((dx * dx) + (dy * dy) + (dz * dz) < 2.25) {
            App.damagePlayer(bullet.damage);
            App.createExplosion(bullet.mesh.position, bullet.impactColor, bullet.impactSize);
            App.disposeProjectile(bullet);
            App.enemyBullets.splice(i, 1);
            continue;
        }

        if (
            bullet.mesh.position.z < -60 ||
            Math.abs(bullet.mesh.position.x) > 80 ||
            bullet.mesh.position.y < 0 ||
            (
                (bullet.mesh.position.x * bullet.mesh.position.x) +
                (bullet.mesh.position.y * bullet.mesh.position.y) +
                (bullet.mesh.position.z * bullet.mesh.position.z)
            ) > bullet.maxDistance * bullet.maxDistance
        ) {
            App.disposeProjectile(bullet);
            App.enemyBullets.splice(i, 1);
        }
    }
};
