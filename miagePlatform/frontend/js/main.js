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
        // Le token est maintenant géré dynamiquement par le navigateur,
        // on se fie juste à la présence du username localement pour afficher le UI.
        // Si le cookie expire en arrière plan, les requêtes API (comme les scores) seront rejetées.
        const username = localStorage.getItem('username');

        if (username) {
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
                credentials: 'include', // Nécessaire pour accepter un potentiel cookie
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
                credentials: 'include', // Indispensable pour que le navigateur ACCEPTE le Set-Cookie !
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Le Token est désormais renvoyé et scellé automatiquement dans un Cookie HttpOnly !
                // Il n'y a plus besoin de le stocker ou de le manipuler ici.
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                
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
    logoutBtn.addEventListener('click', async () => {
        try {
            // Dit au serveur de détruire le Cookie sécurisé HttpOnly
            await fetch('http://localhost:5000/api/auth/logout', { method: 'GET', credentials: 'omit' });
        } catch(e) { console.error('Erreur déconnexion serveur', e); }

        // Détruit les traces d'interface locales
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
        console.log("Déconnexion complète (Cookie banni) effectuée");
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
    async function loadLeaderboard(gameFilter = 'all') {
        try {
            const scoreList = document.getElementById('score-list');
            let allScores = [];

            if (gameFilter === 'all') {
                // Récupérer les scores de tous les jeux
                const games = ['2048', 'canvas', 'babylon'];
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
            } else {
                // Récupérer les scores d'un jeu spécifique
                const response = await fetch(`http://localhost:5000/api/scores/leaderboard/${gameFilter}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    allScores = data.data.map(score => ({
                        ...score,
                        gameName: gameFilter
                    }));
                }
            }

            // Remplir le tableau
            scoreList.innerHTML = '';
            allScores.slice(0, 25).forEach((score, index) => {
                const rank = index + 1;
                let medal = '';
                if (rank === 1) medal = '🥇';
                else if (rank === 2) medal = '🥈';
                else if (rank === 3) medal = '🥉';

                const row = document.createElement('tr');
                if (rank <= 3) row.className = `rank-${rank}`;
                
                // CORRECTION SÉCURITÉ : Je remplace innerHTML par la création manuelle des noeuds 
                // et l'utilisation de .textContent. Cela m'assure qu'aucun code pirate (XSS) 
                // mis dans le nom d'un joueur ne pourra s'exécuter sur mon site !
                
                const tdRank = document.createElement('td');
                tdRank.textContent = `${medal} ${rank}`;
                
                const tdUser = document.createElement('td');
                tdUser.textContent = score.user?.username || 'Joueur inconnu';
                
                const tdPoints = document.createElement('td');
                tdPoints.textContent = score.points.toLocaleString('fr-FR');
                
                const tdGame = document.createElement('td');
                tdGame.textContent = score.gameName;

                row.appendChild(tdRank);
                row.appendChild(tdUser);
                row.appendChild(tdPoints);
                row.appendChild(tdGame);
                scoreList.appendChild(row);
            });
        } catch (error) {
            console.error('Erreur chargement leaderboard:', error);
        }
    }

    // Gestion des filtres du leaderboard
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            // Charger le leaderboard avec le filtre
            loadLeaderboard(btn.getAttribute('data-filter'));
        });
    });

    // Charger le leaderboard au démarrage
    loadLeaderboard();
    // Rafraîchir toutes les 30 secondes
    setInterval(loadLeaderboard, 30000);

    // 8. HIGHLIGHT NAVBAR LINK ON SCROLL
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the top 20-30% of viewport
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

});