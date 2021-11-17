// requires JB2A patreon and Sequencer

// todo just use db path and no distance 
const returnPaths = {
    '15': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_Return_15ft_1000x400.webm',
    '30': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_Return_30ft_1600x400.webm',
    '60': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_Return_60ft_2800x400.webm',
    '90': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_Return_90ft_4000x400.webm',
}
const throwPaths  = {
    '15': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_15ft_1000x400.webm',
    '30': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_30ft_1600x400.webm',
    '60': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_60ft_2800x400.webm',
    '90': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_01_Regular_White_90ft_4000x400.webm',
}
const allInOnePaths  = {
    '15': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_02_Regular_White_15ft_1000x400.webm',
    '30': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_02_Regular_White_30ft_1600x400.webm',
    '60': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_02_Regular_White_60ft_2800x400.webm',
    '90': 'modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Chakram01_02_Regular_White_90ft_4000x400.webm',
}

const distanceKey = (from, to) => {
    const distance = canvas.grid.measureDistance(from, to);
    let d;
    if (distance <= 15) {
        d = '15';
    }
    else if (distance <= 30) {
        d = '30';
    }
    else if (distance <= 60) {
        d = '60';
    }
    else if (distance <= 90) {
        d = '90';
    }

    return d || '15';
};

const getFilePath = (path, from, to) => {
    const d = distanceKey(from, to);
    return path[d];
}

// token filled in below will work if you simply have a token selected and execute the macro manually
// (it may also work by default depending on your system)

const targets = [...game.user.targets];

// if no source and no target then don't try to play anything
if (!token || !targets.length) return;

if (targets.length === 1) {
    new Sequence()
        .effect()
            .JB2A()
            .file(getFilePath(allInOnePaths, token, targets[0]))
            .atLocation(token)
            .reachTowards(targets[0])
            .randomOffset(0.75)
        .play();
}
else {
    const seq = new Sequence()
        .effect()
            .JB2A()
            .file(getFilePath(throwPaths, token, targets[0]))
            .atLocation(token)
            .reachTowards(targets[0])
            .endTime(450)
            .waitUntilFinished(-100)

    for (let i = 1; i < targets.length; i++) {
        const from = targets[i-1];
        const to = targets[i];
        seq.effect()
            .JB2A()
            .file(getFilePath(throwPaths, from, to))
            .startTime(550)
            .atLocation(from)
            .reachTowards(to)
            .endTime(1000)
            .waitUntilFinished(-100)
    }

    const last = targets[targets.length - 1];
    seq.effect()
        .JB2A()
        .file(getFilePath(returnPaths, token, last))
        .startTime(500)
        .atLocation(token)
        .reachTowards(last)
    .play();
}
