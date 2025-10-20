const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const COLOR = parseInt(process.env.COLOR, 16)
module.exports = {
    name: "start",
    prefix: "!",
    description: "Démarrer l'événement Halloween (réservé à l'organisateur)",

    async execute(message, args, client) {
        // Vérification de l'ID autorisé
        const allowedId = "1272243102584930305";
        if (message.author.id !== allowedId) {
            return message.reply("❌ Tu n’es pas autorisé à utiliser cette commande.").then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        }

        // Supprimer le message de commande
        await message.delete().catch(() => {});

        // Création de l'embed
        const embed = new EmbedBuilder()
            .setDescription( `# 🎃 Événement Halloween\n` +
                "Bienvenue dans **l'événement Halloween** ! 👻\n\n" +
                "Appuie sur le bouton ci-dessous pour **commencer ton aventure** et découvrir les surprises qui t’attendent..."
            )
            .setColor(COLOR)
            .setThumbnail("https://cdn.discordapp.com/attachments/1425882037654392843/1425882091710582885/Nouvelle_photo_de_profil_-_Halloween.png?ex=68e933ae&is=68e7e22e&hm=60626ca600eba753958086911ceee2b4eadaf4482d992024dc9a9871871a496c&")
            .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

        // Création du bouton "Commencer"
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("halloween_start")
                .setLabel("Commencer")
                .setEmoji("💫")
                .setStyle(ButtonStyle.Primary)
        );

        // Envoi de l'embed + bouton
        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
