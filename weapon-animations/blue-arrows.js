// requires JB2A patreon and Sequencer

// fail early if no caster
if (typeof token === 'undefined' || !token) return;

let missiles = 3;
if (typeof attacks !== 'undefined') {
    missiles = attacks.length;
}
if (typeof data !== 'undefined' && !data.fullAttack) {
    missiles = 1;
}

const targetTokens = [...game.user.targets];

for (let i = 0; i < missiles; i++) {
    const target = targetTokens[i] || targetTokens[Math.floor(Math.random() * targetTokens.length)];
    new Sequence()
        .effect()
        .delay(i * 250, i * 250 + 175)
        .file('jb2a.arrow.physical.blue')
        .atLocation(token)
        .reachTowards(target)
        .randomOffset(0.75)
        .play();
}
