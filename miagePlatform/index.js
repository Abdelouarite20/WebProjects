require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Nécessaire pour les chemins de fichiers
const connectDb = require('./connectDb/connectDb');
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

// Importation des boucliers de sécurité
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// 1. Connexion à la base
connectDb();

// 2. Middlewares - Briques de Sécurité

// Helmet : Bloque les failles XSS basiques et cache la signature Express
app.use(helmet({ contentSecurityPolicy: false })); // CSP désactivé pour ne pas brider les jeux 


// CORS : On évite open-bar (autorise localhost, ajuste lors de la mise en ligne)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST'],
    credentials: true 
}));

// Rate Limit : Empêche le Brute-Force et le Spam (100 requêtes max par 10 minutes)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100, 
    message: { error: "Trop de requêtes détectées, calme-toi et réessaie dans 10 minutes !" }
});
app.use('/api', limiter); // Appliqué uniquement sur les routes API
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Mongo Sanitize : Custom middleware pour Express 5 (évite le plantage sur req.query)
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
});


// Ajout du lecteur de Cookies pour l'authentification sécurisée
app.use(cookieParser());

// 3. Servir les fichiers statiques (CSS, JS, Images)
// On dit à Express que le dossier 'frontend' contient nos fichiers publics
app.use(express.static(path.join(__dirname, "frontend")));

// 4. Routes API
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// 5. Route principale : Affiche index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// 6. Port et Lancement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));