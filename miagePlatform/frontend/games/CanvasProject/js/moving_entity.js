class MovingEntity extends Entity {
    constructor(x, y, size) {
        super(x, y, size);
        this.vx = 0;
        this.vy = 0;
    }

    update(deltaScale = 1) {
        this.x += this.vx * deltaScale;
        this.y += this.vy * deltaScale;
    }
}

window.MovingEntity = MovingEntity;
