// will increase the duration of the defined buffs by 30 seconds. As written, it's intended for a GM to use in an NPC witch's cackle ability
// it cannot differentiate between which witch the buff originated from, so if there are multiple witches in the scene using hexes, a single cackle will extend any within range regardless of whether or not it was their hex
// *it requires the GM because players cannot update NPCs to extend their buffs. In that case, this can be run as a regular macro by the GM by selecting the player's witch token and then using this macro.

/// List of hex names -- these must exactly match the Buff's name
const buffs = ['Agony', 'Charm', 'Evil Eye', 'Fortune', 'Misfortune'];
const range = 30;

const api = game.modules.get('ckl-roll-bonuses')?.api;
if (!api) {
    // requires Roll Bonuses to use its measuring api.
    ui.notifications.error('This macro requires the mod "Roll Bonuses PF1"');
    return;
}

const me = token;
if (!me) {
    ui.notifications.error('Must select a token (i.e. the witch)');
    return;
}

const PositionHelper = api.utils.PositionalHelper;

const sceneTokens = me.scene.tokens.filter(t => t.id !== token.id);
const tokensInRange = sceneTokens.filter(st => new PositionHelper(token, st).isWithinRange(0, range));

if (!tokensInRange.length) {
    ui.notifications.error(`No other tokens within '${range}' of the witch '${token.name}'.`);
    return;
}

const updated = [];

for (const t of tokensInRange) {
    const aes = buffs
        .map((b) => t?.actor?.itemTypes.buff.getName(b)?.effect)
        .filter(x => x?.active);
    for (const ae of aes) {
        const seconds = (ae.duration.seconds || (ae.duration.rounds * CONFIG.time.roundTime)) || 0;
        const data = {
            duration: {
                seconds: seconds + CONFIG.time.roundTime,
                rounds: null,
            },
        };
        await ae.update(data);
    }

    if (aes.length) {
        updated.push({name: t.name, buffs: aes.map(ae => ae.label)});
    }
}

let chatContent;
if (updated.length) {
    const messages = [
        'Cackle updated:<hr/>',
        updated.map(({name, buffs}) => `${name}: ${buffs.join(', ')}`).join('<br />'),
    ];

    chatContent = messages.join('');
}
else {
    chatContent = 'No targets in range have any hexes that can be extended.';
}

const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: chatContent
};
ChatMessage.create(chatData, {});
