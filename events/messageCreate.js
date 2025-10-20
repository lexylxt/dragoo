module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (message.author.bot) return;
        const content = message.content.trim().toLowerCase();

        // 1️⃣ Always Reply : toutes les commandes avec always:true
        for (const [_, command] of client.tcommands) {
            if (command.always) {
                try {
                    await command.execute(message, [], client);
                } catch (error) {
                    console.error(`Erreur dans alwaysReply :`, error);
                }
            }
        }

        // 2️⃣ Commandes avec ou sans préfixe
        for (const [name, command] of client.tcommands) {
            if (!command.name || command.always) continue; // skip commandes sans name
            const prefix = command.prefix ?? "!";
            const fullTrigger = `${prefix}${name}`;

            if (content.startsWith(fullTrigger.toLowerCase())) {
                const args = content.slice(fullTrigger.length).trim().split(/ +/);
                try {
                    await command.execute(message, args, client);
                } catch (error) {
                    console.error(`Erreur commande ${name}:`, error);
                    await message.reply("❌ Une erreur est survenue dans cette commande.");
                }
                return; // stop après exécution
            }
        }
    }
};
