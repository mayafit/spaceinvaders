class Game {
    constructor(shipType) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.shipType = shipType;

        // Ship characteristics
        const shipStats = {
            ship1: { speed: 5, width: 40, height: 40 },
            ship2: { speed: 7, width: 35, height: 40 },
            ship3: { speed: 4, width: 45, height: 40 }
        };

        // Game objects
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: shipStats[shipType].width,
            height: shipStats[shipType].height,
            speed: shipStats[shipType].speed
        };

        this.bullets = [];
        this.aliens = [];
        this.alienDirection = 1;
        this.alienStepDown = 30;
        this.alienMoveInterval = 1000;
        this.lastAlienMove = 0;

        // Load images
        this.playerImg = new Image();
        this.playerImg.src = `/static/svg/${shipType}.svg`;

        this.alienImgs = {
            normal: (() => {
                const img = new Image();
                img.src = '/static/svg/alien.svg';
                return img;
            })(),
            fast: (() => {
                const img = new Image();
                img.src = '/static/svg/alien_fast.svg';
                return img;
            })(),
            boss: (() => {
                const img = new Image();
                img.src = '/static/svg/alien_boss.svg';
                return img;
            })()
        };

        // Setup sound
        this.synth = new Tone.Synth().toDestination();
        this.soundEnabled = window.soundEnabled;

        // Controls
        this.keys = {
            left: false,
            right: false,
            space: false
        };

        this.setupEventListeners();
        this.createAliens();
    }

    playSound(note, duration) {
        if (this.soundEnabled) {
            this.synth.triggerAttackRelease(note, duration);
        }
    }

    shoot() {
        if (this.gameOver) return;

        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 3,
            height: 15
        });

        // Play shoot sound
        this.playSound('C4', '0.1');
    }

    moveAliens() {
        let touchedEdge = false;

        this.aliens.forEach(alien => {
            alien.x += 30 * this.alienDirection * alien.speed;

            if (alien.x <= 0 || alien.x + alien.width >= this.canvas.width) {
                touchedEdge = true;
            }
        });

        if (touchedEdge) {
            this.alienDirection *= -1;
            this.aliens.forEach(alien => {
                alien.y += this.alienStepDown;

                if (alien.y + alien.height >= this.player.y) {
                    this.endGame();
                }
            });
        }
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.aliens.forEach((alien, alienIndex) => {
                if (this.checkCollision(bullet, alien)) {
                    this.bullets.splice(bulletIndex, 1);

                    alien.health--;
                    if (alien.health <= 0) {
                        this.aliens.splice(alienIndex, 1);
                        this.score += alien.type === 'boss' ? 500 :
                                    alien.type === 'fast' ? 200 : 100;
                        document.getElementById('score').textContent = this.score;

                        // Play explosion sound
                        this.playSound('G2', '0.1');
                    }
                }
            });
        });

        // Check if level is complete
        if (this.aliens.length === 0) {
            if (this.level < 5) {
                this.level++;
                document.getElementById('level').textContent = this.level;
                this.createAliens();
            } else {
                this.endGame(true);
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (this.gameOver) return;

        // Move player
        if (this.keys.left && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.right && this.player.x + this.player.width < this.canvas.width) {
            this.player.x += this.player.speed;
        }

        // Move bullets
        this.bullets.forEach((bullet, index) => {
            bullet.y -= 7;
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });

        // Move aliens periodically
        const currentTime = Date.now();
        if (currentTime - this.lastAlienMove > this.alienMoveInterval) {
            this.moveAliens();
            this.lastAlienMove = currentTime;
        }

        this.checkCollisions();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.drawImage(this.playerImg, this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw bullets
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw aliens
        this.aliens.forEach(alien => {
            const img = this.alienImgs[alien.type];
            this.ctx.drawImage(img, alien.x, alien.y, alien.width, alien.height);
        });
    }

    endGame(won = false) {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('d-none');
        document.getElementById('gameCanvas').classList.add('d-none');

        const message = won ? 'Congratulations! You completed all levels!' : 'Game Over';
        document.getElementById('gameOverMessage').textContent = message;

        loadHighScores();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.keys.space = true;
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === ' ') this.keys.space = false;
        });
    }

    createAliens() {
        this.aliens = [];
        const levelConfig = {
            1: { rows: 3, cols: 8, types: ['normal'], speed: 1 },
            2: { rows: 4, cols: 8, types: ['normal', 'fast'], speed: 1.2 },
            3: { rows: 4, cols: 9, types: ['normal', 'fast'], speed: 1.4, boss: true },
            4: { rows: 5, cols: 9, types: ['normal', 'fast'], speed: 1.6, boss: true },
            5: { rows: 5, cols: 10, types: ['fast'], speed: 1.8, boss: true }
        };

        const config = levelConfig[this.level] || levelConfig[5];
        this.alienMoveInterval = 1000 / config.speed;

        // Create regular aliens
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const type = config.types[Math.floor(Math.random() * config.types.length)];
                this.aliens.push({
                    x: col * 50 + 50,
                    y: row * 50 + 50,
                    width: type === 'fast' ? 30 : 30,
                    height: type === 'fast' ? 20 : 30,
                    type: type,
                    health: type === 'fast' ? 1 : 1,
                    speed: type === 'fast' ? 2 : 1
                });
            }
        }

        // Add boss if configured for this level
        if (config.boss) {
            this.aliens.push({
                x: this.canvas.width / 2 - 25,
                y: 20,
                width: 50,
                height: 50,
                type: 'boss',
                health: 5,
                speed: 0.5
            });
        }
    }
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

let selectedShip = null;

function selectShip(shipType) {
    // Remove selection from all ships
    document.querySelectorAll('.ship-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selection to clicked ship
    const selectedOption = document.querySelector(`.ship-option[onclick="selectShip('${shipType}')"]`);
    selectedOption.classList.add('selected');

    selectedShip = shipType;
    startGame();
}

function showShipSelection() {
    document.getElementById('shipSelection').classList.remove('d-none');
    document.getElementById('gameOver').classList.add('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1'; //Added to initialize level display
}

function startGame() {
    if (!selectedShip) return;

    document.getElementById('shipSelection').classList.add('d-none');
    document.getElementById('gameOver').classList.add('d-none');
    document.getElementById('gameCanvas').classList.remove('d-none');
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1'; //Added to initialize level display

    window.game = new Game(selectedShip);
    window.game.gameLoop();
}

async function loadHighScores() {
    try {
        const response = await fetch('/api/scores');
        const scores = await response.json();
        const highScoresList = document.getElementById('highScores');
        highScoresList.innerHTML = scores
            .map(score => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${score.player_name}</span>
                    <span class="badge bg-primary rounded-pill">${score.score}</span>
                </li>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading high scores:', error);
    }
}

async function saveScore() {
    const playerName = document.getElementById('playerName').value || 'Anonymous';
    const score = window.game.score;

    try {
        await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player_name: playerName, score: score })
        });
        await loadHighScores();
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// Add sound toggle functionality
window.soundEnabled = true;

function toggleSound() {
    window.soundEnabled = !window.soundEnabled;
    const soundButton = document.getElementById('soundToggle');
    if (window.soundEnabled) {
        soundButton.innerHTML = '🔊 Sound On';
        soundButton.classList.remove('btn-outline-secondary');
        soundButton.classList.add('btn-secondary');
    } else {
        soundButton.innerHTML = '🔈 Sound Off';
        soundButton.classList.remove('btn-secondary');
        soundButton.classList.add('btn-outline-secondary');
    }
    if (window.game) {
        window.game.soundEnabled = window.soundEnabled;
    }
}

window.addEventListener('load', () => {
    loadHighScores();
    showShipSelection();
});