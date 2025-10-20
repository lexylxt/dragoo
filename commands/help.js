const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

COLOR = parseInt(process.env.COLOR, 16);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide et la liste des commandes'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Aide - Commandes et salons')
            .setColor(COLOR)
            .setDescription('Voici un petit message d\'aide pour vous guider à travers les commandes de <@1422282077604155493> et les salons.')
            .addFields(
                {
                    name: 'Liste des commandes',
                    value:
                        '• **/shop** — Acheter ou vendre des objets.\n' +
                        '• **/inventory** — Consulter votre inventaire (bonbons, objets, etc.).\n' +
                        '• **/profile** — Afficher les informations de votre profil.\n' +
                        '• **/level** — Voir votre niveau.',
                },
                {
                    name: 'Liste des salons',
                    value:
                        '• Participez au Giveway dans le salon <#1132684735567630417>.\n' +
                        '• Retrouvez les infos sur l\'événement dans <#1429864156324167821>.',
                },
                {
                    name: 'Remerciements',
                    value: '• <@700696678919045122> et <@1115313618184065135> pour les emojis et l\'organisation.\n• <@1272243102584930305> pour le bot et l\'organisation.\n• <@671395583088656404> pour le script de l\'évènement et l\'organisation.\n\nBon évènement !',
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};