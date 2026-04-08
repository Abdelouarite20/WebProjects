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
        flashOuter: makeMaterial("fxFlashOuterMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.58, 0.18),
            alpha: 0.4
        }),
        ring: makeMaterial("fxRingMat", {
            emissiveColor: new BABYLON.Color3(1.0, 0.7, 0.22),
            alpha: 0.48
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
        })
    };

    return App.effectMaterials;
};

App.createEffectParticle = function (mesh, options) {
    App.particles.push({
        mesh: mesh,
        life: options.life !== undefined ? options.life : 0.25,
        maxLife: options.life !== undefined ? options.life : 0.25,
        velocity: options.velocity || BABYLON.Vector3.Zero(),
        growth: options.growth || 0,
        fade: options.fade !== undefined ? options.fade : 1,
        spin: options.spin || 0,
        gravity: options.gravity || 0,
        drift: options.drift || 0
    });
};

App.createExplosion = function (position, color, size) {
    const mats = App.getEffectMaterials();

    const core = BABYLON.MeshBuilder.CreateSphere("explosionCore", {
        diameter: size * 0.55,
        segments: 10
    }, App.scene);
    core.position = position.clone();
    core.material = mats.flashCore;
    core.isPickable = false;

    App.explosions.push({
        mesh: core,
        time: 0.14,
        maxTime: 0.14,
        grow: 0.34,
        fade: 1.6,
        spin: 0
    });

    const outer = BABYLON.MeshBuilder.CreateSphere("explosionOuter", {
        diameter: size,
        segments: 10
    }, App.scene);
    outer.position = position.clone();
    outer.material = mats.flashOuter.clone("explosionOuterMat" + Math.random());
    outer.material.emissiveColor = color.clone();
    outer.material.alpha = 0.42;
    outer.isPickable = false;

    App.explosions.push({
        mesh: outer,
        time: 0.24,
        maxTime: 0.24,
        grow: 0.42,
        fade: 1.35,
        spin: 0.9
    });

    const ring = BABYLON.MeshBuilder.CreateTorus("explosionRing", {
        diameter: size * 0.95,
        thickness: Math.max(0.04, size * 0.08),
        tessellation: 20
    }, App.scene);
    ring.position = position.clone();
    ring.rotation.x = Math.PI / 2;
    ring.material = mats.ring.clone("explosionRingMat" + Math.random());
    ring.material.emissiveColor = color.scale(0.95).add(new BABYLON.Color3(0.18, 0.12, 0.02));
    ring.material.alpha = 0.5;
    ring.isPickable = false;

    App.explosions.push({
        mesh: ring,
        time: 0.22,
        maxTime: 0.22,
        grow: 0.52,
        fade: 1.55,
        spin: 2.2
    });

    const sparkCount = Math.max(6, Math.floor(8 + size * 6));
    for (let i = 0; i < sparkCount; i++) {
        const spark = BABYLON.MeshBuilder.CreateBox("explosionSpark", {
            width: 0.05 + Math.random() * 0.04,
            height: 0.05 + Math.random() * 0.04,
            depth: 0.42 + Math.random() * 0.5
        }, App.scene);

        spark.position = position.clone();
        spark.material = Math.random() > 0.35 ? mats.spark : mats.ember;
        spark.isPickable = false;

        const dir = new BABYLON.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.35) * 1.6,
            (Math.random() - 0.5) * 2
        ).normalize();

        spark.lookAt(spark.position.add(dir));

        App.createEffectParticle(spark, {
            life: 0.16 + Math.random() * 0.14,
            velocity: dir.scale(8 + Math.random() * 10).add(new BABYLON.Vector3(0, 1.2 + Math.random() * 1.8, 0)),
            growth: -0.6,
            fade: 2.6,
            gravity: 7.5,
            spin: (Math.random() - 0.5) * 10
        });
    }

    const smokeCount = Math.max(4, Math.floor(4 + size * 2.2));
    for (let i = 0; i < smokeCount; i++) {
        const puff = BABYLON.MeshBuilder.CreateSphere("explosionSmoke", {
            diameter: size * (0.22 + Math.random() * 0.2),
            segments: 8
        }, App.scene);

        puff.position = position.clone().add(new BABYLON.Vector3(
            (Math.random() - 0.5) * size * 0.35,
            (Math.random() - 0.2) * size * 0.18,
            (Math.random() - 0.5) * size * 0.35
        ));
        puff.material = mats.smoke.clone("explosionSmokeMat" + Math.random());
        puff.material.alpha = 0.18 + Math.random() * 0.08;
        puff.isPickable = false;

        App.createEffectParticle(puff, {
            life: 0.42 + Math.random() * 0.28,
            velocity: new BABYLON.Vector3(
                (Math.random() - 0.5) * 1.5,
                1.6 + Math.random() * 1.5,
                (Math.random() - 0.5) * 1.5
            ),
            growth: 0.8 + Math.random() * 0.45,
            fade: 0.85,
            drift: 0.35
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
        particle.life -= deltaTime;

        if (particle.velocity) {
            if (particle.gravity) {
                particle.velocity.y -= particle.gravity * deltaTime;
            }

            if (particle.drift) {
                particle.velocity.x += (Math.random() - 0.5) * particle.drift * deltaTime;
                particle.velocity.z += (Math.random() - 0.5) * particle.drift * deltaTime;
            }

            particle.mesh.position.addInPlace(particle.velocity.scale(deltaTime));
        }

        if (particle.growth) {
            const scaleDelta = 1 + particle.growth * deltaTime;
            particle.mesh.scaling.scaleInPlace(Math.max(0.75, scaleDelta));
        } else {
            particle.mesh.scaling.scaleInPlace(0.985);
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
    const shieldColor = new BABYLON.Color3(0.12, 0.35, 0.7);

    App.player.mesh.getChildMeshes().forEach(mesh => {
        if (!mesh.material) {
            return;
        }

        if (!mesh.material._baseEmissiveColor) {
            mesh.material._baseEmissiveColor = mesh.material.emissiveColor
                ? mesh.material.emissiveColor.clone()
                : BABYLON.Color3.Black();
        }

        if (App.player.shieldTime > 0) {
            mesh.material.emissiveColor = BABYLON.Color3.Lerp(
                mesh.material._baseEmissiveColor,
                shieldColor,
                0.72
            );
        } else {
            mesh.material.emissiveColor = mesh.material._baseEmissiveColor.clone();
        }
    });

    if (App.bombFlash > 0) {
        App.bombFlash -= App.engine.getDeltaTime() / 1000;

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
    } else {
        App.scene.clearColor = new BABYLON.Color4(0.64, 0.79, 0.95, 1);
        App.scene.fogColor = new BABYLON.Color3(0.72, 0.82, 0.93);
    }
};