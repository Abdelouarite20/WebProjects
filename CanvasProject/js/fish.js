class Fish extends MovingEntity {
    constructor(
        x,
        y,
        size,
        isPlayer = false,
        getFishStyle,
        getPlayerSize,
        isBoostActive,
        isShieldActive,
        getCurrentSpeed,
        getCtx
    ) {
        super(x, y, size);
        this.isPlayer = isPlayer;
        this.vx = 0;
        this.vy = 0;
        this.direction = 1;
        this.aiState = isPlayer ? null : 'swim';
        this.getFishStyleFn = getFishStyle;
        this.getPlayerSizeFn = getPlayerSize;
        this.isBoostActiveFn = isBoostActive;
        this.isShieldActiveFn = isShieldActive;
        this.getCurrentSpeedFn = getCurrentSpeed;
        this.getCtxFn = getCtx;

        if (!isPlayer) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 1 + 0.5) * this.getCurrentSpeedFn();
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    draw() {
        const ctx = this.getCtxFn();
        ctx.save();
        ctx.translate(this.x, this.y);

        const facing = this.direction === -1 ? -1 : 1;
        ctx.scale(facing, 1);
        const bodyAngle = Math.atan2(this.vy, Math.max(Math.abs(this.vx), 0.0001)) * 0.25;
        ctx.rotate(bodyAngle);

        const style = this.getFishStyleFn(this.size, this.isPlayer, this.size < this.getPlayerSizeFn());

        ctx.lineWidth = 2;
        ctx.strokeStyle = style.stroke;

        const bodyGradient = ctx.createLinearGradient(-this.size, 0, this.size, 0);
        bodyGradient.addColorStop(0, style.bodyDark);
        bodyGradient.addColorStop(0.5, style.bodyMid);
        bodyGradient.addColorStop(1, style.bodyLight);
        ctx.fillStyle = bodyGradient;

        if (this.isPlayer && (this.isBoostActiveFn() || this.isShieldActiveFn())) {
            ctx.save();
            if (this.isShieldActiveFn()) {
                ctx.shadowColor = 'rgba(34, 197, 94, 1)';
            } else {
                ctx.shadowColor = 'rgba(234, 179, 8, 1)';
            }
            ctx.shadowBlur = this.size * 1.6;
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (this.isPlayer && (this.isBoostActiveFn() || this.isShieldActiveFn())) {
            ctx.restore();
        }

        ctx.fillStyle = style.fin;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.2, -this.size * 0.45);
        ctx.lineTo(this.size * 0.15, -this.size * 0.85);
        ctx.lineTo(this.size * 0.45, -this.size * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = style.fin;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.6, -this.size * 0.6);
        ctx.lineTo(-this.size * 1.75, 0);
        ctx.lineTo(-this.size * 1.6, this.size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.size * 0.05, this.size * 0.1);
        ctx.quadraticCurveTo(this.size * 0.35, this.size * 0.35, this.size * 0.2, this.size * 0.55);
        ctx.quadraticCurveTo(this.size * 0.05, this.size * 0.3, this.size * 0.05, this.size * 0.1);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = style.stripe;
        ctx.lineWidth = 2;
        const stripes = Math.max(2, Math.floor(this.size / 12));
        for (let i = 0; i < stripes; i++) {
            const x = -this.size * 0.3 + i * (this.size * 0.35);
            ctx.beginPath();
            ctx.moveTo(x, -this.size * 0.45);
            ctx.lineTo(x + this.size * 0.15, this.size * 0.45);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = style.highlight;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, -this.size * 0.15, this.size * 0.45, this.size * 0.22, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 0.2, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        if (true) {
            const fontSize = Math.max(10, Math.floor(this.size * 0.5));
            ctx.save();
            ctx.rotate(-bodyAngle);
            ctx.scale(facing, 1);
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const label = Math.floor(this.size);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillText(label, 0, -this.size * 0.95);
            ctx.fillStyle = this.isPlayer ? '#ffd700' : '#ffffff';
            ctx.fillText(label, 0, -this.size * 0.98);
            ctx.restore();
        }

        ctx.restore();
    }

    update() {
        super.update();

        if (this.vx > 0) this.direction = 1;
        else if (this.vx < 0) this.direction = -1;

        if (!this.isPlayer) {
            const canvas = this.getCtxFn().canvas;
            let bounced = false;
            if (this.x - this.size < 0 || this.x + this.size > canvas.width) {
                this.vx *= -1;
                this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
                bounced = true;
            }
            if (this.y - this.size < 0 || this.y + this.size > canvas.height) {
                this.vy *= -1;
                this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
                bounced = true;
            }
            if (bounced) {
                this.aiState = 'bounce';
            } else if (this.aiState !== 'swim') {
                this.aiState = 'swim';
            }
        }
    }
}

window.Fish = Fish;
