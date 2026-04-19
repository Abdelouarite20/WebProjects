const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    S'inscrire
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });

        res.status(201).json({
            success: true,
            message: "Utilisateur créé !",
            userId: user._id
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Se connecter
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Création du Cookie sécurisé "HttpOnly"
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', // Lax est plus tolérant pour les requêtes locales (Fetch) sur localhost
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        });

        res.status(200).json({
            success: true,
            userId: user._id,
            username: user.username
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Se déconnecter (Effacer le cookie)
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax'
    });
    res.status(200).json({ success: true, message: 'Déconnexion réussie' });
};