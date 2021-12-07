const target = [...game.user.targets][0];

const seq = new Sequence();

if (token) {
    seq.effect()
        .file('jb2a.magic_signs.rune.evocation.intro.blue')
        .atLocation(token)
        .scale(0.5)
        .waitUntilFinished();

    if (target) {
        seq.effect()
            .file('jb2a.unarmed_strike.magical.01.blue')
            .startTime(300)
            .atLocation(token)
            .reachTowards(target);

        seq.effect()
            .fadeIn(100)
            .delay(500)
            .file('jb2a.static_electricity.01.blue')
            .attachTo(target)
            .size(target)
            .fadeOut(200);
    }
}

seq.play();
