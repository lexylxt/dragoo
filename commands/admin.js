const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUserData, supabase } = require("../utils/userVars");

const COLOR = parseInt(process.env.COLOR, 16);
const ALLOWED_ID = "1272243102584930305"; // id admin autorisé

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Commande admin : ajouter/retirer des ressources à un utilisateur")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Ajouter une quantité")
                .addUserOption(o => o.setName("user").setDescription("Utilisateur cible").setRequired(true))
                .addStringOption(o => o
                    .setName("field")
                    .setDescription("Champ à modifier")
                    .setRequired(true)
                    .addChoices(
                        { name: "inventory.candy", value: "inventory.candy" },
                        { name: "inventory.book", value: "inventory.book" },
                        { name: "inventory.pumpkin", value: "inventory.pumpkin" },
                        { name: "inventory.candle", value: "inventory.candle" },
                        { name: "rank", value: "rank" },
                        { name: "level", value: "level" },
                        { name: "xp", value: "xp" },
                        { name: "msgs", value: "msgs" }
                    ))
                .addIntegerOption(o => o.setName("amount").setDescription("Montant à ajouter").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Retirer une quantité")
                .addUserOption(o => o.setName("user").setDescription("Utilisateur cible").setRequired(true))
                .addStringOption(o => o
                    .setName("field")
                    .setDescription("Champ à modifier")
                    .setRequired(true)
                    .addChoices(
                        { name: "inventory.candy", value: "inventory.candy" },
                        { name: "inventory.book", value: "inventory.book" },
                        { name: "inventory.pumpkin", value: "inventory.pumpkin" },
                        { name: "inventory.candle", value: "inventory.candle" },
                        { name: "rank", value: "rank" },
                        { name: "level", value: "level" },
                        { name: "xp", value: "xp" },
                        { name: "msgs", value: "msgs" }
                    ))
                .addIntegerOption(o => o.setName("amount").setDescription("Montant à retirer").setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.user.id !== ALLOWED_ID) {
            return interaction.reply({ content: "❌ Tu n’es pas autorisé à utiliser cette commande.", ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser("user", true);
        const field = interaction.options.getString("field", true);
        const amount = interaction.options.getInteger("amount", true);

        if (amount <= 0) {
            return interaction.reply({ content: "⚠️ Le montant doit être supérieur à 0.", ephemeral: true });
        }

        try {
            const userData = await getUserData(target.id);
            if (!userData) {
                return interaction.reply({ content: "❌ Utilisateur introuvable en base de données.", ephemeral: true });
            }

            let updateObj = {};
            // gère les champs inventory.xxx
            if (field.startsWith("inventory.")) {
                const key = field.split(".")[1]; // candy/book/pumpkin/candle
                if (!userData.inventory) userData.inventory = {};
                const current = Number(userData.inventory[key] || 0);
                let newVal = current + (sub === "add" ? amount : -amount);
                newVal = Math.max(0, newVal);
                userData.inventory[key] = newVal;
                updateObj.inventory = userData.inventory;
            } else {
                // champs top-level numériques
                const current = Number(userData[field] || 0);
                let newVal = current + (sub === "add" ? amount : -amount);
                newVal = Math.max(0, newVal);
                userData[field] = newVal;
                updateObj[field] = newVal;
            }

            // Mise à jour Supabase (n'envoie que les champs modifiés)
            const { error } = await supabase
                .from("users")
                .update(updateObj)
                .eq("userid", target.id);

            if (error) {
                console.error("❌ Erreur Supabase :", error);
                return interaction.reply({ content: "⚠️ Une erreur est survenue lors de la mise à jour.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(COLOR)
                .setTitle("🔧 Commande Admin")
                .setDescription(`${sub === "add" ? "✅ Ajouté" : "🗑️ Retiré"} **${amount}** à **${target.tag}**`)
                .addFields(
                    { name: "Champ", value: field, inline: true },
                    { name: "Nouveau montant", value: `${field.startsWith("inventory.") ? userData.inventory[field.split(".")[1]] : userData[field]}`, inline: true }
                )
                .setFooter({ text: "Commande admin • Dragoo", iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error("❌ Erreur commande /admin :", err);
            await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
        }
    }
};
