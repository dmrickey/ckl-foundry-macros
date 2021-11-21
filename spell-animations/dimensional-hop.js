// requires Warpgate, Sequencer, and JB2A patreon module

const distanceTo = (target) => canvas.grid.measureDistances([{ ray: new Ray(token, target) }], { gridSpaces: true });

const distanceAvailable = item.data.data.uses.value * 5;

let travelDistance = 0;
const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        //wait for initial render
        await warpgate.wait(100);

        const ray = new Ray(token.center, crosshairs);
        const targetDistance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (travelDistance !== targetDistance) {
            travelDistance = targetDistance;
            if (targetDistance > distanceAvailable) {
                crosshairs.icon = 'icons/svg/hazard.svg';
            } else {
                crosshairs.icon = token.data.img;
            }

            crosshairs.draw();
            crosshairs.label = `${targetDistance} ft`;
        }
    }
}

const callbacks = {
    show: checkDistance
}

const location = await warpgate.crosshairs.show(
    {
        interval: token.data.width % 2 === 0 ? 1 : -1,
        size: token.data.width,
        icon: token.data.img, label: '0 ft.'
    },
    callbacks
);

if (location.cancelled || travelDistance > distanceAvailable) {
    return;
}

const seq = new Sequence().effect()
    .JB2A()
    .scale(.5)
    .endTime(400)
    .file('jb2a.magic_signs.circle.02.conjuration.intro.blue')
    .waitUntilFinished()
    .atLocation(token)
    .thenDo(async () => {
        const { x, y } = canvas.grid.getSnappedPosition(location.x - 10, location.y - 10);
        await token.document.update({ x, y }, { animate: false });

        const updatedCharges = item.data.data.uses.value - travelDistance / 5;
        await item.update({ 'data.uses.value': updatedCharges });
    });
seq.effect()
    .JB2A()
    .file('jb2a.impact.003.blue')
    .atLocation(token)
seq.effect()
    .JB2A()
    .scale(.5)
    .startTime(400)
    .file('jb2a.magic_signs.circle.02.conjuration.outro.blue')
    .atLocation(token)
await seq.play();