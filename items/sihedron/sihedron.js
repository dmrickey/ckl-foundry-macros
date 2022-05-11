// This requires that Warpgate be installed to show the menu
// This requires that Noon's `applyBuff` macro be in your world
// This requires that you have configured Buffs in your world for this macro to swap between (see `buffs` variable below for expected names)

// goes in `On Use` and `On Equip` advanced script calls

const charity = 'charity';
const generosity = 'generosity';
const humility = 'humility';
const kindness = 'kindness';
const love = 'love';
const temperance = 'temperance';
const zeal = 'zeal';

const buffs = {
    [charity]: { name: 'Sihedron - Charity', value: '+4AC, Dimensional Anchor', opposed: new Set([kindness, temperance]) },
    [generosity]: { name: 'Sihedron - Generosity', value: '+4 Attack Rolls, Beast Shape', opposed: new Set([humility, love]) },
    [humility]: { name: 'Sihedron - Humility', value: '+8 Skill Checks, Greater Invisibility', opposed: new Set([generosity, zeal]) },
    [kindness]: { name: 'Sihedron - Kindness', value: '+4 Weapon Damage, Ice Storm', opposed: new Set([charity, zeal]) },
    [love]: { name: 'Sihedron - Love', value: '+8 Initiative, Charm Monster', opposed: new Set([generosity, temperance]) },
    [temperance]: { name: 'Sihedron - Temperance', value: 'Fast Healing 10, Fear', opposed: new Set([charity, love]) },
    [zeal]: { name: 'Sihedron - Zeal', value: '+8 Concentration/Caster Level Checks, Dimension Door', opposed: new Set([humility, kindness]) },
}
const allVirtues = Object.keys(buffs);

const currentVirtue = item.getFlag('world', 'virtue');
const give = 'give';

const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const turnOffAllBuffs = () => allVirtues.forEach((virtue) => {
    window.macroChain = [`Remove ${buffs[virtue].name} skipMessage`];
    game.macros.getName("applyBuff")?.execute({actor, token});
});

if (typeof equipped !== 'undefined' && !equipped) {
    turnOffAllBuffs();
    return;
}

const buttons = allVirtues
    .filter((virtue) => !buffs.opposed[currentVirtue]?.has(virtue))
    .filter((virtue) => !currentVirtue || virtue !== currentVirtue)
    .map((virtue) => ({ label: capitalizeFirstLetter(virtue), value: virtue }));
buttons.push({ label: 'cancel'});
buttons.push({ label: 'Give', value: give })

let virtueHints = '<div style="display: grid; grid-template-columns: auto 1fr; grid-column-gap: 1rem; grid-row-gap: .5rem">';
allVirtues.forEach(virtue => {
    virtueHints += `<div>${ capitalizeFirstLetter(virtue) }</div><div>${ buffs[virtue].value }</div>`
});
virtueHints += '</div>';
inputs = [{ type: 'info', label: virtueHints }];

if (currentVirtue) {
    inputs.push({ type: 'info', label: `Currently active: ${ capitalizeFirstLetter(currentVirtue) }`});
}

if (buffs[currentVirtue]?.opposed) {
    const opp = [...buffs[currentVirtue].opposed];
    inputs.push({ type: 'info', label: `Currently opposed: ${opp[0]} and ${opp[1]}`});
}

const { buttons: chosenVirtue } = await warpgate.menu({ buttons, inputs }, { title: 'Choose a point' });
console.log(chosenVirtue);

// skip if chosen button is not a virtue (i.e. i it's canceled or given)
if (allVirtues.includes(chosenVirtue)) {
    turnOffAllBuffs();

    await item.setFlag('world', 'virtue', chosenVirtue);

    window.macroChain = [`Apply ${buffs[chosenVirtue].name}`];
    game.macros.getName("applyBuff")?.execute({actor, token});
}

// todo make sure this works. I don't know if I can invoke a pf1-specific socket here
else if (chosenVirtue === give) {
    // todo filter out self
    const targets = game.actors.contents.filter((o) => o.hasPlayerOwner && !o.testUserPermission(game.user, "OWNER"));
    const targetData = await game.pf1.utils.dialogGetActor(`Give item to actor`, targets);
    if (!targetData) {
        return;
    }
    const target = game.actors.get(targetData.id);

    // todo unset current buff on item here instead of in other macro
    // todo both actors - heal 2d8 + 10, +2 to saves for one round

    if (target.testUserPermission(game.user, "OWNER")) {
        const itemData = item.toObject();
        await target.createEmbeddedDocuments("Item", [itemData]);
        await item.document.deleteEmbeddedDocuments("Item", [item.id]);
    }
    else {
        game.socket.emit(
            "system.pf1",
            {
                eventType: "giveItem",
                targetActor: target.uuid,
                item: item.uuid,
            }
        );
        // Deleting will be performed on the gm side as well to prevent race conditions
    }
}
