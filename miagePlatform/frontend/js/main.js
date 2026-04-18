document.addEventListener('DOMContentLoaded', () => {
    console.log("Système Arcade prêt !");

    // 1. SÉLECTION DES ÉLÉMENTS
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');
    const logoutBtn = document.getElementById('btn-logout');

    // VÉRIFIER SI L'UTILISATEUR EST DÉJÀ CONNECTÉ AU CHARGEMENT
    checkExistingSession();

    function checkExistingSession() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            console.log("Session trouvée, restauration...");
            goToLobby(username);
        }
    }
    
    // 2. BASCULEMENT DES ONGLETS (Visuel)
    signupToggle.addEventListener('click', () => {
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        clearMessage();
    });

    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        clearMessage();
    });

    // 3. GESTION DE L'INSCRIPTION
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (data.success) {
                displayMessage("Compte créé ! Prépare-toi à jouer.", "success");
                signupForm.reset();
                setTimeout(() => loginToggle.click(), 2000);
            } else {
                displayMessage(data.error || "Erreur d'inscription", "error");
            }
        } catch (error) {
            displayMessage("Erreur : Serveur déconnecté.", "error");
        }
    });

    // 4. GESTION DE LA CONNEXION
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Sauvegarde de la session dans le navigateur
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                localStorage.setItem('token', data.token); // Nouveau : on sauvegarde le Badge
                
                // On active le passage au Lobby
                goToLobby(data.username);
            } else {
                displayMessage(data.error || "Email ou mot de passe incorrect", "error");
            }
        } catch (error) {
            displayMessage("Erreur : Connexion au serveur impossible.", "error");
        }
    });

    // 5. FONCTIONS DE NAVIGATION
    function goToLobby(username) {
        const authPage = document.getElementById('auth-page');
        const lobbyPage = document.getElementById('lobby-page');

        // On masque l'auth et on affiche le lobby
        authPage.classList.remove('active');
        authPage.style.display = 'none';

        lobbyPage.classList.add('active');
        lobbyPage.style.display = 'flex';
        
        document.getElementById('username-display').innerText = username;
    }

    function displayMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `pixel-message ${type}`;
        messageDiv.style.display = 'block';
    }

    function clearMessage() {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
    }

    // GESTION DU BOUTON LOGOUT
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        
        const authPage = document.getElementById('auth-page');
        const lobbyPage = document.getElementById('lobby-page');
        
        authPage.classList.add('active');
        authPage.style.display = 'flex';
        
        lobbyPage.classList.remove('active');
        lobbyPage.style.display = 'none';
        
        loginToggle.click();
        clearMessage();
        console.log("Déconnexion effectuée");
    });

    // 6. GESTION DES BOUTONS JOUER
    const playButtons = document.querySelectorAll('.game-card button');
    playButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.game-card');
            const gameId = card.getAttribute('data-game');
            
            if (gameId === 'ttt' || gameId === '2048') {
                window.location.href = 'games/DOMProject/index.html';
            }
        });
    });

    // 7. CHARGER LE LEADERBOARD DYNAMIQUEMENT
    async function loadLeaderboard() {
        try {
            const games = ['2048', 'canvas', 'babylon'];
            const scoreList = document.getElementById('score-list');
            let allScores = [];

            // Récupérer les scores de tous les jeux
            for (const game of games) {
                const response = await fetch(`http://localhost:5000/api/scores/leaderboard/${game}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    allScores = allScores.concat(data.data.map(score => ({
                        ...score,
                        gameName: game
                    })));
                }
            }

            // Trier par score décroissant
            allScores.sort((a, b) => b.points - a.points);

            // Remplir le tableau
            scoreList.innerHTML = '';
            allScores.slice(0, 50).forEach((score, index) => {
                const rank = index + 1;
                let medal = '';
                if (rank === 1) medal = '🥇';
                else if (rank === 2) medal = '🥈';
                else if (rank === 3) medal = '🥉';

                const row = document.createElement('tr');
                if (rank <= 3) row.className = `rank-${rank}`;
                
                row.innerHTML = `
                    <td>${medal} ${rank}</td>
                    <td>${score.user?.username || 'Joueur inconnu'}</td>
                    <td>${score.points.toLocaleString('fr-FR')}</td>
                    <td>${score.gameName}</td>
                `;
                scoreList.appendChild(row);
            });
        } catch (error) {
            console.error('Erreur chargement leaderboard:', error);
        }
    }

    // Charger le leaderboard au démarrage
    loadLeaderboard();
    // Rafraîchir toutes les 30 secondes
    setInterval(loadLeaderboard, 30000);

});