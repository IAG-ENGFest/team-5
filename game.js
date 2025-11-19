// ============================================
// PLANE DODGER - BOARDING PASS EDITION
// Complete Game Engine
// ============================================

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas to square (responsive)
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game states
        this.state = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        
        // Game objects
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);
        this.planes = [];
        this.collectibles = [];
        this.particles = [];
        this.projectiles = [];
        
        // Difficulty parameters
        this.spawnRate = 0.015;
        this.maxPlaneSpeed = 3;
        this.basePlaneSpeed = 1.5;
        
        // Active power-ups
        this.activePowerUps = {};
        
        // Input handling
        this.keys = {};
        this.setupInputListeners();
        
        // UI Elements
        this.setupUIListeners();
        
        // Game loop
        this.gameRunning = false;
        this.lastTime = Date.now();
        this.gameLoop();
    }
    
    resizeCanvas() {
        // Make canvas square and responsive
        const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
        this.canvas.width = maxSize;
        this.canvas.height = maxSize;
    }
    
    setupInputListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            if (x < this.canvas.width / 2) {
                this.keys['arrowleft'] = true;
            } else {
                this.keys['arrowright'] = true;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.keys['arrowleft'] = false;
            this.keys['arrowright'] = false;
        });
    }
    
    setupUIListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        this.spawnRate = 0.015;
        this.maxPlaneSpeed = 3;
        this.basePlaneSpeed = 1.5;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);
        this.planes = [];
        this.collectibles = [];
        this.particles = [];
        this.projectiles = [];
        this.activePowerUps = {};
        this.gameRunning = true;
        
        document.getElementById('menuScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');
        
        this.updateUI();
    }
    
    gameLoop() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        if (this.state === 'playing') {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update difficulty
        this.updateDifficulty();
        
        // Add score for survival (1 point per 0.5 seconds)
        this.score += Math.floor(deltaTime * 2);
        
        // Update player
        this.player.update(this.keys, this.canvas, this.activePowerUps);
        
        // Spawn planes
        if (Math.random() < this.spawnRate) {
            this.spawnPlane();
        }
        
        // Update planes
        for (let i = this.planes.length - 1; i >= 0; i--) {
            const plane = this.planes[i];
            const planeSpeed = this.basePlaneSpeed * (this.activePowerUps['slowmo'] ? 0.5 : 1) * (this.activePowerUps['speedup'] ? 1.5 : 1);
            plane.update(planeSpeed);
            
            // Check collision with player
            if (this.checkCollision(this.player, plane)) {
                if (this.activePowerUps['ghost']) {
                    // Ghost mode: just pass through, no collision
                    // Visual feedback optional
                } else {
                    this.lives--;
                    this.createExplosion(this.player.x, this.player.y, '#ff0000');
                    this.playSound('crash');
                    this.player.reset(this.canvas);
                    
                    if (this.lives <= 0) {
                        this.endGame();
                    }
                }
            }
            
            // Remove plane if off-screen
            if (plane.y > this.canvas.height) {
                this.planes.splice(i, 1);
            }
        }
        
        // Update projectiles and check for plane collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update();
            
            let hit = false;
            
            // Check collision with planes
            for (let j = this.planes.length - 1; j >= 0; j--) {
                if (this.checkCollision(projectile, this.planes[j])) {
                    this.createExplosion(this.planes[j].x, this.planes[j].y, '#ffaa00');
                    this.planes.splice(j, 1);
                    this.score += 50;
                    this.playSound('collect');
                    hit = true;
                    break;
                }
            }
            
            // Remove projectile if off-screen or hit
            if (hit || projectile.y < 0) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Handle gun power-up (auto-fire projectiles)
        if (this.activePowerUps['gun'] && this.activePowerUps['gun'] > 0) {
            // Fire projectile every 0.2 seconds
            if (!this.gunFireTimer) this.gunFireTimer = 0;
            this.gunFireTimer += deltaTime;
            
            if (this.gunFireTimer >= 0.2) {
                const projectile = new Projectile(this.player.x + this.player.width / 2, this.player.y, -8);
                this.projectiles.push(projectile);
                this.gunFireTimer = 0;
            }
        } else {
            this.gunFireTimer = 0;
        }
        
        // Spawn collectibles randomly
        if (Math.random() < 0.005) {
            this.spawnCollectible();
        }
        
        // Update collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.update();
            
            // Check collision with player
            if (this.checkCollision(this.player, item)) {
                this.collectItem(item);
                this.collectibles.splice(i, 1);
            } else if (item.y > this.canvas.height) {
                this.collectibles.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update power-ups (duration tracking)
        for (let key in this.activePowerUps) {
            this.activePowerUps[key] -= deltaTime;
            if (this.activePowerUps[key] <= 0) {
                delete this.activePowerUps[key];
            }
        }
        
        this.updateUI();
    }
    
    updateDifficulty() {
        // Increase difficulty every 30 seconds
        this.level = Math.floor(this.gameTime / 30) + 1;
        this.spawnRate = Math.min(0.015 + (this.level - 1) * 0.003, 0.05);
        this.basePlaneSpeed = 1.5 + (this.level - 1) * 0.3;
        this.maxPlaneSpeed = 3 + (this.level - 1) * 0.5;
    }
    
    spawnPlane() {
        const x = Math.random() * (this.canvas.width - 60);
        const planeSize = 60 + Math.random() * 20;
        const speed = this.basePlaneSpeed + Math.random() * (this.maxPlaneSpeed - this.basePlaneSpeed);
        const plane = new Plane(x, -planeSize, planeSize, speed);
        this.planes.push(plane);
    }
    
    spawnCollectible() {
        const x = Math.random() * (this.canvas.width - 30);
        const types = ['boardingpass', 'fuel', 'speedboost', 'ghost', 'slowmo', 'sizeup', 'speedup', 'gun'];
        const type = types[Math.floor(Math.random() * types.length)];
        const item = new Collectible(x, -30, type);
        this.collectibles.push(item);
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectItem(item) {
        this.createExplosion(item.x, item.y, '#ffff00');
        
        switch (item.type) {
            case 'boardingpass':
                this.score += 100;
                this.playSound('collect');
                break;
            case 'fuel':
                this.lives = Math.min(this.lives + 1, 5);
                this.playSound('collect');
                break;
            case 'speedboost':
                this.activePowerUps['speedboost'] = 5;
                this.playSound('powerup');
                break;
            case 'ghost':
                this.activePowerUps['ghost'] = 5;
                this.playSound('powerup');
                break;
            case 'slowmo':
                this.activePowerUps['slowmo'] = 5;
                this.playSound('powerup');
                break;
            case 'sizeup':
                this.activePowerUps['sizeup'] = 5;
                this.playSound('powerup');
                break;
            case 'speedup':
                this.activePowerUps['speedup'] = 5;
                this.playSound('powerup');
                break;
            case 'gun':
                this.activePowerUps['gun'] = 5;
                this.playSound('powerup');
                this.gunFireTimer = 0;
                break;
        }
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const particle = new Particle(x, y, angle, color);
            this.particles.push(particle);
        }
    }
    
    playSound(type) {
        // Using Web Audio API for simple sound synthesis
        const audioContext = window.audioContext || (window.audioContext = new (window.AudioContext || window.webkitAudioContext)());
        const now = audioContext.currentTime;
        
        switch (type) {
            case 'collect':
                this.beep(800, 0.1, now);
                this.beep(1000, 0.1, now + 0.1);
                break;
            case 'crash':
                this.beep(200, 0.2, now);
                this.beep(150, 0.2, now + 0.1);
                break;
            case 'powerup':
                this.beep(600, 0.1, now);
                this.beep(800, 0.1, now + 0.1);
                this.beep(1000, 0.1, now + 0.2);
                break;
            case 'shield':
                this.beep(1200, 0.15, now);
                break;
        }
    }
    
    beep(frequency, duration, startTime) {
        const audioContext = window.audioContext;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    endGame() {
        this.state = 'gameOver';
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('gameOverScreen').classList.add('active');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('time').textContent = Math.floor(this.gameTime) + 's';
        
        // Update power-up display
        const display = document.getElementById('powerUpDisplay');
        display.innerHTML = '';
        
        for (let key in this.activePowerUps) {
            if (this.activePowerUps[key] > 0) {
                const remaining = Math.ceil(this.activePowerUps[key]);
                let emoji = '⚡';
                let label = key.toUpperCase();
                
                if (key === 'ghost') emoji = '👻';
                else if (key === 'slowmo') emoji = '🐌';
                else if (key === 'speedup') emoji = '🚀';
                else if (key === 'sizeup') emoji = '📦';
                else if (key === 'speedboost') emoji = '⚡';
                else if (key === 'gun') emoji = '🔫';
                
                const badge = document.createElement('div');
                badge.className = `powerup-badge ${key}`;
                badge.textContent = `${emoji} ${remaining}s`;
                display.appendChild(badge);
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid pattern (optional, for visual interest)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // Draw planes
        for (let plane of this.planes) {
            plane.render(this.ctx);
        }
        
        // Draw collectibles
        for (let item of this.collectibles) {
            item.render(this.ctx);
        }
        
        // Draw projectiles
        for (let projectile of this.projectiles) {
            projectile.render(this.ctx);
        }
        
        // Draw player
        this.player.render(this.ctx, this.activePowerUps);
        
        // Draw particles
        for (let particle of this.particles) {
            particle.render(this.ctx);
        }
    }
}

// ============================================
// PLAYER CLASS
// ============================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.baseSpeed = 5;
    }
    
    update(keys, canvas, activePowerUps) {
        // Determine movement speed
        this.speed = this.baseSpeed * (activePowerUps['speedboost'] ? 2 : 1);
        
        // Handle input
        if (keys['arrowleft'] || keys['a']) {
            this.x -= this.speed;
        }
        if (keys['arrowright'] || keys['d']) {
            this.x += this.speed;
        }
        
        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
    
    reset(canvas) {
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 60;
    }
    
    render(ctx, activePowerUps) {
        const size = activePowerUps['sizeup'] ? this.width * 1.5 : this.width;
        const offsetX = activePowerUps['sizeup'] ? this.width * 0.25 : 0;
        
        // Ghost mode effect
        if (activePowerUps['ghost']) {
            ctx.globalAlpha = 0.6;
        }
        
        // Player body
        ctx.fillStyle = activePowerUps['ghost'] ? '#b0e0e6' : '#00ff00';
        ctx.fillRect(this.x - offsetX, this.y - (size - this.height) / 2, size, size);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - offsetX + size * 0.2, this.y - (size - this.height) / 2 + size * 0.2, size * 0.15, size * 0.15);
        ctx.fillRect(this.x - offsetX + size * 0.65, this.y - (size - this.height) / 2 + size * 0.2, size * 0.15, size * 0.15);
        
        // Ghost glow effect
        if (activePowerUps['ghost']) {
            ctx.strokeStyle = 'rgba(176, 224, 230, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x - offsetX + size / 2, this.y - (size - this.height) / 2 + size / 2, size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// ============================================
// PLANE CLASS
// ============================================

class Plane {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size * 0.6;
        this.speed = speed;
    }
    
    update(speed) {
        this.y += speed;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Main fuselage (body) - vertical
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.15, this.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit (front of plane - pointing down)
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(0, this.height * 0.35, this.width * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings (left and right)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-this.width * 0.5, -this.height * 0.15, this.width, this.height * 0.3);
        
        // Wing tips
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(-this.width * 0.5, 0, this.height * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.width * 0.5, 0, this.height * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail wing (vertical stabilizer) - at the back (top)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-this.width * 0.1, -this.height * 0.5, this.width * 0.2, this.height * 0.2);
        
        // Horizontal stabilizer (tail)
        ctx.fillRect(-this.width * 0.3, -this.height * 0.65, this.width * 0.6, this.height * 0.15);
        
        // Windows/Portholes
        ctx.fillStyle = '#ffff00';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(i * this.width * 0.08, this.height * 0.1, this.width * 0.04, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Landing gear indicator (small rectangles at bottom front)
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width * 0.08, this.height * 0.3, this.width * 0.16, this.height * 0.15);
        
        ctx.restore();
    }
}

// ============================================
// COLLECTIBLE CLASS
// ============================================

class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.speed = 2;
        this.rotation = 0;
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.1;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        switch (this.type) {
            case 'boardingpass':
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.fillStyle = '#fff';
                ctx.fillRect(-this.width / 2 + 3, -this.height / 2 + 3, this.width - 6, this.height - 6);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🎫', 0, 5);
                break;
                
            case 'fuel':
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, 0);
                ctx.lineTo(0, -this.height / 2);
                ctx.lineTo(this.width / 2, 0);
                ctx.lineTo(0, this.height / 2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'speedboost':
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚡', 0, 5);
                break;
                
            case 'shield':
                ctx.fillStyle = '#00d4ff';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🛡️', 0, 5);
                break;
                
            case 'ghost':
                ctx.fillStyle = '#b0e0e6';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#6495ed';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('👻', 0, 5);
                break;
                
            case 'slowmo':
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🐌', 0, 5);
                break;
                
            case 'sizeup':
                ctx.fillStyle = '#add8e6';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('📦', 0, 5);
                break;
                
            case 'speedup':
                ctx.fillStyle = '#e94560';
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, 0);
                ctx.lineTo(this.width / 2, -this.height / 2);
                ctx.lineTo(this.width / 2, this.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🚀', 0, 5);
                break;
                
            case 'gun':
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🔫', 0, 5);
                break;
        }
        
        ctx.restore();
    }
}

// ============================================
// PARTICLE CLASS
// ============================================

class Particle {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * 5;
        this.vy = Math.sin(angle) * 5;
        this.life = 0.5;
        this.maxLife = 0.5;
        this.color = color;
        this.size = 4;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.life -= 0.016;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// PROJECTILE CLASS
// ============================================

class Projectile {
    constructor(x, y, velocityY) {
        this.x = x;
        this.y = y;
        this.velocityY = velocityY;
        this.width = 8;
        this.height = 16;
    }
    
    update() {
        this.y += this.velocityY;
    }
    
    render(ctx) {
        // Draw projectile as a small bullet
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width / 2 + 1, this.y - this.height / 2 + 1, 2, this.height - 2);
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});
