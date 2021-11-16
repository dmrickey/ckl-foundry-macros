// requires JB2A patreon and Sequencer

// fail early if no caster
if (typeof token === 'undefined') return;

let missiles = 3;
if (typeof item !== 'undefined') {
    // technically this should cap out at 5, but I let my players cast more
    // ..but this is just the animation damage is controlled by the spell itself so edit however you see fit
    missiles = Math.ceil(item.casterLevel / 2) || missiles;
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

    return `jb2a.magic_missile.{{color}}.${d}ft.{{number}}`;
};

const targetTokens = [...game.user.targets];

const colors = ['blue', 'dark_red', 'green', 'orange', 'purple', 'yellow']
const mustache = {
    "color": () => {
        return colors[Math.floor(Math.random() * colors.length)]
    },
    "number": () => {
        return Math.floor(Math.random() * 4);
    }
};

for (let i = 0; i < missiles; i++) {
    const target = targetTokens[i] || targetTokens[Math.floor(Math.random() * targetTokens.length)];
    new Sequence()
        .effect()
        .delay(i * 100, i * 100 + 75)
        .JB2A()
        .file(animation(canvas.grid.measureDistance(token, target)))
        .setMustache(mustache)
        .atLocation(token)
        .reachTowards(target)
        .randomOffset(0.75)
        .play();
}
