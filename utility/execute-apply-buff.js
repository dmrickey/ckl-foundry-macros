// executes Noon's apply buff macro. This is beneficial for automating things as part of as script call. Or even part of a small module

const executeApplyBuff = (command) => {
    window.macroChain = [command];
    game.macros.getName('applyBuff')?.execute();
}
