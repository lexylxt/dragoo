const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    customId: "shopBuyCustom",
    async execute(interaction) {
        const item = interaction.customId.split("-")[1];
        const userId = interaction.customId.split("-")[2];
        if (interaction.user.id !== userId) {
                console.log("Unauthorized click by", interaction.user.id, "expected", userId);
                return interaction.reply({ content: "🚫 Tu ne peux pas interagir avec cet embed.", ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`shopBuyConfirm-${item}`)
            .setTitle("Achat personnalisé");

        const amountInput = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Nombre de lots à acheter")
            .setPlaceholder("Ex: 3")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(amountInput);

        modal.addComponents(row);
        await interaction.showModal(modal);
    }
};
