const App = {
    canvas: document.getElementById("renderCanvas"),
    engine: null,
    scene: null,
    camera: null,
    terrain: null,
    sun: null,
    player: null,
    enemies: [],
    playerBullets: [],
    enemyBullets: [],
    allies: [],
    explosions: [],
    particles: [],
    villageCenters: [],
    keys: {},
    mouse: {
        x: 0,
        y: 0,
        down: false,
        aimPoint: null
    },
    arenaRadius: 120,
    score: 0,
    money: 0,
    survivalTime: 0,
    difficultyLevel: 1,
    enemySpawnTimer: 0,
    enemySpawnDelay: 2.1,
    levelEnemiesSpawned: 0,
    levelEnemyTarget: 0,
    levelTransitionTime: 0,
    levelActive: false,
    playerShootTimer: 0,
    allyDuration: 0,
    bombFlash: 0,
    bombFlashActive: false,
    ui: {
        healthValue: document.getElementById("healthValue"),
        moneyValue: document.getElementById("moneyValue"),
        scoreValue: document.getElementById("scoreValue"),
        timeValue: document.getElementById("timeValue"),
        levelValue: document.getElementById("levelValue"),
        shieldButton: document.getElementById("shieldButton"),
        speedButton: document.getElementById("speedButton"),
        bombButton: document.getElementById("bombButton"),
        alliesButton: document.getElementById("alliesButton")
    },
    performance: {
        shadowMapSize: (window.devicePixelRatio || 1) > 1.5 ? 1024 : 1536,
        shadowCascadeCount: (window.devicePixelRatio || 1) > 1.5 ? 2 : 3,
        maxParticles: 260,
        maxTrailParticles: 180,
        maxExplosionMeshes: 96,
        effectDensity: (window.devicePixelRatio || 1) > 1.5 ? 0.68 : 0.82,
        hudRefreshMs: 90,
        hardwareScaling: (window.devicePixelRatio || 1) > 1.5 ? Math.min(window.devicePixelRatio || 1, 1.5) : 1
    },
    hudCache: {
        health: null,
        money: null,
        score: null,
        time: null,
        level: null,
        speed: null,
        speedZone: null,
        lastRenderAt: 0
    },
    cameraRig: {
        forwardFallback: new BABYLON.Vector3(0, 0, 1),
        position: new BABYLON.Vector3(),
        lookTarget: new BABYLON.Vector3(),
        offset: new BABYLON.Vector3(),
        lookAhead: new BABYLON.Vector3()
    }
};

App.engine = new BABYLON.Engine(App.canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    powerPreference: "high-performance"
});

if (App.performance.hardwareScaling > 1) {
    App.engine.setHardwareScalingLevel(App.performance.hardwareScaling);
}
