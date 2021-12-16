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
        return gridSize * this.heightSquares;
    },
    get w() {
        return gridSize * this.widthSquares;
    },
    heightSquares,
    widthSquares,
    get rightSpots() {
        return [...new Array(heightSquares)].map((_, i) => ({
            direction: 0,
            x: this.right,
            y: this.top + gridSize / 2 + gridSize * i,
        }));
    },
    get bottomSpots() {
        return [...new Array(widthSquares)].map((_, i) => ({
            direction: 90,
            x: this.right - gridSize / 2 - gridSize * i,
            y: this.bottom,
        }));
    },
    get leftSpots() {
        return [...new Array(heightSquares)].map((_, i) => ({
            direction: 180,
            x: this.left,
            y: this.bottom - gridSize / 2 - gridSize * i,
        }));
    },
    get topSpots() {
        return [...new Array(widthSquares)].map((_, i) => ({
            direction: 270,
            x: this.left + gridSize / 2 + gridSize * i,
            y: this.top,
        }));
    },
    get allSpots() {

        return [
            ...this.rightSpots.slice(Math.floor(this.rightSpots.length / 2)),
            { direction: 45, x: this.right, y: this.bottom },
            ...this.bottomSpots,
            { direction: 135, x: this.left, y: this.bottom },
            ...this.leftSpots,
            { direction: 225, x: this.left, y: this.top },
            ...this.topSpots,
            { direction: 315, x: this.right, y: this.top },
            ...this.rightSpots.slice(0, Math.floor(this.rightSpots.length / 2)),
        ];
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
    square = sourceSquare({ x: source.x, y: source.y }, 1, 1);
}
else {
    const size = Math.max(token.actor.data.data.size - 3, 1);
    square = sourceSquare(token.center, size, size);
}

const templateData = {
    t: "cone",
    distance: 15,
    fillColor: '#000000',
    angle: 90,
    ...square.rightSpots[0],
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

        const totalSpots = 4 + 2 * square.heightSquares + 2 * square.widthSquares;
        const radToNormalizedAngle = (rad) => {
            const angle = (rad * 180 / Math.PI) % 360;
            const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0
                ? normalizedAngle + 360
                : normalizedAngle;
        }

        const ray = new Ray(square.center, crosshairs);
        const angle = radToNormalizedAngle(ray.angle);
        const spotIndex = angle / 360 * totalSpots;

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
    .atLocation(square, { relativeToCenter: true })
    .scaleToObject(1.6)
    .opacity(0.5)
    .waitUntilFinished();
seq.effect()
    .file('jb2a.burning_hands.01.orange')
    .atLocation(template, { cacheLocation: true })
    .fadeIn(300)
    .rotate(-template.direction, { cacheLocation: true })
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
