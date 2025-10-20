const { EmbedBuilder } = require("discord.js");
const { getUserData, supabase, HALLOWEEN_RANKS } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);
const LOG_CHANNEL_ID = "1427349131222978621"; // Salon de logs admin

module.exports = {
    customId: "rankUp",
    async execute(interaction, client) {
        try {
            const userId = interaction.customId.split("-")[1];

            // ✅ Sécurité : seul le bon user peut cliquer
            if (interaction.user.id !== userId) {
                return interaction.reply({
                    content: "🚫 Tu ne peux pas interagir avec ce message.",
                    ephemeral: true
                });
            }

            const userData = await getUserData(userId);
            if (!userData) {
                return interaction.reply({ content: "❌ Profil introuvable.", ephemeral: true });
            }

            const currentRank = HALLOWEEN_RANKS[userData.rank];
            const nextRank = HALLOWEEN_RANKS[userData.rank + 1];

            if (!nextRank) {
                return interaction.reply({
                    content: "🎉 Tu as déjà atteint le rang **maximal** !",
                    ephemeral: true
                });
            }

            const inv = userData.inventory || { candle: 0, pumpkin: 0, book: 0, candy: 0 };

            // --- Vérification des ressources requises
            const missingCandy = Math.max(0, nextRank.candyRequired - inv.candy);
            const missingCandles = Math.max(0, nextRank.itemsRequired.candles - (inv.candle || 0));
            const missingPumpkins = Math.max(0, nextRank.itemsRequired.pumpkin - (inv.pumpkin || 0));
            const missingBooks = Math.max(0, nextRank.itemsRequired.book - (inv.book || 0));

            if (missingCandy > 0 || missingCandles > 0 || missingPumpkins > 0 || missingBooks > 0) {
                return interaction.reply({
                    content: "❌ Tu n’as pas encore tous les objets ou bonbons nécessaires pour ce rang.",
                    ephemeral: true
                });
            }

            // ✅ Conditions remplies → mise à jour des ressources
            inv.candy -= nextRank.candyRequired;
            inv.candle -= nextRank.itemsRequired.candles;
            inv.pumpkin -= nextRank.itemsRequired.pumpkin;
            inv.book -= nextRank.itemsRequired.book;

            // Sécurité : pas de valeurs négatives
            for (const key in inv) {
                if (inv[key] < 0) inv[key] = 0;
            }

            // --- Sauvegarde en base
            const { error } = await supabase
                .from("users")
                .update({ rank: userData.rank + 1, inventory: inv })
                .eq("userid", userId);

            if (error) {
                console.error("❌ Erreur Supabase (rankUp):", error);
                return interaction.reply({
                    content: "❌ Erreur interne lors de la mise à jour.",
                    ephemeral: true
                });
            }

            // --- Gestion des rôles Discord
            try {
                const guild = interaction.guild;
                const member = await guild.members.fetch(userId);

                if (currentRank?.roleId) await member.roles.remove(currentRank.roleId).catch(() => {});
                if (nextRank?.roleId) await member.roles.add(nextRank.roleId).catch(() => {});
            } catch (roleErr) {
                console.error("⚠️ Erreur lors du changement de rôle :", roleErr);
            }

            // --- Message de confirmation
            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setDescription(`# Montée en rang réussie !\nFélicitations ${interaction.user} ! Tu passes du rang **${currentRank.name}** ➜ **${nextRank.name}** 🎉`)
                .addFields(
                    { name: "<:candy:1429877089154236466> Bonbons restants", value: `${inv.candy}`, inline: true },
                    { name: "<:Bougie_Halloween_x1:1429878415988625451> Bougies", value: `${inv.candle}`, inline: true },
                    { name: "<:Citrouille_halloween_x1:1429878827248779387> Citrouilles", value: `${inv.pumpkin}`, inline: true },
                    { name: "<:Grimoir_Halloween_x1:1429873244097347724>  Grimoires", value: `${inv.book}`, inline: true }
                )
                .setFooter({ text: "L'événement Halloween continue...", iconURL: client.user.displayAvatarURL() });

            await interaction.update({ embeds: [embed], components: [] });

            // --- Log dans le salon admin
            try {
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    await logChannel.send(
                        `🧾 **${interaction.user.username}** est passé du rang **${currentRank.name}** ➜ **${nextRank.name}** ` +
                        `(-${nextRank.candyRequired} <:candy:1429877089154236466>, -${nextRank.itemsRequired.candles || 0} <:Bougie_Halloween_x1:1429878415988625451>, ` +
                        `-${nextRank.itemsRequired.pumpkin || 0} <:Citrouille_halloween_x1:1429878827248779387>, -${nextRank.itemsRequired.book || 0} <:Grimoir_Halloween_x1:1429873244097347724>) ` +
                        `(\`${userId}\`)`
                    );
                }
            } catch (logErr) {
                console.error("⚠️ Erreur d’envoi du log de rang :", logErr);
            }

        } catch (error) {
            console.error("❌ Erreur bouton rankUp :", error);
            return interaction.reply({
                content: "❌ Une erreur est survenue lors de la montée en rang.",
                ephemeral: true
            });
        }
    }
};
