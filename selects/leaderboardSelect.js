const { EmbedBuilder } = require("discord.js");
const { supabase, HALLOWEEN_RANKS } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "leaderboardSelect",
    async execute(interaction) {
        const [ , userId ] = interaction.customId.split("-");

        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: "🚫 Tu ne peux pas interagir avec ce menu.",
                ephemeral: true
            });
        }

        const selected = interaction.values[0];

        // 📥 Récupération de toutes les données
        const { data: users, error } = await supabase
            .from("users")
            .select("userid, candy, level, rank");

        if (error || !users) {
            console.error("Erreur Supabase leaderboard:", error);
            return interaction.reply({
                content: "❌ Impossible de charger le classement.",
                ephemeral: true
            });
        }

        // 🔢 Tri selon le classement choisi
        let sorted;
        if (selected === "candy") {
            sorted = users.sort((a, b) => parseInt(b.candy || 0) - parseInt(a.candy || 0));
        } else if (selected === "level") {
            sorted = users.sort((a, b) => (b.level || 0) - (a.level || 0));
        } else if (selected === "rank") {
            sorted = users.sort((a, b) => (b.rank || 0) - (a.rank || 0));
        }

        // 🔝 Top 10
        const top10 = sorted.slice(0, 10);
        const userIndex = sorted.findIndex(u => u.userid === interaction.user.id);
        const userRank = userIndex + 1;
        const userData = sorted[userIndex];

        const lines = await Promise.all(top10.map(async (u, i) => {
            const member = await interaction.guild.members.fetch(u.userid).catch(() => null);
            const name = member?.nickname || member?.user.username || `Utilisateur inconnu`;

            let value;
            if (selected === "candy") value = `${u.candy || 0} <:candy:1429877089154236466>`;
            if (selected === "level") value = `Niveau ${u.level || 0} 🏆`;
            if (selected === "rank") {
                const rankName = HALLOWEEN_RANKS[u.rank]?.name || "Citrouille";
                value = rankName;
            }

            return `\`#${i + 1}\` ${name} \n╰ ${value}`;
        }));

        let desc = lines.join("\n");

        if (userRank > 10) {
            let value;
            if (selected === "candy") value = `${userData.candy || 0} <:candy:1429877089154236466>`;
            if (selected === "level") value = `Niveau ${userData.level || 0} 🏆`;
            if (selected === "rank") {
                const rankName = HALLOWEEN_RANKS[userData.rank]?.name || "Citrouille";
                value = rankName;
            }
            desc += `\n\n\`#${userRank}\` ${interaction.user.username} \n╰ ${value}`;
        }

        const titles = {
            candy: "# 🏆 Classement des Bonbons",
            level: "# 🏆 Classement des Niveaux",
            rank: "# 🏆 Classement des Rangs"
        };

        const embed = new EmbedBuilder()
            .setColor(COLOR)
            .setDescription(titles[selected] + `\n` + desc || "Aucune donnée disponible...");

        // ✅ On met à jour uniquement l’embed, le menu reste le même
        await interaction.update({ embeds: [embed], components: interaction.message.components });
    }
};
