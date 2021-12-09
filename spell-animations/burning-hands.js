// const sourceConfig = {
//   drawIcon: true,
//   drawOutline: false,
//   interval: -1,
//   label: 'Cone Start',
// }

// const source = await warpgate.crosshairs.show(sourceConfig);
// if (source.cancelled) {
//   return;
// }

// this will originate from the selected token, the above commented out code will originate it from a selected crosshairs position
if (!token) {
    return;
}
const source = token.center;


const gridSize = canvas.grid.h;

const square = {
    x: source.x,
    y: source.y,
    get center() { return { x: this.x, y: this.y }; },
    get top() { return this.center.y - gridSize / 2; },
    get bottom() { return this.center.y + gridSize / 2; },
    get left() { return this.center.x - gridSize / 2; },
    get right() { return this.center.x + gridSize / 2; },
};

const templateData = {
    t: "cone",
    distance: 15,
    direction: 0,
    fillColor: '#000000',
    angle: 90,
    x: square.center.x,
    y: source.right,
}

let template = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]))[0];

const targetConfig = {
    drawIcon: false,
    drawOutline: false,
}

let currentCrosshairsAngle = 0;
const updateTemplateLocation = async (crosshairs) => {
    while (crosshairs.inFlight) {
        await warpgate.wait(100);
        const ray = new Ray(square.center, crosshairs);
        const angle = ray.angle * 180 / Math.PI;
        let closestAngle = (Math.round(angle/45) * 45) % 360;
        if (closestAngle < 0) {
            closestAngle += 360;
        }

        if (currentCrosshairsAngle !== closestAngle) {
            currentCrosshairsAngle = closestAngle;

            const update = { direction: closestAngle };
            switch (closestAngle) {
                case 315:
                case 0:
                case 45:
                    update.x = square.right;
                    break;
                case 90:
                case 270:
                    update.x = square.center.x;
                    break;
                case 135:
                case 180:
                case 225:
                    update.x = square.left;
                    break;
          }
            switch (closestAngle) {
                case 0:
                case 180:
                    update.y = square.center.y;
                    break;
                case 45:
                case 90:
                case 135:
                    update.y = square.bottom;
                    break;
                case 225:
                case 270:
                case 315:
                    update.y = square.top;
                    break;
          }

          template = await template.update(update);
        }
    }
}

const target = await warpgate.crosshairs.show(targetConfig, { show: updateTemplateLocation });
if (target.cancelled) {
    await template.delete();
    return;
}

await new Sequence().effect()
    .file('jb2a.burning_hands.01.orange')
    .atLocation(template)
    .rotateTowards(target)
    .size(gridSize * 3)
    .anchor({ x: 0, y: 0.5 })
    .play();

await template.delete();
