App.getLevelEnemyTarget = function (level) {
    return 4 + (level - 1) * 2;
};

App.startLevel = function (level) {
    App.difficultyLevel = level;
    App.levelEnemiesSpawned = 0;
    App.levelEnemyTarget = App.getLevelEnemyTarget(level);
    App.levelTransitionTime = 0;
    App.levelActive = true;
    App.enemySpawnTimer = 0;
    App.enemySpawnDelay = Math.max(2.1 - App.difficultyLevel * 0.13, 0.7);
    App.updateHud();
};

App.updateDifficulty = function (deltaTime) {
    App.survivalTime += deltaTime;
    App.enemySpawnDelay = Math.max(2.1 - App.difficultyLevel * 0.13, 0.7);
    App.updateHud();
};
