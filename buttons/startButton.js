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

            // Constante pour le rôle à ajouter si le compte est créé
            const EVENT_ROLE_ID = "1428073428640075867";

            // Confirmer la création ou indiquer que le compte existait déjà
            if (created) {
                await interaction.editReply({
                    content: `✅・Compte créé avec succès !`
                });

                // Log simple dans le salon
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
                if (logChannel) {
                    logChannel.send(`✅・Compte de <@${interaction.user.id}> créé avec succès.`);
                }

                // Ajouter le rôle à l'utilisateur (si interaction dans une guild)
                try {
                    if (interaction.guild) {
                        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                        if (member) {
                            await member.roles.add(EVENT_ROLE_ID);
                            if (logChannel) {
                                logChannel.send(`✅・Rôle ajouté à <@${interaction.user.id}>.`);
                            }
                        } else {
                            if (logChannel) {
                                logChannel.send(`⚠️・Impossible de récupérer le membre ${interaction.user.id} pour ajouter le rôle.`);
                            }
                        }
                    } else {
                        if (logChannel) {
                            logChannel.send(`⚠️・Interaction hors-guild pour <@${interaction.user.id}>, rôle non ajouté.`);
                        }
                    }
                } catch (roleError) {
                    console.error("❌・Erreur ajout rôle :", roleError);
                    if (logChannel) {
                        logChannel.send(`❌・Erreur lors de l'ajout du rôle à <@${interaction.user.id}> : ${roleError.message}`);
                    }
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
