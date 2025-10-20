const { initUser } = require("../utils/userVars");

const LOG_CHANNEL_ID = "1425886559403511832"; // salon de log

module.exports = {
    customId: "halloween_start",
    async execute(interaction, client) {
        try {
            // Message de chargement éphémère
            await interaction.reply({
                content: "<a:loading:1425551135716020327>・Initialisation de votre compte évènement...",
                ephemeral: true
            });

            // Initialiser l'utilisateur et savoir si le compte vient d'être créé
            const { data: userData, created } = await initUser(interaction.user.id);

            // Confirmer la création ou indiquer que le compte existait déjà
            if (created) {
                await interaction.editReply({
                    content: `✅・Compte créé avec succès !`
                });

                // Log simple dans le salon
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    logChannel.send(`✅・Compte de <@${interaction.user.id}> créé avec succès.`);
                }
            } else {
                await interaction.editReply({
                    content: `⚠️・Vous avez déjà un compte.`
                });

                // Log simple dans le salon
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    logChannel.send(`⚠️・Tentative de recréation du compte pour <@${interaction.user.id}>.`);
                }
            }

        } catch (error) {
            console.error("❌・Erreur initialisation utilisateur :", error);

            // Message éphémère à l'utilisateur
            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌・Impossible d'initialiser le compte.",
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: "❌・Impossible d'initialiser le compte."
                });
            }

            // Log simple dans le salon même en cas d'erreur
            try {
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel) {
                    logChannel.send(`❌・Erreur lors de la création du compte pour <@${interaction.user.id}>.`);
                }
            } catch (_) {}
        }
    }
};
