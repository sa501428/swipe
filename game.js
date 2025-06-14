// Constants
const TWO_PI = Math.PI * 2;

// Particle Pool implementation
class ParticlePool {
    constructor(size) {
        this.pool = Array.from({ length: size }, () => new Particle());
        this.next = 0;
    }

    get(x, y, vx, vy, color) {
        const p = this.pool[this.next];
        p.reset(x, y, vx, vy, color);
        this.next = (this.next + 1) % this.pool.length;
        return p;
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
        this.type = type; // 'flying' or 'tossed' or 'orbital'
        this.size = size; // 1 is normal size, 0.5 is half size, etc.
        this.width = 40 * this.size;
        this.height = 40 * this.size;
        this.baseSpeed = 3; // Reduced from 5 to 3
        this.speedMultiplier = speedMultiplier;
        this.speed = this.baseSpeed * this.speedMultiplier;
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
        this.particles = [];
        this.breakProgress = 0; // 0 to 1 for breaking animation
        this.breakDirection = Math.random() > 0.5 ? 1 : -1;
        this.pieces = []; // Array to hold smaller pieces
        
        // Randomly select a fruit type
        this.fruitType = Math.floor(Math.random() * 15); // 15 different fruits
        
        // Gravitational properties
        this.centerX = centerX;
        this.centerY = centerY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.2 * this.speedMultiplier;
        
        // Fruit-specific colors
        this.colors = FruitColors[this.getFruitTypeName()];
        
        // Pre-calculate fruit-specific data
        this.fruitData = this.initializeFruitData();
        
        // Initialize velocity based on position relative to center
        const dx = this.x - this.centerX;
        const dy = this.y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Set initial velocity perpendicular to radius for orbital motion
        const orbitalSpeed = (Math.random() * 2 + 3) * this.speedMultiplier;
        this.velocityX = Math.cos(angle + Math.PI/2) * orbitalSpeed;
        this.velocityY = Math.sin(angle + Math.PI/2) * orbitalSpeed;
        
        this.sliceCount = 0;
        this.maxSlices = 2; // Changed to 2 since we only want one split
        this.fadeProgress = 0; // New property for fade effect
        this.isFading = false; // New property to track if object is fading
        this.isOffscreen = false;
        this.isDead = false;
    }

    initializeFruitData() {
        return GameObject.fruitDataCache[this.fruitType] || null;
    }

    breakIntoPieces() {
        if (this.size <= 0.25 || this.sliceCount >= this.maxSlices) {
            this.isFading = true; // Start fading instead of creating more pieces
            return [];
        }
        const pieces = [];
        const newSize = this.size * 0.7; // Slightly larger pieces
        const spread = 8; // Increased spread for more dramatic split

        // Create only 2 pieces
        for (let i = 0; i < 2; i++) {
            const piece = new GameObject(
                this.x,
                this.y,
                this.type,
                this.speedMultiplier,
                this.centerX,
                this.centerY,
                newSize
            );
            piece.fruitType = this.fruitType;
            piece.sliceCount = this.sliceCount + 1;
            const angle = (i * Math.PI) + (Math.random() - 0.5) * 0.5; // Pieces go in opposite directions
            piece.velocityX = this.velocityX + Math.cos(angle) * spread;
            piece.velocityY = this.velocityY + Math.sin(angle) * spread;
            pieces.push(piece);
        }
        return pieces;
    }

    update() {
        if (this.isDead) return;

        // Quick offscreen check
        const margin = 100;
        this.isOffscreen = (
            this.x < -margin ||
            this.x > this.centerX * 2 + margin ||
            this.y < -margin ||
            this.y > this.centerY * 2 + margin
        );

        if (this.isOffscreen) {
            this.isDead = true;
            return;
        }

        if (this.isFading) {
            this.fadeProgress += 0.05;
            if (this.fadeProgress >= 1) {
                this.fadeProgress = 1;
                this.isDead = true;
                return;
            }
        } else if (this.sliced) {
            this.breakProgress += 0.1;
            this.angle += this.breakDirection * 0.2;
            this.y += 2;
        } else {
            const dx = this.centerX - this.x;
            const dy = this.centerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = this.gravity / (distance * 0.1);
            this.velocityX += (dx / distance) * force;
            this.velocityY += (dy / distance) * force;
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= 0.99;
            this.velocityY *= 0.99;
            this.angle += this.rotationSpeed;
        }

        // Update particles and remove dead ones
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (this.isDead || this.fadeProgress >= 1 || this.isOffscreen) return;

        // Batch transformations
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.isFading) {
            ctx.globalAlpha = 1 - this.fadeProgress;
        }

        if (this.sliced) {
            ctx.rotate(this.angle);
            const breakOffset = this.breakProgress * 30 * this.breakDirection;
            
            // Draw first half
            ctx.translate(breakOffset, 0);
            this.drawFruit(ctx, this.width, this.height);
            
            // Draw second half
            ctx.translate(-breakOffset * 2, 0);
            this.drawFruit(ctx, this.width, this.height);
            
            // Draw break line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.width/2 + breakOffset, -this.height/2);
            ctx.lineTo(this.width/2 + breakOffset, this.height/2);
            ctx.stroke();
        } else {
            ctx.rotate(this.angle);
            this.drawFruit(ctx, this.width, this.height);
        }
        ctx.restore();

        // Batch particle drawing by color
        if (this.particles.length > 0) {
            const particlesByColor = new Map();
            
            // Group particles by color
            for (const particle of this.particles) {
                if (!particlesByColor.has(particle.color)) {
                    particlesByColor.set(particle.color, []);
                }
                particlesByColor.get(particle.color).push(particle);
            }
            
            // Draw particles in batches by color
            ctx.save();
            for (const [color, particles] of particlesByColor) {
                ctx.fillStyle = color;
                for (const particle of particles) {
                    ctx.globalAlpha = particle.life;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, 2, 0, TWO_PI);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    }

    drawFruit(ctx, width, height) {
        const fruitType = this.getFruitTypeName();
        switch(this.fruitType) {
            case FruitType.APPLE:
                this.drawApple(ctx, width, height);
                break;
            case FruitType.BANANA:
                this.drawBanana(ctx, width, height);
                break;
            case FruitType.ORANGE:
                this.drawOrange(ctx, width, height);
                break;
            case FruitType.GRAPE:
                this.drawGrape(ctx, width, height);
                break;
            case FruitType.PINEAPPLE:
                this.drawPineapple(ctx, width, height);
                break;
            case FruitType.STARFRUIT:
                this.drawStarfruit(ctx, width, height);
                break;
            case FruitType.DRAGONFRUIT:
                this.drawDragonfruit(ctx, width, height);
                break;
            case FruitType.WATERMELON:
                this.drawWatermelon(ctx, width, height);
                break;
            case FruitType.POMEGRANATE:
                this.drawPomegranate(ctx, width, height);
                break;
            case FruitType.PASSIONFRUIT:
                this.drawPassionfruit(ctx, width, height);
                break;
            case FruitType.LYCHEE:
                this.drawLychee(ctx, width, height);
                break;
            case FruitType.PAPAYA:
                this.drawPapaya(ctx, width, height);
                break;
            case FruitType.MANGOSTEEN:
                this.drawMangosteen(ctx, width, height);
                break;
            case FruitType.KIWI:
                this.drawKiwi(ctx, width, height);
                break;
            case FruitType.PERSIMMON:
                this.drawPersimmon(ctx, width, height);
                break;
        }
    }

    drawApple(ctx, width, height) {
        const { main, stem, leaf } = this.colors;
        
        // Draw apple body
        ctx.fillStyle = main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw stem
        ctx.fillStyle = stem;
        ctx.fillRect(-2, -height/2, 4, 8);
        
        // Draw leaf
        ctx.fillStyle = leaf;
        ctx.beginPath();
        ctx.ellipse(4, -height/2 + 4, 6, 3, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBanana(ctx, width, height) {
        const { main, stem, leaf, tip } = this.colors;
        
        // Draw banana body
        ctx.fillStyle = main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, TWO_PI);
        ctx.fill();
        
        // Draw stem
        ctx.fillStyle = stem;
        ctx.fillRect(-2, -height/2, 4, 8);
        
        // Draw tip
        if (tip) {
            ctx.fillStyle = tip;
            ctx.beginPath();
            ctx.arc(width/2 - 5, 0, 5, 0, TWO_PI);
            ctx.fill();
        }
    }

    drawOrange(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.orange.main + '80' : this.colors.orange.main;
        ctx.beginPath();
        ctx.arc(0, 0, width/2, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#fff9a5';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, width/2.2, i * Math.PI/3, (i+0.5)*Math.PI/3);
            ctx.stroke();
        }
        ctx.strokeStyle = this.colors.orange.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2-8);
        ctx.stroke();
        ctx.fillStyle = this.colors.orange.leaf;
        ctx.beginPath();
        ctx.ellipse(-width/7, -height/2.1, 7, 3, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    drawGrape(ctx, width, height) {
        ctx.save();
        const grapes = this.fruitData.coords;
        grapes.forEach(([gx, gy]) => {
            ctx.fillStyle = this.sliced ? this.colors.grape.main + '80' : this.colors.grape.main;
            ctx.beginPath();
            ctx.arc(gx, gy, width/6, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.strokeStyle = this.colors.grape.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2-10);
        ctx.stroke();
        ctx.restore();
    }

    drawPineapple(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.pineapple.main + '80' : this.colors.pineapple.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2.3, height/2, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = this.colors.pineapple.leaf;
        ctx.lineWidth = 1.5;
        for (let i = -width/2.3; i < width/2.3; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -height/2);
            ctx.lineTo(i, height/2);
            ctx.stroke();
        }
        for (let j = -height/2; j < height/2; j += 8) {
            ctx.beginPath();
            ctx.moveTo(-width/2.3, j);
            ctx.lineTo(width/2.3, j);
            ctx.stroke();
        }
        // Leaves
        ctx.save();
        ctx.translate(0, -height/2);
        ctx.fillStyle = this.colors.pineapple.leaf;
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i-2.5)*Math.PI/8);
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(0,-17-Math.random()*6);
            ctx.lineTo(7,0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
        ctx.restore();
    }

    drawStarfruit(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.starfruit.main + '80' : this.colors.starfruit.main;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI/2;
            const x = Math.cos(angle) * width/2;
            const y = Math.sin(angle) * height/2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.colors.starfruit.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 10);
        ctx.stroke();
        ctx.restore();
    }

    drawDragonfruit(ctx, width, height) {
        const { main, stem, leaf, dots } = this.colors;
        
        // Draw dragonfruit body
        ctx.fillStyle = main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, TWO_PI);
        ctx.fill();
        
        // Draw dots
        if (dots) {
            ctx.fillStyle = dots;
            this.fruitData.dots.forEach(({angle, radius}) => {
                ctx.beginPath();
                ctx.arc(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    2,
                    0,
                    TWO_PI
                );
                ctx.fill();
            });
        }
    }

    drawWatermelon(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.colors.watermelon.stem;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = this.sliced ? this.colors.watermelon.main + '80' : this.colors.watermelon.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2-5, height/2-5, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = this.colors.watermelon.leaf;
        this.fruitData.seeds.forEach(({angle, dist}) => {
            ctx.beginPath();
            ctx.ellipse(Math.cos(angle)*dist, Math.sin(angle)*dist, 2, 4, angle, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawPomegranate(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.pomegranate.main + '80' : this.colors.pomegranate.main;
        ctx.beginPath();
        ctx.arc(0, 0, width/2, 0, Math.PI*2);
        ctx.fill();
        // "Crown"
        ctx.fillStyle = this.colors.pomegranate.stem;
        ctx.save();
        ctx.translate(0, -height/2+2);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.sin(i*1.257)*7, -Math.cos(i*1.257)*6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.restore();
    }

    drawPassionfruit(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.passionfruit.main + '80' : this.colors.passionfruit.main;
        ctx.beginPath();
        ctx.arc(0, 0, width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = this.colors.passionfruit.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 8);
        ctx.stroke();
        ctx.restore();
    }

    drawLychee(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.lychee.main + '80' : this.colors.lychee.main;
        ctx.beginPath();
        ctx.arc(0, 0, width/2, 0, Math.PI*2);
        ctx.fill();
        // Spiky skin
        ctx.strokeStyle = this.colors.lychee.leaf;
        for (let i = 0; i < 18; i++) {
            const a = i*Math.PI*2/18;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a)*(width/2-2), Math.sin(a)*(height/2-2));
            ctx.lineTo(Math.cos(a)*(width/2+2), Math.sin(a)*(height/2+2));
            ctx.stroke();
        }
        ctx.strokeStyle = this.colors.lychee.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 8);
        ctx.stroke();
        ctx.restore();
    }

    drawPapaya(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.papaya.main + '80' : this.colors.papaya.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = this.colors.papaya.leaf;
        this.fruitData.seeds.forEach(({angle, radius}) => {
            ctx.beginPath();
            ctx.arc(Math.cos(angle)*radius, Math.sin(angle)*radius, 1.4, 0, Math.PI*2);
            ctx.fill();
        });

        ctx.strokeStyle = this.colors.papaya.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 10);
        ctx.stroke();
        ctx.restore();
    }

    drawMangosteen(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.mangosteen.main + '80' : this.colors.mangosteen.main;
        ctx.beginPath();
        ctx.arc(0, 0, width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = this.colors.mangosteen.leaf;
        ctx.beginPath();
        ctx.arc(0, -height/2 + 7, width/4, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = this.colors.mangosteen.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2 + 2);
        ctx.lineTo(0, -height/2 - 6);
        ctx.stroke();
        ctx.restore();
    }

    drawKiwi(ctx, width, height) {
        const { main, stem, leaf, seeds } = this.colors;
        
        // Draw kiwi body
        ctx.fillStyle = main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, TWO_PI);
        ctx.fill();
        
        // Draw seeds
        if (seeds) {
            ctx.fillStyle = seeds;
            this.fruitData.seeds.forEach(({angle, radius}) => {
                ctx.beginPath();
                ctx.arc(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    1,
                    0,
                    TWO_PI
                );
                ctx.fill();
            });
        }
    }

    drawPersimmon(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.persimmon.main + '80' : this.colors.persimmon.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2.4, 0, 0, Math.PI*2);
        ctx.fill();
        // Cap
        ctx.fillStyle = this.colors.persimmon.leaf;
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate(i*Math.PI/2);
            ctx.beginPath();
            ctx.ellipse(0, -height/2.5, 8, 3, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
        ctx.strokeStyle = this.colors.persimmon.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2.3);
        ctx.lineTo(0, -height/2.3 - 7);
        ctx.stroke();
        ctx.restore();
    }

    createSliceParticles() {
        if (!Game.particlePool) {
            console.warn('Particle pool not initialized');
            return;
        }

        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * TWO_PI);
            const speed = Math.random() * 8 + 2;
            const particle = Game.particlePool.get(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.colors.main
            );
            this.particles.push(particle);
        }
    }

    getFruitTypeName() {
        return Object.keys(FruitType).find(key => FruitType[key] === this.fruitType).toLowerCase();
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
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= 0.02;
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
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        this.soundManager = new SoundManager();
        
        // Start game loop
        this.setupEventListeners();
        this.gameLoop();
        
        // Performance monitoring
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
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
        
        const type = Math.floor(Math.random() * 3);
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

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    setupEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => {
            this.touchStart = {
                x: e.touches[0].clientX - this.canvas.offsetLeft,
                y: e.touches[0].clientY - this.canvas.offsetTop
            };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.touchStart) return;
            
            const currentX = e.touches[0].clientX - this.canvas.offsetLeft;
            const currentY = e.touches[0].clientY - this.canvas.offsetTop;
            
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.touchStart.x, this.touchStart.y);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
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
        const sliceAngle = Math.atan2(y - this.centerY, x - this.centerX);
        let sliceFound = false;

        // Play swish sound for slice motion
        this.soundManager.playSwish();

        for (const obj of this.objects) {
            if (obj.sliced) continue;

            const dx = obj.x - this.centerX;
            const dy = obj.y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const angleDiff = Math.abs(angle - sliceAngle);

            if (distance < 100 && angleDiff < Math.PI / 4) {
                obj.sliced = true;
                sliceFound = true;
                
                // Play squish sound for fruit hit
                this.soundManager.playSquish();

                // Create slice particles using pool
                const particleCount = 10;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.random() * Math.PI * 2);
                    const speed = Math.random() * 8 + 2;
                    const particle = this.particlePool.get(
                        obj.x,
                        obj.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        obj.colors.main
                    );
                    obj.particles.push(particle);
                }

                const pieces = obj.breakIntoPieces();
                this.objects.push(...pieces);
            }
        }

        return sliceFound;
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