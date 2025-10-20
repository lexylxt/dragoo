const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

// Charger toutes les commandes valides
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);

        if (command?.data && typeof command.data.toJSON === "function") {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[⚠️] Commande ignorée (invalide ou incomplète) : ${file}`);
        }
    } catch (err) {
        console.log(`[⚠️] Erreur lors du chargement de ${file} : ${err.message}`);
    }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log(`Déploiement de ${commands.length} commande(s) slash...`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log("✅ Commandes déployées avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors du déploiement :", error);
    }
})();
