// drop this on an "Equip" script call and change the path for the stone of your choice
const path = "jb2a.ioun_stones.01.blue.strength";

const name = `${token.data.name}-${item.data.name}`;
if (equipped) {
    new Sequence()
    .effect(path)
        .attachTo(token)
        .fadeIn(500)
        .fadeOut(500)
        .scale(0.10)
        .spriteOffset({ y: token.height/2 })
        .zeroSpriteRotation(true)
        .loopProperty("spriteContainer", "rotation", { from: 0, to: 360, duration: 6000 })
        .persist()
        .name(name)
    .play();
}    
else {
    Sequencer.EffectManager.endEffects({ name, object: token });
}
