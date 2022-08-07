// requires Tagger

const lights = Tagger.getByTag('lava-light');
if (!lights.length) return;
await canvas.scene.updateEmbeddedDocuments('AmbientLight', lights.map(({ id, hidden }) => ({_id: id, hidden: !hidden })));
