import { vec3 } from './math/vector.js';

function hexToRGB(hex) {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        let c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return vec3((c >> 16) & 255, (c >> 8) & 255, c & 255);
    }
    throw new Error('Bad Hex');
}

function RGBtoString(rgb) {
    return `rgb(${rgb.x}, ${rgb.y}, ${rgb.z})`;
}

export const colorScale = {
    pick(scale, value, min, max) {
        let alpha = min !== max ? (value)/(max-min) : 1;
        alpha = Math.max(0, Math.min(alpha, 1));
        return RGBtoString(scale[1].mult(alpha).add(scale[0].mult(1-alpha)));
    }
};

export const scales = {
    temperature: [hexToRGB('#00429d'), hexToRGB('#c21005')]
};