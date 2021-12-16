// requires warpgate, jb2a patreon, and sequencer

const gridSize = canvas.grid.h;
const sourceSquare = (center, widthSquares, heightSquares) => ({
    get x() {
        return this.left;
    },
    get y() {
        return this.top;
    },
    center,
    get top() {
        return this.center.y - this.h / 2;
    },
    get bottom() {
        return this.center.y + this.h / 2;
    },
    get left() {
        return this.center.x - this.w / 2;
    },
    get right() {
        return this.center.x + this.w / 2;
    },
    get h() {
        return gridSize * heightSquares;
    },
    get w() {
        return gridSize * widthSquares;
    },
});

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
    square = sourceSquare({ x: source.x, y: source.y }, 1 ,1);
}
else {
    const size = Math.max(token.actor.data.data.size - 3, 1);
    square = sourceSquare(token.center, size, size);
}

const templateData = {
    t: "cone",
    distance: 15,
    direction: 0,
    fillColor: '#000000',
    angle: 90,
    x: square.right,
    y: square.center.y,
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
        let closestAngle = (Math.round(angle / 45) * 45) % 360;
        if (closestAngle < 0) {
            closestAngle += 360;
        }

        if (currentCrosshairsAngle !== closestAngle) {
            currentCrosshairsAngle = closestAngle;

            const update = {
                direction: closestAngle
            };
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
}

const rotateCrosshairs = await warpgate.crosshairs.show(targetConfig, {
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
    .atLocation(square, { relativeToCenter: true })
    .scaleToObject(1.6)
    .opacity(0.5)
    .waitUntilFinished();
seq.effect()
    .file('jb2a.burning_hands.01.orange')
    .atLocation(template, { cacheLocation: true })
    .fadeIn(300)
    .rotate(-currentCrosshairsAngle)
    .size(gridSize * 3)
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
