// requires JB2A patreon and Sequencer

let casterToken = token;
let isOn = true;
let numberOfImages = 5;
const targetTokens = game.user.targets.size
    ? [...game.user.targets]
    : casterToken
        ? [casterToken]
        : [];

// swap these out to change the animations
const illusionAnimation = 'jb2a.extras.tmfx.runes.circle.simple.illusion';
const spellStartAnimation = 'jb2a.impact.004.dark_purple';
const spellEndAnimation = 'jb2a.impact.003.dark_purple';

const origin = 'mirror-image';

if (typeof item !== 'undefined' && typeof token !== 'undefined') {
    casterToken = token;
    if (item.type === 'buff') {
        isOn = state;
    }

    numberOfImages = isOn ? RollPF.safeTotal("1d4") : 4;
    if (item.type === 'buff') {
        numberOfImages += Math.floor(item.data.data.level / 3);
    }
    else if (item.type === 'spell') {
        numberOfImages += Math.floor(item.casterLevel / 3);
    }
    numberOfImages = Math.min(8, numberOfImages);
}

// turn off all possible images to start with in case the spell is recast
targetTokens.forEach(targetToken => {
    Sequencer.EffectManager.endEffects({
        origin,
        object: targetToken,
    });
});

if (isOn) {
    const positions = [];

    const pi = 3.1415926535;
    const angles = [...Array(120).keys()].map(x => x * 3);
    for (let i = 0; i < numberOfImages; i++) {
        const centerOffset = canvas.scene.dimensions.size / 10 + Math.random() * canvas.scene.dimensions.size / 5 * 2;
        var rotationOffset = angles.length / numberOfImages * i;
        const trig = (formula) => {
            const pos = angles.map(angle => centerOffset * Math[formula](angle * (pi / 180)));
            return [...pos.slice(rotationOffset), ...pos.slice(0, rotationOffset)];
        }
        positions.push({
            x: trig('cos'),
            y: trig('sin'),
        });
    }

    const seq = new Sequence();

    if (casterToken) {
        seq.effect()
            .file(spellStartAnimation)
            .atLocation(casterToken)
            .fadeIn(500);
        seq.effect()
            .file(illusionAnimation)
            .atLocation(casterToken)
            .duration(2000)
            .fadeIn(500)
            .fadeOut(500)
            .scale(0.5)
            .filter("Glow", {
                color: 0x3c1361
            })
            .scaleIn(0, 500, {
                ease: "easeOutCubic"
            })
            .waitUntilFinished(-1000);
    }

    if (targetTokens.length) {
        seq.thenDo(() => {
            targetTokens.forEach(targetToken => {
                const textName = `mirror-image-count-${targetToken.id}`;
                const addText = async (qty) => {
                    Sequencer.EffectManager.endEffects({
                        name: textName,
                        object: targetToken
                    })
                    if (!qty) {
                        qty = Sequencer.EffectManager.getEffects({ object: targetToken, origin }).length;
                        if (qty <= 0) {
                            if (item.type === 'buff') {
                                await item.update({ 'data.active': false });
                            }
                            return;
                        }
                    }

                    new Sequence().effect()
                        .attachTo(targetToken)
                        .name(textName)
                        .origin(origin)
                        .offset({ x: -(targetToken.w / 2 - 10), y: -(targetToken.h / 2 - 10) })
                        .text(`1d${qty + 1}`, {
                            "fill": "#fafafa",
                            "fillGradientStops": [0],
                            "strokeThickness": 3
                        })
                        .zIndex(100)
                        .persist()
                        .waitUntilFinished()
                        .thenDo(addText)
                        .play();
                };
                addText(numberOfImages);

                positions.forEach((position, index) => {
                    const name = `mirror-image-${index}-${targetToken.id}`;
                    new Sequence()
                        .effect()
                        .delay(index * 75)
                        .from(targetToken)
                        .fadeIn(1000)
                        .fadeOut(200)
                        .origin(origin)
                        .attachTo(targetToken)
                        .loopProperty("sprite", "position.x", {
                            values: index % 2 ? position.x : position.x.slice().reverse(),
                            duration: 24,
                            pingPong: false,
                        })
                        .loopProperty("sprite", "position.y", {
                            values: index % 3 ? position.y : position.y.slice().reverse(),
                            duration: 24,
                            pingPong: false,
                        })
                        .persist()
                        .scaleToObject(1)
                        .opacity(0.5)
                        .name(name)
                        .play();

                    const playBoom = (effect) => {
                        if (effect.data.name !== name) {
                            registerHook();
                            return;
                        }
                        new Sequence().effect()
                            .file(spellEndAnimation)
                            .zIndex(1000)
                            .atLocation(effect, { cacheLocation: true })
                            .scaleToObject(2)
                            .fadeIn(100)
                            .thenDo(() => {
                                Sequencer.EffectManager.endEffects({
                                    name: textName,
                                    object: targetToken.id
                                });
                            })
                            .waitUntilFinished()
                            .play()
                    };
                    const registerHook = () => Hooks.once('endedSequencerEffect', playBoom);
                    registerHook();
                });
            });
        });
    }

    seq.play()
}
