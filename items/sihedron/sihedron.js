// This requires that Warpgate be installed to show the menu
// This requires that Noon's `applyBuff` macro be in your world
// This requires that you have configured Buffs in your world for this macro to swap between (see `buffs` variable below for expected names)

const charity = 'charity';
const generosity = 'generosity';
const humility = 'humility';
const kindness = 'kindness';
const love = 'love';
const temperance = 'temperance';
const zeal = 'zeal';

const opposed = {
    [charity]: new Set([kindness, temperance]),
    [generosity]: new Set([humility, love]),
    [humility]: new Set([generosity, zeal]),
    [kindness]: new Set([charity, zeal]),
    [love]: new Set([generosity, temperance]),
    [temperance]: new Set([charity, love]),
    [zeal]: new Set([humility, kindness]),
}

const buffs = {
    [charity]: 'Sihedron - Charity',
    [generosity]: 'Sihedron - Generosity',
    [humility]: 'Sihedron - Humility',
    [kindness]: 'Sihedron - Kindness',
    [love]: 'Sihedron - Love',
    [temperance]: 'Sihedron - Temperance',
    [zeal]: 'Sihedron - Zeal',
}

var current = item.getFlag('world', 'virtue');

const buttons = Object.keys(opposed)
    .filter((x) => !opposed[current]?.has(x))
    .filter((x) => !current || x !== current)
    .map((x) => ({ label: x, value: x }));
buttons.push({ label: 'cancel'});

const inputs = [
    { type: 'info', label: '<div style="width: 100%; text-align: center">Charity - +4AC, Dimensional Anchor</div>' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Generosity - +4 Attack Rolls, Beast Shape</div' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Humility - +8 Skill Checks, Greater Invisibility</div' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Kindness - +4 Weapon Damage, Ice Storm</div' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Love - +2 Initiative, Charm Monster</div' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Temperance - Fast Healing 10, Fear</div' },
    { type: 'info', label: '<div style="width: 100%; text-align: center">Zeal - +8 Concentration/Caster Level Checks, Dimension Door</div' },
    { type: 'info', label: '<hr style="width: 100%" />' },
];
if (current) {
    inputs.push({ type: 'info', label: `Currently active: ${ current }`});
}

if (opposed[current]) {
    const opp = [...opposed[current]];
    inputs.push({ type: 'info', label: `Currently opposed: ${opp[0]} and ${opp[1]}`});
}

const { buttons: choice } = await warpgate.menu({ buttons, inputs }, { title: 'Choose a point' });
console.log(choice);

// just a safety check to make sure it's a valid choice..don't actually care about `opposed`
if (opposed[choice]) {
    await item.setFlag('world', 'virtue', choice);

    Object.keys(buffs).forEach((buffKey) => {
        window.macroChain = [`Remove ${buffs[buffKey]} skipMessage`];
        game.macros.getName("applyBuff")?.execute({actor, token});
    });

    window.macroChain = [`Apply ${buffs[choice]}`];
    game.macros.getName("applyBuff")?.execute({actor, token});
}
