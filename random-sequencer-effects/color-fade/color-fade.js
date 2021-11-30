let counter = 0;
const colors = [
    0xff0000,
    // 0x00ff00,
    0x0000ff,
]
const repeats = 10; 

// how long it takes to transition from "nothing" to "full color strength"
const amplitude = 1000;

// how much the colors fade into. Numbers less than 1 will increase the overlap time--closer to 0 means more overlap time and less of the "full" color. Numbers greater than will increase the "blank time" between fading in and out from each color--
//  e.g. 2 will fade in to full, then fade out, then wait as long as that cycle took before fading the next color
//  e.g. 1 will fade in to full, fade out completely, then switch to next color
//  e.g. (1 - 1 / colors.length) will fade through multiple colors, fading into the next as soon as the current is at full strength
const crossfadeRatio = 1 - 1 / colors.length;

new Sequence().effect()
    .from(token)
    .fadeIn(amplitude)
    .fadeOut(amplitude)
    .tint(`#${colors[counter].toString(16)}`)
    .repeats(repeats, amplitude * 2 * crossfadeRatio)
    .addOverride((effect, data) => {
        counter = (counter + 1) % colors.length;
        const color = colors[counter];
        effect._tint.decimal = color;
        effect._tint.hex = color.toString(16);
        return data;
     })
.play();
