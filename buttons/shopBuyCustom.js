const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    customId: "shopBuyCustom",
    async execute(interaction) {
        const item = interaction.customId.split("-")[1];

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
