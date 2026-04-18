/**
 * Base Tile class representing coordinates on the grid.
 */
export default class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = document.createElement('div');
        this.element.classList.add('tile');
        this.updatePosition();
    }

    // Update internal coordinates and DOM representation
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.setProperty('--x', this.x);
        this.element.style.setProperty('--y', this.y);
    }
    
    // Remove element from DOM
    remove() {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
