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

const targetTokens = [...game.user.targets];

for (let i = 0; i < missiles; i++) {
    const target = targetTokens[i] || targetTokens[Math.floor(Math.random() * targetTokens.length)];
    new Sequence()
        .effect()
        .delay(i * 250, i * 250 + 175)
        .JB2A()
        .file('jb2a.arrow.physical.blue')
        .atLocation(token)
        .reachTowards(target)
        .randomOffset(0.75)
        .play();
}