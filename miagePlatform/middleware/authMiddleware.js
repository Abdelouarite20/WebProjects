const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Récupérer le token de l'entête
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajouter l'ID du joueur à la requête pour les prochains middlewares/contrôleurs
            req.user = { id: decoded.id };

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, error: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Non autorisé, pas de token fourni' });
    }
};
