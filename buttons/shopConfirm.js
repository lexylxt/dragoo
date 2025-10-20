const { EmbedBuilder } = require("discord.js");
const { getUserData, supabase } = require("../utils/userVars");
const { getItemPrice, formatItemName } = require("../utils/shopUtils");

const COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    customId: "shopConfirm",
    async execute(interaction, client) {
        console.log("=== shopConfirm triggered ===");
        console.log("customId:", interaction.customId);

        try {
            const [, object, amountStr, userId] = interaction.customId.split("-");
            const amount = parseInt(amountStr);

            console.log("Parsed:", { object, amount, userId });

            if (interaction.user.id !== userId) {
                console.log("Unauthorized click by", interaction.user.id, "expected", userId);
                return interaction.reply({ content: "🚫 Tu ne peux pas interagir avec cet embed.", ephemeral: true });
            }

            const userData = await getUserData(userId);
            console.log("Fetched userData:", JSON.stringify(userData));

            if (!userData) {
                console.warn("No userData found for", userId);
                return interaction.reply({ content: "❌ Compte introuvable.", ephemeral: true });
            }

            const price = getItemPrice(object, amount);
            const itemName = formatItemName(object);

            console.log("Computed price:", price, "itemName:", itemName);

            let embed;

            const dbItemKey = object === "pumpkin" ? "pumpkin" : object;
            userData.inventory = userData.inventory || {};
            userData.inventory.candy = Number(userData.inventory.candy || 0);
            userData.inventory[dbItemKey] = Number(userData.inventory[dbItemKey] || 0);

            console.log("Inventory before purchase:", JSON.stringify(userData.inventory));

            if (userData.inventory.candy < price) {
                console.log("Not enough candy:", userData.inventory.candy, "<", price);
                embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Pas assez de bonbons ! Il vous faut **${price} bonbons**.`);
                await interaction.update({ embeds: [embed], components: [] });
                return;
            }

            // Calcul des quantités réelles par lot
            let realQuantity = amount;
            if (object === "candle") realQuantity = amount * 10;
            else if (object === "pumpkin") realQuantity = amount * 3;

            // Mise à jour de l’inventaire
            userData.inventory.candy -= price;
            userData.inventory[dbItemKey] += realQuantity;

            console.log("Inventory after local update (to be saved):", JSON.stringify(userData.inventory));
            // incrémente le compteur d'achats et enregistre dans la base
            userData.purchases = Number(userData.purchases || 0) + 1;
            console.log("Purchases incremented (local):", userData.purchases);

            const purchasesRes = await supabase
                .from("users")
                .update({ purchases: userData.purchases })
                .eq("userid", userId);

            console.log("Supabase purchases update response:", purchasesRes);

            if (purchasesRes.error) {
                console.error("Supabase purchases update error:", purchasesRes.error);
                embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("❌ Erreur lors de la mise à jour des achats. Réessaie plus tard.");
                await interaction.update({ embeds: [embed], components: [] });
                return;
            }
            const res = await supabase
                .from("users")
                .update({ inventory: userData.inventory })
                .eq("userid", userId);

            console.log("Supabase update response:", res);

            if (res.error) {
                console.error("Supabase returned an error:", res.error);
                embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("❌ Erreur lors de la mise à jour du compte. Réessaie plus tard.");
                await interaction.update({ embeds: [embed], components: [] });
                return;
            }

            // ✅ Confirmation visuelle pour l’utilisateur
            embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`✅ Achat confirmé : **${realQuantity} ${itemName}**\nCoût : **${price} bonbons**\n\nRedirection vers la boutique dans 3 secondes...`);

            await interaction.update({ embeds: [embed], components: [] });

            // 🧾 Envoi du log dans le salon d’administration
            try {
                const logChannelId = "1427349131222978621";
                const logChannel = await client.channels.fetch(logChannelId);

                if (logChannel) {
                    await logChannel.send({
                        content: `🛍️ **${interaction.user.username}** a acheté **${realQuantity} ${itemName}** pour **${price} bonbons** (\`${userId}\`)`
                    });
                } else {
                    console.warn("⚠️ Salon de logs introuvable :", logChannelId);
                }
            } catch (logErr) {
                console.error("❌ Erreur lors de l’envoi du log :", logErr);
            }

            // Retour automatique à la boutique
            setTimeout(async () => {
                try {
                    const shopMain = require("./shopMain");
                    await shopMain.showMain(interaction, client, userId);
                } catch (e) {
                    console.error("Error redirecting to shopMain:", e);
                }
            }, 3000);

        } catch (err) {
            console.error("Unhandled error in shopConfirm:", err);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Une erreur inattendue est survenue.", ephemeral: true });
            }
        }
    }
};
