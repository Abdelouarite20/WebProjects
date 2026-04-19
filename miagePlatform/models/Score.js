const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    // On lie le score à l'ID de l'utilisateur qui vient de se connecter
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: String,
        required: true,
        enum: ['2048', 'Crazy Fish', 'babylon'] // Mes 3 jeux
    },
    points: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Score', scoreSchema);