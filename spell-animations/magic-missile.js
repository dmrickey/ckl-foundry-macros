// fail early if no caster
if (typeof token === 'undefined') return;

let missiles = 3;
if (typeof item !== 'undefined') {
    // technically this should cap out at 5, but I let my players cast more
    // ..but this is just the animation--damage is controlled by the spell itself so edit however you see fit
    missiles = Math.ceil(item.casterLevel / 2) || missiles;
}

const targetTokens = [...game.user.targets];
for (let i = 0; i < missiles; i++) {
    const target = targetTokens[i] || targetTokens[Math.floor(Math.random() * targetTokens.length)];
    new Sequence()
        .effect()
        .delay(i * 100, i * 100 + 75)
        .JB2A()
        .file('jb2a.magic_missile')
        .atLocation(token)
        .stretchTo(target)
        .randomOffset(0.75)
        .play();
}
