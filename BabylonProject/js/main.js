App.ui.shieldButton.addEventListener("click", () => App.buyPower("shield"));
App.ui.speedButton.addEventListener("click", () => App.buyPower("speed"));
App.ui.bombButton.addEventListener("click", () => App.buyPower("bomb"));
App.ui.alliesButton.addEventListener("click", () => App.buyPower("allies"));

App.createScene();
App.startLevel(1);

App.scene.onBeforeRenderObservable.add(() => {
    const deltaTime = App.engine.getDeltaTime() / 1000;

    App.updatePlayer(deltaTime);
    App.updateEnemies(deltaTime);
    App.updatePlayerBullets(deltaTime);
    App.updateEnemyBullets(deltaTime);
    App.updateAllies(deltaTime);
    App.updateExplosions(deltaTime);
    App.updateParticles(deltaTime);
    App.updateDifficulty(deltaTime);
    App.updateEffects();
    App.updateHud();
    App.updateCamera();
});

App.engine.runRenderLoop(() => {
    App.scene.render();
});

window.addEventListener("resize", () => {
    App.engine.resize();
});
