// goes into a super small mod (or world script) to _hopefully_ automatically hit the "accept" button for Noon's applyBuff macro. Newer versions of Foundry don't need the `isResponsibleGM` method and can instead use `game.users.activeGM` (from memory, could be called something else) to figure out if they should handle this

const isResponsibleGM = () => game.users
    .filter(user => user.isGM && user.isActive)
    .some(other => other.data._id < game.user.data._id);

const MODULE_ID = 'apply-buff-gm-executor';
Hooks.on('renderChatMessage', async (doc, jq) => {
    if (!isResponsibleGM()) return;

    if (doc.flags[MODULE_ID]?.applied) return;

    if (jq.text().includes(`I'm trying to`) && jq.text().includes(`to:`)) {
        jq.find('button').click();
    }

    await doc.update({ [`flags.${MODULE_ID}.applied`]: true });
});
