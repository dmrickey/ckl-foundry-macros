// requires JB2A and Sequencer
const target = [...game.user.targets][0];

const seq = new Sequence();

if (token) {
    seq.effect()
        .file('jb2a.magic_signs.rune.evocation.intro.blue')
        .atLocation(token)
        .scaleToObject()
        .scale(1.6)
        .opacity(0.5)
        .waitUntilFinished();

    if (target) {
        seq.effect()
            .file('jb2a.unarmed_strike.magical.01.blue')
            .startTime(300)
            .endTime(1250)
            .atLocation(token)
            .reachTowards(target);

        seq.effect()
            .fadeIn(100)
            .delay(500)
            .file('jb2a.impact.011.blue')
            .attachTo(target)
            .size(target)
            .scale(1.5)
            .fadeOut(200);
    }
}

seq.play();
