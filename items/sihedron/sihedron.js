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

const buffs = {
    [charity]: { name: 'Sihedron - Charity', value: '+4AC, Dimensional Anchor', opposed: new Set([kindness, temperance]) },
    [generosity]: { name: 'Sihedron - Generosity', value: '+4 Attack Rolls, Beast Shape', opposed: new Set([humility, love]) },
    [humility]: { name: 'Sihedron - Humility', value: '+8 Skill Checks, Greater Invisibility', opposed: new Set([generosity, zeal]) },
    [kindness]: { name: 'Sihedron - Kindness', value: '+4 Weapon Damage, Ice Storm', opposed: new Set([charity, zeal]) },
    [love]: { name: 'Sihedron - Love', value: '+2 Initiative, Charm Monster', opposed: new Set([generosity, temperance]) },
    [temperance]: { name: 'Sihedron - Temperance', value: 'Fast Healing 10, Fear', opposed: new Set([charity, love]) },
    [zeal]: { name: 'Sihedron - Zeal', value: '+8 Concentration/Caster Level Checks, Dimension Door', opposed: new Set([humility, kindness]) },
}

const currentVirtue = item.getFlag('world', 'virtue');

const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const buttons = allVirtues
    .filter((virtue) => !buffs.opposed[currentVirtue]?.has(virtue))
    .filter((virtue) => !currentVirtue || virtue !== currentVirtue)
    .map((virtue) => ({ label: capitalizeFirstLetter(virtue), value: virtue }));
buttons.push({ label: 'cancel'});

let info = '<div style="display: grid; grid-template-columns: auto 1fr; grid-column-gap: 1rem; grid-row-gap: .5rem">';
allVirtues.forEach(virtue => {
    info += `<div>${ capitalizeFirstLetter(virtue) }</div><div>${ buffs[virtue].value }</div>`
});
info += '</div>';
inputs = [{ type: 'info', label: info }];

if (currentVirtue) {
    inputs.push({ type: 'info', label: `Currently active: ${ capitalizeFirstLetter(currentVirtue) }`});
}

if (buffs[currentVirtue]?.opposed) {
    const opp = [...buffs[currentVirtue].opposed];
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
