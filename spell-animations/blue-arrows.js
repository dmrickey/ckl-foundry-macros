// requires JB2A patreon and Sequencer
//   expects the attack is set up using Formulaic Attack

// fail early if no caster
if (typeof token === 'undefined') return;

let missiles = 3;
if (typeof item !== 'undefined') {
    missiles = (item.data.data?.formulaicAttacks?.count?.value || 2) + 1;
}
if (typeof data !== 'undefined') {
    missiles = data.fullAttack ? missiles : 1;
}

const animation = (distance) => {
    let d;
    if (distance <= 5) {
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

    return `jb2a.arrow.physical.blue.${d}ft`;
};

const targetTokens = [...game.user.targets];

for (let i = 0; i < missiles; i++) {
    const target = targetTokens[i] || targetTokens[Math.floor(Math.random() * targetTokens.length)];
    new Sequence()
        .effect()
        .delay(i * 250, i * 250 + 175)
        .JB2A()
        .file(animation(canvas.grid.measureDistance(token, target)))
        .atLocation(token)
        .reachTowards(target)
        .randomOffset(0.75)
        .play();
}