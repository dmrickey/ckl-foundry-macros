

/** 
 * This is an example on how to use it in an item On Use script call.
 * this is specifically in a `createChatMessage` callback so it can access extra data about the attack from the chat card - like targets
 */
async function handleChatMessage({ itemSource }) {
    if (itemSource !== item) {
        return;
    }

    const tokenId = msg.speaker?.token;
    const token = tokenId ? canvas.scene.tokens.get(tokenId) : null;

    const actorId = msg.speaker?.actor;
    const actor = actorId ? game.actors.get(actorId) : null;

    // do something

    Hooks.off('createChatMessage', handleChatMessage);
};

Hooks.on('createChatMessage', handleChatMessage);
setTimeout(() => Hooks.off('createChatMessage', handleChatMessage), 500);
/** end item use callback example */
