const Score = require('../models/Score');

// Enregistrer un score
exports.addScore = async (req, res) => {
    try {
        const { game, points } = req.body;
        
        // Logique Anti-Triche très basique
        if (typeof points !== 'number' || points < 0) {
            return res.status(400).json({ success: false, error: "Score invalide (négatif ou incorrect)" });
        }
        
        if (game === '2048' && points > 5000000) {
            return res.status(400).json({ success: false, error: "Score impossible détecté. Triche probable." });
        }

        const userId = req.user.id; // L'ID vient maintenant du Token vérifié
        const newScore = await Score.create({ user: userId, game, points });
        res.status(201).json({ success: true, data: newScore });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Récupérer le TOP 25 d'un jeu
exports.getLeaderboard = async (req, res) => {
    try {
        const { game } = req.params;
        const scores = await Score.find({ game })
            .sort({ points: -1 }) // Du plus grand au plus petit
            .limit(25)
            .populate('user', 'username'); // Pour afficher le nom du joueur, pas juste son ID

        res.status(200).json({ success: true, data: scores });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};