const { EmbedBuilder } = require("discord.js");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopCancel",
    async execute(interaction, client) {
        const userId = interaction.customId.split("-")[2];
        if (interaction.user.id !== userId) {
                console.log("Unauthorized click by", interaction.user.id, "expected", userId);
                return interaction.reply({ content: "🚫 Tu ne peux pas interagir avec cet embed.", ephemeral: true });
        }
        try {
            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("❌ Achat annulé")
                .setDescription("Votre achat a été annulé.\nRedirection vers la boutique dans 3 secondes...");

            await interaction.update({ embeds: [embed], components: [] });

            setTimeout(async () => {
                const shopCommand = client.commands.get("shop");
                if (shopCommand) await shopCommand.execute(interaction, client);
            }, 3000);

        } catch (err) {
            console.error("❌ Erreur shopCancel :", err);
        }
    }
};
