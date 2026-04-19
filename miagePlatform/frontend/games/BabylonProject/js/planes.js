App.createPlaneMesh = function (name, bodyColor, wingColor, noseColor) {
    const root = new BABYLON.TransformNode(name + "Root", App.scene);
    const faction = name.indexOf("enemy") === 0 ? "axis" : "allied";

    const makeColoredMaterial = function (materialName, color, alpha) {
        const material = new BABYLON.StandardMaterial(materialName, App.scene);
        material.diffuseColor = color;
        material.specularColor = BABYLON.Color3.Black();
        if (alpha !== undefined) {
            material.alpha = alpha;
        }
        return material;
    };

    const palette = {
        body: makeColoredMaterial(name + "BodyMat", bodyColor),
        underside: makeColoredMaterial(name + "UndersideMat", wingColor),
        nose: makeColoredMaterial(name + "NoseMat", noseColor),
        accent: makeColoredMaterial(
            name + "AccentMat",
            bodyColor.scale(0.72).add(new BABYLON.Color3(0.08, 0.08, 0.08))
        )
    };

    const canopyGlassMat = makeColoredMaterial(
        name + "CanopyGlassMat",
        new BABYLON.Color3(0.20, 0.28, 0.34),
        0.82
    );
    canopyGlassMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.95);
    canopyGlassMat.emissiveColor = new BABYLON.Color3(0.03, 0.05, 0.06);

    const canopyFrameMat = makeColoredMaterial(
        name + "CanopyFrameMat",
        new BABYLON.Color3(0.28, 0.32, 0.34)
    );
    const metalDarkMat = makeColoredMaterial(
        name + "MetalDarkMat",
        new BABYLON.Color3(0.16, 0.17, 0.18)
    );
    const metalLightMat = makeColoredMaterial(
        name + "MetalLightMat",
        new BABYLON.Color3(0.55, 0.56, 0.58)
    );
    const wheelRubberMat = makeColoredMaterial(
        name + "WheelRubberMat",
        new BABYLON.Color3(0.05, 0.05, 0.06)
    );
    const roundelBlueMat = makeColoredMaterial(
        name + "RoundelBlueMat",
        new BABYLON.Color3(0.08, 0.17, 0.38)
    );
    const roundelWhiteMat = makeColoredMaterial(
        name + "RoundelWhiteMat",
        new BABYLON.Color3(0.95, 0.95, 0.93)
    );
    const roundelRedMat = makeColoredMaterial(
        name + "RoundelRedMat",
        new BABYLON.Color3(0.66, 0.12, 0.12)
    );
    const axisWhiteMat = makeColoredMaterial(
        name + "AxisWhiteMat",
        new BABYLON.Color3(0.95, 0.95, 0.92)
    );
    const axisBlackMat = makeColoredMaterial(
        name + "AxisBlackMat",
        new BABYLON.Color3(0.07, 0.07, 0.07)
    );

    const mirrorSign = function (side) {
        return side === "left" ? -1 : 1;
    };

    const createWingRoundel = function (x, y, z, size) {
        const blue = BABYLON.MeshBuilder.CreateCylinder(
            name + "WingRoundelBlue" + Math.random(),
            { height: 0.04, diameter: size },
            App.scene
        );
        blue.parent = root;
        blue.position.set(x, y, z);
        blue.material = roundelBlueMat;

        const white = BABYLON.MeshBuilder.CreateCylinder(
            name + "WingRoundelWhite" + Math.random(),
            { height: 0.05, diameter: size * 0.68 },
            App.scene
        );
        white.parent = root;
        white.position.set(x, y + 0.005, z);
        white.material = roundelWhiteMat;

        const red = BABYLON.MeshBuilder.CreateCylinder(
            name + "WingRoundelRed" + Math.random(),
            { height: 0.06, diameter: size * 0.34 },
            App.scene
        );
        red.parent = root;
        red.position.set(x, y + 0.01, z);
        red.material = roundelRedMat;
    };

    const createFuselageRoundel = function (side, y, z, size) {
        const sign = mirrorSign(side);
        const x = sign * 1.28;

        [1, 0.68, 0.34].forEach((scale, index) => {
            const mats = [roundelBlueMat, roundelWhiteMat, roundelRedMat];
            const mark = BABYLON.MeshBuilder.CreateCylinder(
                name + "FuselageRoundel" + side + index + Math.random(),
                { height: 0.05, diameter: size * scale },
                App.scene
            );
            mark.parent = root;
            mark.position.set(x, y, z);
            mark.rotation.z = Math.PI / 2;
            mark.material = mats[index];
        });
    };

    const createAxisCross = function (side, y, z, scale) {
        const sign = mirrorSign(side);

        const crossRoot = new BABYLON.TransformNode(
            name + "CrossRoot" + side + Math.random(),
            App.scene
        );
        crossRoot.parent = root;
        crossRoot.position.set(sign * 1.32, y, z);
        crossRoot.rotation.z = Math.PI / 2;

        const outerH = BABYLON.MeshBuilder.CreateBox(
            name + "CrossOuterH" + side + Math.random(),
            { width: 1.3 * scale, height: 0.38 * scale, depth: 0.05 },
            App.scene
        );
        outerH.parent = crossRoot;
        outerH.material = axisWhiteMat;

        const outerV = BABYLON.MeshBuilder.CreateBox(
            name + "CrossOuterV" + side + Math.random(),
            { width: 0.38 * scale, height: 1.3 * scale, depth: 0.05 },
            App.scene
        );
        outerV.parent = crossRoot;
        outerV.position.z = 0.005;
        outerV.material = axisWhiteMat;

        const innerH = BABYLON.MeshBuilder.CreateBox(
            name + "CrossInnerH" + side + Math.random(),
            { width: 1.05 * scale, height: 0.18 * scale, depth: 0.05 },
            App.scene
        );
        innerH.parent = crossRoot;
        innerH.position.z = 0.01;
        innerH.material = axisBlackMat;

        const innerV = BABYLON.MeshBuilder.CreateBox(
            name + "CrossInnerV" + side + Math.random(),
            { width: 0.18 * scale, height: 1.05 * scale, depth: 0.05 },
            App.scene
        );
        innerV.parent = crossRoot;
        innerV.position.z = 0.015;
        innerV.material = axisBlackMat;
    };

    const addExhausts = function (side) {
        const sign = mirrorSign(side);

        for (let i = 0; i < 4; i++) {
            const pipe = BABYLON.MeshBuilder.CreateCylinder(
                name + "Exhaust" + side + i,
                { height: 0.72, diameterTop: 0.13, diameterBottom: 0.16, tessellation: 8 },
                App.scene
            );
            pipe.parent = root;
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(sign * 1.05, 0.48 - i * 0.02, 4.65 - i * 0.52);
            pipe.material = metalDarkMat;
            App.addShadowCaster(pipe);
        }
    };

    const addWingGuns = function (side) {
        const sign = mirrorSign(side);

        [-4.8, -5.55].forEach((zPos, index) => {
            const barrel = BABYLON.MeshBuilder.CreateCylinder(
                name + "WingGun" + side + index,
                { height: 1.2, diameter: 0.09, tessellation: 8 },
                App.scene
            );
            barrel.parent = root;
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(sign * (5.1 + index * 0.45), -0.1, zPos + 5.1);
            barrel.material = metalDarkMat;
            App.addShadowCaster(barrel);
        });
    };

    const addLandingGear = function () {
        ["left", "right"].forEach(side => {
            const sign = mirrorSign(side);

            const strut = BABYLON.MeshBuilder.CreateCylinder(
                name + "GearStrut" + side,
                { height: 2.3, diameterTop: 0.12, diameterBottom: 0.16, tessellation: 8 },
                App.scene
            );
            strut.parent = root;
            strut.position.set(sign * 1.85, -1.02, 0.7);
            strut.rotation.z = sign * 0.36;
            strut.material = metalLightMat;
            App.addShadowCaster(strut);

            const wheel = BABYLON.MeshBuilder.CreateCylinder(
                name + "GearWheel" + side,
                { height: 0.24, diameter: 0.82, tessellation: 14 },
                App.scene
            );
            wheel.parent = root;
            wheel.position.set(sign * 2.55, -2.02, 1.1);
            wheel.rotation.z = Math.PI / 2;
            wheel.material = wheelRubberMat;
            App.addShadowCaster(wheel);
        });

        const tailWheel = BABYLON.MeshBuilder.CreateCylinder(
            name + "TailWheel",
            { height: 0.14, diameter: 0.34, tessellation: 10 },
            App.scene
        );
        tailWheel.parent = root;
        tailWheel.position.set(0, -1.36, -8.9);
        tailWheel.rotation.z = Math.PI / 2;
        tailWheel.material = wheelRubberMat;
        App.addShadowCaster(tailWheel);
    };

    [
        { z: 5.6, height: 3.3, top: 0.72, bottom: 1.2, mat: palette.nose },
        { z: 2.7, height: 4.9, top: 0.96, bottom: 1.34, mat: palette.body },
        { z: -1.2, height: 5.2, top: 0.88, bottom: 1.2, mat: palette.body },
        { z: -5.4, height: 4.8, top: 0.42, bottom: 0.74, mat: palette.body }
    ].forEach((segment, index) => {
        const part = BABYLON.MeshBuilder.CreateCylinder(
            name + "FuselageSegment" + index,
            {
                height: segment.height,
                diameterTop: segment.top,
                diameterBottom: segment.bottom,
                tessellation: 16
            },
            App.scene
        );
        part.parent = root;
        part.rotation.x = Math.PI / 2;
        part.position.z = segment.z;
        part.material = segment.mat;
        App.addShadowCaster(part);
    });

    const spinnerBase = BABYLON.MeshBuilder.CreateSphere(
        name + "SpinnerBase",
        { diameter: 1.0, segments: 12 },
        App.scene
    );
    spinnerBase.parent = root;
    spinnerBase.scaling.set(1.08, 1.02, 1.5);
    spinnerBase.position.z = 7.58;
    spinnerBase.material = palette.nose;
    App.addShadowCaster(spinnerBase);

    const bellyScoop = BABYLON.MeshBuilder.CreateBox(
        name + "BellyScoop",
        { width: 0.62, height: 0.26, depth: 1.25 },
        App.scene
    );
    bellyScoop.parent = root;
    bellyScoop.position.set(0, -0.62, 4.4);
    bellyScoop.material = metalDarkMat;
    App.addShadowCaster(bellyScoop);

    const canopyBase = BABYLON.MeshBuilder.CreateBox(
        name + "CanopyBase",
        { width: 1.2, height: 0.56, depth: 2.6 },
        App.scene
    );
    canopyBase.parent = root;
    canopyBase.position.set(0, 0.78, -1.2);
    canopyBase.material = canopyFrameMat;
    App.addShadowCaster(canopyBase);

    const canopyFront = BABYLON.MeshBuilder.CreateSphere(
        name + "CanopyFront",
        { diameter: 1.32, segments: 12 },
        App.scene
    );
    canopyFront.parent = root;
    canopyFront.scaling.set(0.84, 0.68, 1.14);
    canopyFront.position.set(0, 1.08, 0.0);
    canopyFront.material = canopyGlassMat;
    App.addShadowCaster(canopyFront);

    const canopyRear = BABYLON.MeshBuilder.CreateBox(
        name + "CanopyRear",
        { width: 1.04, height: 0.58, depth: 1.9 },
        App.scene
    );
    canopyRear.parent = root;
    canopyRear.position.set(0, 0.95, -2.2);
    canopyRear.material = canopyGlassMat;
    App.addShadowCaster(canopyRear);

    const mast = BABYLON.MeshBuilder.CreateCylinder(
        name + "Mast",
        { height: 0.55, diameter: 0.05, tessellation: 6 },
        App.scene
    );
    mast.parent = root;
    mast.position.set(0, 1.62, -2.55);
    mast.material = metalDarkMat;
    App.addShadowCaster(mast);

    [
        { side: "left", x: 2.55, z: -0.25, width: 4.4, depth: 1.9, rotY: 0.03 },
        { side: "left", x: 5.65, z: -0.86, width: 3.9, depth: 1.35, rotY: 0.12 },
        { side: "left", x: 8.05, z: -1.34, width: 1.55, depth: 0.74, rotY: 0.18 },
        { side: "right", x: 2.55, z: -0.25, width: 4.4, depth: 1.9, rotY: -0.03 },
        { side: "right", x: 5.65, z: -0.86, width: 3.9, depth: 1.35, rotY: -0.12 },
        { side: "right", x: 8.05, z: -1.34, width: 1.55, depth: 0.74, rotY: -0.18 }
    ].forEach((cfg, index) => {
        const sign = cfg.side === "left" ? -1 : 1;

        const part = BABYLON.MeshBuilder.CreateBox(
            name + "WingPart" + index,
            { width: cfg.width, height: 0.12, depth: cfg.depth },
            App.scene
        );
        part.parent = root;
        part.position.set(sign * cfg.x, 0.0, cfg.z);
        part.rotation.y = cfg.rotY;
        part.material = index % 3 === 0 ? palette.body : palette.underside;
        App.addShadowCaster(part);
    });

    ["left", "right"].forEach(side => {
        const sign = mirrorSign(side);

        const flap = BABYLON.MeshBuilder.CreateBox(
            name + "Flap" + side,
            { width: 2.0, height: 0.08, depth: 0.38 },
            App.scene
        );
        flap.parent = root;
        flap.position.set(sign * 5.65, -0.08, -1.05);
        flap.rotation.y = sign > 0 ? -0.08 : 0.08;
        flap.material = metalDarkMat;
        App.addShadowCaster(flap);

        const wingRootFairing = BABYLON.MeshBuilder.CreateSphere(
            name + "WingRootFairing" + side,
            { diameter: 1.2, segments: 8 },
            App.scene
        );
        wingRootFairing.parent = root;
        wingRootFairing.position.set(sign * 1.75, -0.04, -0.22);
        wingRootFairing.scaling.set(1.3, 0.55, 1.45);
        wingRootFairing.material = palette.body;
        App.addShadowCaster(wingRootFairing);

        addWingGuns(side);
    });

    ["left", "right"].forEach(side => {
        const sign = mirrorSign(side);

        [
            { x: 1.95, z: -8.35, width: 3.8, depth: 1.02, rotY: 0.1 },
            { x: 3.95, z: -8.86, width: 2.0, depth: 0.74, rotY: 0.16 }
        ].forEach((cfg, index) => {
            const tailPlane = BABYLON.MeshBuilder.CreateBox(
                name + "TailPlane" + side + index,
                { width: cfg.width, height: 0.12, depth: cfg.depth },
                App.scene
            );
            tailPlane.parent = root;
            tailPlane.position.set(sign * cfg.x, 0.52, cfg.z);
            tailPlane.rotation.y = sign > 0 ? -cfg.rotY : cfg.rotY;
            tailPlane.material = index === 0 ? palette.body : palette.underside;
            App.addShadowCaster(tailPlane);
        });
    });

    const fin = BABYLON.MeshBuilder.CreateBox(
        name + "Fin",
        { width: 0.16, height: 2.7, depth: 2.05 },
        App.scene
    );
    fin.parent = root;
    fin.position.set(0, 1.95, -8.55);
    fin.rotation.x = -0.06;
    fin.material = palette.body;
    App.addShadowCaster(fin);

    const rudder = BABYLON.MeshBuilder.CreateBox(
        name + "Rudder",
        { width: 0.12, height: 1.75, depth: 1.18 },
        App.scene
    );
    rudder.parent = root;
    rudder.position.set(0, 2.18, -9.18);
    rudder.rotation.x = -0.04;
    rudder.material = palette.accent;
    App.addShadowCaster(rudder);

    const propellerHub = BABYLON.MeshBuilder.CreateCylinder(
        name + "PropellerHub",
        { height: 0.18, diameter: 1.12, tessellation: 20 },
        App.scene
    );
    propellerHub.parent = root;
    propellerHub.rotation.x = Math.PI / 2;
    propellerHub.position.set(0, 0, 7.36);
    propellerHub.material = palette.accent;
    App.addShadowCaster(propellerHub);

    const spinnerTip = BABYLON.MeshBuilder.CreateSphere(
        name + "SpinnerTip",
        { diameter: 0.58, segments: 14 },
        App.scene
    );
    spinnerTip.parent = root;
    spinnerTip.scaling.set(1.0, 1.0, 1.85);
    spinnerTip.position.set(0, 0, 8.03);
    spinnerTip.material = palette.accent;
    App.addShadowCaster(spinnerTip);

    const propellerBlades = new BABYLON.TransformNode(name + "PropellerBlades", App.scene);
    propellerBlades.parent = root;
    propellerBlades.position.set(0, 0, 7.48);

    for (let i = 0; i < 3; i++) {
        const bladePivot = new BABYLON.TransformNode(name + "PropBladePivot" + i, App.scene);
        bladePivot.parent = propellerBlades;
        bladePivot.rotation.z = (Math.PI * 2 * i) / 3;

        const blade = BABYLON.MeshBuilder.CreateBox(
            name + "PropBlade" + i,
            { width: 0.18, height: 3.25, depth: 0.12 },
            App.scene
        );
        blade.parent = bladePivot;
        blade.position.set(0, 1.38, 0);
        blade.rotation.x = 0.08;
        blade.rotation.y = 0.04;
        blade.material = metalDarkMat;
        App.addShadowCaster(blade);

        const bladeTip = BABYLON.MeshBuilder.CreateBox(
            name + "PropBladeTip" + i,
            { width: 0.12, height: 0.72, depth: 0.09 },
            App.scene
        );
        bladeTip.parent = bladePivot;
        bladeTip.position.set(0, 2.82, 0);
        bladeTip.rotation.x = 0.08;
        bladeTip.rotation.y = 0.04;
        bladeTip.material = metalDarkMat;
        App.addShadowCaster(bladeTip);
    }

    addExhausts("left");
    addExhausts("right");

    if (faction === "allied") {
        createWingRoundel(-6.15, 0.14, -0.95, 1.6);
        createWingRoundel(6.15, 0.14, -0.95, 1.6);
        createFuselageRoundel("left", 0.42, -4.1, 1.15);
        createFuselageRoundel("right", 0.42, -4.1, 1.15);
    } else {
        createAxisCross("left", 0.34, -4.05, 0.9);
        createAxisCross("right", 0.34, -4.05, 0.9);

        const tailBand = BABYLON.MeshBuilder.CreateBox(
            name + "TailBand",
            { width: 2.55, height: 1.45, depth: 0.22 },
            App.scene
        );
        tailBand.parent = root;
        tailBand.position.set(0, 1.18, -8.35);
        tailBand.material = palette.nose;
        App.addShadowCaster(tailBand);
    }

    if (faction === "allied") {
        addLandingGear();
    }

    root.scaling.setAll(0.86);

    return {
        root,
        propellerHub,
        propellerBlades,
        propeller: propellerBlades
    };
};

App.updatePlanePropeller = function (plane, deltaTime) {
    if (!plane) {
        return;
    }

    const propeller = plane.propeller || plane.propellerBlades;
    if (!propeller) {
        return;
    }

    const minSpeed = plane.minSpeed ?? 20;
    const maxSpeed = Math.max(plane.maxSpeed ?? 200, minSpeed + 0.001);
    const speed = BABYLON.Scalar.Clamp(plane.speed ?? minSpeed, minSpeed, maxSpeed);
    const speedRatio = (speed - minSpeed) / (maxSpeed - minSpeed);

    const minSpin = plane.propellerMinSpin ?? 18;
    const maxSpin = plane.propellerMaxSpin ?? 95;
    const response = plane.propellerResponse ?? 6;

    const targetSpin = BABYLON.Scalar.Lerp(minSpin, maxSpin, speedRatio);
    const smoothing = Math.min(1, response * deltaTime);

    plane.propellerSpin = BABYLON.Scalar.Lerp(
        plane.propellerSpin ?? minSpin,
        targetSpin,
        smoothing
    );

    propeller.rotation.z += plane.propellerSpin * deltaTime;
};