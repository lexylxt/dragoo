const { EmbedBuilder } = require("discord.js");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopCancel",
    async execute(interaction, client) {
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
