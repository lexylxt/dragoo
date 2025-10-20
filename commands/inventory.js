const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUserData } = require("../utils/userVars");

// Couleur de l'embed
const COLOR = parseInt(process.env.COLOR, 16);

// Items traduits en français avec emoji
const ITEM_DISPLAY = {
    candy: { name: "Bonbons", emoji: "<:candy:1429877089154236466>" },
    candle: { name: "Bougies", emoji: "<:Bougie_Halloween_x1:1429878415988625451>" },
    pumpkin: { name: "Citrouilles", emoji: "<:Citrouille_halloween_x1:1429878827248779387>" },
    book: { name: "Livres", emoji: "<:Grimoir_Halloween_x1:1429873244097347724>" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Afficher votre inventaire Halloween"),

    async execute(interaction, client) {
        try {
            // Récupérer les données utilisateur
            const userData = await getUserData(interaction.user.id);

            if (!userData) {
                return interaction.reply({
                    content: "❌ Vous n'avez pas de compte ! Commencez l'aventure avec le bouton Halloween.",
                    ephemeral: true
                });
            }

            // Construire le texte de l'inventaire
            const inventoryText = Object.entries(userData.inventory)
                .map(([key, amount]) => {
                    const item = ITEM_DISPLAY[key];
                    // Ordre souhaité
                    const ORDER = ["candy", "candle", "pumpkin", "book"];
                    // Trouver la première clé présente dans l'inventaire selon l'ordre désiré
                    const firstKey = ORDER.find(k => k in userData.inventory);
                    if (key === firstKey) {
                        // Construire le texte de l'inventaire dans l'ordre désiré
                        return ORDER
                            .filter(k => k in userData.inventory)
                            .map(k => {
                                const amt = userData.inventory[k] ?? 0;
                                const it = ITEM_DISPLAY[k];
                                return `${it?.emoji || ""} ${it?.name || k} : ${amt}`;
                            })
                            .join("\n");
                    }
                    // Les autres éléments retournent une chaîne vide (ne restent pas visibles)
                    return "";
                })
                .join("\n");

            // Récupérer le pseudo du serveur si disponible
            const member = interaction.guild.members.cache.get(interaction.user.id);
            const nickname = member?.nickname || interaction.user.username;

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setDescription(`# Inventaire\nVoici votre inventaire, ${nickname}\n` + inventoryText)
                .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

            // Envoyer l'embed
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Erreur lors de la récupération de l'inventaire :", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Impossible de récupérer votre inventaire pour le moment.",
                    ephemeral: true
                });
            }
        }
    }
};
