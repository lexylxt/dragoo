const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopMain",
    async execute(interaction, client) {
        const userId = interaction.customId.split("-")[1];
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: "🚫 Tu ne peux pas interagir avec cet embed.", ephemeral: true });
        }
        await module.exports.showMain(interaction, client, userId);
    },

    async showMain(interaction, client, userId) {
        const embed = new EmbedBuilder()
            .setColor(COLOR)
            .setTitle("🎃 Boutique Halloween")
            .setDescription("Bienvenue dans la boutique Halloween ! Choisissez une catégorie 👇")
            .addFields(
                { name: "<:Bougies_Halloween_x10:1429873150824546434> Bougies", value: "10 bougies = 400 bonbons", inline: true },
                { name: "<:Citrouille_Halloween_x3:1429873096260845701> Citrouilles", value: "3 citrouilles = 1200 bonbons", inline: true },
                { name: "<:Grimoir_Halloween_x1:1429873244097347724> Grimoires", value: "1 grimoire = 3000 bonbons", inline: true }
            )
            .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`shopCategory-candle-${userId}`).setLabel("Bougies").setStyle(ButtonStyle.Secondary).setEmoji("<:Bougies_Halloween_x10:1429873150824546434>"),
            new ButtonBuilder().setCustomId(`shopCategory-pumpkin-${userId}`).setLabel("Citrouilles").setStyle(ButtonStyle.Secondary).setEmoji("<:Citrouille_Halloween_x3:1429873096260845701>"),
            new ButtonBuilder().setCustomId(`shopCategory-book-${userId}`).setLabel("Grimoires").setStyle(ButtonStyle.Secondary).setEmoji("<:Grimoir_Halloween_x1:1429873244097347724>")
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`shopResell-${interaction.user.id}`).setLabel("Revendre").setStyle(ButtonStyle.Secondary).setEmoji("💰")
        )

        await interaction.editReply({ embeds: [embed], components: [row, row2] });
    }
};
