const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { getUserData } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);
const RESELL_PRICES = {
  candle: { label: "bougies (x10)", price: 100, divider: 10 },
  pumpkin: { label: "citrouilles (x3)", price: 300, divider: 3 },
  book: { label: "grimoires (x1)", price: 800, divider: 1 }
};

module.exports = {
  customId: "resellConfirm",
  async execute(interaction, client) {
    const [_, object, userId] = interaction.customId.split("-");

    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "❌ Tu ne peux pas interagir avec ce message.",
        ephemeral: true
      });
    }

    const userData = await getUserData(userId);
    if (!userData) {
      return interaction.reply({
        content: "❌ Impossible de récupérer ton profil.",
        ephemeral: true
      });
    }

    const item = RESELL_PRICES[object];
    const inv = userData.inventory || {};
    const owned = inv[object] || 0;
    const availableLots = Math.floor(owned / item.divider);

    if (availableLots <= 0) {
      return interaction.reply({
        content: `❌ Tu n’as pas assez de ${item.label} pour en revendre.`,
        ephemeral: true
      });
    }

    // 🧾 Création du modal
    const modal = new ModalBuilder()
      .setCustomId(`resellModal-${object}-${userId}`)
      .setTitle(`Revendre des ${item.label}`);

    const amountInput = new TextInputBuilder()
      .setCustomId("resellAmount")
      .setLabel(`Combien de lot(s) veux-tu revendre ?`)
      .setPlaceholder(`Tu peux en vendre jusqu’à ${availableLots}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(amountInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
