App.createScene = function () {
    App.scene = new BABYLON.Scene(App.engine);
    App.scene.clearColor = new BABYLON.Color4(0.74, 0.84, 0.96, 1);
    App.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    App.scene.fogDensity = 0.00095;
    App.scene.fogColor = new BABYLON.Color3(0.74, 0.82, 0.9);
    App.scene.skipPointerMovePicking = true;
    App.scene.imageProcessingConfiguration.contrast = 1.15;
    App.scene.imageProcessingConfiguration.exposure = 1.08;
    const shadowMapSize = App.performance.shadowMapSize || 1536;
    const useHighQualityShadows = shadowMapSize >= 1536;

    App.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 12, -30), App.scene);
    App.camera.fov = 0.72;
    App.camera.minZ = 0.2;

    const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0.15, 1, 0.2), App.scene);
    hemi.intensity = 0.6;
    hemi.groundColor = new BABYLON.Color3(0.22, 0.24, 0.25);

    App.sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.55, -1, -0.25), App.scene);
    App.sun.position = new BABYLON.Vector3(240, 420, 160);
    App.sun.intensity = 2.4;
    App.sun.shadowMinZ = 1;
    App.sun.shadowMaxZ = 1200;
    App.sun.autoCalcShadowZBounds = true;

    if (BABYLON.CascadedShadowGenerator) {
        App.shadowGenerator = new BABYLON.CascadedShadowGenerator(shadowMapSize, App.sun);
        App.shadowGenerator.numCascades = App.performance.shadowCascadeCount || 2;
        App.shadowGenerator.lambda = 0.82;
        App.shadowGenerator.stabilizeCascades = true;
    } else {
        App.shadowGenerator = new BABYLON.ShadowGenerator(shadowMapSize, App.sun);
    }

    App.shadowGenerator.bias = 0.00035;
    App.shadowGenerator.normalBias = 0.015;
    App.shadowGenerator.usePercentageCloserFiltering = true;
    App.shadowGenerator.filteringQuality = useHighQualityShadows
        ? BABYLON.ShadowGenerator.QUALITY_HIGH
        : BABYLON.ShadowGenerator.QUALITY_MEDIUM;
    App.shadowGenerator.darkness = 0.26;

    App.createSky();
    App.createBattlefield();
    App.createClouds();
    App.createPlayer();
    App.updateHud(true);

    return App.scene;
};

App.addShadowCaster = function (mesh) {
    if (!App.shadowGenerator || !mesh) {
        return;
    }
    App.shadowGenerator.addShadowCaster(mesh, true);
};

App.updateCamera = function () {
    const rig = App.cameraRig;
    const forward = App.player.forward || rig.forwardFallback;

    rig.offset.copyFrom(forward);
    rig.offset.scaleInPlace(-24);
    rig.position.copyFrom(App.player.mesh.position);
    rig.position.addInPlace(rig.offset);
    rig.position.y += 8;

    rig.lookAhead.copyFrom(forward);
    rig.lookAhead.scaleInPlace(52);
    rig.lookTarget.copyFrom(App.player.mesh.position);
    rig.lookTarget.addInPlace(rig.lookAhead);
    rig.lookTarget.y += 2.5;

    App.camera.position.copyFrom(rig.position);
    App.camera.setTarget(rig.lookTarget);
};
