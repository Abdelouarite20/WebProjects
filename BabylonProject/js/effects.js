App.getEffectMaterials = function () {
    if (App.effectMaterials) {
        return App.effectMaterials;
    }

    const makeMaterial = function (name, options) {
        const mat = new BABYLON.StandardMaterial(name, App.scene);
        mat.diffuseColor = options.diffuseColor || BABYLON.Color3.Black();
        mat.emissiveColor = options.emissiveColor || BABYLON.Color3.Black();
        mat.specularColor = options.specularColor || BABYLON.Color3.Black();
        mat.alpha = options.alpha !== undefined ? options.alpha : 1;
        mat.disableLighting = options.disableLighting !== undefined ? options.disableLighting : true;
        return mat;
    };

    App.effectMaterials = {
        flashCore: makeMaterial("fxFlashCoreMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.92, 0.7),
            alpha: 0.95
        }),
        flashHot: makeMaterial("fxFlashHotMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.97, 0.86),
            alpha: 0.92
        }),
        flashOuter: makeMaterial("fxFlashOuterMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.58, 0.18),
            alpha: 0.4
        }),
        fireShell: makeMaterial("fxFireShellMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.46, 0.12),
            alpha: 0.52
        }),
        ring: makeMaterial("fxRingMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.7, 0.22),
            alpha: 0.48
        }),
        ringSoft: makeMaterial("fxRingSoftMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.54, 0.16),
            alpha: 0.24
        }),
        spark: makeMaterial("fxSparkMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.84, 0.42),
            alpha: 0.92
        }),
        ember: makeMaterial("fxEmberMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.42, 0.15),
            alpha: 0.65
        }),
        smoke: makeMaterial("fxSmokeMat", {
            diffuseColor: new BABYLON.Color3(0.16, 0.16, 0.18),
            emissiveColor: new BABYLON.Color3(0.08, 0.08, 0.08),
            alpha: 0.2,
            disableLighting: false
        }),
        smokeDense: makeMaterial("fxSmokeDenseMat", {
            diffuseColor: new BABYLON.Color3(0.14, 0.14, 0.15),
            emissiveColor: new BABYLON.Color3(0.05, 0.05, 0.05),
            alpha: 0.26,
            disableLighting: false
        })
    };

    return App.effectMaterials;
};

App.getEffectTextures = function () {
    if (App.effectTextures) {
        return App.effectTextures;
    }

    const createSoftFlareTexture = function (name, size) {
        const dt = new BABYLON.DynamicTexture(name, { width: size, height: size }, App.scene, false);
        const ctx = dt.getContext();
        const c = size / 2;
        const r = size * 0.48;
        const grad = ctx.createRadialGradient(c, c, 0, c, c, r);

        ctx.clearRect(0, 0, size, size);
        grad.addColorStop(0.0, "rgba(255,255,255,1.0)");
        grad.addColorStop(0.12, "rgba(255,245,210,1.0)");
        grad.addColorStop(0.28, "rgba(255,180,70,0.95)");
        grad.addColorStop(0.52, "rgba(255,90,20,0.65)");
        grad.addColorStop(0.78, "rgba(110,20,0,0.20)");
        grad.addColorStop(1.0, "rgba(0,0,0,0.0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        dt.update();
        return dt;
    };

    const createCloudSmokeTexture = function (name, size) {
        const dt = new BABYLON.DynamicTexture(name, { width: size, height: size }, App.scene, false);
        const ctx = dt.getContext();

        ctx.clearRect(0, 0, size, size);
        for (let i = 0; i < 80; i++) {
            const x = size * (0.2 + Math.random() * 0.6);
            const y = size * (0.2 + Math.random() * 0.6);
            const radius = size * (0.05 + Math.random() * 0.13);
            const alpha = 0.03 + Math.random() * 0.08;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);

            grad.addColorStop(0.0, "rgba(255,255,255," + alpha.toFixed(3) + ")");
            grad.addColorStop(0.45, "rgba(220,220,220," + (alpha * 0.85).toFixed(3) + ")");
            grad.addColorStop(0.8, "rgba(160,160,160," + (alpha * 0.35).toFixed(3) + ")");
            grad.addColorStop(1.0, "rgba(0,0,0,0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        dt.update();
        return dt;
    };

    App.effectTextures = {
        flare: createSoftFlareTexture("fxFlare", 256),
        smoke: createCloudSmokeTexture("fxSmoke", 256)
    };

    return App.effectTextures;
};

App.getDebrisSourceMaterial = function (sourceNode) {
    if (!sourceNode) {
        return null;
    }

    if (sourceNode.material) {
        return sourceNode.material;
    }

    if (sourceNode.getChildMeshes) {
        const child = sourceNode.getChildMeshes(false).find(mesh => mesh && mesh.material);
        return child ? child.material : null;
    }

    return null;
};

App.createEffectParticle = function (mesh, options) {
    if (!mesh) {
        return false;
    }

    if (App.particles.length >= App.performance.maxParticles) {
        if (mesh.dispose) {
            mesh.dispose();
        }
        return false;
    }

    App.particles.push({
        mesh: mesh,
        life: options.life !== undefined ? options.life : 0.25,
        maxLife: options.life !== undefined ? options.life : 0.25,
        velocity: options.velocity || BABYLON.Vector3.Zero(),
        growth: options.growth || 0,
        fade: options.fade !== undefined ? options.fade : 1,
        spin: options.spin || 0,
        gravity: options.gravity || 0,
        drift: options.drift || 0,
        angularVelocity: options.angularVelocity || null,
        damping: options.damping || 0
    });
    return true;
};

App.queueExplosionMesh = function (mesh, options) {
    if (!mesh) {
        return false;
    }

    if (App.explosions.length >= App.performance.maxExplosionMeshes) {
        mesh.dispose();
        return false;
    }

    App.explosions.push({
        mesh: mesh,
        time: options.time,
        maxTime: options.maxTime,
        grow: options.grow,
        fade: options.fade,
        spin: options.spin
    });
    return true;
};

App.shakeCamera = function (camera, options) {
    if (!camera || !camera.position || !App.scene) {
        return;
    }

    const duration = options?.duration || 250;
    const intensity = options?.intensity || 0.25;
    const start = performance.now();
    let lastOffset = BABYLON.Vector3.Zero();

    const obs = App.scene.onBeforeRenderObservable.add(() => {
        camera.position.subtractInPlace(lastOffset);

        const elapsed = performance.now() - start;
        const k = 1 - elapsed / duration;
        if (k <= 0) {
            lastOffset.set(0, 0, 0);
            App.scene.onBeforeRenderObservable.remove(obs);
            return;
        }

        lastOffset = new BABYLON.Vector3(
            (Math.random() * 2 - 1) * intensity * k,
            (Math.random() * 2 - 1) * intensity * k,
            (Math.random() * 2 - 1) * intensity * k
        );

        camera.position.addInPlace(lastOffset);
    });
};

App.spawnExplosionLight = function (position, options) {
    if (!App.scene) {
        return;
    }

    const light = new BABYLON.PointLight("explosionLight", position.clone(), App.scene);
    const intensity = options?.intensity || 18;
    const duration = options?.duration || 120;
    light.diffuse = new BABYLON.Color3(1.0, 0.65, 0.25);
    light.specular = new BABYLON.Color3(1.0, 0.65, 0.25);
    light.range = options?.range || 18;
    light.intensity = intensity;

    const start = performance.now();
    const obs = App.scene.onBeforeRenderObservable.add(() => {
        const t = (performance.now() - start) / duration;
        if (t >= 1) {
            App.scene.onBeforeRenderObservable.remove(obs);
            light.dispose();
            return;
        }

        light.intensity = (1 - t) * intensity;
    });
};

App.spawnCrashDebris = function (position, sourceNode, count, options) {
    const debrisCount = count || 14;
    const sourceMaterial = App.getDebrisSourceMaterial(sourceNode);
    const forward = options?.forward && options.forward.lengthSquared() > 0.001
        ? options.forward.clone().normalize()
        : new BABYLON.Vector3(0, 0, 1);

    for (let i = 0; i < debrisCount; i++) {
        let piece;
        if (Math.random() < 0.5) {
            piece = BABYLON.MeshBuilder.CreateBox("debrisBox" + Math.random(), {
                size: 0.18 + Math.random() * 0.24
            }, App.scene);
        } else {
            piece = BABYLON.MeshBuilder.CreateCylinder("debrisCylinder" + Math.random(), {
                height: 0.14 + Math.random() * 0.26,
                diameterTop: 0.05 + Math.random() * 0.12,
                diameterBottom: 0.08 + Math.random() * 0.14,
                tessellation: 5
            }, App.scene);
        }

        if (sourceMaterial) {
            piece.material = sourceMaterial.clone("debrisMat" + Math.random());
        } else {
            const mat = new BABYLON.StandardMaterial("debrisMat" + Math.random(), App.scene);
            mat.diffuseColor = new BABYLON.Color3(0.42, 0.42, 0.45);
            mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
            piece.material = mat;
        }

        piece.position.copyFrom(position).addInPlace(new BABYLON.Vector3(
            (Math.random() * 2 - 1) * 0.45,
            (Math.random() * 2 - 1) * 0.25,
            (Math.random() * 2 - 1) * 0.45
        ));
        piece.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        piece.scaling.scaleInPlace(0.7 + Math.random() * 1.4);
        piece.isPickable = false;

        const spread = options?.spread || 1.0;
        const dir = forward.scale(0.6).add(new BABYLON.Vector3(
            (Math.random() * 2 - 1) * spread,
            Math.random() * 1.1,
            (Math.random() * 2 - 1) * spread
        )).normalize();
        const speed = (options?.speed || 5) + Math.random() * (options?.speedVariance || 8);
        const velocity = dir.scale(speed);
        velocity.y += 2 + Math.random() * 4;

        App.createEffectParticle(piece, {
            life: options?.life || 1.5,
            velocity: velocity,
            gravity: options?.gravity || 14,
            fade: 1.0,
            growth: -0.02,
            angularVelocity: new BABYLON.Vector3(
                (Math.random() * 2 - 1) * 8,
                (Math.random() * 2 - 1) * 8,
                (Math.random() * 2 - 1) * 8
            ),
            damping: 0.992
        });
    }
};

App.createCrashParticleExplosion = function (position, size) {
    if (!App.scene) {
        return;
    }

    const scene = App.scene;
    const textures = App.getEffectTextures();
    const root = new BABYLON.TransformNode("explosionRoot", scene);
    const scale = size || 1;
    const density = App.performance.effectDensity || 1;
    root.position.copyFrom(position);

    const flash = new BABYLON.ParticleSystem("explosionFlash", Math.max(48, Math.floor(120 * density)), scene);
    flash.particleTexture = textures.flare;
    flash.emitter = root;
    flash.createDirectedSphereEmitter(
        0.12 * scale,
        new BABYLON.Vector3(-1, -1, -1),
        new BABYLON.Vector3(1, 1, 1)
    );
    flash.minLifeTime = 0.04;
    flash.maxLifeTime = 0.1;
    flash.minSize = 1.3 * scale;
    flash.maxSize = 2.2 * scale;
    flash.minEmitPower = 8;
    flash.maxEmitPower = 12;
    flash.emitRate = 6000 * density;
    flash.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    flash.addColorGradient(0.0, new BABYLON.Color4(1.0, 1.0, 0.95, 1.0));
    flash.addColorGradient(0.35, new BABYLON.Color4(1.0, 0.75, 0.25, 0.9));
    flash.addColorGradient(1.0, new BABYLON.Color4(0.2, 0.05, 0.0, 0.0));
    flash.disposeOnStop = true;
    flash.start();
    setTimeout(() => flash.stop(), 50);

    const fire = new BABYLON.ParticleSystem("explosionFire", Math.max(140, Math.floor(320 * density)), scene);
    fire.particleTexture = textures.flare;
    fire.emitter = root;
    fire.createDirectedSphereEmitter(
        0.35 * scale,
        new BABYLON.Vector3(-1.25, -1.25, -1.25),
        new BABYLON.Vector3(1.25, 1.25, 1.25)
    );
    fire.minLifeTime = 0.16;
    fire.maxLifeTime = 0.4;
    fire.minSize = 0.3 * scale;
    fire.maxSize = 0.8 * scale;
    fire.minEmitPower = 3;
    fire.maxEmitPower = 7;
    fire.emitRate = 2200 * density;
    fire.updateSpeed = 0.012;
    fire.gravity = new BABYLON.Vector3(0, 1.1, 0);
    fire.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    fire.addColorGradient(0.0, new BABYLON.Color4(1.0, 0.95, 0.7, 1.0));
    fire.addColorGradient(0.2, new BABYLON.Color4(1.0, 0.55, 0.12, 0.95));
    fire.addColorGradient(0.7, new BABYLON.Color4(0.65, 0.15, 0.02, 0.45));
    fire.addColorGradient(1.0, new BABYLON.Color4(0.05, 0.02, 0.02, 0.0));
    fire.disposeOnStop = true;
    fire.start();
    setTimeout(() => fire.stop(), 140);

    const smoke = new BABYLON.ParticleSystem("explosionSmoke", Math.max(120, Math.floor(260 * density)), scene);
    smoke.particleTexture = textures.smoke;
    smoke.emitter = root;
    smoke.createDirectedSphereEmitter(
        0.22 * scale,
        new BABYLON.Vector3(-0.7, -0.1, -0.7),
        new BABYLON.Vector3(0.7, 1.1, 0.7)
    );
    smoke.minLifeTime = 0.9;
    smoke.maxLifeTime = 1.8;
    smoke.minSize = 0.7 * scale;
    smoke.maxSize = 2.2 * scale;
    smoke.minEmitPower = 0.5;
    smoke.maxEmitPower = 2.2;
    smoke.emitRate = 260 * density;
    smoke.updateSpeed = 0.016;
    smoke.gravity = new BABYLON.Vector3(0, 1.4, 0);
    smoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    smoke.addColorGradient(0.0, new BABYLON.Color4(0.25, 0.25, 0.25, 0.48));
    smoke.addColorGradient(0.3, new BABYLON.Color4(0.18, 0.18, 0.18, 0.38));
    smoke.addColorGradient(0.75, new BABYLON.Color4(0.1, 0.1, 0.1, 0.2));
    smoke.addColorGradient(1.0, new BABYLON.Color4(0.03, 0.03, 0.03, 0.0));
    smoke.disposeOnStop = true;
    smoke.start();
    setTimeout(() => smoke.stop(), 260);

    smoke.onStoppedObservable.add(() => {
        if (!root.isDisposed()) {
            root.dispose();
        }
    });
};

App.createExplosion = function (position, color, size) {
    const mats = App.getEffectMaterials();
    const density = App.performance.effectDensity || 1;
    const warmColor = BABYLON.Color3.Lerp(color, new BABYLON.Color3(1, 0.9, 0.68), 0.38);
    const fireColor = BABYLON.Color3.Lerp(color, new BABYLON.Color3(1, 0.36, 0.08), 0.22);
    const emberColor = BABYLON.Color3.Lerp(color, new BABYLON.Color3(0.6, 0.14, 0.04), 0.4);

    const hotFlash = BABYLON.MeshBuilder.CreateSphere("explosionHotFlash", {
        diameter: size * 0.32,
        segments: 8
    }, App.scene);
    hotFlash.position = position.clone();
    hotFlash.material = mats.flashHot.clone("explosionHotFlashMat" + Math.random());
    hotFlash.material.emissiveColor = warmColor;
    hotFlash.isPickable = false;

    App.queueExplosionMesh(hotFlash, {
        time: 0.16,
        maxTime: 0.16,
        grow: 0.7,
        fade: 1.55,
        spin: 0
    });

    const core = BABYLON.MeshBuilder.CreateSphere("explosionCore", {
        diameter: size * 0.55,
        segments: 10
    }, App.scene);
    core.position = position.clone();
    core.material = mats.flashCore.clone("explosionCoreMat" + Math.random());
    core.material.emissiveColor = warmColor.scale(0.95);
    core.isPickable = false;

    App.queueExplosionMesh(core, {
        time: 0.28,
        maxTime: 0.28,
        grow: 0.42,
        fade: 1.3,
        spin: 0
    });

    const outer = BABYLON.MeshBuilder.CreateSphere("explosionOuter", {
        diameter: size * 0.9,
        segments: 10
    }, App.scene);
    outer.position = position.clone();
    outer.material = mats.flashOuter.clone("explosionOuterMat" + Math.random());
    outer.material.emissiveColor = fireColor;
    outer.material.alpha = 0.48;
    outer.isPickable = false;

    App.queueExplosionMesh(outer, {
        time: 0.42,
        maxTime: 0.42,
        grow: 0.52,
        fade: 1.05,
        spin: 1.2
    });

    const fireShell = BABYLON.MeshBuilder.CreateSphere("explosionFireShell", {
        diameter: size * 0.64,
        segments: 8
    }, App.scene);
    fireShell.position = position.clone();
    fireShell.material = mats.fireShell.clone("explosionFireShellMat" + Math.random());
    fireShell.material.emissiveColor = fireColor.scale(1.05);
    fireShell.material.alpha = 0.52;
    fireShell.isPickable = false;

    App.queueExplosionMesh(fireShell, {
        time: 0.58,
        maxTime: 0.58,
        grow: 0.5,
        fade: 0.95,
        spin: 1.6
    });

    const ring = BABYLON.MeshBuilder.CreateTorus("explosionRing", {
        diameter: size * 0.78,
        thickness: Math.max(0.04, size * 0.08),
        tessellation: 20
    }, App.scene);
    ring.position = position.clone();
    ring.rotation.x = Math.PI / 2;
    ring.material = mats.ring.clone("explosionRingMat" + Math.random());
    ring.material.emissiveColor = warmColor.scale(0.92).add(new BABYLON.Color3(0.16, 0.1, 0.02));
    ring.material.alpha = 0.56;
    ring.isPickable = false;

    App.queueExplosionMesh(ring, {
        time: 0.44,
        maxTime: 0.44,
        grow: 0.54,
        fade: 1.08,
        spin: 2.2
    });

    const softRing = BABYLON.MeshBuilder.CreateTorus("explosionSoftRing", {
        diameter: size * 0.72,
        thickness: Math.max(0.03, size * 0.05),
        tessellation: 20
    }, App.scene);
    softRing.position = position.clone().add(new BABYLON.Vector3(0, size * 0.03, 0));
    softRing.rotation.x = Math.PI / 2;
    softRing.material = mats.ringSoft.clone("explosionSoftRingMat" + Math.random());
    softRing.material.emissiveColor = fireColor.scale(0.92);
    softRing.material.alpha = 0.34;
    softRing.isPickable = false;

    App.queueExplosionMesh(softRing, {
        time: 0.7,
        maxTime: 0.7,
        grow: 0.62,
        fade: 0.72,
        spin: 1.4
    });

    const sparkCount = Math.max(5, Math.floor((10 + size * 7) * density));
    for (let i = 0; i < sparkCount; i++) {
        const spark = BABYLON.MeshBuilder.CreateBox("explosionSpark", {
            width: 0.05 + Math.random() * 0.04,
            height: 0.05 + Math.random() * 0.04,
            depth: 0.5 + Math.random() * 0.7
        }, App.scene);

        spark.position = position.clone();
        spark.material = (Math.random() > 0.35 ? mats.spark : mats.ember).clone("explosionSparkMat" + Math.random());
        spark.material.emissiveColor = Math.random() > 0.4 ? warmColor : emberColor;
        spark.isPickable = false;

        const dir = new BABYLON.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.3) * 1.7,
            (Math.random() - 0.5) * 2
        ).normalize();

        spark.lookAt(spark.position.add(dir));

        App.createEffectParticle(spark, {
            life: 0.34 + Math.random() * 0.22,
            velocity: dir.scale(10 + Math.random() * 12).add(new BABYLON.Vector3(0, 1.5 + Math.random() * 2.2, 0)),
            growth: -0.85,
            fade: 2.8,
            gravity: 7.5,
            spin: (Math.random() - 0.5) * 10
        });
    }

    const emberCount = Math.max(3, Math.floor((4 + size * 2.5) * density));
    for (let i = 0; i < emberCount; i++) {
        const ember = BABYLON.MeshBuilder.CreateSphere("explosionEmber", {
            diameter: size * (0.06 + Math.random() * 0.05),
            segments: 6
        }, App.scene);

        ember.position = position.clone();
        ember.material = mats.ember.clone("explosionEmberMat" + Math.random());
        ember.material.emissiveColor = emberColor;
        ember.material.alpha = 0.72;
        ember.isPickable = false;

        App.createEffectParticle(ember, {
            life: 0.48 + Math.random() * 0.28,
            velocity: new BABYLON.Vector3(
                (Math.random() - 0.5) * (4 + size * 2.2),
                1.5 + Math.random() * 2.2,
                (Math.random() - 0.5) * (4 + size * 2.2)
            ),
            growth: -0.2,
            fade: 1.8,
            gravity: 4.8,
            spin: (Math.random() - 0.5) * 7
        });
    }

    const smokeCount = Math.max(4, Math.floor((6 + size * 3) * density));
    for (let i = 0; i < smokeCount; i++) {
        const puff = BABYLON.MeshBuilder.CreateSphere("explosionSmoke", {
            diameter: size * (0.18 + Math.random() * 0.24),
            segments: 8
        }, App.scene);

        puff.position = position.clone().add(new BABYLON.Vector3(
            (Math.random() - 0.5) * size * 0.3,
            (Math.random() - 0.15) * size * 0.16,
            (Math.random() - 0.5) * size * 0.3
        ));
        puff.material = (Math.random() > 0.4 ? mats.smokeDense : mats.smoke).clone("explosionSmokeMat" + Math.random());
        puff.material.alpha = 0.16 + Math.random() * 0.12;
        puff.isPickable = false;

        App.createEffectParticle(puff, {
            life: 1.15 + Math.random() * 0.8,
            velocity: new BABYLON.Vector3(
                (Math.random() - 0.5) * 1.1,
                1.8 + Math.random() * 1.8,
                (Math.random() - 0.5) * 1.1
            ),
            growth: 0.82 + Math.random() * 0.4,
            fade: 0.58,
            drift: 0.42
        });
    }
};

App.updateExplosions = function (deltaTime) {
    for (let i = App.explosions.length - 1; i >= 0; i--) {
        const explosion = App.explosions[i];
        explosion.time -= deltaTime;

        const ratio = explosion.maxTime > 0 ? explosion.time / explosion.maxTime : 0;
        const fade = Math.max(ratio * explosion.fade, 0);

        if (explosion.grow) {
            const growAmount = explosion.grow * deltaTime * 10;
            explosion.mesh.scaling.addInPlace(new BABYLON.Vector3(growAmount, growAmount, growAmount));
        }

        if (explosion.spin) {
            explosion.mesh.rotation.y += explosion.spin * deltaTime;
            explosion.mesh.rotation.z += explosion.spin * 0.45 * deltaTime;
        }

        if (explosion.mesh.material) {
            explosion.mesh.material.alpha = fade;
        }

        if (explosion.time <= 0) {
            explosion.mesh.dispose();
            App.explosions.splice(i, 1);
        }
    }
};

App.updateParticles = function (deltaTime) {
    for (let i = App.particles.length - 1; i >= 0; i--) {
        const particle = App.particles[i];
        if (!particle.mesh || (particle.mesh.isDisposed && particle.mesh.isDisposed())) {
            App.particles.splice(i, 1);
            continue;
        }

        particle.life -= deltaTime;

        if (particle.velocity) {
            if (particle.gravity) {
                particle.velocity.y -= particle.gravity * deltaTime;
            }

            if (particle.drift) {
                particle.velocity.x += (Math.random() - 0.5) * particle.drift * deltaTime;
                particle.velocity.z += (Math.random() - 0.5) * particle.drift * deltaTime;
            }

            if (particle.damping) {
                particle.velocity.scaleInPlace(Math.pow(particle.damping, deltaTime * 60));
            }

            particle.mesh.position.x += particle.velocity.x * deltaTime;
            particle.mesh.position.y += particle.velocity.y * deltaTime;
            particle.mesh.position.z += particle.velocity.z * deltaTime;
        }

        if (particle.growth) {
            const scaleDelta = 1 + particle.growth * deltaTime;
            particle.mesh.scaling.scaleInPlace(Math.max(0.75, scaleDelta));
        } else {
            particle.mesh.scaling.scaleInPlace(0.985);
        }

        if (particle.angularVelocity) {
            particle.mesh.rotation.x += particle.angularVelocity.x * deltaTime;
            particle.mesh.rotation.y += particle.angularVelocity.y * deltaTime;
            particle.mesh.rotation.z += particle.angularVelocity.z * deltaTime;
        }

        if (particle.spin) {
            particle.mesh.rotation.x += particle.spin * 0.35 * deltaTime;
            particle.mesh.rotation.y += particle.spin * deltaTime;
            particle.mesh.rotation.z += particle.spin * 0.55 * deltaTime;
        }

        if (particle.mesh.material) {
            const maxLife = particle.maxLife || 0.25;
            const ratio = Math.max(particle.life / maxLife, 0);
            const fade = particle.fade !== undefined ? particle.fade : 1.8;
            particle.mesh.material.alpha = Math.max(ratio * fade, 0);
        }

        if (particle.life <= 0) {
            particle.mesh.dispose();
            App.particles.splice(i, 1);
        }
    }
};

App.updateEffects = function () {
    const shieldActive = App.player.shieldTime > 0;
    if (App.player.shieldVisualActive !== shieldActive) {
        const shieldColor = new BABYLON.Color3(0.12, 0.35, 0.7);

        App.player.effectMeshes.forEach(mesh => {
            if (!mesh.material) {
                return;
            }

            if (shieldActive) {
                mesh.material.emissiveColor = BABYLON.Color3.Lerp(
                    mesh.material._baseEmissiveColor,
                    shieldColor,
                    0.72
                );
            } else {
                mesh.material.emissiveColor = mesh.material._baseEmissiveColor.clone();
            }
        });

        App.player.shieldVisualActive = shieldActive;
    }

    if (App.bombFlash > 0) {
        App.bombFlash -= App.engine.getDeltaTime() / 1000;
        App.bombFlashActive = true;

        const flashRatio = Math.max(App.bombFlash / 0.28, 0);
        App.scene.clearColor = new BABYLON.Color4(
            0.64 + 0.31 * flashRatio,
            0.79 + 0.07 * flashRatio,
            0.95 - 0.23 * flashRatio,
            1
        );

        App.scene.fogColor = new BABYLON.Color3(
            0.72 + 0.22 * flashRatio,
            0.82 + 0.02 * flashRatio,
            0.93 - 0.22 * flashRatio
        );
    } else if (App.bombFlashActive) {
        App.scene.clearColor = new BABYLON.Color4(0.64, 0.79, 0.95, 1);
        App.scene.fogColor = new BABYLON.Color3(0.72, 0.82, 0.93);
        App.bombFlashActive = false;
    }
};
