const { EmbedBuilder } = require("discord.js");
const { getUserData, supabase } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);
const RESELL_PRICES = {
  candle: { label: "bougies (x10)", price: 100, divider: 10 },
  pumpkin: { label: "citrouilles (x3)", price: 300, divider: 3 },
  book: { label: "grimoires (x1)", price: 800, divider: 1 }
};

module.exports = {
  customId: "resellModal",
  async execute(interaction, client) {
    const [, object, userId] = interaction.customId.split("-");
    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "🚫 Tu ne peux pas interagir avec cet embed.",
        ephemeral: true
      });
    }

    const amount = parseInt(interaction.fields.getTextInputValue("resellAmount"));
    if (isNaN(amount) || amount <= 0) {
      return interaction.reply({ content: "❌ Nombre invalide.", ephemeral: true });
    }

    const userData = await getUserData(userId);
    const inv = userData.inventory || {};
    const item = RESELL_PRICES[object];
    const owned = inv[object] || 0;

    // ✅ Vérifie si l'utilisateur a assez d'objets pour former 'amount' lots
    const availableLots = Math.floor(owned / item.divider);

    if (availableLots < amount) {
      return interaction.reply({
        content: `❌ Tu n’as pas assez de ${item.label} pour revendre ${amount} lot(s).\n` +
                 `Tu peux en revendre au maximum **${availableLots}**.`,
        ephemeral: true
      });
    }

    // Calcul des gains
    const totalGain = item.price * amount;

    // Mise à jour inventaire
    inv[object] -= amount * item.divider; // Retirer le bon nombre d’objets
    inv.candy = (inv.candy || 0) + totalGain;

    const newSales = (userData.sales || 0) + 1;
    const { error } = await supabase
      .from("users")
      .update({ inventory: inv, sales: newSales })
      .eq("userid", userId);

    // Log simple message dans le salon 1427349131222978621
    try {
      const logChannel = await client.channels.fetch("1427349131222978621");
      if (logChannel) {
      // Récupère un display name lisible si possible
      let displayName = `<@${userId}>`;
      try {
        if (interaction.guild) {
        const member = await interaction.guild.members.fetch(userId);
        displayName = member.displayName || `<@${userId}>`;
        } else {
        const user = await client.users.fetch(userId);
        displayName = user.username || `<@${userId}>`;
        }
      } catch (fetchErr) {
        // fallback to mention si fetch échoue
      }

      await logChannel.send(
        `${displayName} a revendu ${amount} ${item.label} pour ${totalGain} bonbons 🍬`
      );
      }
    } catch (logErr) {
      console.error("Erreur lors de l'envoi du log de vente :", logErr);
    }

    if (error) {
      console.error("Supabase update error:", error);
      return interaction.reply({ content: "❌ Erreur lors de la mise à jour.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `✅ Tu as revendu **${amount} lot(s)** de ${item.label} pour **${totalGain} bonbons** 🍬\n` +
        `Tu as maintenant **${inv.candy} bonbons**.`
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
