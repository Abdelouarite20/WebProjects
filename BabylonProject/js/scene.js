App.createScene = function () {
    App.scene = new BABYLON.Scene(App.engine);
    App.scene.clearColor = new BABYLON.Color4(0.74, 0.84, 0.96, 1);
    App.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    App.scene.fogDensity = 0.00095;
    App.scene.fogColor = new BABYLON.Color3(0.74, 0.82, 0.9);
    App.scene.imageProcessingConfiguration.contrast = 1.15;
    App.scene.imageProcessingConfiguration.exposure = 1.08;

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
        App.shadowGenerator = new BABYLON.CascadedShadowGenerator(2048, App.sun);
        App.shadowGenerator.numCascades = 3;
        App.shadowGenerator.lambda = 0.82;
        App.shadowGenerator.stabilizeCascades = true;
    } else {
        App.shadowGenerator = new BABYLON.ShadowGenerator(2048, App.sun);
    }

    App.shadowGenerator.bias = 0.00035;
    App.shadowGenerator.normalBias = 0.015;
    App.shadowGenerator.usePercentageCloserFiltering = true;
    App.shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
    App.shadowGenerator.darkness = 0.26;

    App.createSky();
    App.createBattlefield();
    App.createClouds();
    App.createPlayer();
    App.updateHud();

    return App.scene;
};

App.addShadowCaster = function (mesh) {
    if (!App.shadowGenerator || !mesh) {
        return;
    }
    App.shadowGenerator.addShadowCaster(mesh, true);
};

App.updateCamera = function () {
    const forward = App.player.forward || new BABYLON.Vector3(0, 0, 1);
    const back = forward.scale(-1);
    const up = new BABYLON.Vector3(0, 1, 0);

    const targetPosition = App.player.mesh.position
        .add(back.scale(24))
        .add(up.scale(8));

    App.camera.position.copyFrom(targetPosition);
    App.camera.setTarget(App.player.mesh.position.add(forward.scale(52)).add(up.scale(2.5)));
};
