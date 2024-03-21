

/** 
 * This is an example on how to use it in an item _On Use script call_.
 * 
 * This is specifically in a `createChatMessage` callback so it can access extra data about the attack from the chat card - like targets
 */
async function handleChatMessage({ itemSource }) {
    if (itemSource !== item) {
        return;
    }

    // example on how to fetch token
    const tokenId = msg.speaker?.token;
    const token = tokenId ? canvas.scene.tokens.get(tokenId) : null;

    // example on how to fetch actor
    const actorId = msg.speaker?.actor;
    const actor = actorId ? game.actors.get(actorId) : null;

    // do something

    Hooks.off('createChatMessage', handleChatMessage);
};

Hooks.on('createChatMessage', handleChatMessage);

// the amount of time to wait before the chat messages shows up (in milliseconds). Increase this if your environment takes longer
const timeout = 500;
setTimeout(() => Hooks.off('createChatMessage', handleChatMessage), timeout);
/** end item use callback example */
