const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const token = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Charger les commandes
client.commands = new Collection();
client.tcommands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[⚠️] La commande ${file} est invalide (manque data ou execute).`);
    }
}

const tcommandFiles = fs.readdirSync("./tcommands").filter(file => file.endsWith(".js"));
for (const file of tcommandFiles) {
    const command = require(`./tcommands/${file}`);
    if ("name" in command && "execute" in command) {
        client.tcommands.set(command.name, command);
    } else {
        console.log(`[⚠️] La commande prefix ${file} est invalide.`);
    }
}


// Charger les événements
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(token);
