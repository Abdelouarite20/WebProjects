import NumberTile from './NumberTile.js';

export default class Board {
    constructor(gridElement, tileContainer, size = 4) {
        this.gridElement = gridElement;
        this.tileContainer = tileContainer;
        this.size = size;
        this.cells = [];
        this.score = 0;
        this.hasWon = false;
        
        // Initialize background grid and cells array
        this.initGrid();
    }

    initGrid() {
        this.gridElement.innerHTML = '';
        this.tileContainer.innerHTML = '';
        this.cells = [];
        for (let y = 0; y < this.size; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.cells[y][x] = null;
                const bgCell = document.createElement('div');
                bgCell.classList.add('grid-cell');
                this.gridElement.appendChild(bgCell);
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.cells[y][x]) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const tile = new NumberTile(randomCell.x, randomCell.y);
            this.cells[randomCell.y][randomCell.x] = tile;
            this.tileContainer.appendChild(tile.element);
        }
    }

    // Move tiles in a specific direction: dx, dy can be -1, 0, 1
    move(dx, dy) {
        let moved = false;
        const mergedThisTurn = [];
        
        for (let y = 0; y < this.size; y++) {
            mergedThisTurn[y] = [];
            for (let x = 0; x < this.size; x++) {
                mergedThisTurn[y][x] = false;
            }
        }

        // Define traversal order based on direction
        const xStart = dx === 1 ? this.size - 1 : 0;
        const xEnd = dx === 1 ? -1 : this.size;
        const xStep = dx === 1 ? -1 : 1;

        const yStart = dy === 1 ? this.size - 1 : 0;
        const yEnd = dy === 1 ? -1 : this.size;
        const yStep = dy === 1 ? -1 : 1;

        for (let y = yStart; y !== yEnd; y += yStep) {
            for (let x = xStart; x !== xEnd; x += xStep) {
                const tile = this.cells[y][x];
                if (!tile) continue;

                let nextX = x + dx;
                let nextY = y + dy;
                let currentX = x;
                let currentY = y;

                // Move until hitting a boundary or another tile
                while (nextX >= 0 && nextX < this.size && nextY >= 0 && nextY < this.size) {
                    const nextTile = this.cells[nextY][nextX];
                    
                    if (!nextTile) {
                        // Empty space, continue moving
                        this.cells[nextY][nextX] = tile;
                        this.cells[currentY][currentX] = null;
                        tile.setPosition(nextX, nextY);
                        currentX = nextX;
                        currentY = nextY;
                        nextX += dx;
                        nextY += dy;
                        moved = true;
                    } else if (nextTile.value === tile.value && !mergedThisTurn[nextY][nextX]) {
                        // Merge!
                        const newValue = tile.value * 2;
                        this.score += newValue;
                        
                        if (newValue === 2048) {
                            this.hasWon = true;
                        }

                        nextTile.setValue(newValue);
                        this.cells[currentY][currentX] = null;
                        
                        // Just visually move and remove old tile
                        tile.setPosition(nextX, nextY);
                        setTimeout(() => tile.remove(), 100);
                        
                        mergedThisTurn[nextY][nextX] = true;
                        moved = true;
                        break;
                    } else {
                        // Different tile, stop moving
                        break;
                    }
                }
            }
        }
        
        return moved;
    }

    hasMovesLeft() {
        // Any empty cells?
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.cells[y][x]) return true;
                
                // Any possible merge? check right and down matching values
                const currentVal = this.cells[y][x].value;
                if (x < this.size - 1 && this.cells[y][x+1] && this.cells[y][x+1].value === currentVal) return true;
                if (y < this.size - 1 && this.cells[y+1][x] && this.cells[y+1][x].value === currentVal) return true;
            }
        }
        return false;
    }
}
