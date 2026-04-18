export default class LevelManager {
    constructor(selectElement, onChangeCallback) {
        this.selectElement = selectElement;
        
        // Define level configurations based on grid sizes
        this.levels = {
            'hard': { size: 3 },
            'classic': { size: 4 },
            'easy': { size: 5 },
            'very-easy': { size: 6 }
        };

        // Initialize based on the current DOM value (solves cache/refresh desync)
        const initialKey = this.selectElement ? this.selectElement.value : 'classic';
        this.currentLevel = this.levels[initialKey] || this.levels['classic'];

        // If UI changes the select
        if (this.selectElement) {
            this.selectElement.addEventListener('change', (e) => {
                const levelKey = e.target.value;
                if (this.levels[levelKey]) {
                    this.currentLevel = this.levels[levelKey];
                    onChangeCallback(this.currentLevel);
                }
            });
        }
    }

    getCurrentSize() {
        return this.currentLevel.size;
    }
}
