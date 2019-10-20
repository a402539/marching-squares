import { vec2 } from './math/vector.js';
import { marchingSquares } from './marching-squares/index.js';
import { input } from './input.js';


function getExecutionParams() {
    return {
        data: input.getData(),
        threshold: document.querySelector('#option-threshold').value,
        interpolate: document.querySelector('#option-interpolate').checked,
        fillOrStroke: document.querySelector('[name="option-fill-or-stroke"]:checked').value
    };
}

// executa o algoritmo e desenha a imagem
function drawImage(e) {
    const params = getExecutionParams();

    let polygons = marchingSquares(params.data, params.threshold, params.interpolate);
    
    const canvasEl = document.querySelector('#result-canvas');
    const imageSize = vec2(canvasEl.clientWidth, canvasEl.clientHeight);
    const dataSize = vec2(params.data.length > 0 ? params.data[0].length - 1 : 0, params.data.length - 1);
    const ctx = canvasEl.getContext('2d');
    
    // limpa o canvas para poder desenhar a imagem
    ctx.clearRect(0, 0, imageSize.x, imageSize.y);
    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#000';
    
    // percorre os polígonos, desenhando cada um com seus vértices
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
        '.spreadsheet'
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

// configura botão play
const playButtonEl = document.querySelector('#play-button');
playButtonEl.addEventListener('click', drawImage);

// configura botão autoplay
const autoPlayEl = document.querySelector('#option-autoplay');
autoPlayEl.addEventListener('change', setAutoPlay);
setAutoPlay({ currentTarget: autoPlayEl });
drawImage();

// configura botões de tamanho de input
const inputDimensionButtons = document.querySelectorAll('#input-width, #input-height');
inputDimensionButtons.forEach(el => el.addEventListener('input', setResultCanvasDimensions));

// configura largura/altura do canvas de resultado de acordo com 
// os dados de input
function setResultCanvasDimensions() {
    const canvasEl = document.querySelector('#result-canvas');
    const panelWidth = document.querySelector('#result-panel').clientWidth;
    // const panelHeight = document.querySelector('#result-panel').clientHeight;
    const data = input.getData();
    const height = data.length;
    const width = data[0].length;
    const dataAspectRatio = width/height;

    canvasEl.width = panelWidth;
    canvasEl.height = panelWidth / dataAspectRatio;
}