// requires Warpgate, Sequencer, and JB2A patreon module

let distanceAvailable = 30;
let icon = 'icons/magic/control/silhouette-grow-shrink-blue.webp';
let updateItem = async () => {};

if (typeof item !== 'undefined') {
    distanceAvailable = item.data.data.uses.value * 5;
    icon = item.data.img;
    updateItem = async () => {
        const updatedCharges = item.data.data.uses.value - crosshairsDistance / 5;
        await item.update({ 'data.uses.value': updatedCharges });
    };
}

let crosshairsDistance = 0;
const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        //wait for initial render
        await warpgate.wait(100);

        const ray = new Ray(token.center, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
            crosshairsDistance = distance;
            if (distance > distanceAvailable) {
                crosshairs.icon = 'icons/svg/hazard.svg';
            } else {
                crosshairs.icon = icon;
            }

            crosshairs.draw();
            crosshairs.label = `${distance} ft`;
        }
    }
}

const location = await warpgate.crosshairs.show(
    {
        // swap between targeting the grid square vs intersection based on token's size
        interval: token.data.width % 2 === 0 ? 1 : -1,
        size: token.data.width,
        icon: icon,
        label: '0 ft.',
    },
    {
        show: checkDistance
    },
);

if (location.cancelled || crosshairsDistance > distanceAvailable) {
    return;
}

const seq = new Sequence().effect()
    .scale(.25)
    .endTime(400)
    .file('jb2a.magic_signs.circle.02.conjuration.intro.blue')
    .waitUntilFinished(-500)
    .atLocation(token)
    .thenDo(async () => { await updateItem(); });
seq.animation()
    .on(token)
    .fadeOut(500)
    .duration(500)
    .waitUntilFinished();
seq.animation()
    .on(token)
    .teleportTo(location, { relativeToCenter: true })
    .waitUntilFinished();
seq.animation()
    .on(token)
    .fadeIn(1000)
    .waitUntilFinished(-999);
seq.effect()
    .file('jb2a.impact.003.blue')
    .atLocation(token)
seq.effect()
    .scale(.25)
    .startTime(400)
    .file('jb2a.magic_signs.circle.02.conjuration.outro.blue')
    .atLocation(token)
await seq.play();
