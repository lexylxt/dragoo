const fs = require("fs");
const path = require("path");
const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            // --- 1️⃣ Slash Commands ---
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            }

            // --- 2️⃣ Buttons ---
            else if (interaction.isButton()) {
                const buttonsPath = path.join(__dirname, "..", "buttons");
                const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith(".js"));
                const button = buttonFiles
                    .map(f => require(path.join(buttonsPath, f)))
                    .find(b => interaction.customId.startsWith(b.customId));


                if (button) await button.execute(interaction, client);
                else if (!interaction.replied) {
                    await interaction.reply({ content: "⚠️ Bouton inconnu.", ephemeral: true });
                }
            }

            // --- 3️⃣ Select menus ---
            else if (interaction.isStringSelectMenu()) {
                const selectsPath = path.join(__dirname, "..", "selects");
                const selectFiles = fs.readdirSync(selectsPath).filter(f => f.endsWith(".js"));
                const select = selectFiles
                    .map(f => require(path.join(selectsPath, f)))
                    .find(s => interaction.customId.startsWith(s.customId)); // ✅ comparaison dynamique

                if (select) await select.execute(interaction, client);
                else if (!interaction.replied) {
                    await interaction.reply({ content: "⚠️ Select menu inconnu.", ephemeral: true });
                }
            }

            // --- 4️⃣ Modals ---
            else if (interaction.isModalSubmit()) {
                const modalsPath = path.join(__dirname, "..", "modals");
                const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith(".js"));
                const modal = modalFiles
                    .map(f => require(path.join(modalsPath, f)))
                    .find(m => interaction.customId.startsWith(m.customId));


                if (modal) await modal.execute(interaction, client);
                else if (!interaction.replied) {
                    await interaction.reply({ content: "⚠️ Modal inconnu.", ephemeral: true });
                }
            }

            // --- 5️⃣ Autres types ---
            else {
                console.warn("⚠️ Interaction non gérée :", interaction.type);
            }

        } catch (error) {
            console.error("❌ Erreur globale interactionCreate :", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Une erreur inattendue est survenue.", ephemeral: true });
            }
        }
    },
};
