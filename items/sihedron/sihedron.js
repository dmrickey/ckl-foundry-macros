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

const allVirtues = [
    charity,
    generosity,
    humility,
    kindness,
    love,
    temperance,
    zeal,
];

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
    [charity]: { name: 'Sihedron - Charity', value: '+4AC, Dimensional Anchor' },
    [generosity]: { name: 'Sihedron - Generosity', value: '+4 Attack Rolls, Beast Shape' },
    [humility]: { name: 'Sihedron - Humility', value: '+8 Skill Checks, Greater Invisibility' },
    [kindness]: { name: 'Sihedron - Kindness', value: '+4 Weapon Damage, Ice Storm' },
    [love]: { name: 'Sihedron - Love', value: '+2 Initiative, Charm Monster' },
    [temperance]: { name: 'Sihedron - Temperance', value: 'Fast Healing 10, Fear' },
    [zeal]: { name: 'Sihedron - Zeal', value: '+8 Concentration/Caster Level Checks, Dimension Door' },
}

const currentVirtue = item.getFlag('world', 'virtue');

const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const buttons = allVirtues
    .filter((virtue) => !opposed[currentVirtue]?.has(virtue))
    .filter((virtue) => !currentVirtue || virtue !== currentVirtue)
    .map((virtue) => ({ label: capitalizeFirstLetter(virtue), value: virtue }));
buttons.push({ label: 'cancel'});

// const inputs = [
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Charity - +4AC, Dimensional Anchor</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Generosity - +4 Attack Rolls, Beast Shape</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Humility - +8 Skill Checks, Greater Invisibility</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Kindness - +4 Weapon Damage, Ice Storm</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Love - +2 Initiative, Charm Monster</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Temperance - Fast Healing 10, Fear</div>' },
//     { type: 'info', label: '<div style="width: 100%; text-align: center">Zeal - +8 Concentration/Caster Level Checks, Dimension Door</div>' },
//     { type: 'info', label: '<hr style="width: 100%" />' },
// ];

let info = '<div style="display: grid; grid-template-columns: auto 1fr; grid-column-gap: 1rem; grid-row-gap: .5rem">';
allVirtues.forEach(virtue => {
    info += `<div>${ capitalizeFirstLetter(virtue) }</div><div>${ buffs[virtue].value }</div>`
});
info += '</div>';
inputs = [{ type: 'info', label: info }];

if (currentVirtue) {
    inputs.push({ type: 'info', label: `Currently active: ${ capitalizeFirstLetter(currentVirtue) }`});
}

if (opposed[currentVirtue]) {
    const opp = [...opposed[currentVirtue]];
    inputs.push({ type: 'info', label: `Currently opposed: ${opp[0]} and ${opp[1]}`});
}

const { buttons: choice } = await warpgate.menu({ buttons, inputs }, { title: 'Choose a point' });
console.log(choice);

// skip if chosen button is not a virtue (i.e. i it's canceled or given)
if (allVirtues.includes(choice)) {
    allVirtues.forEach((virtue) => {
        window.macroChain = [`Remove ${buffs[virtue].name} skipMessage`];
        game.macros.getName("applyBuff")?.execute({actor, token});
    });

    await item.setFlag('world', 'virtue', choice);

    window.macroChain = [`Apply ${buffs[choice].name}`];
    game.macros.getName("applyBuff")?.execute({actor, token});
}
