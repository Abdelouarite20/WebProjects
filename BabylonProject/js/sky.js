App.createSky = function () {
    BABYLON.Effect.ShadersStore["skyVertexShader"] = `
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        varying vec3 vPosition;
        void main(void) {
            vPosition = position;
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
    `;

    BABYLON.Effect.ShadersStore["skyFragmentShader"] = `
        precision highp float;
        varying vec3 vPosition;
        void main(void) {
            vec3 dir = normalize(vPosition);
            float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
            vec3 zenith = vec3(0.05, 0.16, 0.38);
            vec3 upper = vec3(0.22, 0.48, 0.78);
            vec3 lower = vec3(0.74, 0.85, 0.98);
            vec3 horizonWarm = vec3(0.98, 0.78, 0.52);
            vec3 col = mix(lower, upper, smoothstep(0.18, 0.72, h));
            col = mix(col, zenith, smoothstep(0.68, 1.0, h));
            float horizonBand = 1.0 - smoothstep(0.02, 0.24, abs(dir.y));
            col = mix(col, horizonWarm, horizonBand * 0.25);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    const skyMat = new BABYLON.ShaderMaterial("skyMat", App.scene, { vertex: "sky", fragment: "sky" }, { attributes: ["position"], uniforms: ["worldViewProjection"] });
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;

    const skyDome = BABYLON.MeshBuilder.CreateSphere("skyDome", { diameter: 5000, segments: 32 }, App.scene);
    skyDome.material = skyMat;
    skyDome.isPickable = false;
    skyDome.infiniteDistance = true;
};

App.createClouds = function () {
    for (let i = 0; i < 20; i++) {
        const x = -520 + Math.random() * 1040;
        const y = 180 + Math.random() * 110;
        const z = -520 + Math.random() * 1040;
        const scale = 0.8 + Math.random() * 1.2;
        const cloudMat = new BABYLON.StandardMaterial("cloudMat" + i, App.scene);
        cloudMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        cloudMat.alpha = 0.92;
        cloudMat.disableLighting = true;
        for (let j = 0; j < 4; j++) {
            const puff = BABYLON.MeshBuilder.CreateSphere("cloud_" + i + "_" + j, { diameter: 28 + Math.random() * 24, segments: 8 }, App.scene);
            puff.position.set(x + (Math.random() - 0.5) * 30 * scale, y + (Math.random() - 0.5) * 10 * scale, z + (Math.random() - 0.5) * 18 * scale);
            puff.scaling.set(1.6 * scale, 0.7 * scale, 1.0 * scale);
            puff.material = cloudMat;
            puff.isPickable = false;
        }
    }
};
