const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  customId: "resellSelect",
  async execute(interaction) {
    const [ , object, userId ] = interaction.customId.split("-");

    console.log("SELECT" + userId + interaction.user.id)
    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "🚫 Tu ne peux pas interagir avec cet embed.",
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`resellModal-${object}-${userId}`)
      .setTitle("💰 Revendre des objets");

    const input = new TextInputBuilder()
      .setCustomId("resellAmount")
      .setLabel("Combien de lots veux-tu revendre ?")
      .setPlaceholder("Exemple : 3")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
