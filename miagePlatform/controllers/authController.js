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

        res.status(200).json({
            success: true,
            userId: user._id,
            username: user.username,
            token
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};