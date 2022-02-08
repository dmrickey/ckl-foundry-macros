// requires warpgate, jb2a patreon, and sequencer

const coneSize = 30;

const gridSize = canvas.grid.h;
const sourceSquare = (center, widthSquares, heightSquares) => {
    const h = gridSize * heightSquares;
    const w = gridSize * widthSquares;

    const bottom = center.y + h / 2;
    const left = center.x - w / 2;
    const top = center.y - h / 2;
    const right = center.x + w / 2;

    const rightSpots = [...new Array(heightSquares + 1)].map((_, i) => ({
        direction: 0,
        x: right,
        y: top + gridSize * i,
    }));
    const bottomSpots = [...new Array(widthSquares + 1)].map((_, i) => ({
        direction: 90,
        x: right - gridSize * i,
        y: bottom,
    }));
    const leftSpots = [...new Array(heightSquares + 1)].map((_, i) => ({
        direction: 180,
        x: left,
        y: bottom - gridSize * i,
    }));
    const topSpots = [...new Array(widthSquares + 1)].map((_, i) => ({
        direction: 270,
        x: left + gridSize * i,
        y: top,
    }));
    const allSpots = [
        ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
        { direction: 45, x: right, y: bottom },
        ...bottomSpots,
        { direction: 135, x: left, y: bottom },
        ...leftSpots,
        { direction: 225, x: left, y: top },
        ...topSpots,
        { direction: 315, x: right, y: top },
        ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
    ];

    return {
        x: left,
        y: top,
        center,
        top,
        bottom,
        left,
        right,
        h,
        w,
        heightSquares,
        widthSquares,
        allSpots,
    };
};

// cast from source token, if no source token, then select a square to originate the cone from.
let square;
if (typeof token === 'undefined') {
    const sourceConfig = {
        drawIcon: true,
        drawOutline: false,
        interval: -1,
        label: 'Cone Start',
    };

    const source = await warpgate.crosshairs.show(sourceConfig);
    if (source.cancelled) {
        return;
    }
    square = sourceSquare({ x: source.x, y: source.y }, 1, 1);
}
else {
    const width = Math.max(Math.round(token.data.width), 1);
    const height = Math.max(Math.round(token.data.height), 1)
    square = sourceSquare(token.center, width, height);
}

game.user.updateTokenTargets();

const templateData = {
    t: "cone",
    distance: 30,
    fillColor: '#000000',
    angle: 90,
    ...square.allSpots[0],
    user: game.userId,
}

let template = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]))[0];

const targetConfig = {
    drawIcon: false,
    drawOutline: false,
}

let currentSpotIndex = 0;
const updateTemplateLocation = async (crosshairs) => {
    while (crosshairs.inFlight) {
        await warpgate.wait(100);

        const totalSpots = square.allSpots.length;
        const radToNormalizedAngle = (rad) => {
            let angle = (rad * 180 / Math.PI) % 360;

            // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
            if (square.heightSquares % 2 === 1 && square.widthSquares % 2 === 1) {
                angle -= (360 / totalSpots) / 2;
            }
            const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0
                ? normalizedAngle + 360
                : normalizedAngle;
        }

        const ray = new Ray(square.center, crosshairs);
        const angle = radToNormalizedAngle(ray.angle);
        const spotIndex = Math.ceil(angle / 360 * totalSpots);

        if (spotIndex === currentSpotIndex) {
            continue;
        }

        currentSpotIndex = spotIndex;
        const spot = square.allSpots[currentSpotIndex];

        template = await template.update({ ...spot });

        const getCenterOfSquares = (t) => {
            const x1 = t.x + gridSize / 2;
            const y1 = t.y + gridSize / 2;
            const tokenSquaresWidth = t.data.width;
            const tokenSquaresHeight = t.data.height;
            const centers = [];
            for (let x = 0; x < tokenSquaresWidth; x++) {
                for (let y = 0; y < tokenSquaresHeight; y++) {
                    centers.push({ id: t.id, center: { x: x1 + x * gridSize, y: y1 + y * gridSize } });
                }
            }
            return centers;
        };
        const centers = canvas.tokens.placeables
            .map(t => t.actor.data.data.size <= 4
                ? { id: t.id, center: t.center }
                : getCenterOfSquares(t))
            .flatMap(x => x);
        const tokenIdsToTarget = centers.filter(o => canvas.grid.getHighlightLayer('Template.' + template.id).geometry.containsPoint(o.center)).map(x => x.id);
        game.user.updateTokenTargets(tokenIdsToTarget);
    }
}

const rotateCrosshairs = await warpgate.crosshairs.show(
    targetConfig,
    {
        show: updateTemplateLocation
    });
if (rotateCrosshairs.cancelled) {
    await template.delete();
    game.user.updateTokenTargets();
    return;
}

const seq = new Sequence();
seq.effect()
    .file('jb2a.magic_signs.rune.evocation.intro.red')
    .atLocation(square)
    .offset({ x: -square.w / 2, y: -square.h / 2 })
    .scaleToObject(1.6)
    .opacity(0.5)
    .waitUntilFinished();
seq.effect()
    .file('jb2a.breath_weapons.fire.cone.blue.02')
    .atLocation(square.allSpots[currentSpotIndex])
    .fadeIn(300)
    .rotate(-square.allSpots[currentSpotIndex].direction)
    .size(gridSize * coneSize / 5)
    .scale({
        x: 1,
        y: 1.5
    })
    .anchor({
        x: 0,
        y: 0.5
    })
    .waitUntilFinished();

await template.delete();
await seq.play();
