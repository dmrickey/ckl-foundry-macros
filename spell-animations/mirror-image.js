// requires JB2A and Sequencer

// generic defaults
// this is what will happen if you just run the macro yourself
// uses selected token as caster, and then casts on targets (unless there's no target then selected is also assumed the target)
let casterToken = canvas.tokens.controlled[0];
let isOn = true;
let targetTokens = game.user.targets.size ? [...game.user.targets] : [casterToken];
let numberOfImages = 5;

// swap these out to change the animations
const illusionAnimation = 'jb2a.extras.tmfx.runes.circle.simple.illusion';
const spellStartAnimation = 'jb2a.impact.004.dark_purple';
const spellEndAnimation = 'jb2a.impact.003.dark_purple';

// this is an overwrite if being used by midi for dnd 5 (..I think, I don't use it)
if (typeof args !== 'undefined') {
    casterToken = canvas.tokens.get(args[2]);
    isOn = args[0] !== "off";
    targetTokens = [canvas.tokens.get(args[1])];
}
// this is if used in a Script Call in pf1 (either a buff or as a spell)
else if (game.system.data.name === 'pf1') {
    if (typeof item !== 'undefined' && typeof token !== 'undefined') {
        casterToken = token;
        if (item.type === 'buff') {
            isOn = state;
        }

        numberOfImages = isOn ? RollPF.safeTotal("1d4") : 4;
        if (item.type === 'buff') {
            numberOfImages += Math.floor(item.data.data.level / 3);
        }
        if (item.type === 'spell') {
            numberOfImages += Math.floor(item.casterLevel / 3);
        }
    }
}

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
                positions.forEach((position, index) => {
                    const name = `mirror-image-${index}-${targetToken.id}`;
                    new Sequence()
                        .effect()
                        .delay(index * 75)
                        .from(targetToken)
                        .fadeIn(1000)
                        .fadeOut(400)
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
                        } console.log(effect)
                        new Sequence().effect()
                            .file(spellEndAnimation)
                            .atLocation({ x: casterToken.center.x + effect.sprite.x, y: casterToken.center.y + effect.sprite.y })
                            .scaleToObject(2)
                            .fadeIn(100)
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
else {
    targetTokens.forEach(targetToken => {
        for (let i = 0; i < numberOfImages; i++) {
            Sequencer.EffectManager.endEffects({
                name: `mirror-image-${i}-${targetToken.id}`,
                object: targetToken.id
            });
        }
    });
}