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
            .delay(400)
            .file('jb2a.side_impact.ice_shard.blue')
            .attachTo(target)
            .rotate(30)
            .size(target)
            .scale(1.5)
            .fadeOut(200);
    }
}

seq.play();
