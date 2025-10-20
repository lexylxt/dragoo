const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUserData } = require("../utils/userVars");

// Fonction pour calculer l'XP nécessaire pour le prochain niveau
function xpForNextLevel(level) {
    return 100 + level * 20; // Exemple : 100 XP pour le niveau 1, +20 par niveau
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Affiche votre niveau et vos XP actuels"),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const userData = await getUserData(userId);

            if (!userData) {
                return interaction.reply({
                    content: "❌ Impossible de trouver votre profil.",
                    ephemeral: true
                });
            }

            const level = userData.level || 0;
            const xp = userData.xp || 0;
            const xpNext = xpForNextLevel(level);
            const xpRemaining = Math.max(0, xpNext - xp);

            const percent = xpNext > 0 ? Math.min(100, Math.floor((xp / xpNext) * 100)) : 0;

            // Barre de 10 emojis : position 1 -> type1, positions 2-9 -> type2, position 10 -> type3
            const segments = [
                { full: "<:bp1:1429870106456101058>", empty: "<:bv1:1429870124701188168>" }, // 1
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 2
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 3
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 4
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 5
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 6
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 7
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 8
                { full: "<:bp2:1429870115192574063>", empty: "<:bv2:1429870117868540024>" }, // 9
                { full: "<:bp3:1429870111094870177>", empty: "<:bv3:1429870119609307208>" }  // 10
            ];

            // 0% => 0 remplis, >0 => arrondi vers le haut sur les 10 segments
            const filledCount = percent === 0 ? 0 : Math.ceil((percent / 100) * segments.length);
            const progressBar = segments
                .map((s, i) => (i < filledCount ? s.full : s.empty))
                .join(""); // sans espaces entre les emojis

            const embed = new EmbedBuilder()
            .setDescription(`# Votre Niveau\n\nVoici vos informations de niveau et d'expérience.`)
                .setColor(parseInt(process.env.COLOR, 16))
                .addFields(
                    { name: "Niveau", value: `${level}`, inline: true },
                    { name: "XP actuelle", value: `${xp} / ${xpNext}`, inline: true },
                    { name: "XP pour le prochain niveau", value: `${xpRemaining}`, inline: true },
                    { name: "Progression", value: `**${percent}%・**${progressBar}`, inline: false }
                )
                .setFooter({ text: "Powered by Dragoo", iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error("❌ Erreur commande /level :", err);
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de la récupération du niveau.",
                ephemeral: true
            });
        }
    }
};
