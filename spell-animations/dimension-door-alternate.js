// requires JB2A, Sequencer, and Warpgate

await Sequencer.Preloader.preloadForClients(["jb2a.magic_signs.rune.conjuration.intro.blue", "jb2a.portals.vertical.vortex.blue"])

if (!token) {
    return;
}

const config = {
    drawIcon: false,
    interval: token.data.width % 2 === 0 ? 1 : -1,
    label: 'Dimension Door',
    size: token.w / canvas.grid.size,
}
if (typeof item !== 'undefined') {
    config.drawIcon = true;
    config.icon = item.img;
    config.label = item.name;
}

const position = await warpgate.crosshairs.show(config);
if (position.cancelled) {
    return;
}

const portalScale = token.w / canvas.grid.size * .7;

const magicSign = new Sequence().effect()
    .file('jb2a.magic_signs.rune.conjuration.intro.blue')
    .atLocation(token)
    .scale(portalScale * .7)
    .opacity(0.5)
    .waitUntilFinished(-600);

const introSequence = new Sequence().effect()
    .file('jb2a.portals.vertical.vortex.blue')
    .atLocation(token)
    .offset({ y: (token.h)})
    .scale(portalScale)
    .duration(1200)
    .fadeIn(200)
    .fadeOut(500);
introSequence.animation()
    .on(token)
    .opacity(0);
introSequence.effect()
    .from(token)
    .moveTowards({ x: token.center.x, y: token.center.y - token.h }, { ease: 'easeInCubic', rotate: false })
    .zeroSpriteRotation()
    .fadeOut(500)
    .duration(500);
introSequence.wait(250);

const outroSequence = new Sequence();
outroSequence.effect()
    .file('jb2a.portals.vertical.vortex.blue')
    .atLocation(position)
    .offset({ y: (token.h)})
    .scale(portalScale)
    .duration(1200)
    .fadeOut(500)
    .fadeIn(200);
outroSequence.effect()
    .from(token)
    .atLocation({ x: position.x, y: position.y - token.h }, { ease: 'easeInCubic', rotate: false })
    .fadeIn(500)
    .duration(500)
    .moveTowards(position)
    .zeroSpriteRotation()
    .waitUntilFinished();
outroSequence.animation()
    .on(token)
    .teleportTo(position, { relativeToCenter: true })
    .opacity(1);

await magicSign.play();
await introSequence.play();
await outroSequence.play();
