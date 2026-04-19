const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token = req.cookies.token; // Lecture automatique via cookie-parser

    if (!token) {
        return res.status(401).json({ success: false, error: 'Non autorisé, pas de token fourni' });
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajouter l'ID du joueur à la requête
        req.user = { id: decoded.id };

        next();
    } catch (error) {
        console.error("Erreur Token :", error.message);
        return res.status(401).json({ success: false, error: 'Non autorisé, token invalide ou expiré' });
    }
};
