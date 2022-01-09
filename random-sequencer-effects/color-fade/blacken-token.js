if (!token) {
    return;
}

const filter = "ColorMatrix";
const filterData = {
    hue: 0,
    brightness: .1,
    contrast: 1,
    saturate: .8
};

new Sequence().effect()
    .fadeIn(300)
    .persist()
    .fadeOut(500)
    .from(token)
    .attachTo(token)
    .filter(filter, filterData)
    .waitUntilFinished()
.play();
