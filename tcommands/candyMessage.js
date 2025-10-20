const { getUserData, supabase } = require("../utils/userVars");

const LOG_CHANNEL_ID = "1425896059753725984"; // salon de log

module.exports = {
    name: "candyMessage", // aucun trigger, sera appelé pour tous les messages
    always: true, // toujours exécuté
    async execute(message, args, client) {
        if (message.author.bot) return;

        try {
            const userData = await getUserData(message.author.id);
            if (!userData) return;

            // Salons où on ne peut pas gagner de bonbons — modifiez cette liste si besoin
            const NO_CANDY_CHANNELS = [
                "1425551463723171840",
                "996929797869551737",
                "998399427788156959",
                "1132377570978050120"
            ];

            if (NO_CANDY_CHANNELS.includes(message.channel.id)) return;
            const gain = Math.floor(Math.random() * 6) + 5;
            const newInventory = { ...userData.inventory, candy: (userData.inventory.candy || 0) + gain };

            await supabase
                .from("users")
                .update({ inventory: newInventory, candy: userData.candy + gain })
                .eq("userid", message.author.id);

            console.log(`💫 ${message.author.tag} a reçu ${gain} bonbons.`);

            // Log dans le salon
            try {
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    logChannel.send(`<:candy:1429877089154236466> ${message.author.tag} a reçu ${gain} bonbons.`);
                }
            } catch (err) {
                console.error("❌ Impossible de log dans le salon :", err);
            }

        } catch (error) {
            console.error("❌ Erreur lors de l'ajout de bonbons :", error);
        }
    }
};
