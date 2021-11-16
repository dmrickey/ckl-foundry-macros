// requires JB2A patreon and Sequencer

// swap this out with your web path
const autoReturnPath = 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_02_Regular_White_30ft_1600x400.webm';
const startPath = 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_30ft_1600x400.webm';
const endPath = 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_Return_30ft_1600x400.webm';

// token filled in below will work if you simply have a token selected and execute the macro manually
// (it may also work by default depending on your system)

const targets = [...game.user.targets];

// if no source and no target then don't try to play anything
if (!token || !targets.length) return;

if (targets.length === 1) {
    new Sequence()
        .effect()
            .JB2A()
            .file(autoReturnPath)
            .atLocation(token)
            .reachTowards(targets[0])
            .randomOffset(0.75)
        .play();
}
else {
    const seq = new Sequence()
        .effect()
            .JB2A()
            .file(startPath)
            .atLocation(token)
            .reachTowards(targets[0])
            .waitUntilFinished(-750)
    for (let i = 1; i < targets.length; i++) {
        seq.effect()
            .JB2A()
            .file(startPath)
            .atLocation(targets[i-1])
            .reachTowards(targets[i])
            .waitUntilFinished(-750)
    }
    seq.effect()
        .JB2A()
        .file(endPath)
        .atLocation(token)
        .reachTowards(targets[targets.length - 1])
        .waitUntilFinished(-750)
    .play();
}
