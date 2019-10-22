import { vec2 } from './math/vector.js';
import { marchingSquares } from './marching-squares/index.js';
import { input } from './input.js';
import { lut } from './lut.js';
import { colorScale, scales} from './color-scale.js';

function getExecutionParams() {
    return {
        data: input.getData(),
        threshold: document.querySelector('#option-threshold').value,
        interpolate: document.querySelector('#option-interpolate').checked,
        fillOrStroke: document.querySelector('[name="option-fill-or-stroke"]:checked').value,
        drawDataAsColors: document.querySelector('#option-draw-data-colors').checked,
        drawDataAsNumbers: document.querySelector('#option-draw-data-numbers').checked,
        drawCells: document.querySelector('#option-draw-cells').checked
    };
}

// executa o algoritmo e desenha a imagem
function drawImage(e) {
    const params = getExecutionParams();

    let cells = marchingSquares(params.data, params.threshold, params.interpolate);

    const canvasEl = document.querySelector('#result-canvas');
    const imageSize = vec2(canvasEl.clientWidth, canvasEl.clientHeight);
    const dataSize = vec2(params.data.length > 0 ? params.data[0].length : 0, params.data.length);
    const ctx = canvasEl.getContext('2d');

    // limpa o canvas para poder desenhar a imagem
    ctx.clearRect(0, 0, imageSize.x, imageSize.y);

    // desenha uma imagem em uma escala de cores representando os dados
    if (params.drawDataAsColors || params.drawDataAsNumbers) {

        const flattenedData = params.data.reduce((flattened, array) => flattened.concat(array), []);
        const dataLimits = {
            min: Math.min(...flattenedData),
            max: Math.max(...flattenedData)
        };

        for (let i = 0; i < dataSize.y; i++) {
            for (let j = 0; j < dataSize.x; j++) {
                if (params.drawDataAsColors) {

                    ctx.fillStyle = colorScale.pick(scales.temperature, params.data[i][j], dataLimits.min, dataLimits.max);
                    ctx.fillRect(
                        j*imageSize.x/dataSize.x,
                        i*imageSize.y/dataSize.y,
                        imageSize.x/dataSize.x,
                        imageSize.y/dataSize.y
                    );
                }

                if (params.drawDataAsNumbers) {
                    ctx.fillStyle = params.drawDataAsColors ? '#fff' : '#333';
                    ctx.font = '16px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        `${params.data[i][j]}`,
                        (j + 0.5) * imageSize.x / dataSize.x,
                        (i + 0.5) * imageSize.y / dataSize.y
                        );
                }
            }
        }
    }

    // desenha as células do marching squares
    if (params.drawCells) {
        ctx.strokeStyle = '#ac6';
        // linhas horizontais
        for (let i = 0.5; i < dataSize.y; i++) {
            ctx.beginPath();
            for (let j = 0.5; j < dataSize.x; j++) {
                if (j === 0) {
                    ctx.moveTo(
                        j * imageSize.x / dataSize.x,
                        i * imageSize.y / dataSize.y
                    );
                } else {
                    ctx.lineTo(
                        j * imageSize.x / dataSize.x,
                        i * imageSize.y / dataSize.y
                    );
                }
            }
            ctx.closePath();
            ctx.stroke();
        }

        // linhas verticais
        for (let j = 0.5; j < dataSize.x; j++) {
            ctx.beginPath();
            for (let i = 0.5; i < dataSize.y; i++) {
                if (i === 0) {
                    ctx.moveTo(
                        j * imageSize.x / dataSize.x,
                        i * imageSize.y / dataSize.y
                    );
                } else {
                    ctx.lineTo(
                        j * imageSize.x / dataSize.x,
                        i * imageSize.y / dataSize.y
                    );
                }
            }
            ctx.closePath();
            ctx.stroke();
        }

        // vértices das células
        for (let i = 0; i < dataSize.y; i++) {
            for (let j = 0; j < dataSize.x; j++) {
                const isVertexInside = params.data[i][j] >= params.threshold;
                ctx.fillStyle = isVertexInside ? '#8a4' : '#000';
                ctx.beginPath();
                ctx.arc(
                    (j + 0.5) * imageSize.x / dataSize.x,
                    (i + 0.5) * imageSize.y / dataSize.y,
                    3,
                    0,
                    Math.PI*2
                );
                ctx.closePath();
                ctx.fill();
            }
        }

        // valores das células
        for (let i = 0; i < dataSize.y - 1; i++) {
            for (let j = 0; j < dataSize.x - 1; j++) {
                const cellValue = cells[i * (dataSize.x - 1) + j].case;

                ctx.fillStyle = params.drawDataAsColors ? '#fff' : '#333';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    `${cellValue}`,
                    (j+1) * imageSize.x / dataSize.x,
                    (i+1) * imageSize.y / dataSize.y
                );

            }
        }
    }

    // percorre os polígonos, desenhando cada um com seus vértices
    ctx.fillStyle = '#ff4e33';
    ctx.strokeStyle = '#000';

    const polygons = cells.map(c => c.polygons).reduce((flattened, array) => flattened.concat(array), []);
    ctx.save();
    ctx.translate(imageSize.x / dataSize.x * 0.5, imageSize.y / dataSize.y * 0.5);
    polygons.forEach(vertices => {
        ctx.beginPath();

        if (params.fillOrStroke === 'stroke') {
            vertices = vertices.filter(v => !v.inside);
        }

        for (let c = 0; c < vertices.length; c++) {
            const coordinate = dataToImageCoordinates(vertices[c], dataSize, imageSize);
            if (c === 0) {
                ctx.moveTo(coordinate.x, coordinate.y);
            } else {
                ctx.lineTo(coordinate.x, coordinate.y);
            }
        }

        ctx.closePath();
        if (params.fillOrStroke === 'stroke') {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    });
    ctx.restore();


    function dataToImageCoordinates(position, dataSize, imageSize) {
        const dataToUnitProportion = vec2(1/dataSize.x, 1/dataSize.y);
        return position.mult(dataToUnitProportion).mult(imageSize);
    }
}

function setDataRange() {
    const thresholdEl = document.querySelector('#option-threshold');
    const flattenedData = input.getData().reduce((flattened, array) => flattened.concat(array), []);
    thresholdEl.max = Math.max(...flattenedData);
}

function setAutoPlay(e) {
    const checked = e.currentTarget.checked;
    const playTriggerElements = [
        '#option-threshold',
        '#option-interpolate',
        '[name="option-fill-or-stroke"]',
        '#option-draw-data-colors, #option-draw-data-numbers',
        '#option-draw-cells',
        '.spreadsheet',
        '#input-width, #input-height'
    ]
    .map(selector => [...document.querySelectorAll(selector)])
    .reduce((flattened, array) => flattened.concat(array), []);


    if (checked) {
        playTriggerElements.forEach(el => el.addEventListener('input', drawImage));
    } else {
        playTriggerElements.forEach(el => el.removeEventListener('input', drawImage));
    }

    // para os campos de input da spreadsheet, é preciso usar event delegation
    const spreadsheetEl = document.querySelector('.spreadsheet');
    if (checked) {
        // spreadsheetEl.addEventListener('input', drawImage);
        spreadsheetEl.addEventListener('input', setDataRange);
    } else {
        // spreadsheetEl.removeEventListener('input', drawImage);
        spreadsheetEl.removeEventListener('input', setDataRange);
    }
}

// configura botões de tamanho de input
const inputDimensionButtons = document.querySelectorAll('#input-width, #input-height');
inputDimensionButtons.forEach(el => el.addEventListener('input', setResultCanvasDimensions));
setResultCanvasDimensions();

// configura largura/altura do canvas de resultado de acordo com
// os dados de input
function setResultCanvasDimensions() {
    const canvasEl = document.querySelector('#result-canvas');
    const panelWidth = document.querySelector('#result-panel').clientWidth - 10;
    const panelHeight = document.querySelector('#result-panel').clientHeight - 10;
    const data = input.getData();
    const height = data.length;
    const width = data[0].length;
    const dataAspectRatio = width / height;

    canvasEl.width = panelWidth;
    canvasEl.height = panelWidth / dataAspectRatio;
}

// configura botão play
const playButtonEl = document.querySelector('#play-button');
playButtonEl.addEventListener('click', drawImage);

// configura botão autoplay
const autoPlayEl = document.querySelector('#option-autoplay');
autoPlayEl.addEventListener('change', setAutoPlay);
setAutoPlay({ currentTarget: autoPlayEl });
drawImage();

// configura threshold e thresholdValue
const thresholdEl = document.querySelector('#option-threshold');
const thresholdValueEl = document.querySelector('#option-threshold-value')
thresholdEl.addEventListener('input', () => thresholdValueEl.value = thresholdEl.value);


// configura LUT
lut.draw();
