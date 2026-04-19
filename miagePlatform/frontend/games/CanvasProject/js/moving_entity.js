class MovingEntity extends Entity {
    constructor(x, y, size) {
        super(x, y, size);
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}

window.MovingEntity = MovingEntity;
