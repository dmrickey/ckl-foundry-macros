// will increase the duration of the defined buffs by 30 seconds. As written, it's intended for a GM to use in an NPC witches cackle ability
// it cannot differentiate between which witch the buff originated from, so if there are multiple witches in the scene using hexes, a single cackle will extend any within range regardless of whether or not it was their hex
// *it requires the GM because players cannot update NPCs to extend their buffs. In that case, this can be run as a regular macro by the GM by selecting the player's witch token and then using this macro.

const buffs = ['agony', 'charm', 'evil eye', 'fortune', 'misfortune'];
const range = 30;

const gridSizePx = canvas.scene.grid.size;
function assessTokenSpace(t) {
    const wr = t.document?.width ?? t.width;
    const hr = t.document?.height ?? t.height;

    const squares = [];

    [...Array(wr).keys()].forEach((x) => {
        [...Array(hr).keys()].forEach((y) => {
            squares.push({ x: t.x + x * gridSizePx, y: t.y + y * gridSizePx });
        });
    });

    return squares;
}

const me = token;
const meSquares = assessTokenSpace(me);

const tokensInRange = me.scene.tokens.filter((target) => {
    const targetSquares = assessTokenSpace(target);
    const rays = meSquares.flatMap((meSquare) => targetSquares.map((targetSquare) => new Ray({ x: meSquare.x, y: meSquare.y }, { x: targetSquare.x, y: targetSquare.y }))).map((ray) => ({ ray }));
    const closest = Math.min(...canvas.grid.grid.measureDistances(rays, { gridSpaces: true }));
    return closest <= range;
});

for (const t of tokensInRange) {
    const aes = t?.actor?.effects?.filter((ae) => buffs.includes(ae.name?.toLowerCase()));
    for (const ae of aes) {
        await ae.update({"duration.seconds": ae.duration.seconds + 6});
    }
}
