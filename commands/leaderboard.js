const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { supabase, HALLOWEEN_RANKS } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Affiche le classement de l’événement Halloween"),

    async execute(interaction) {
        await interaction.deferReply();

        // 📥 Récupérer toutes les données
        const { data: users, error } = await supabase
            .from("users")
            .select("userid, candy, level, rank");

        if (error || !users) {
            console.error("Erreur Supabase leaderboard:", error);
            return interaction.editReply({ content: "❌ Impossible de charger le classement.", ephemeral: true });
        }

        // 🔢 Tri initial par bonbons
        const sorted = users.sort((a, b) => parseInt(b.candy || 0) - parseInt(a.candy || 0));

        // 🔝 Top 10
        const top10 = sorted.slice(0, 10);

        // 🧍 Position de l’utilisateur
        const userIndex = sorted.findIndex(u => u.userid === interaction.user.id);
        const userRank = userIndex + 1;
        const userData = sorted[userIndex];

        // 🏆 Créer le texte du top 10
        const lines = await Promise.all(top10.map(async (u, i) => {
            const member = await interaction.guild.members.fetch(u.userid).catch(() => null);

            // ✅ nickname est sur member, sinon fallback sur le username global
            const name = member?.nickname || member?.user.username || `Utilisateur inconnu`;

            return `\`#${i + 1}\` ${name} \n╰ ${u.candy || 0} <:candy:1429877089154236466>`;
        }));


        let desc = lines.join("\n");
        if (userRank > 10) {
            desc += `\n\n\`#${userRank}\` ${interaction.user.username} \n╰ ${userData?.candy || 0} <:candy:1429877089154236466>`;
        }

        const embed = new EmbedBuilder()
            .setColor(COLOR)
            .setDescription("# 🏆 Classement des Bonbons \n" + desc || "Aucune donnée disponible...");

        // 🔽 Menu de sélection
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`leaderboardSelect-${interaction.user.id}`)
            .setPlaceholder("Choisis un classement à afficher 👇")
            .addOptions([
                { label: "Bonbons", value: "candy", emoji: "<:candy:1429877089154236466>", default: true },
                { label: "Niveaux", value: "level", emoji: "🏆" },
                { label: "Rangs", value: "rank", emoji: "🎖️" },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
