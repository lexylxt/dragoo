const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUserData, HALLOWEEN_RANKS, supabase } = require("../utils/userVars");

// Couleur de l'embed
const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Voir votre profil Halloween, stats et rank"),

    async execute(interaction, client) {
        try {
            // Récupérer les données utilisateur
            const userData = await getUserData(interaction.user.id);

            if (!userData) {
                return interaction.reply({
                    content: "❌ Vous n'avez pas de compte ! Commencez l'aventure avec le bouton Halloween.",
                    ephemeral: true
                });
            }

            // Récupérer pseudo serveur si disponible
            const member = interaction.guild.members.cache.get(interaction.user.id);
            const nickname = member?.nickname || interaction.user.username;

            const currentRank = HALLOWEEN_RANKS.find(r => r.rank === userData.rank);
            const rankRole = currentRank ? currentRank.roleId : "Aucun rang";

            // Créer l'embed avec stats
            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setDescription(`# Profil\nVoici votre profil, ${nickname}`)
                .addFields(
                    { name: "Rang", value: `<@&${rankRole}> (${userData.rank})`, inline: true },
                    { name: "Niveau", value: `${userData.level}`, inline: true },
                    { name: "XP", value: `${userData.xp}`, inline: true },
                    { name: "Bonbons", value: `${userData.inventory.candy}`, inline: true },
                    { name: "Messages", value: `${userData.msgs}`, inline: true }
                )
                .setFooter({ text: "Powered by Dragoo", iconURL: client.user.displayAvatarURL() });

            // Bouton pour rank up si possible
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`viewUserRank-${interaction.user.id}`)
                    .setLabel("Mon rang")
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [embed], components: [row]});

        } catch (error) {
            console.error("❌ Erreur lors de la récupération du profil :", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Impossible de récupérer votre profil pour le moment.",
                    ephemeral: true
                });
            }
        }
    }
};
