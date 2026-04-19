import Board from './Board.js';
import LevelManager from './LevelManager.js';

export default class Game {
    constructor() {
        this.gridElement = document.getElementById('grid');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.gameOverMsg = document.getElementById('game-over-message');
        this.restartBtns = [document.getElementById('restart-btn'), document.getElementById('retry-btn')];
        this.levelSelect = document.getElementById('level-select');
        
        this.board = null;
        this.isGameOver = false;
        this.winDisplayed = false;

        this.levelManager = new LevelManager(this.levelSelect, () => {
            this.init(); // Restart game when level changes
        });

        this.init();
        this.setupInput();
    }

    init() {
        const size = this.levelManager.getCurrentSize();
        // Change CSS variable to adapt UI
        document.documentElement.style.setProperty('--grid-row-cells', size);

        this.board = new Board(this.gridElement, this.tileContainer, size);
        this.isGameOver = false;
        this.winDisplayed = false;
        this.scoreSaved = false;
        this.updateScore();
        this.gameOverMsg.classList.add('hidden');
        this.gameOverMsg.querySelector('p').textContent = "Fin de partie !"; // Reset text
        this.gameOverMsg.querySelector('p').style.color = "#776e65";
        
        // Add two initial tiles
        this.board.addRandomTile();
        this.board.addRandomTile();

        this.restartBtns.forEach(btn => {
            btn.onclick = () => this.init();
        });
    }

    updateScore() {
        this.scoreElement.textContent = this.board.score;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    moved = this.board.move(0, -1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    moved = this.board.move(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    moved = this.board.move(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    moved = this.board.move(1, 0);
                    e.preventDefault();
                    break;
            }

            if (moved) {
                this.updateScore();
                // Adding a small delay helps animations before a tile is spawned
                setTimeout(() => {
                    if (this.board.hasWon && !this.winDisplayed) {
                        this.isGameOver = true;
                        this.winDisplayed = true;
                        this.gameOverMsg.querySelector('p').textContent = "Victoire !";
                        this.gameOverMsg.querySelector('p').style.color = "#ff914d";
                        this.gameOverMsg.classList.remove('hidden');
                        this.saveScore();
                        return; // Stop here so we don't spawn a tile or show loss
                    }

                    this.board.addRandomTile();
                    if (!this.board.hasMovesLeft()) {
                        this.isGameOver = true;
                        this.gameOverMsg.querySelector('p').textContent = "Fin de partie !";
                        this.gameOverMsg.querySelector('p').style.color = "#776e65";
                        this.gameOverMsg.classList.remove('hidden');
                        this.saveScore();
                    }
                }, 100);
            }
        });
    }

    async saveScore() {
        if (this.scoreSaved) return;
        this.scoreSaved = true;

        const username = localStorage.getItem('username');
        if (!username) {
            console.log("Joueur non connecté, score non sauvegardé.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/scores/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Le navigateur enverra automatiquement le Cookie sécurisé !
                body: JSON.stringify({
                    game: '2048',
                    points: this.board.score
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log("Score sauvegardé avec succès !");
            } else {
                console.error("Erreur de sauvegarde :", data.error);
            }
        } catch (error) {
            console.error("Erreur serveur lors de la sauvegarde du score.", error);
        }
    }
}
