const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');

const { HERO_NAME_TO_BLOONOLOGY_LINK } = require('../helpers/heroes');
const shop = ['Shooty Turret', 'Stack of Old Nails', 'Creepy Idol', 'Jar of Pickles', 'Rare Quincy Action Figure', 'See Invisibility Potion', 'Tube of Amaz-o-Glue', 'Sharpening Stone', 'Worn Hero\'s Cape', 'Blade Trap', 'Bottle of \'Gerry\'s Fire\' Hot Sauce', 'Fertilizer', 'Pet Bunny', 'Rejuv Potion', 'Genie Bottle', 'Paragon Power Totem'];
const spellbook = ['Spear', 'Aggression', 'Malevolence', 'Storm', 'Repel', 'Echo', 'Haste', 'Trample', 'Frostbound', 'Ember', 'Ancestral Might', 'Overload', 'Nourishment', 'Soul Barrier', 'Vision', 'Recovery'];

const axios = require('axios');
const { footer } = require('../aliases/misc.json');
const { red, cyber } = require('../jsons/colors.json');

const heroOption = new SlashCommandStringOption()
    .setName('hero')
    .setDescription('The hero you are finding information for')
    .setRequired(true);
Object.keys(HERO_NAME_TO_BLOONOLOGY_LINK).forEach((hero) => {
    heroOption.addChoices({ name: Aliases.toIndexNormalForm(hero), value: hero });
});

const itemOptions = new SlashCommandStringOption()
    .setName('item')
    .setDescription('Geraldo\'s Shop Item that you are looking for information on')
    .setRequired(true);
    shop.forEach(item => {itemOptions.addChoices({ name: Aliases.toIndexNormalForm(item), value: item });
});

const spellOptions = new SlashCommandStringOption()
    .setName('spell')
    .setDescription('Corvus\'s spell that you are looking for information on')
    .setRequired(true);
    spellbook.forEach(spell => {spellOptions.addChoices({ name: Aliases.toIndexNormalForm(spell), value: spell });
});

const builder = new SlashCommandBuilder()
    .setName('hero')
    .setDescription('hi :3')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('heros')
            .setDescription('Find information for each hero')
            .addStringOption(heroOption)
            .addIntegerOption((option) =>
                option.setName('hero_lvl').setDescription('The hero level that you want the information for').setRequired(false)
            )
    ).addSubcommand((subcommand) =>
        subcommand
            .setName('geraldo')
            .setDescription('Find Information on Geraldo\'s shop items')
            .addStringOption(itemOptions)
            .addIntegerOption((option) =>
                option.setName('hero_lvl').setDescription('The Geraldo level that you want the information for').setRequired(true)
            )
    ).addSubcommand((subcommand) =>
        subcommand
            .setName('corvus')
            .setDescription('Find Information on Corvus\' spells')
            .addStringOption(spellOptions)
            .addIntegerOption((option) =>
                option.setName('hero_lvl').setDescription('The Corvus level that you want the information for').setRequired(true)
            )
    );

function validateInput(interaction) {
    const heroLevel = interaction.options.getInteger('hero_lvl');
    if (heroLevel && (heroLevel > 20 || heroLevel < 1))
        return `Invalid hero level \`${heroLevel}\` provided!\nHero level must be from \`1\` to \`20\` (inclusive)`;
}

async function embedBloonology(heroName, level, heroItem, heroSpell, interaction) {
    const link = HERO_NAME_TO_BLOONOLOGY_LINK[heroName];
    let res = '';

    try {
        res = await axios.get(link);
    } catch {
        return new Discord.EmbedBuilder().setColor(red).setTitle('Something went wrong while fetching the data');
    }
    
    const body = res.data;
    const cleaned = body.replace(/\t/g, '').replace(/\r/g, '').trim();
    const sentences = cleaned.split(/\n\n/);

    const desc = level ? sentences[level - 1] : sentences[sentences.length - 1].trim();
    
    let descWithoutLevel;
    if(interaction.options.getSubcommand() === 'geraldo') descWithoutLevel = desc.split('\n').slice(5);
    else if(interaction.options.getSubcommand() === 'corvus') descWithoutLevel = desc.split('\n').slice(10);
    else descWithoutLevel = desc.split('\n').slice(1).join('\n');

    const descWithoutChanges = descWithoutLevel.slice(0, descWithoutLevel.indexOf(' '));
    const descWithoutAbilities = descWithoutChanges.slice(0,descWithoutChanges.indexOf('# Activated Abilities'));


    if(descWithoutChanges.join('\n').includes(heroItem) == false){
        return new Discord.EmbedBuilder().setColor(red).setTitle('Geraldo does not have this item at the current level, please try again.');
    }

    if(descWithoutChanges.join('\n').includes(heroSpell) == false){
        return new Discord.EmbedBuilder().setColor(red).setTitle('Corvus does not have this spell at the current level, please try again.');
    }


    //geraldo
    let item;
    let a = descWithoutChanges.indexOf("## " + shop[shop.indexOf(heroItem)+1]);
    let b = descWithoutChanges.indexOf("## " + heroItem);
    a === -1 ? item = descWithoutChanges.slice(b).join('\n') : item = descWithoutChanges.slice(b, a).join('\n');
    
    //corvus
    let spells = [], spell;

    level == 1 ? spells = spellbook.slice(0,1).concat(spellbook.slice(4,5)).concat(spellbook.slice(12,13))
    : (level > 1 && level < 4) ? spells = spellbook.slice(0,1).concat(spellbook.slice(4,7)).concat(spellbook.slice(12,13))
    : level == 4 ? spells = spellbook.slice(0,1).concat(spellbook.slice(4,8)).concat(spellbook.slice(12,14))
    : level == 5 ? spells = spellbook.slice(0,2).concat(spellbook.slice(4,9)).concat(spellbook.slice(12,15))
    : level == 6 ? spells = spellbook.slice(0,2).concat(spellbook.slice(4,10)).concat(spellbook.slice(12,15))
    : level == 7 ? spells = spellbook.slice(0,3).concat(spellbook.slice(4,11)).concat(spellbook.slice(12,15))
    : (level > 7 && level < 10) ? spells = spellbook.slice(0,11).concat(spellbook.slice(12,15))
    : (level > 9 && level < 13) ? spells = spellbook.slice(0,11).concat(spellbook.slice(12,16))
    : (level > 12 && level < 21) ? spells = spellbook : spells = 'hi :)';
    
    let c = descWithoutChanges.indexOf("## " + spells[spells.indexOf(heroSpell)+1]);
    let d = descWithoutChanges.indexOf("## " + heroSpell);
    let e = descWithoutAbilities.indexOf("## " + spells[spells.indexOf(heroSpell)+1]);
    let f = descWithoutAbilities.indexOf("## " + heroSpell);

    if(level < 3){
        c === -1 ? spell = descWithoutChanges.slice(d).join('\n') : spell = descWithoutChanges.slice(d, c).join('\n');
    } else {
        e === -1 ? spell = descWithoutAbilities.slice(f).join('\n') : spell = descWithoutAbilities.slice(f, e).join('\n');
    }



    if (typeof desc != 'string') {
        return new Discord.EmbedBuilder().setColor(red).setTitle('The bloonology datapiece is missing');
    }

    let title;
    if(interaction.options.getSubcommand() === 'geraldo') title = `${Aliases.toIndexNormalForm(heroItem)} (Level-${level})`;
    else if(interaction.options.getSubcommand() === 'corvus') title = `${Aliases.toIndexNormalForm(heroSpell)} (Level-${level})`
    else level ? `${Aliases.toIndexNormalForm(heroName)} (Level-${level})` : `${Aliases.toIndexNormalForm(heroName)} (All Levels)`;

    // overflow
    // TODO: Check for total chars > 6000
    let fields = [];
    let descForDescription = '';
    if (descWithoutLevel.length > 4096) {
        const descLines = descWithoutLevel.split('\n');
        descLines.forEach((line) => {
            // add to description until char limit is reached
            if (descForDescription.length + line.length < 4096) 
                return descForDescription += line + '\n';
            
            // (assuming fields array is not empty) add to value of latest field
            if (fields[0] && fields[fields.length - 1].value.length + line.length < 1024)
                return fields[fields.length - 1].value += line + '\n';

            fields.push({ name: '\u200b', value: line + '\n' });
        });
    } else {
        if(interaction.options.getSubcommand() === 'geraldo') descForDescription = item;
        else if(interaction.options.getSubcommand() === 'corvus') descForDescription = spell;
        else descForDescription = descWithoutLevel;
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle(title)
        .setDescription(descForDescription)
        .addFields(fields)
        .setColor(cyber)
        .setFooter({ text: footer });
    return embed;
}

async function execute(interaction) {
    const validationFailure = validateInput(interaction);
    if (validationFailure) {
        return await interaction.reply({
            content: validationFailure,
            ephemeral: true
        });
    }

    let heroName = interaction.options.getString('hero');
    if(interaction.options.getSubcommand() === 'geraldo') heroName = 'geraldo';
    if(interaction.options.getSubcommand() === 'corvus') heroName = 'corvus';
    const heroLevel = interaction.options.getInteger('hero_lvl');
    const heroItem = interaction.options.getString('item');
    const heroSpell = interaction.options.getString('spell');

    const embed = await embedBloonology(heroName, heroLevel, heroItem, heroSpell, interaction);

    return await interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: builder,
    execute
};
