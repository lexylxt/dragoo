const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getItemPrice, getItemQuantity, formatItemName } = require("../utils/shopUtils");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopBuyConfirm",
    async execute(interaction, client) {
        try {
            const item = interaction.customId.split("-")[1];
            const lots = parseInt(interaction.fields.getTextInputValue("amount"));
            const userId = interaction.user.id
            if (isNaN(lots) || lots <= 0) {
                return interaction.reply({ content: "❌ Nombre invalide.", ephemeral: true });
            }

            const price = getItemPrice(item, lots);
            const quantity = getItemQuantity(item, lots);
            const name = formatItemName(item, quantity);

            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("🛍️ Confirmation d’achat personnalisé")
                .setDescription(`Vous allez acheter **${lots} lot(s)** (${quantity} ${name}) pour **${price} bonbons**.`)
                .setFooter({ text: "Confirmez ou annulez votre achat." });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`shopConfirm-${item}-${lots}-${userId}`).setLabel("Procéder au paiement").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`shopCancel-${item}-${userId}`).setLabel("Annuler").setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (err) {
            console.error("❌ Erreur modal shopBuyConfirm :", err);
            await interaction.reply({ content: "Erreur lors du traitement de l’achat.", ephemeral: true });
        }
    }
};
