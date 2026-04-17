const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connecté à la base : PlateformeJeux");
    } catch (err) {
        console.error("❌ Erreur de connexion :", err.message);
        process.exit(1); // Arrête le serveur si la connexion échoue
    }
};

module.exports = connectDb;