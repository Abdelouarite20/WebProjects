require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Nécessaire pour les chemins de fichiers
const connectDb = require('./connectDb/connectDb');
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

// 1. Connexion à la base
connectDb();

// 2. Middlewares
app.use(cors()); // Autorise les requêtes cross-origin
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// 3. Servir les fichiers statiques (CSS, JS, Images)
// On dit à Express que le dossier 'frontend' contient nos fichiers publics
app.use(express.static(path.join(__dirname, "frontend")));

// 4. Routes API
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// 5. Route principale : Affiche ton index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// 6. Port et Lancement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));