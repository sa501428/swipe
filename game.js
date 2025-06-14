// Constants
const TWO_PI = Math.PI * 2;

// Particle Pool implementation
class ParticlePool {
    constructor(size) {
        this.pool = new Array(size);
        this.next = 0;
        this.activeParticles = 0;
        
        // Pre-create particles
        for (let i = 0; i < size; i++) {
            this.pool[i] = new Particle();
        }
    }

    get(x, y, vx, vy, color) {
        const particle = this.pool[this.next];
        if (particle) {
            particle.reset(x, y, vx, vy, color);
            this.next = (this.next + 1) % this.pool.length;
            this.activeParticles++;
        }
        return particle;
    }

    release(particle) {
        const index = this.pool.indexOf(particle);
        if (index !== -1) {
            this.pool[index] = this.pool[this.next];
            this.pool[this.next] = particle;
            this.next = (this.next + 1) % this.pool.length;
            this.activeParticles--;
        }
    }

    reset() {
        this.next = 0;
        this.activeParticles = 0;
        // Reset all particles in the pool
        for (const particle of this.pool) {
            if (particle) {
                particle.isDead = true;
            }
        }
    }
}

// Fruit type enum
const FruitType = {
    APPLE: 0,
    BANANA: 1,
    ORANGE: 2,
    GRAPE: 3,
    PINEAPPLE: 4,
    STARFRUIT: 5,
    DRAGONFRUIT: 6,
    WATERMELON: 7,
    POMEGRANATE: 8,
    PASSIONFRUIT: 9,
    LYCHEE: 10,
    PAPAYA: 11,
    MANGOSTEEN: 12,
    KIWI: 13,
    PERSIMMON: 14
};

// Global color palette
const FruitColors = {
    apple: {
        main: '#ff0000',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    banana: {
        main: '#ffff00',
        stem: '#4a2810',
        leaf: '#00ff00',
        tip: '#ffa500'
    },
    orange: {
        main: '#ffa500',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    grape: {
        main: '#800080',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    pineapple: {
        main: '#ffff00',
        stem: '#4a2810',
        leaf: '#00ff00',
        skin: '#a9743a'
    },
    starfruit: {
        main: '#ffff00',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    dragonfruit: {
        main: '#ff0000',
        stem: '#4a2810',
        leaf: '#00ff00',
        dots: '#000000'
    },
    watermelon: {
        main: '#ff0000',
        stem: '#4a2810',
        leaf: '#00ff00',
        rind: '#188835',
        seeds: '#222222'
    },
    pomegranate: {
        main: '#ff0000',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    passionfruit: {
        main: '#800080',
        stem: '#4a2810',
        leaf: '#00ff00'
    },
    lychee: {
        main: '#ff0000',
        stem: '#4a2810',
        leaf: '#00ff00',
        skin: '#f8a4a4'
    },
    papaya: {
        main: '#ffa500',
        stem: '#4a2810',
        leaf: '#00ff00',
        seeds: '#262200'
    },
    mangosteen: {
        main: '#800080',
        stem: '#4a2810',
        leaf: '#00ff00',
        cap: '#94fa7c'
    },
    kiwi: {
        main: '#90ee90',
        stem: '#4a2810',
        leaf: '#00ff00',
        seeds: '#222222'
    },
    persimmon: {
        main: '#ffa500',
        stem: '#4a2810',
        leaf: '#00ff00',
        cap: '#a1ce58'
    }
};

class GameObject {
    // Static cache for fruit-specific data
    static fruitDataCache = {
        [FruitType.GRAPE]: {
            coords: [[-7,7],[0,0],[7,7],[-4,-4],[4,-4]]
        },
        [FruitType.WATERMELON]: {
            seeds: Array.from({length: 7}, () => ({
                angle: Math.random() * Math.PI*2,
                dist: Math.random() * 10
            }))
        },
        [FruitType.DRAGONFRUIT]: {
            dots: Array.from({length: 12}, () => ({
                angle: Math.random() * Math.PI*2,
                radius: Math.random() * 20
            }))
        },
        [FruitType.PAPAYA]: {
            seeds: Array.from({length: 9}, () => ({
                angle: Math.PI/2 + (Math.random()-0.5),
                radius: 7 + Math.random()*5
            }))
        },
        [FruitType.KIWI]: {
            seeds: Array.from({length: 18}, (_, i) => ({
                angle: i * Math.PI*2/18,
                radius: 10
            }))
        }
    };

    constructor(x, y, type, speedMultiplier, centerX, centerY, size = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speedMultiplier = speedMultiplier;
        this.centerX = centerX;
        this.centerY = centerY;
        this.size = size;
        this.angle = Math.atan2(y - centerY, x - centerX);
        this.distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        this.speed = 2 * speedMultiplier;
        this.sliced = false;
        this.fadeOut = 0;
        this.particles = [];
        this.isDead = false;
        this.colors = FruitColors[this.getFruitTypeName()];
        this.fruitData = this.getFruitData();
    }

    getFruitTypeName() {
        const fruitTypes = ['apple', 'banana', 'orange', 'grape', 'pineapple', 
                           'starfruit', 'dragonfruit', 'watermelon', 'pomegranate', 
                           'passionfruit', 'lychee', 'papaya', 'mangosteen', 
                           'kiwi', 'persimmon'];
        return fruitTypes[this.type % fruitTypes.length];
    }

    getFruitData() {
        return GameObject.fruitDataCache[this.type] || null;
    }

    update() {
        if (this.isDead) return;

        if (this.sliced) {
            this.fadeOut += 0.05;
            if (this.fadeOut >= 1) {
                this.isDead = true;
                return;
            }
        }

        // Update position
        this.angle += 0.02 * this.speedMultiplier;
        this.distance -= this.speed;
        
        this.x = this.centerX + Math.cos(this.angle) * this.distance;
        this.y = this.centerY + Math.sin(this.angle) * this.distance;

        // Check if object is off screen
        if (this.distance < -100) {
            this.isDead = true;
            return;
        }

        // Update particles and remove dead ones
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.isDead) {
                if (Game.particlePool) {
                    Game.particlePool.release(particle);
                }
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.size, this.size);

        // Apply fade out effect
        if (this.sliced) {
            ctx.globalAlpha = 1 - this.fadeOut;
        }

        const width = 40;
        const height = 40;

        // Draw the fruit
        this.drawFruit(ctx, width, height);

        // Draw particles
        for (const particle of this.particles) {
            particle.draw(ctx);
        }

        ctx.restore();
    }

    drawFruit(ctx, width, height) {
        const fruitType = this.getFruitTypeName();
        switch(fruitType) {
            case 'apple':
                this.drawApple(ctx, width, height);
                break;
            case 'banana':
                this.drawBanana(ctx, width, height);
                break;
            case 'orange':
                this.drawOrange(ctx, width, height);
                break;
            case 'grape':
                this.drawGrape(ctx, width, height);
                break;
            case 'pineapple':
                this.drawPineapple(ctx, width, height);
                break;
            case 'starfruit':
                this.drawStarfruit(ctx, width, height);
                break;
            case 'dragonfruit':
                this.drawDragonfruit(ctx, width, height);
                break;
            case 'watermelon':
                this.drawWatermelon(ctx, width, height);
                break;
            case 'pomegranate':
                this.drawPomegranate(ctx, width, height);
                break;
            case 'passionfruit':
                this.drawPassionfruit(ctx, width, height);
                break;
            case 'lychee':
                this.drawLychee(ctx, width, height);
                break;
            case 'papaya':
                this.drawPapaya(ctx, width, height);
                break;
            case 'mangosteen':
                this.drawMangosteen(ctx, width, height);
                break;
            case 'kiwi':
                this.drawKiwi(ctx, width, height);
                break;
            case 'persimmon':
                this.drawPersimmon(ctx, width, height);
                break;
            default:
                // Fallback to a simple circle
                ctx.fillStyle = this.colors.main || '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, width/2, 0, TWO_PI);
                ctx.fill();
        }
    }

    createSliceParticles() {
        if (!Game.particlePool) return;
        
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * TWO_PI;
            const speed = Math.random() * 4 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            const particle = Game.particlePool.get(
                this.x,
                this.y,
                vx,
                vy,
                this.colors.main
            );
            if (particle) {
                this.particles.push(particle);
            }
        }
    }
}

class Particle {
    constructor() {
        this.reset(0, 0, 0, 0, '#ffffff');
    }

    reset(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = 1;
        this.isDead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= 0.02;
        this.isDead = (this.life <= 0);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class SlashEffect {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.life = 1;
        this.particles = [];
        
        // Create particles using pool
        if (Game.particlePool) {
            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const spread = (Math.random() - 0.5) * Math.PI / 4;
                const speed = Math.random() * 5 + 3;
                const particle = Game.particlePool.get(
                    this.x,
                    this.y,
                    Math.cos(this.angle + spread) * speed,
                    Math.sin(this.angle + spread) * speed,
                    '#ffffff'
                );
                this.particles.push(particle);
            }
        }
    }

    update() {
        this.life -= 0.05;
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Draw particles
        if (this.particles.length > 0) {
            ctx.save();
            for (const particle of this.particles) {
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 2, 0, TWO_PI);
                ctx.fill();
            }
            ctx.restore();
        }
        
        ctx.restore();
    }
}

class SoundManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.audioContext.suspend();
        
        // Precompute buffers
        this.swishBuffer = this.createSwishSound();
        this.squishBuffer = this.createSquishSound();
        
        // Precompute reverb buffers
        this.swishReverb = this.createReverbBuffer(0.3, 0.1);
        this.squishReverb = this.createReverbBuffer(0.2, 0.05);
    }

    createReverbBuffer(duration, decay) {
        const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioContext.sampleRate * decay));
            }
        }
        return buffer;
    }

    createSwishSound() {
        const duration = 0.2;
        const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.length;
                const freq = 2000 - (1500 * t);
                data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-3 * t);
            }
        }
        return buffer;
    }

    createSquishSound() {
        const duration = 0.15;
        const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.length;
                const noise = Math.random() * 2 - 1;
                const freq = 800 + Math.sin(t * Math.PI * 4) * 400;
                data[i] = (noise * 0.3 + Math.sin(2 * Math.PI * freq * t) * 0.7) * Math.exp(-5 * t);
            }
        }
        return buffer;
    }

    playSwish() {
        this.resume();
        const source = this.audioContext.createBufferSource();
        source.buffer = this.swishBuffer;
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 0.5;
        
        const reverb = this.audioContext.createConvolver();
        reverb.buffer = this.swishReverb;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.3;
        
        source.connect(panner)
            .connect(reverb)
            .connect(gain)
            .connect(this.audioContext.destination);
        
        source.start();
    }

    playSquish() {
        this.resume();
        const source = this.audioContext.createBufferSource();
        source.buffer = this.squishBuffer;
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 0.3;
        
        const reverb = this.audioContext.createConvolver();
        reverb.buffer = this.squishReverb;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.4;
        
        source.connect(panner)
            .connect(reverb)
            .connect(gain)
            .connect(this.audioContext.destination);
        
        source.start();
    }

    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game state
        this.objects = [];
        this.slashEffects = [];
        this.touchStart = null;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.lastCenterMove = Date.now();
        this.centerMoveInterval = 5000;
        this.speedMultiplier = 1;
        this.lastSpeedIncrease = Date.now();
        this.speedIncreaseInterval = 60000;
        this.score = 0;
        this.scoreElement = document.getElementById('scoreValue');
        this.backgroundColors = [
            '#ffb6c1', // Light pink
            '#ffc0cb', // Pink
            '#ff69b4', // Hot pink
            '#ff1493', // Deep pink
            '#db7093', // Pale violet red
            '#ff69b4', // Hot pink
            '#ffb6c1', // Light pink
            '#ffc0cb'  // Pink
        ];
        this.currentBackgroundIndex = 0;
        this.lastBackgroundChange = Date.now();
        this.backgroundChangeInterval = 60000;

        // Initialize systems
        this.particlePool = new ParticlePool(1000);
        Game.particlePool = this.particlePool;
        
        // Initialize audio context on user interaction
        this.audioContext = null;
        this.soundManager = null;
        
        // Performance monitoring
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.lastCleanup = 0;
        this.cleanupInterval = 1000;
        
        // Start game loop
        this.setupEventListeners();
        this.gameLoop();
    }

    initializeAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundManager = new SoundManager(this.audioContext);
        }
    }

    updateScore(points = 10) {
        this.score += points;
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    draw() {
        // Clear canvas with current background color
        this.ctx.fillStyle = this.backgroundColors[this.currentBackgroundIndex];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center point
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 5, 0, TWO_PI);
        this.ctx.fill();

        // Draw all objects
        for (const obj of this.objects) {
            obj.draw(this.ctx);
        }

        // Draw slash effects
        for (const effect of this.slashEffects) {
            effect.draw(this.ctx);
        }

        // Draw FPS counter
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }

    spawnObject() {
        const angle = Math.random() * TWO_PI;
        const distance = 300;
        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;
        
        const type = Math.floor(Math.random() * 15); // 15 different fruits
        const size = Math.random() * 0.5 + 0.75;
        
        this.objects.push(new GameObject(
            x,
            y,
            type,
            this.speedMultiplier,
            this.centerX,
            this.centerY,
            size
        ));
    }

    update() {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }

        // Periodic cleanup
        if (currentTime - this.lastCleanup >= this.cleanupInterval) {
            this.cleanup();
            this.lastCleanup = currentTime;
        }

        // Spawn new objects
        if (Math.random() < 0.02) {
            this.spawnObject();
        }

        // Update center point periodically
        const currentTime2 = Date.now();
        if (currentTime2 - this.lastCenterMove >= this.centerMoveInterval) {
            this.updateCenterPoint();
            this.lastCenterMove = currentTime2;
        }

        // Increase speed over time
        if (currentTime2 - this.lastSpeedIncrease >= this.speedIncreaseInterval) {
            this.speedMultiplier += 0.2;
            this.lastSpeedIncrease = currentTime2;
            
            // Change background color
            this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundColors.length;
        }

        // Update objects and remove dead ones
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            obj.update();
            if (obj.isDead) {
                // Return particles to pool
                for (const particle of obj.particles) {
                    if (Game.particlePool) {
                        Game.particlePool.release(particle);
                    }
                }
                obj.particles.length = 0;
                this.objects.splice(i, 1);
            }
        }

        // Update slash effects
        this.slashEffects = this.slashEffects.filter(effect => {
            effect.update();
            return effect.life > 0;
        });
    }

    cleanup() {
        // Clean up dead objects
        this.objects = this.objects.filter(obj => !obj.isDead);
        
        // Clean up expired slash effects
        this.slashEffects = this.slashEffects.filter(effect => effect.life > 0);
        
        // Reset particle pool if it's getting too full
        if (this.particlePool && this.particlePool.activeParticles > 800) {
            this.particlePool.reset();
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    setupEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => {
            this.initializeAudio();
            this.touchStart = {
                x: e.touches[0].clientX - this.canvas.offsetLeft,
                y: e.touches[0].clientY - this.canvas.offsetTop
            };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.touchStart) return;
            
            const currentX = e.touches[0].clientX - this.canvas.offsetLeft;
            const currentY = e.touches[0].clientY - this.canvas.offsetTop;
            
            // Add slash effect instead of drawing directly
            const angle = Math.atan2(currentY - this.touchStart.y, currentX - this.touchStart.x);
            this.slashEffects.push(new SlashEffect(this.touchStart.x, this.touchStart.y, angle));
            
            this.checkSlice(currentX, currentY);
            this.touchStart = { x: currentX, y: currentY };
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.touchStart) return;
            
            const endX = e.changedTouches[0].clientX - this.canvas.offsetLeft;
            const endY = e.changedTouches[0].clientY - this.canvas.offsetTop;
            
            const angle = Math.atan2(endY - this.touchStart.y, endX - this.touchStart.x);
            this.slashEffects.push(new SlashEffect(this.touchStart.x, this.touchStart.y, angle));
            
            this.checkSlice(endX, endY);
            this.touchStart = null;
        });
    }

    checkSlice(x, y) {
        for (const obj of this.objects) {
            if (obj.sliced) continue;
            
            const dx = obj.x - x;
            const dy = obj.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30 * obj.size) {
                obj.sliced = true;
                obj.createSliceParticles();
                if (this.soundManager) {
                    this.soundManager.playSquish();
                }
                this.updateScore();
                break;
            }
        }
    }

    updateCenterPoint() {
        // Calculate the middle 25% of the screen
        const marginX = this.canvas.width * 0.375; // (100% - 25%) / 2
        const marginY = this.canvas.height * 0.375;
        
        this.centerX = marginX + Math.random() * (this.canvas.width - 2 * marginX);
        this.centerY = marginY + Math.random() * (this.canvas.height - 2 * marginY);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 