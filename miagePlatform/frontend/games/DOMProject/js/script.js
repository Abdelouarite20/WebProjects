import Game from './Game.js';

// The entry point for the game
window.addEventListener('DOMContentLoaded', () => {
    console.log("Starting 2048 Game...");
    
    // UI Platform binding
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        document.getElementById('platform-banner').classList.remove('hidden');
        document.getElementById('player-name-display').textContent = username;
    }
    
    document.getElementById('btn-lobby').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    new Game();
});
