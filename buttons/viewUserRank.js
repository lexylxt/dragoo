const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUserData, HALLOWEEN_RANKS } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "viewUserRank",
    async execute(interaction, client) {
        try {
            const userId = interaction.customId.split("-")[1];

            if (interaction.user.id !== userId) {
                return interaction.reply({
                    content: "❌ Tu ne peux pas interagir avec ce message.",
                    ephemeral: true
                });
            }

            const userData = await getUserData(userId);
            if (!userData) {
                return interaction.reply({
                    content: "❌ Impossible de trouver votre profil. Essayez de recommencer.",
                    ephemeral: true
                });
            }

            const currentRankIndex = userData.rank;
            const nextRank = HALLOWEEN_RANKS[currentRankIndex + 1];
            const currentRank = HALLOWEEN_RANKS[currentRankIndex];

            // --- Génération de la liste des rangs
            const ranksList = HALLOWEEN_RANKS.map((r, i) => {
                if (i === currentRankIndex) return `### - **${r.name}** *(rang actuel)*`;
                return `- ${r.name}`;
            }).join("\n");

            // --- Vérification des ressources manquantes
            let missingText = "";
            let canRankUp = false;

            if (!nextRank) {
                missingText = "🎉 Vous avez atteint le rang **maximal** !";
            } else {
                const { candyRequired, itemsRequired } = nextRank;

                const missingCandy = Math.max(0, candyRequired - (userData.inventory.candy || 0));
                const missingCandles = Math.max(0, itemsRequired.candles - (userData.inventory.candle || 0));
                const missingPumpkins = Math.max(0, itemsRequired.pumpkin - (userData.inventory.pumpkin || 0));
                const missingBooks = Math.max(0, itemsRequired.book - (userData.inventory.book || 0));

                const missingItems = [];
                if (missingCandles > 0) missingItems.push(`${missingCandles} 🕯️`);
                if (missingPumpkins > 0) missingItems.push(`${missingPumpkins} 🎃`);
                if (missingBooks > 0) missingItems.push(`${missingBooks} 📖`);

                if (missingCandy === 0 && missingItems.length === 0) {
                    missingText = "✨ Vous avez tout ce qu’il faut pour passer au rang suivant !";
                    canRankUp = true;
                } else {
                    missingText = "";
                    if (missingCandy > 0) missingText += `<:candy:1429877089154236466> ${missingCandy} bonbons manquants\n`;
                    if (missingItems.length > 0) missingText += `📦 ${missingItems.join(", ")} manquants`;
                }
            }

            // --- Création de l’embed
            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("🎃 Progression des rangs")
                .setDescription(ranksList)
                .addFields(
                    { name: "Rang actuel", value: `${currentRank.name}`, inline: true },
                    { name: "Prochain rang", value: nextRank ? `${nextRank.name}` : "Aucun (rang maximal)", inline: true },
                    { name: "Progression", value: missingText || "✅ Prêt à passer au rang suivant !" }
                )
                .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

            // --- Boutons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`profile-${userId}`)
                    .setLabel("Retour")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:previous:1422926470535188541>"),
                new ButtonBuilder()
                    .setCustomId(`rankUp-${userId}`)
                    .setLabel("Passer au rang suivant")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!canRankUp)
            );

            await interaction.update({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error("❌ Erreur bouton viewUserRank :", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Une erreur est survenue lors de l'affichage des rangs.",
                    ephemeral: true
                });
            }
        }
    }
};
