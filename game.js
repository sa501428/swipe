class GameObject {
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
        this.colors = {
            apple: { main: '#ff2d2d', stem: '#5a350c', leaf: '#2ecc40' },
            banana: { main: '#ffe135', stem: '#866c09', tip: '#d6b70a' },
            orange: { main: '#ff9500', stem: '#ad6407', leaf: '#aeea00' },
            grape: { main: '#6a1b9a', stem: '#68401a' },
            pineapple: { main: '#ffdd55', stem: '#238b22', skin: '#a9743a', leaves: '#238b22' },
            starfruit: { main: '#ffe659', stem: '#af8508' },
            dragonfruit: { main: '#fc46aa', scales: '#57eb64', dots: '#000000' },
            watermelon: { main: '#fc4c4e', rind: '#188835', seeds: '#222' },
            pomegranate: { main: '#d9032e', stem: '#683214' },
            passionfruit: { main: '#85266d', stem: '#745329' },
            lychee: { main: '#e04947', stem: '#7f3523', skin: '#f8a4a4' },
            papaya: { main: '#ffb23d', stem: '#8d5413', seeds: '#262200' },
            mangosteen: { main: '#491f7e', stem: '#755217', cap: '#94fa7c' },
            kiwi: { main: '#b0de4c', skin: '#725c27', seeds: '#222' },
            persimmon: { main: '#fd6d1f', stem: '#70510e', cap: '#a1ce58' }
        };
        
        // Initialize velocity based on position relative to center
        const dx = this.x - this.centerX;
        const dy = this.y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Set initial velocity perpendicular to radius for orbital motion
        const orbitalSpeed = (Math.random() * 2 + 3) * this.speedMultiplier;
        this.velocityX = Math.cos(angle + Math.PI/2) * orbitalSpeed;
        this.velocityY = Math.sin(angle + Math.PI/2) * orbitalSpeed;
        
        this.sliceCount = 0; // Track number of times this object has been sliced
        this.maxSlices = 3; // Maximum number of slices before disappearing
    }

    breakIntoPieces() {
        if (this.size <= 0.25 || this.sliceCount >= this.maxSlices) {
            return []; // Return empty array to indicate this piece should be removed
        }
        
        const pieces = [];
        const newSize = this.size * 0.5;
        const spread = 5;
        
        for (let i = 0; i < 4; i++) {
            const piece = new GameObject(
                this.x,
                this.y,
                this.type,
                this.speedMultiplier,
                this.centerX,
                this.centerY,
                newSize
            );
            
            // Maintain the same fruit type as the parent
            piece.fruitType = this.fruitType;
            piece.sliceCount = this.sliceCount + 1;
            
            // Calculate spread angle based on piece index
            const angle = (i * Math.PI / 2) + (Math.random() - 0.5) * 0.5;
            piece.velocityX = this.velocityX + Math.cos(angle) * spread;
            piece.velocityY = this.velocityY + Math.sin(angle) * spread;
            
            pieces.push(piece);
        }
        
        return pieces;
    }

    update() {
        if (this.sliced) {
            this.breakProgress += 0.1; // Speed of breaking animation
            this.angle += this.breakDirection * 0.2; // Rotation during break
            this.y += 2; // Fall down while breaking
        } else {
            // Calculate direction to center
            const dx = this.centerX - this.x;
            const dy = this.centerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply gravitational force
            const force = this.gravity / (distance * 0.1);
            this.velocityX += (dx / distance) * force;
            this.velocityY += (dy / distance) * force;
            
            // Apply velocity
            this.x += this.velocityX;
            this.y += this.velocityY;
            
            // Add some drag to prevent excessive speeds
            this.velocityX *= 0.99;
            this.velocityY *= 0.99;
            
            this.angle += this.rotationSpeed;
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.update();
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    drawFruit(ctx, width, height) {
        switch(this.fruitType) {
            case 0: this.drawApple(ctx, width, height); break;
            case 1: this.drawBanana(ctx, width, height); break;
            case 2: this.drawOrange(ctx, width, height); break;
            case 3: this.drawGrape(ctx, width, height); break;
            case 4: this.drawPineapple(ctx, width, height); break;
            case 5: this.drawStarfruit(ctx, width, height); break;
            case 6: this.drawDragonfruit(ctx, width, height); break;
            case 7: this.drawWatermelon(ctx, width, height); break;
            case 8: this.drawPomegranate(ctx, width, height); break;
            case 9: this.drawPassionfruit(ctx, width, height); break;
            case 10: this.drawLychee(ctx, width, height); break;
            case 11: this.drawPapaya(ctx, width, height); break;
            case 12: this.drawMangosteen(ctx, width, height); break;
            case 13: this.drawKiwi(ctx, width, height); break;
            case 14: this.drawPersimmon(ctx, width, height); break;
        }
    }

    drawApple(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.apple.main + '80' : this.colors.apple.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI*2);
        ctx.bezierCurveTo(width*0.3, height*0.5, -width*0.3, height*0.5, 0, height*0.35);
        ctx.fill();

        ctx.strokeStyle = this.colors.apple.stem;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -height/2.1);
        ctx.bezierCurveTo(5, -height/2.3, 8, -height/2, 0, -height/2 + 10);
        ctx.stroke();

        ctx.fillStyle = this.colors.apple.leaf;
        ctx.save();
        ctx.translate(width/7, -height/2.4);
        ctx.rotate(-Math.PI/8);
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        ctx.restore();
    }

    drawBanana(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.banana.main + '80' : this.colors.banana.main;
        ctx.beginPath();
        ctx.moveTo(-width/2, height/8);
        ctx.bezierCurveTo(
            -width/3, -height/2, width/2, -height/2, width/2, height/8
        );
        ctx.bezierCurveTo(
            width/3, height/1.7, -width/3, height/1.7, -width/2, height/8
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.colors.banana.tip;
        ctx.beginPath();
        ctx.arc(-width/2+2, height/8, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = this.colors.banana.stem;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width/2, height/8);
        ctx.lineTo(width/2+5, height/8-5);
        ctx.stroke();
        ctx.restore();
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
        const grapes = [
            [-7,7],[0,0],[7,7],[-4,-4],[4,-4]
        ];
        grapes.forEach(([gx, gy], i) => {
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

        ctx.strokeStyle = this.colors.pineapple.skin;
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
        ctx.fillStyle = this.colors.pineapple.leaves;
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
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.dragonfruit.main + '80' : this.colors.dragonfruit.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = this.colors.dragonfruit.scales;
        for (let i = 0; i < 6; i++) {
            ctx.save();
            const angle = (i * Math.PI * 2) / 6;
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(width/3, 0, 7, 2, angle, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = this.colors.dragonfruit.dots;
        for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI*2;
            const r = Math.random() * width/2.2;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 1, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawWatermelon(ctx, width, height) {
        ctx.save();
        // Rind
        ctx.fillStyle = this.colors.watermelon.rind;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI*2);
        ctx.fill();
        // Flesh
        ctx.fillStyle = this.sliced ? this.colors.watermelon.main + '80' : this.colors.watermelon.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2-5, height/2-5, 0, 0, Math.PI*2);
        ctx.fill();
        // Seeds
        ctx.fillStyle = this.colors.watermelon.seeds;
        for (let i = 0; i < 7; i++) {
            const angle = Math.random() * Math.PI*2;
            const dist = Math.random() * (width/4);
            ctx.beginPath();
            ctx.ellipse(Math.cos(angle)*dist, Math.sin(angle)*dist, 2, 4, angle, 0, Math.PI*2);
            ctx.fill();
        }
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
        ctx.strokeStyle = this.colors.lychee.skin;
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
        // Seeds
        ctx.fillStyle = this.colors.papaya.seeds;
        for (let i = 0; i < 9; i++) {
            const a = Math.PI/2 + (Math.random()-0.5)*1;
            const r = height/7 + Math.random()*height/10;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 1.4, 0, Math.PI*2);
            ctx.fill();
        }
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
        ctx.fillStyle = this.colors.mangosteen.cap;
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
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.kiwi.main + '80' : this.colors.kiwi.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2.3, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = this.colors.kiwi.skin;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = this.colors.kiwi.seeds;
        for (let i = 0; i < 18; i++) {
            const a = i*Math.PI*2/18;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*(width/4), Math.sin(a)*(height/5), 1, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawPersimmon(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.sliced ? this.colors.persimmon.main + '80' : this.colors.persimmon.main;
        ctx.beginPath();
        ctx.ellipse(0, 0, width/2, height/2.4, 0, 0, Math.PI*2);
        ctx.fill();
        // Cap
        ctx.fillStyle = this.colors.persimmon.cap;
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.sliced) {
            ctx.rotate(this.angle);
            const breakOffset = this.breakProgress * 30 * this.breakDirection;
            ctx.translate(breakOffset, 0);
            this.drawFruit(ctx, this.width, this.height);
            ctx.translate(-breakOffset * 2, 0);
            this.drawFruit(ctx, this.width, this.height);
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
        this.particles.forEach(particle => particle.draw(ctx));
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

class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext.suspend(); // Start suspended until user interaction
    }

    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    createSwishSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                // Create a whooshing sound with frequency sweep
                const freq = 2000 - (t / duration) * 1500; // Sweep from 2000Hz to 500Hz
                const pan = channel === 0 ? -0.5 : 0.5; // Stereo separation
                data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-4 * t) * 0.3;
            }
        }
        
        return buffer;
    }

    createSquishSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                // Create a squishy sound with noise and frequency modulation
                const noise = (Math.random() * 2 - 1) * 0.5;
                const freq = 800 + Math.sin(t * 50) * 200; // Modulated frequency
                const envelope = Math.exp(-8 * t); // Quick decay
                data[i] = (noise + Math.sin(2 * Math.PI * freq * t)) * envelope * 0.4;
            }
        }
        
        return buffer;
    }

    playSwish() {
        this.resume();
        const source = this.audioContext.createBufferSource();
        source.buffer = this.createSwishSound();
        
        // Add stereo panning
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 0.5; // Random pan position
        
        // Add subtle reverb
        const reverb = this.audioContext.createConvolver();
        const reverbBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = reverbBuffer.getChannelData(channel);
            for (let i = 0; i < reverbBuffer.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioContext.sampleRate * 0.1));
            }
        }
        reverb.buffer = reverbBuffer;
        
        // Connect nodes
        source.connect(panner);
        panner.connect(reverb);
        reverb.connect(this.audioContext.destination);
        
        source.start();
    }

    playSquish() {
        this.resume();
        const source = this.audioContext.createBufferSource();
        source.buffer = this.createSquishSound();
        
        // Add stereo panning
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = (Math.random() - 0.5) * 0.3; // Less panning for squish
        
        // Add subtle reverb
        const reverb = this.audioContext.createConvolver();
        const reverbBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = reverbBuffer.getChannelData(channel);
            for (let i = 0; i < reverbBuffer.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioContext.sampleRate * 0.05));
            }
        }
        reverb.buffer = reverbBuffer;
        
        // Connect nodes
        source.connect(panner);
        panner.connect(reverb);
        reverb.connect(this.audioContext.destination);
        
        source.start();
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
        this.slashEffects = [];
        
        // Initialize sound manager
        this.soundManager = new SoundManager();
        
        // Center point properties
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.lastCenterMove = Date.now();
        this.centerMoveInterval = 30000;
        
        this.lastBackgroundChange = Date.now();
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
        this.currentColorIndex = 0;
        
        this.resize();
        this.setupEventListeners();
        this.gameLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Update center point on resize
        this.updateCenterPoint();
    }

    updateCenterPoint() {
        // Calculate the middle 25% of the screen
        const marginX = this.canvas.width * 0.375; // (100% - 25%) / 2
        const marginY = this.canvas.height * 0.375;
        
        this.centerX = marginX + Math.random() * (this.canvas.width - 2 * marginX);
        this.centerY = marginY + Math.random() * (this.canvas.height - 2 * marginY);
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
        
        // Spawn objects from the edges
        let x, y;
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch(side) {
            case 0: // top
                x = Math.random() * this.canvas.width;
                y = -50;
                break;
            case 1: // right
                x = this.canvas.width + 50;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        this.objects.push(new GameObject(x, y, 'orbital', this.speedMultiplier, this.centerX, this.centerY));
    }

    checkSlice(startX, startY, endX, endY) {
        let sliced = false;
        const newObjects = [];
        
        // Play swish sound for the slice motion
        this.soundManager.playSwish();
        
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (!obj.sliced && this.lineIntersectsObject(startX, startY, endX, endY, obj)) {
                obj.sliced = true;
                sliced = true;
                
                // Create particles for slice effect
                for (let j = 0; j < 10; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 2;
                    obj.particles.push({
                        x: obj.x,
                        y: obj.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 1
                    });
                }
                
                // Create smaller pieces
                const pieces = obj.breakIntoPieces();
                if (pieces.length > 0) {
                    newObjects.push(...pieces);
                }
                
                // Play squish sound when fruit is hit
                this.soundManager.playSquish();
            }
        }
        
        // Add new pieces to objects array
        this.objects.push(...newObjects);
        
        return sliced;
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

    lineIntersectsObject(x1, y1, x2, y2, obj) {
        const rx = obj.x - obj.width/2;
        const ry = obj.y - obj.height/2;
        const rw = obj.width;
        const rh = obj.height;
        return this.lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh);
    }

    update() {
        // Update center point periodically
        const currentTime = Date.now();
        if (currentTime - this.lastCenterMove >= this.centerMoveInterval) {
            this.updateCenterPoint();
            this.lastCenterMove = currentTime;
        }

        // Update difficulty
        if (currentTime - this.lastDifficultyIncrease >= this.difficultyIncreaseInterval) {
            this.speedMultiplier += 0.2;
            this.lastDifficultyIncrease = currentTime;
            this.spawnInterval = Math.max(500, this.spawnInterval - 100);
        }

        // Update background color every minute
        if (currentTime - this.lastBackgroundChange >= 60000) { // 60000ms = 1 minute
            this.currentColorIndex = (this.currentColorIndex + 1) % this.backgroundColors.length;
            this.lastBackgroundChange = currentTime;
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
        // Clear canvas with current background color
        this.ctx.fillStyle = this.backgroundColors[this.currentColorIndex];
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