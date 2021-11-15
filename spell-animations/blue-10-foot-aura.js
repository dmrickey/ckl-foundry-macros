const name = `${token.name}-ten-foot-aura`;

const animation = 'jb2a.extras.tmfx.outflow.circle.02';

if (state) {
    new Sequence()
        .effect()
        .file(animation)
        .filter("Glow", { color: 0x1166ff })
        .attachTo(token)
        .belowTokens()
        .opacity(.5)
        .fadeIn(500)
        .fadeOut(1000)
        .name(name)
        .persist()
    .play();
}
else {
    Sequencer.EffectManager.endEffects({ name });
}
