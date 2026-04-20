class PowerUp extends Entity {
    constructor(type = 'speed', getCanvas, getGameTime) {
        super(0, 0, 14);
        this.type = type;
        const canvas = getCanvas();
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.life = 8000;
        this.spawnTime = getGameTime();
        this.wobble = Math.random() * Math.PI * 2;
        this._getGameTime = getGameTime;
    }

    update(deltaScale = 1) {
        this.wobble += 0.08 * deltaScale;
    }

    draw(ctx) {
        const t = this._getGameTime() - this.spawnTime;
        const pulse = 1 + Math.sin(t * 0.01) * 0.12;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.wobble) * 0.35);
        ctx.scale(pulse, pulse);

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, this.size * 2.2);
        if (this.type === 'shield') {
            glow.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
            glow.addColorStop(1, 'rgba(34, 197, 94, 0)');
        } else {
            glow.addColorStop(0, 'rgba(234, 179, 8, 0.6)');
            glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
        }
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.type === 'shield' ? '#22c55e' : '#facc15';
        ctx.strokeStyle = this.type === 'shield' ? '#15803d' : '#a16207';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.type === 'shield' ? '#dcfce7' : '#fef3c7';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.type === 'shield' ? '#14532d' : '#78350f';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (this.type === 'shield') {
            ctx.moveTo(0, -this.size * 0.45);
            ctx.lineTo(this.size * 0.35, -this.size * 0.1);
            ctx.lineTo(this.size * 0.2, this.size * 0.38);
            ctx.lineTo(-this.size * 0.2, this.size * 0.38);
            ctx.lineTo(-this.size * 0.35, -this.size * 0.1);
            ctx.closePath();
        } else {
            ctx.moveTo(-this.size * 0.15, -this.size * 0.45);
            ctx.lineTo(this.size * 0.08, -this.size * 0.05);
            ctx.lineTo(-this.size * 0.02, -this.size * 0.05);
            ctx.lineTo(this.size * 0.15, this.size * 0.45);
            ctx.lineTo(-this.size * 0.08, this.size * 0.05);
            ctx.lineTo(this.size * 0.02, this.size * 0.05);
            ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
    }

    isExpired() {
        return this._getGameTime() - this.spawnTime > this.life;
    }
}

window.PowerUp = PowerUp;
