// fail early if not available
if (token === undefined) return;

const animation = (distance) => {
    let d;
    if (distance <= 5 ) {
        d = '05';
    }
    else if (distance <= 15) {
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

    // return `jb2a.magic_missile.*.${d}ft.*`;
    return 'jb2a.magic_missile.blue.15ft.2';
};

let targetTokens = [...game.user.targets];

targetTokens.forEach(target => {
    new Sequence()
        .effect()
        .JB2A()
        .file(animation(15))
        .atLocation(token)
        .reachTowards(target)
    .play();
});
