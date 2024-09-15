// drop this on an "Equip" script call and change the path for the stone of your choice
const path = "jb2a.ioun_stones.01.blue.strength";

const random = Sequencer.Helpers.random_int_between;

const name = `${token.name}-${token.id}-${item.name}-${item.id}`;
const fromRotation = random(1, 360);
const toRotation = fromRotation + 360;
const randomDuration = 6000 + random(1, 3000);
if (equipped) {
  new Sequence()
    .effect(path)
    .attachTo(token)
    .fadeIn(500)
    .fadeOut(500)
    .scale(0.10)
    .spriteOffset({ y: random(token.h / 4, token.h / 2) })
    .zeroSpriteRotation(true)
    .loopProperty("spriteContainer", "rotation", { from: fromRotation, to: toRotation, duration: randomDuration })
    .loopProperty("sprite", "rotation", { from: -10, to: 10, duration: 500, pingPong: true, ease: 'easeInOutCubic' })
    .persist(true, { persistTokenPrototype: true })
    .name(name)
    .play();
}
else {
  Sequencer.EffectManager.endEffects({ name, object: token });
}
