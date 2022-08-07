const templates = canvas.templates.placeables.map(i=> i.id);
await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templates);
