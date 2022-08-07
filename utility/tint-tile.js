const lava = Tagger.getByTag('lava')[0];

if (!lava) {
    return;
}

const update = {
    _id: lava.id,
    tint: '#495f9f',
};
await canvas.scene.updateEmbeddedDocuments('Tile', [update]);
