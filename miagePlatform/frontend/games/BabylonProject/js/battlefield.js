App.arenaRadius = 1560;

App.clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
};

App.lerp = function (a, b, t) {
    return a + (b - a) * t;
};

App.smoothstep = function (edge0, edge1, x) {
    const t = App.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
};

App.fract = function (x) {
    return x - Math.floor(x);
};

App.rand2 = function (x, z) {
    return App.fract(Math.sin(x * 127.1 + z * 311.7) * 43758.5453123);
};

App.noise2 = function (x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);

    const a = App.rand2(ix, iz);
    const b = App.rand2(ix + 1, iz);
    const c = App.rand2(ix, iz + 1);
    const d = App.rand2(ix + 1, iz + 1);

    return App.lerp(App.lerp(a, b, ux), App.lerp(c, d, ux), uz);
};

App.fbm = function (x, z, octaves) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
        value += App.noise2(x * frequency, z * frequency) * amplitude;
        frequency *= 2;
        amplitude *= 0.5;
    }

    return value;
};

App.getGroundHeight = function (x, z) {
    const dist = Math.sqrt(x * x + z * z);
    const centerBlend = App.smoothstep(80, 260, dist);

    const broad = (App.fbm((x + 800) * 0.0036, (z - 300) * 0.0036, 6) - 0.5) * 40;
    const detail = (App.fbm((x - 1200) * 0.013, (z + 600) * 0.013, 4) - 0.5) * 10;
    const ridge = Math.abs(App.fbm((x + 300) * 0.008, (z + 300) * 0.008, 4) - 0.5) * -10;

    let height = (broad + detail + ridge) * (0.28 + centerBlend * 0.9);
    height -= (1 - centerBlend) * 8;
    height += App.smoothstep(380, 560, dist) * 6;

    return height;
};

App.createGroundTexture = function () {
    const tex = new BABYLON.DynamicTexture("groundTex", { width: 1024, height: 1024 }, App.scene, false);
    const ctx = tex.getContext();
    ctx.fillStyle = "#557448";
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 18000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const w = 1 + Math.random() * 4;
        const h = 1 + Math.random() * 8;
        const g = 70 + Math.floor(Math.random() * 70);
        const r = 55 + Math.floor(Math.random() * 35);
        const b = 35 + Math.floor(Math.random() * 28);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.18 + Math.random() * 0.22})`;
        ctx.fillRect(x, y, w, h);
    }

    for (let i = 0; i < 1400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const radius = 3 + Math.random() * 18;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(120, 92, 58, 0.16)");
        gradient.addColorStop(1, "rgba(120, 92, 58, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    tex.update();
    tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    tex.anisotropicFilteringLevel = 8;
    return tex;
};

App.createRockTexture = function () {
    const tex = new BABYLON.DynamicTexture("rockTex", { width: 512, height: 512 }, App.scene, false);
    const ctx = tex.getContext();
    ctx.fillStyle = "#5d5c58";
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 1 + Math.random() * 6;
        const shade = 85 + Math.floor(Math.random() * 70);
        ctx.fillStyle = `rgba(${shade},${shade},${shade},${0.16 + Math.random() * 0.26})`;
        ctx.fillRect(x, y, size, size);
    }

    for (let i = 0; i < 180; i++) {
        const x1 = Math.random() * 512;
        const y1 = Math.random() * 512;
        const x2 = x1 + (Math.random() - 0.5) * 80;
        const y2 = y1 + (Math.random() - 0.5) * 80;
        ctx.strokeStyle = `rgba(35,35,35,${0.04 + Math.random() * 0.08})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    tex.update();
    tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    tex.anisotropicFilteringLevel = 8;
    return tex;
};

App.makeColoredMaterial = function (name, color) {
    const material = new BABYLON.StandardMaterial(name, App.scene);
    material.diffuseColor = color;
    material.specularColor = BABYLON.Color3.Black();
    return material;
};

App.freezeStaticNode = function (node) {
    if (!node) {
        return;
    }

    if (typeof node.freezeWorldMatrix === "function") {
        node.freezeWorldMatrix();
    }

    if (node.getChildMeshes) {
        node.getChildMeshes(false).forEach(mesh => {
            if (mesh && typeof mesh.freezeWorldMatrix === "function") {
                mesh.freezeWorldMatrix();
            }
        });
    }
};

App.createBattlefield = function () {
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 3600,
        height: 3600,
        subdivisions: 300,
        updatable: true
    }, App.scene);

    const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const indices = ground.getIndices();
    const normals = [];
    const colors = [];

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const y = App.getGroundHeight(x, z);
        positions[i + 1] = y;

        const dist = Math.sqrt(x * x + z * z);
        const dry = App.smoothstep(16, 42, y + dist * 0.015);
        const rockyEdge = App.smoothstep(430, 580, dist);

        const grass = new BABYLON.Color3(0.21, 0.39, 0.2);
        const field = new BABYLON.Color3(0.36, 0.47, 0.24);
        const dirt = new BABYLON.Color3(0.47, 0.4, 0.28);
        const rock = new BABYLON.Color3(0.5, 0.49, 0.47);

        let color = BABYLON.Color3.Lerp(grass, field, dry);
        color = BABYLON.Color3.Lerp(color, dirt, dry * 0.42);
        color = BABYLON.Color3.Lerp(color, rock, rockyEdge * 0.5);
        colors.push(color.r, color.g, color.b, 1);
    }

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    ground.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
    ground.receiveShadows = true;
    ground.isPickable = false;

    const groundMat = new BABYLON.StandardMaterial("groundMat", App.scene);
    groundMat.diffuseTexture = App.createGroundTexture();
    groundMat.diffuseTexture.uScale = 36;
    groundMat.diffuseTexture.vScale = 36;
    groundMat.specularColor = BABYLON.Color3.Black();
    groundMat.ambientColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    groundMat.useVertexColor = true;
    ground.material = groundMat;
    App.terrain = ground;
    App.freezeStaticNode(ground);

    App.rockMaterial = new BABYLON.StandardMaterial("rockMat", App.scene);
    App.rockMaterial.diffuseTexture = App.createRockTexture();
    App.rockMaterial.diffuseTexture.uScale = 4;
    App.rockMaterial.diffuseTexture.vScale = 3;
    App.rockMaterial.specularColor = BABYLON.Color3.Black();

    App.trunkMaterial = App.makeColoredMaterial("trunkMat", new BABYLON.Color3(0.31, 0.22, 0.14));
    App.leafMaterials = [
        App.makeColoredMaterial("leafMat1", new BABYLON.Color3(0.18, 0.39, 0.2)),
        App.makeColoredMaterial("leafMat2", new BABYLON.Color3(0.24, 0.46, 0.22)),
        App.makeColoredMaterial("leafMat3", new BABYLON.Color3(0.13, 0.3, 0.15))
    ];
    App.houseWallMats = [
        App.makeColoredMaterial("houseWallMat0", new BABYLON.Color3(0.83, 0.77, 0.68)),
        App.makeColoredMaterial("houseWallMat1", new BABYLON.Color3(0.77, 0.73, 0.62)),
        App.makeColoredMaterial("houseWallMat2", new BABYLON.Color3(0.71, 0.67, 0.6)),
        App.makeColoredMaterial("houseWallMat3", new BABYLON.Color3(0.61, 0.65, 0.7))
    ];
    App.roofMats = [
        App.makeColoredMaterial("roofMat0", new BABYLON.Color3(0.42, 0.17, 0.12)),
        App.makeColoredMaterial("roofMat1", new BABYLON.Color3(0.25, 0.18, 0.16)),
        App.makeColoredMaterial("roofMat2", new BABYLON.Color3(0.39, 0.22, 0.16))
    ];
    App.windowMat = App.makeColoredMaterial("windowMat", new BABYLON.Color3(0.17, 0.23, 0.28));
    App.doorMat = App.makeColoredMaterial("doorMat", new BABYLON.Color3(0.28, 0.18, 0.12));
    App.roadMat = App.makeColoredMaterial("roadMat", new BABYLON.Color3(0.44, 0.34, 0.23));

    App.createMountains();
    App.createVillages();
    App.createForests();
    App.createRunway();
};

App.createMountain = function (radius, angle, layer) {
    const baseRadius = radius + (Math.random() - 0.5) * 18;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    const height = 120 + Math.random() * 160 + layer * 35;
    const width = 70 + Math.random() * 110 + layer * 18;

    const mountain = BABYLON.MeshBuilder.CreateCylinder("mountain_" + layer + "_" + angle.toFixed(2), {
        height,
        diameterTop: 0,
        diameterBottom: width,
        tessellation: 10,
        subdivisions: 8,
        updatable: true
    }, App.scene);

    const mountainPositions = mountain.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const mountainIndices = mountain.getIndices();
    const mountainNormals = [];

    for (let i = 0; i < mountainPositions.length; i += 3) {
        const vx = mountainPositions[i];
        const vy = mountainPositions[i + 1];
        const vz = mountainPositions[i + 2];
        const vyNorm = (vy + height * 0.5) / height;
        const radial = 1 + (App.noise2(vx * 0.08 + angle * 4, vz * 0.08 + layer * 11) - 0.5) * 0.55;
        const crag = (App.noise2(vx * 0.22 + 50, vz * 0.22 - 35) - 0.5) * 8.5 * vyNorm;
        mountainPositions[i] = vx * radial;
        mountainPositions[i + 2] = vz * radial;
        mountainPositions[i + 1] = vy + crag;
    }

    BABYLON.VertexData.ComputeNormals(mountainPositions, mountainIndices, mountainNormals);
    mountain.updateVerticesData(BABYLON.VertexBuffer.PositionKind, mountainPositions);
    mountain.setVerticesData(BABYLON.VertexBuffer.NormalKind, mountainNormals);
    mountain.material = App.rockMaterial;
    mountain.position.set(x, App.getGroundHeight(x, z) + height * 0.46 - 18, z);
    mountain.rotation.y = angle + Math.random() * 0.8;
    mountain.receiveShadows = true;
    mountain.metadata = mountain.metadata || {};
    mountain.metadata.crashKind = "mountain";
    mountain.metadata.crashDestructible = false;
    App.addShadowCaster(mountain);

    if (App.registerCrashCollider) {
        App.registerCrashCollider(mountain, 1.6);
    }

    App.freezeStaticNode(mountain);
};

App.createMountains = function () {
    [1575, 1710].forEach((radius, layer) => {
        const count = 28 + layer * 8;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.11;
            App.createMountain(radius, angle, layer);
        }
    });
};

App.isNearVillage = function (x, z) {
    for (let i = 0; i < App.villageCenters.length; i++) {
        const village = App.villageCenters[i];
        const dx = x - village.x;
        const dz = z - village.z;
        if (Math.sqrt(dx * dx + dz * dz) < 55) {
            return true;
        }
    }
    return false;
};

App.createTree = function (x, z, scale, styleIndex) {
    const y = App.getGroundHeight(x, z);
    const root = new BABYLON.TransformNode("treeRoot_" + Math.random().toString(36).slice(2), App.scene);
    root.position.set(x, y, z);
    root.scaling.setAll(scale);
    root.rotation.y = Math.random() * Math.PI * 2;
    root.metadata = root.metadata || {};
    root.metadata.crashKind = "tree";
    root.metadata.crashDestructible = true;
    root.metadata.crashExplosionOffset = new BABYLON.Vector3(0, 6 * scale, 0);

    const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
        height: 7,
        diameterTop: 0.7,
        diameterBottom: 1.15,
        tessellation: 7
    }, App.scene);
    trunk.parent = root;
    trunk.position.y = 3.5;
    trunk.material = App.trunkMaterial;
    trunk.receiveShadows = true;
    App.addShadowCaster(trunk);

    if (styleIndex === 0) {
        const foliage1 = BABYLON.MeshBuilder.CreateCylinder("foliage1", { height: 8, diameterTop: 0, diameterBottom: 7.5, tessellation: 8 }, App.scene);
        foliage1.parent = root;
        foliage1.position.y = 8.5;
        foliage1.material = App.leafMaterials[0];
        App.addShadowCaster(foliage1);

        const foliage2 = BABYLON.MeshBuilder.CreateCylinder("foliage2", { height: 7, diameterTop: 0, diameterBottom: 5.6, tessellation: 8 }, App.scene);
        foliage2.parent = root;
        foliage2.position.y = 12.5;
        foliage2.material = App.leafMaterials[1];
        App.addShadowCaster(foliage2);
    } else if (styleIndex === 1) {
        const crown1 = BABYLON.MeshBuilder.CreateSphere("crown1", { diameter: 6.8, segments: 6 }, App.scene);
        crown1.parent = root;
        crown1.position.set(0, 8.3, 0);
        crown1.scaling.y = 0.9;
        crown1.material = App.leafMaterials[1];
        App.addShadowCaster(crown1);

        const crown2 = BABYLON.MeshBuilder.CreateSphere("crown2", { diameter: 5.2, segments: 6 }, App.scene);
        crown2.parent = root;
        crown2.position.set(1.1, 10.8, 0.4);
        crown2.material = App.leafMaterials[2];
        App.addShadowCaster(crown2);

        const crown3 = BABYLON.MeshBuilder.CreateSphere("crown3", { diameter: 4.8, segments: 6 }, App.scene);
        crown3.parent = root;
        crown3.position.set(-0.8, 10, -0.6);
        crown3.material = App.leafMaterials[0];
        App.addShadowCaster(crown3);
    } else {
        const foliage1 = BABYLON.MeshBuilder.CreateCylinder("foliage3a", { height: 6.5, diameterTop: 0, diameterBottom: 5.5, tessellation: 7 }, App.scene);
        foliage1.parent = root;
        foliage1.position.y = 8.2;
        foliage1.material = App.leafMaterials[2];
        App.addShadowCaster(foliage1);

        const foliage2 = BABYLON.MeshBuilder.CreateCylinder("foliage3b", { height: 5.5, diameterTop: 0, diameterBottom: 4.2, tessellation: 7 }, App.scene);
        foliage2.parent = root;
        foliage2.position.y = 11.4;
        foliage2.material = App.leafMaterials[1];
        App.addShadowCaster(foliage2);
    }

    if (App.registerCrashCollider) {
        App.registerCrashCollider(root, 0.85);
    }

    App.freezeStaticNode(root);
};

App.createForests = function () {
    for (let i = 0; i < 180; i++) {
        let x = 0;
        let z = 0;
        let tries = 0;

        while (tries < 12) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 360 + Math.random() * 1080;
            x = Math.cos(angle) * radius + (Math.random() - 0.5) * 70;
            z = Math.sin(angle) * radius + (Math.random() - 0.5) * 70;
            const dist = Math.sqrt(x * x + z * z);
            if (dist < 270 || dist > 1500 || App.isNearVillage(x, z)) {
                tries++;
                continue;
            }
            const height = App.getGroundHeight(x, z);
            if (height > 42) {
                tries++;
                continue;
            }
            break;
        }

        App.createTree(x, z, 0.8 + Math.random() * 0.8, i % 3);
    }
};

App.createHouse = function (x, z, width, depth, height, roofHeight, wallMat, roofMat) {
    const baseY = App.getGroundHeight(x, z);

    const root = new BABYLON.TransformNode("houseRoot_" + Math.random().toString(36).slice(2), App.scene);
    root.position.set(x, baseY, z);
    root.rotation.y = (Math.random() < 0.5 ? 0 : Math.PI * 0.5) + (Math.random() - 0.5) * 0.08;
    root.metadata = root.metadata || {};
    root.metadata.crashKind = "house";
    root.metadata.crashDestructible = true;
    root.metadata.crashExplosionOffset = new BABYLON.Vector3(0, height * 0.55, 0);

    const body = BABYLON.MeshBuilder.CreateBox("houseBody_" + Math.random(), { width, depth, height }, App.scene);
    body.parent = root;
    body.position.set(0, height * 0.5, 0);
    body.material = wallMat;
    body.receiveShadows = true;
    App.addShadowCaster(body);

    const roof = BABYLON.MeshBuilder.CreateCylinder("houseRoof_" + Math.random(), {
        height: depth * 1.1,
        diameter: Math.max(width, 1) * 1.18,
        tessellation: 3
    }, App.scene);
    roof.parent = root;
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, height * 0.5 + roofHeight * 0.18, 0);
    roof.scaling.y = roofHeight;
    roof.material = roofMat;
    App.addShadowCaster(roof);

    const door = BABYLON.MeshBuilder.CreateBox("door_" + Math.random(), {
        width: width * 0.18,
        height: height * 0.46,
        depth: 0.16
    }, App.scene);
    door.parent = root;
    door.position.set(0, height * 0.23, depth * 0.5 + 0.08);
    door.material = App.doorMat;

    const leftWindow = BABYLON.MeshBuilder.CreateBox("windowL_" + Math.random(), {
        width: width * 0.16,
        height: height * 0.18,
        depth: 0.08
    }, App.scene);
    leftWindow.parent = root;
    leftWindow.position.set(-width * 0.22, height * 0.58, depth * 0.5 + 0.05);
    leftWindow.material = App.windowMat;

    const rightWindow = leftWindow.clone("windowR_" + Math.random());
    rightWindow.parent = root;
    rightWindow.position.x = width * 0.22;

    const chimney = BABYLON.MeshBuilder.CreateBox("chimney_" + Math.random(), {
        width: 0.8,
        depth: 0.8,
        height: 3.6
    }, App.scene);
    chimney.parent = root;
    chimney.position.set(width * 0.16, height * 0.5 + roofHeight * 0.18 + 1.7, 0);
    chimney.material = wallMat;
    App.addShadowCaster(chimney);

    if (App.registerCrashCollider) {
        App.registerCrashCollider(root, 1.15);
    }

    App.freezeStaticNode(root);
    return root;
};

App.createRoad = function (from, to, width) {
    const dir = to.subtract(from);
    const len = dir.length();
    const mid = from.add(to).scale(0.5);
    const road = BABYLON.MeshBuilder.CreateBox("road_" + Math.random(), {
        width: width || 8,
        depth: len,
        height: 0.25
    }, App.scene);
    road.position.set(mid.x, App.getGroundHeight(mid.x, mid.z) + 0.2, mid.z);
    road.rotation.y = Math.atan2(dir.x, dir.z);
    road.material = App.roadMat;
    road.receiveShadows = true;
    App.freezeStaticNode(road);
    return road;
};

App.createVillages = function () {
    App.villageCenters = [
        { x: -510, z: -360 },
        { x: 495, z: -255 },
        { x: 420, z: 510 }
    ];

    App.villageCenters.forEach((village, villageIndex) => {
        const center = new BABYLON.Vector3(village.x, App.getGroundHeight(village.x, village.z) + 0.2, village.z);

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.25;
            const radius = 12 + Math.random() * 20;
            const x = village.x + Math.cos(angle) * radius;
            const z = village.z + Math.sin(angle) * radius;

            App.createHouse(
                x,
                z,
                8 + Math.random() * 6,
                7 + Math.random() * 5,
                6 + Math.random() * 3,
                1.2 + Math.random() * 0.6,
                App.houseWallMats[(villageIndex + i) % App.houseWallMats.length],
                App.roofMats[(villageIndex + i) % App.roofMats.length]
            );

            const housePos = new BABYLON.Vector3(x, App.getGroundHeight(x, z) + 0.15, z);
            App.createRoad(center, housePos, 5 + Math.random() * 2);
        }
    });
};

App.createRunway = function () {
    const runway = BABYLON.MeshBuilder.CreateGround("runway", {
        width: 168,
        height: 720,
        subdivisions: 1
    }, App.scene);
    runway.position.y = App.getGroundHeight(0, 0) + 0.16;
    runway.material = App.roadMat;
    runway.receiveShadows = true;
    App.freezeStaticNode(runway);

    const stripeMat = App.makeColoredMaterial("stripeMat", new BABYLON.Color3(0.9, 0.88, 0.74));
    for (let i = 0; i < 7; i++) {
        const stripe = BABYLON.MeshBuilder.CreateGround("stripe_" + i, { width: 4, height: 14 }, App.scene);
        stripe.material = stripeMat;
        stripe.position.set(0, runway.position.y + 0.03, -225 + i * 75);
        App.freezeStaticNode(stripe);
    }
};
