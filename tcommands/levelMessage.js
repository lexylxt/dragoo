const { getUserData, supabase } = require("../utils/userVars");

const LOG_CHANNEL_ID = "1428420242274652323"; // salon de log
const XP_PER_MESSAGE_MIN = 5;
const XP_PER_MESSAGE_MAX = 10;

// Fonction pour calculer XP nécessaire pour passer le niveau suivant
function xpForNextLevel(level) {
    return 100 + level * 20; // Exemple : 100 XP au niveau 1, +20 à chaque niveau
}

module.exports = {
    name: "levelMessage",
    always: true,
    async execute(message, args, client) {
        if (message.author.bot) return;

        try {
            const userData = await getUserData(message.author.id);
            if (!userData) return;

            const NO_LEVEL_CHANNELS = [
                "1425551463723171840",
                "996929797869551737",
                "998399427788156959",
                "1132377570978050120"
            ];

            if (NO_LEVEL_CHANNELS.includes(message.channel.id)) return;
            // Gain aléatoire d'XP
            const gainXp = Math.floor(Math.random() * (XP_PER_MESSAGE_MAX - XP_PER_MESSAGE_MIN + 1)) + XP_PER_MESSAGE_MIN;
            let newXp = (userData.xp || 0) + gainXp;
            let newLevel = userData.level || 0;

            // Vérifier si le joueur monte de niveau
            let leveledUp = false;
            let xpNeeded = xpForNextLevel(newLevel);
            while (newXp >= xpNeeded) {
                newXp -= xpNeeded;
                newLevel++;
                leveledUp = true;
                xpNeeded = xpForNextLevel(newLevel);
            }

            // Mise à jour de la base
            await supabase
                .from("users")
                .update({ xp: newXp, level: newLevel })
                .eq("userid", message.author.id);

            console.log(`💫 ${message.author.tag} a gagné ${gainXp} XP. Niveau: ${newLevel} | XP: ${newXp}`);

            // 1️⃣ Log dans le salon de logs (toujours)
            try {
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    let msg = `📈 ${message.author.tag} a gagné **${gainXp} XP**. Niveau actuel: **${newLevel}**, XP: **${newXp}/${xpForNextLevel(newLevel)}**.`;
                    if (leveledUp) msg += ` 🎉 (Nouveau niveau atteint !)`;
                    await logChannel.send(msg);
                }
            } catch (err) {
                console.error("❌ Impossible de log dans le salon :", err);
            }

            // 2️⃣ Message public si level up
            if (leveledUp) {
                await message.channel.send({
                    content: `🎉 **${message.author}**, tu viens de passer **niveau ${newLevel}** ! GG 👏`
                });
            }

        } catch (error) {
            console.error("❌ Erreur lors de l'ajout d'XP :", error);
        }
    }
};
