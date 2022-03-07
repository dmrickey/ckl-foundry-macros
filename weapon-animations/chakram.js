// requires JB2A patreon and Sequencer

const returnPath = 'jb2a.chakram.01.return';
const throwPath = 'jb2a.chakram.01.throw';
const allInOnePath = 'jb2a.chakram.02';

// token filled in below will work if you simply have a token selected and execute the macro manually
// (it may also work by default depending on your system)

const targets = [...game.user.targets];

// if no source and no targets then don't try to play anything
if (!token || !targets.length) return;

if (targets.length === 1) {
    new Sequence()
        .effect()
            .file(allInOnePath)
            .atLocation(token)
            .stretchTo(targets[0])
            .randomOffset(0.75)
        .play();
}
else {
    const seq = new Sequence()
        .effect()
            .file(throwPath)
            .atLocation(token)
            .stretchTo(targets[0])
            .endTime(450)
            .waitUntilFinished(-100)

    for (let i = 1; i < targets.length; i++) {
        const from = targets[i-1];
        const to = targets[i];
        seq.effect()
            .file(throwPath)
            .startTime(550)
            .atLocation(from)
            .stretchTo(to)
            .endTime(1000)
            .waitUntilFinished(-100)
    }

    const last = targets[targets.length - 1];
    seq.effect()
        .file(returnPath)
        .startTime(500)
        .atLocation(token)
        .stretchTo(last)
    .play();
}
