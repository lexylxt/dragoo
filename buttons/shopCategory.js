const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getItemPrice, getItemQuantity, formatItemName } = require("../utils/shopUtils");
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopCategory",
    async execute(interaction, client) {
        try {
            const userId = interaction.user.id;
            const item = interaction.customId.split("-")[1]; // candle / pumpkin / book

            const itemNames = {
                candle: "Bougies <:Bougie_Halloween_x10:1429873150824546434>",
                pumpkin: "Citrouilles <:Citrouille_Halloween_x3:1429873096260845701>",
                book: "Grimoires <:Grimoir_Hallowee_x1:1429873244097347724> "
            };

            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setDescription(`# Boutique ${itemNames[item]}\n` + "Choisissez le nombre de lots à acheter :")
                .addFields(
                    { name: "💰 Prix par lot", value: `${getItemPrice(item, 1)} bonbons`, inline: true },
                    { name: "📦 Contenu d’un lot", value: `${getItemQuantity(item, 1)} ${formatItemName(item, 2)}`, inline: true }
                )
                .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`shopBuyQuick-${item}-1`).setLabel("x1").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`shopBuyQuick-${item}-2`).setLabel("x2").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`shopBuyQuick-${item}-5`).setLabel("x5").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`shopBuyQuick-${item}-10`).setLabel("x10").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`shopBuyCustom-${item}`).setLabel("Custom").setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`shopBack`).setLabel("Retour").setStyle(ButtonStyle.Danger).setEmoji("<:previous:1422926470535188541>")
            );

            await interaction.update({ embeds: [embed], components: [row, row2] });

        } catch (err) {
            console.error("❌ Erreur shopCategory :", err);
            await interaction.reply({ content: "Erreur lors du chargement de la catégorie.", ephemeral: true });
        }
    }
};
