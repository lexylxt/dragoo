const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUserData } = require("../utils/userVars");
const { getItemPrice, formatItemName } = require("../utils/shopUtils")

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Accéder à la boutique Halloween")
        .addStringOption(opt =>
            opt.setName("object")
                .setDescription("Objet à acheter (candle/pumpkin/book)")
                .setRequired(false)
                .addChoices(
                    { name: "Bougie", value: "candle" },
                    { name: "Citrouille", value: "pumpkin" },
                    { name: "Grimoire", value: "book" }
                ))
        .addIntegerOption(opt =>
            opt.setName("amount")
                .setDescription("Quantité à acheter (optionnel)")
                .setMinValue(1)
                .setRequired(false)),

    async execute(interaction, client) {
        const object = interaction.options.getString("object");
        const amount = interaction.options.getInteger("amount") || 1;

        const userData = await getUserData(interaction.user.id);
        if (!userData) {
            return interaction.reply({
                content: "❌ Vous n'avez pas encore de profil. Utilisez `/profile` pour commencer l'aventure !",
                ephemeral: true
            });
        }

        // --- Achat rapide ---
        if (object) {
            const price = getItemPrice(object, amount);
            const itemName = formatItemName(object);

            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("🛍️ Confirmation d'achat")
                .setDescription(`Voulez-vous acheter **${amount} ${itemName}** pour **${price} bonbons** ?\n\nVous possédez actuellement **${userData.inventory.candy} bonbons**.`)
                .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`shopConfirm-${object}-${amount}-${interaction.user.id}`)
                    .setLabel("Procéder au paiement")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`shopCancel-${object}-${interaction.user.id}`)
                    .setLabel("Annuler")
                    .setStyle(ButtonStyle.Danger)
            );

            return interaction.reply({ embeds: [embed], components: [row] });
        }

        // --- Sinon, page principale du shop ---
        const embed = new EmbedBuilder()
            .setColor(COLOR)
            .setDescription("# Boutique d'Halloween\n" + "Bienvenue dans la boutique Halloween ! Choisissez une catégorie d’objet à explorer")
            .addFields(
                { name: "<:Bougies_Halloween_x10:1429873150824546434>  Bougies", value: "10 bougies = 400 bonbons", inline: true },
                { name: "<:Citrouille_Halloween_x3:1429873096260845701> Citrouilles", value: "3 citrouilles = 1200 bonbons", inline: true },
                { name: "<:Grimoir_Halloween_x1:1429873244097347724>  Grimoires", value: "1 grimoire = 3000 bonbons", inline: true }
            )
            .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`shopCategory-candle-${interaction.user.id}`).setLabel("Bougies").setStyle(ButtonStyle.Secondary).setEmoji("<:Bougies_Halloween_x10:1429873150824546434>"),
            new ButtonBuilder().setCustomId(`shopCategory-pumpkin-${interaction.user.id}`).setLabel("Citrouilles").setStyle(ButtonStyle.Secondary).setEmoji("<:Citrouille_Halloween_x3:1429873096260845701>"),
            new ButtonBuilder().setCustomId(`shopCategory-book-${interaction.user.id}`).setLabel("Grimoires").setStyle(ButtonStyle.Secondary).setEmoji("<:Grimoir_Halloween_x1:1429873244097347724> ")
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`shopResell-${interaction.user.id}`).setLabel("Revendre").setStyle(ButtonStyle.Secondary).setEmoji("💰")
        )

        await interaction.reply({ embeds: [embed], components: [row, row2] });
    }
};
