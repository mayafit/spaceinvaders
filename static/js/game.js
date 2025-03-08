class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameOver = false;

        // Game objects
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 40,
            speed: 5
        };

        this.bullets = [];
        this.aliens = [];
        this.alienDirection = 1;
        this.alienStepDown = 30;
        this.alienMoveInterval = 1000;
        this.lastAlienMove = 0;

        // Load images
        this.playerImg = new Image();
        this.playerImg.src = '/static/svg/player.svg';

        this.alienImg = new Image();
        this.alienImg.src = '/static/svg/alien.svg';

        // Setup sound
        this.synth = new Tone.Synth().toDestination();

        // Controls
        this.keys = {
            left: false,
            right: false,
            space: false
        };

        this.setupEventListeners();
        this.createAliens();
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
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.aliens.push({
                    x: col * 50 + 50,
                    y: row * 50 + 50,
                    width: 30,
                    height: 30
                });
            }
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
        this.synth.triggerAttackRelease('C4', '0.1');
    }

    moveAliens() {
        let touchedEdge = false;

        this.aliens.forEach(alien => {
            alien.x += 30 * this.alienDirection;

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
                    this.aliens.splice(alienIndex, 1);
                    this.score += 100;
                    document.getElementById('score').textContent = this.score;

                    // Play explosion sound
                    this.synth.triggerAttackRelease('G2', '0.1');
                }
            });
        });
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

        if (this.aliens.length === 0) {
            this.endGame(true);
        }
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
            this.ctx.drawImage(this.alienImg, alien.x, alien.y, alien.width, alien.height);
        });
    }

    endGame(won = false) {
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('d-none');
        loadHighScores(); // Load high scores when game ends
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

function startGame() {
    document.getElementById('gameOver').classList.add('d-none');
    document.getElementById('score').textContent = '0';
    window.game = new Game();
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

window.addEventListener('load', loadHighScores);
window.addEventListener('load', startGame);