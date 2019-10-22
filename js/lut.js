import { vec2 } from './math/vector.js';
import { lookupTable } from './marching-squares/index.js';

const canvasEl = document.querySelector('#lookup-canvas');
const ctx = canvasEl.getContext('2d');
const LUT_CASE_MARGIN_HORIZONTAL = 10;
const LUT_CASE_MARGIN_VERTICAL = 10;

const lutState = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => {
  return {
    highlighted: false
  };
});

function highlightLutCase(index, desselectOthers = false) {
    lutState[index].highlighted = true;
    if (desselectOthers) {
        for (let c = 0; c < lutState.length; c++) {
            if (c !== index) {
              lutState[c].highlighted = false;
            }
        }
    }
}

function drawCase(polygons, width, height, i) {
    ctx.strokeStyle = "#888";
    ctx.fillStyle = '#f00';
    ctx.strokeRect(
        LUT_CASE_MARGIN_HORIZONTAL,
        LUT_CASE_MARGIN_VERTICAL,
        width - LUT_CASE_MARGIN_HORIZONTAL * 2,
        height - LUT_CASE_MARGIN_VERTICAL * 2
    );

    for (let polygon of polygons) {
        if (!polygon.length) continue;

        // desenha contorno do polígono
        ctx.fillStyle = lutState[i].highlighted ? '#000' : '#ffa192';
        ctx.beginPath();
        ctx.moveTo(
            polygon[0].x * (width - LUT_CASE_MARGIN_HORIZONTAL * 2) + LUT_CASE_MARGIN_HORIZONTAL,
            (-polygon[0].y + 1) * (height - LUT_CASE_MARGIN_VERTICAL * 2) + LUT_CASE_MARGIN_VERTICAL
        );
        for (let c = 1; c < polygon.length + 1; c++) {
            let vertex = polygon[c % polygon.length];
            ctx.lineTo(
                vertex.x * (width - LUT_CASE_MARGIN_HORIZONTAL * 2) + LUT_CASE_MARGIN_HORIZONTAL,
                (-vertex.y + 1) * (height - LUT_CASE_MARGIN_VERTICAL * 2) + LUT_CASE_MARGIN_VERTICAL
            );
        }
        ctx.stroke();
        ctx.closePath();

        // desenha bolotinha nos vértices
        ctx.fillStyle = lutState[i].highlighted ? '#ff4e33' : '#ffa192';
        for (let vertex of polygon) {
            if (vertex.inside) continue;

            let y = -vertex.y + 1;
            ctx.beginPath();
            ctx.arc(
                vertex.x * (width - LUT_CASE_MARGIN_HORIZONTAL * 2) + LUT_CASE_MARGIN_HORIZONTAL,
                y * (height - LUT_CASE_MARGIN_VERTICAL * 2) + LUT_CASE_MARGIN_VERTICAL,
                3,
                0,
                2 * Math.PI,
                false);
            ctx.fill();
            ctx.closePath();

        }

    }

    // desenha o nome do caso (case 0, case 1...)
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.font = '8px monospace';
    ctx.fillStyle = lutState[i].highlighted ? '#ff4e33' : '#181818';
    ctx.fillText(`case ${i}`, width/2, height, width);


}

function draw() {
    ctx.clearRect(0, 0, canvasEl.clientWidth, canvasEl.clientHeight);
    const lutCases = Object.values(lookupTable);
    const side = Math.floor(Math.sqrt(lutCases.length));
    const availableWidth = canvasEl.clientWidth;
    const caseWidth = availableWidth / side;
    ctx.save();
    for (let i = 0; i < side; i++) {
        ctx.save();
        for (let j = 0; j < side; j++) {
            drawCase(lutCases[i*side + j].polygons, caseWidth, caseWidth, lutCases[i*side + j].case);
            ctx.translate(caseWidth, 0);
        }
        ctx.restore();
        ctx.translate(0, caseWidth);
    }
    ctx.restore();
}

export const lut = {
    draw,
    highlightCase: (...args) => {
      highlightLutCase(...args);
      draw();
    }
};
