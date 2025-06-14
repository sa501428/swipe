class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'flying' or 'tossed'
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
        this.particles = [];
        
        if (type === 'tossed') {
            this.velocityY = -15;
            this.velocityX = (Math.random() - 0.5) * 8;
            this.gravity = 0.5;
        } else {
            this.velocityX = Math.random() > 0.5 ? this.speed : -this.speed;
            this.velocityY = 0;
        }
    }

    update() {
        if (this.type === 'tossed') {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            this.x += this.velocityX;
        } else {
            this.x += this.velocityX;
        }
        
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw object
        ctx.fillStyle = this.sliced ? '#ff4444' : '#44ff44';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();

        // Draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    createSliceParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                this.x,
                this.y,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ));
        }
    }
}

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1;
        this.size = 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.objects = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // 1 second
        this.touchStart = null;
        this.resize();
        this.setupEventListeners();
        this.gameLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touchStart) return;

            const touch = e.touches[0];
            this.checkSlice(
                this.touchStart.x,
                this.touchStart.y,
                touch.clientX,
                touch.clientY
            );
        });

        this.canvas.addEventListener('touchend', () => {
            this.touchStart = null;
        });
    }

    spawnObject() {
        const now = Date.now();
        if (now - this.lastSpawnTime < this.spawnInterval) return;
        
        this.lastSpawnTime = now;
        const type = Math.random() > 0.5 ? 'flying' : 'tossed';
        let x, y;

        if (type === 'flying') {
            x = Math.random() > 0.5 ? -50 : this.canvas.width + 50;
            y = Math.random() * this.canvas.height;
        } else {
            x = Math.random() * this.canvas.width;
            y = this.canvas.height + 50;
        }

        this.objects.push(new GameObject(x, y, type));
    }

    checkSlice(startX, startY, endX, endY) {
        const objects = this.objects.filter(obj => !obj.sliced);
        
        objects.forEach(obj => {
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Check if swipe intersects with object
            if (this.lineIntersectsRect(
                startX, startY,
                endX, endY,
                obj.x - obj.width/2,
                obj.y - obj.height/2,
                obj.width,
                obj.height
            )) {
                obj.sliced = true;
                obj.createSliceParticles();
                this.score += 10;
                document.getElementById('scoreValue').textContent = this.score;
            }
        });
    }

    lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        const left = rx;
        const right = rx + rw;
        const top = ry;
        const bottom = ry + rh;

        // Check if line intersects with any of the rectangle's edges
        return this.lineIntersectsLine(x1, y1, x2, y2, left, top, right, top) ||
               this.lineIntersectsLine(x1, y1, x2, y2, right, top, right, bottom) ||
               this.lineIntersectsLine(x1, y1, x2, y2, right, bottom, left, bottom) ||
               this.lineIntersectsLine(x1, y1, x2, y2, left, bottom, left, top);
    }

    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denominator === 0) return false;

        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    update() {
        this.spawnObject();
        
        this.objects = this.objects.filter(obj => {
            obj.update();
            return !obj.sliced && 
                   obj.x > -100 && 
                   obj.x < this.canvas.width + 100 && 
                   obj.y > -100 && 
                   obj.y < this.canvas.height + 100;
        });
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.objects.forEach(obj => obj.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 