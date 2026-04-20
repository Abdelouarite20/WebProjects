class Particle extends MovingEntity {
    constructor(x, y, color) {
        super(x, y, Math.random() * 4 + 2);
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update(deltaScale = 1) {
        super.update(deltaScale);
        this.life -= this.decay * deltaScale;
        this.size *= Math.pow(0.97, deltaScale);
    }

    draw(ctx) {
        const angle = Math.atan2(this.vy, this.vx || 0.0001);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.15, this.size * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

window.Particle = Particle;
