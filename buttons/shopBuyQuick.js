const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getItemPrice, getItemQuantity, formatItemName } = require("../utils/shopUtils");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopBuyQuick",
    async execute(interaction, client) {
        try {
            const [_, item, amountStr] = interaction.customId.split("-");
            const lots = parseInt(amountStr);
            const userId = interaction.user.id;
            
            const price = getItemPrice(item, lots);
            const quantity = getItemQuantity(item, lots);
            const name = formatItemName(item, quantity);

            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("🛍️ Confirmation d’achat")
                .setDescription(`Vous allez acheter **${lots} lot(s)** (${quantity} ${name}) pour **${price} bonbons**.`)
                .setFooter({ text: "Confirmez ou annulez votre achat." });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`shopConfirm-${item}-${lots}-${userId}`).setLabel("Procéder au paiement").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`shopCancel-${item}-${userId}`).setLabel("Annuler").setStyle(ButtonStyle.Danger)
            );

            await interaction.update({ embeds: [embed], components: [row] });
        } catch (err) {
            console.error("❌ Erreur shopBuyQuick :", err);
            await interaction.reply({ content: "Erreur lors de la confirmation d’achat.", ephemeral: true });
        }
    }
};
