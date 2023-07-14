// this goes in the toggle script call for a buff

async function handleBuff(actionUse) {
    // this checks for the next "item" that is used that is a spell cast by this actor
    if (actionUse.actor === actor && actionUse.action?.item.type === 'spell') {
        // turn off this buff
        await item.setActive(false);

        // turn off the hook so this doesn't have to respond anymore
        Hooks.off('pf1PreDisplayActionUse', handleBuff);
    }
};

if (state) {
    // when this buff is enabled, start listening for a spell to be cast
    Hooks.on('pf1PreDisplayActionUse', handleBuff);
}
else {
    // when this buff is disabled, stop listening for any spells to be cast
    Hooks.off('pf1PreDisplayActionUse', handleBuff);
}
