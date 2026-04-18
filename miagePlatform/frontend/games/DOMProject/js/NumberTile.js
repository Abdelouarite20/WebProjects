import Tile from './Tile.js';

/**
 * Derived class NumberTile which extends Tile.
 * Adds the 'value' logic for 2048 (2, 4, 8, etc.) and handles visual updates.
 */
export default class NumberTile extends Tile {
    constructor(x, y, value) {
        super(x, y);
        this.value = value || (Math.random() < 0.9 ? 2 : 4);
        this.updateValue();
    }

    // Set a new value (when merging) and update DOM
    setValue(v) {
        this.value = v;
        this.updateValue();
    }

    updateValue() {
        this.element.textContent = this.value;
        this.element.setAttribute('data-value', this.value);
    }
}
