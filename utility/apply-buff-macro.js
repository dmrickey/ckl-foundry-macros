const applyBuff = (command, { actor, token }) => {
    window.macroChain = [command];
    game.macros.getName("applyBuff")?.execute({actor, token});
}

const command = 'Apply Mage Armor to self';
applyBuff(command, { actor, token });
