const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true, // s’exécute une seule fois
    execute(client) {
        console.log(`✅ Ready ! Connecté en tant que ${client.user.tag}`);
    },
};
