// requires the mod Item Piles

// turns all NPCs that have 0 or fewer HP into Item Piles
let corpses = canvas.tokens.placeables.filter((target) => 
    target?.actor?.data?.data?.attributes?.hp?.value <= 0
      && target?.actor?.data?.type == "npc"
      && !ItemPiles.API.isItemPileClosed(target)
);

ItemPiles.API.turnTokensIntoItemPiles(corpses);

// delete below if you do not have JB2A - it creates a "sparkle" effect on the tokens that are now lootable
for (let corpse of corpses) {
    ['',''].forEach(() => {
        new Sequence().effect()
            .file('jb2a.glint')
            .attachTo(corpse)
            .scaleToObject()
            .playbackRate(15)
            .name('treasure-twinkle')
            .persist()
            .play();
    });
}
