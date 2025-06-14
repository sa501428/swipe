class GameObject {
    constructor(x, y, type, speedMultiplier) {
        this.x = x;
        this.y = y;
        this.type = type; // 'flying' or 'tossed'
        this.width = 40;
        this.height = 40;
        this.baseSpeed = 3; // Reduced from 5 to 3
        this.speedMultiplier = speedMultiplier;
        this.speed = this.baseSpeed * this.speedMultiplier;
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
        this.particles = [];
        this.breakProgress = 0; // 0 to 1 for breaking animation
        this.breakDirection = Math.random() > 0.5 ? 1 : -1;
        
        // Random color generation
        const hue = Math.random() * 360;
        this.color = `hsl(${hue}, 70%, 60%)`;
        this.slicedColor = `hsl(${hue}, 70%, 40%)`; // Darker version for sliced state
        
        if (type === 'tossed') {
            this.velocityY = -12 * this.speedMultiplier; // Reduced from -15
            this.velocityX = (Math.random() - 0.5) * 6 * this.speedMultiplier; // Reduced from 8
            this.gravity = 0.4 * this.speedMultiplier; // Reduced from 0.5
        } else {
            this.velocityX = Math.random() > 0.5 ? this.speed : -this.speed;
            this.velocityY = 0;
        }
    }

    update() {
        if (this.sliced) {
            this.breakProgress += 0.1; // Speed of breaking animation
            this.angle += this.breakDirection * 0.2; // Rotation during break
            this.y += 2; // Fall down while breaking
        } else {
            if (this.type === 'tossed') {
                this.velocityY += this.gravity;
                this.y += this.velocityY;
                this.x += this.velocityX;
            } else {
                this.x += this.velocityX;
            }
            this.angle += this.rotationSpeed;
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.update();
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.sliced) {
            // Draw breaking animation
            ctx.rotate(this.angle);
            const breakOffset = this.breakProgress * 30 * this.breakDirection;
            
            // Draw two halves of the object
            ctx.fillStyle = this.slicedColor;
            ctx.beginPath();
            ctx.moveTo(-this.width/2, -this.height/2);
            ctx.lineTo(this.width/2, -this.height/2);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.lineTo(-this.width/2, this.height/2);
            ctx.closePath();
            ctx.fill();
            
            // Draw break line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.width/2 + breakOffset, -this.height/2);
            ctx.lineTo(this.width/2 + breakOffset, this.height/2);
            ctx.stroke();
        } else {
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        
        ctx.restore();

        // Draw particles
        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
    }

    createSliceParticles() {
        // Create more particles for a more dramatic effect
        for (let i = 0; i < 20; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 8 + 2;
            this.particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.color // Use the object's color for particles
            ));
        }
    }
}

class Particle {
    constructor(x, y, vx, vy, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1;
        this.size = Math.random() * 4 + 2; // Varied particle sizes
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Add gravity to particles
        this.life -= 0.02;
        this.rotation += this.rotationSpeed;
        this.size *= 0.98; // Particles shrink over time
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color.replace(')', `, ${this.life})`).replace('rgb', 'rgba');
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

class SlashEffect {
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.life = 1;
        this.width = 8;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create particles along the slash line
        const numParticles = Math.floor(length / 10);
        for (let i = 0; i < numParticles; i++) {
            const t = i / numParticles;
            const x = this.startX + dx * t;
            const y = this.startY + dy * t;
            
            // Add some randomness to particle positions
            const offset = (Math.random() - 0.5) * 10;
            const perpX = Math.cos(angle + Math.PI/2) * offset;
            const perpY = Math.sin(angle + Math.PI/2) * offset;
            
            this.particles.push({
                x: x + perpX,
                y: y + perpY,
                size: Math.random() * 4 + 2,
                life: 1,
                speed: Math.random() * 2 + 1,
                angle: angle + (Math.random() - 0.5) * Math.PI/4
            });
        }
    }

    update() {
        this.life -= 0.05;
        this.particles.forEach(p => {
            p.life -= 0.05;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        // Draw the main slash line
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life * 0.8})`;
        ctx.lineWidth = this.width * this.life;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.objects = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500;
        this.touchStart = null;
        this.gameStartTime = Date.now();
        this.speedMultiplier = 1;
        this.lastDifficultyIncrease = Date.now();
        this.difficultyIncreaseInterval = 60000;
        this.slashEffects = []; // Add array for slash effects
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
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            // Create slash effect for every swipe
            this.slashEffects.push(new SlashEffect(
                this.touchStart.x,
                this.touchStart.y,
                endX,
                endY
            ));

            this.checkSlice(
                this.touchStart.x,
                this.touchStart.y,
                endX,
                endY
            );

            // Update touch start for continuous swipes
            this.touchStart = { x: endX, y: endY };
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

        this.objects.push(new GameObject(x, y, type, this.speedMultiplier));
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
        // Update difficulty
        const currentTime = Date.now();
        if (currentTime - this.lastDifficultyIncrease >= this.difficultyIncreaseInterval) {
            this.speedMultiplier += 0.2;
            this.lastDifficultyIncrease = currentTime;
            this.spawnInterval = Math.max(500, this.spawnInterval - 100);
        }

        this.spawnObject();
        
        // Update objects
        this.objects = this.objects.filter(obj => {
            obj.update();
            return !obj.sliced && 
                   obj.x > -100 && 
                   obj.x < this.canvas.width + 100 && 
                   obj.y > -100 && 
                   obj.y < this.canvas.height + 100;
        });

        // Update slash effects
        this.slashEffects = this.slashEffects.filter(effect => {
            effect.update();
            return effect.life > 0;
        });
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw objects
        this.objects.forEach(obj => obj.draw(this.ctx));
        
        // Draw slash effects
        this.slashEffects.forEach(effect => effect.draw(this.ctx));
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