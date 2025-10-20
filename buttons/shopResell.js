const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUserData } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
  customId: "shopResell",
  async execute(interaction, client) {
    const userId = interaction.customId.split("-")[1];

    console.log("MAIN" + userId)
    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "🚫 Tu ne peux pas interagir avec cet embed.",
        ephemeral: true
      });
    }

    const userData = await getUserData(userId);
    if (!userData) {
      return interaction.reply({
        content: "❌ Impossible de récupérer ton inventaire.",
        ephemeral: true
      });
    }

    const inv = userData.inventory || {};

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setDescription("# Revendre des objets\n\n" +
        "Sélectionne un objet que tu veux revendre contre des bonbons <:candy:1429877089154236466>"
      )
      .addFields(
        { name: "<:Bougies_Halloween_x10:1429873150824546434> Bougies", value: `${(inv.candle / 10) || 0} lots`, inline: true },
        { name: "<:Citrouille_Halloween_x3:1429873096260845701> Citrouilles", value: `${(inv.pumpkin / 3) || 0} lots`, inline: true },
        { name: "<:Grimoir_Halloween_x1:1429873244097347724> Grimoires", value: `${inv.book || 0} lots`, inline: true }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`resellSelect-candle-${userId}`)
        .setLabel("Bougies")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("<:Bougies_Halloween_x10:1429873150824546434>")
        .setDisabled(!inv.candle || inv.candle <= 0),
      new ButtonBuilder()
        .setCustomId(`resellSelect-pumpkin-${userId}`)
        .setLabel("Citrouilles")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("<:Citrouille_Halloween_x3:1429873096260845701>")
        .setDisabled(!inv.pumpkin || inv.pumpkin <= 0),
      new ButtonBuilder()
        .setCustomId(`resellSelect-book-${userId}`)
        .setLabel("Grimoires")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("<:Grimoir_Halloween_x1:1429873244097347724>")
        .setDisabled(!inv.book || inv.book <= 0)
    );

    const backRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`shopMain-${userId}`)
        .setLabel("Retour à la boutique")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("<:previous:1422926470535188541>")
    );

    await interaction.update({ embeds: [embed], components: [row, backRow] });
  }
};
