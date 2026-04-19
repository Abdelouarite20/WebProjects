App.createAlly = function (side) {
    const plane = App.createPlaneMesh("ally" + side + Math.random(), new BABYLON.Color3(0.24, 0.44, 0.74), new BABYLON.Color3(0.19, 0.35, 0.62), new BABYLON.Color3(0.92, 0.88, 0.76));
    plane.root.position = App.player.mesh.position.add(new BABYLON.Vector3(side * 14, 2, -10));
    App.allies.push({ mesh: plane.root, propeller: plane.propellerBlades, side, shootTimer: 0 });
};

App.updateAllies = function (deltaTime) {
    if (App.allyDuration > 0) {
        App.allyDuration -= deltaTime;
    }
    const right = BABYLON.Vector3.Cross(App.player.forward, BABYLON.Axis.Y).normalize();
    const back = App.player.forward.scale(-1);
    for (let i = App.allies.length - 1; i >= 0; i--) {
        const ally = App.allies[i];
        const target = App.player.mesh.position.add(right.scale(ally.side * 14)).add(new BABYLON.Vector3(0, 2, 0)).add(back.scale(12));
        ally.mesh.position = BABYLON.Vector3.Lerp(ally.mesh.position, target, 0.08);
        ally.mesh.rotation.x = App.player.mesh.rotation.x;
        ally.mesh.rotation.y = App.player.mesh.rotation.y;
        ally.mesh.rotation.z = App.player.mesh.rotation.z - ally.side * 0.12;
        ally.propeller.rotation.z += 1.18;
        ally.shootTimer += deltaTime;
        if (ally.shootTimer >= 0.35) {
            App.shootPlayerBullet(ally.mesh, App.mouse.aimPoint);
            ally.shootTimer = 0;
        }
    }
    if (App.allyDuration <= 0 && App.allies.length > 0) {
        App.allies.forEach(ally => ally.mesh.dispose());
        App.allies = [];
    }
};
