class Bubble extends Entity {
    constructor(getCanvas) {
        const canvas = getCanvas();
        super(Math.random() * canvas.width, canvas.height + 10, Math.random() * 5 + 2);
        this.speed = Math.random() * 1 + 0.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.getCanvasFn = getCanvas;
    }

    update() {
        this.y -= this.speed;
        this.wobble += 0.05;
        this.x += Math.sin(this.wobble) * 0.5;
    }

    draw(ctx, bubbleColor) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.wobble) * 0.1);
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = bubbleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(-this.size * 0.25, -this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.y < -10;
    }
}

window.Bubble = Bubble;
