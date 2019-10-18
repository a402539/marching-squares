import { vec2 } from './math/vector.js';
import { marchingSquares } from './marching-squares/index.js';




const data = [
    [0, 1, 1, 3, 2],
    [1, 3, 6, 6, 3],
    [3, 7, 9, 7, 3],
    [2, 7, 8, 6, 2],
    [1, 2, 3, 4, 3]
];
// const data = [
//     [1, 1, 3, 3, 3],
//     [1, 1, 3, 3, 3],
//     [3, 3, 3, 1, 1],
//     [3, 3, 1, 1, 1],
//     [3, 3, 1, 1, 1]
// ];

function getExecutionParams() {
    return {
        data: data,
        threshold: document.querySelector('#option-threshold').value,
        interpolate: document.querySelector('#option-interpolate').checked,
        fillOrStroke: document.querySelector('[name="option-fill-or-stroke"]:checked').value
    };
}

function drawImage(e) {

    const params = getExecutionParams();

    let polygons = marchingSquares(params.data, params.threshold, params.interpolate);
    
    
    const canvasEl = document.querySelector('#result-canvas');
    const imageSize = vec2(canvasEl.clientWidth, canvasEl.clientHeight);
    const dataSize = vec2(data.length > 0 ? data[0].length - 1: 0, data.length - 1);
    const ctx = canvasEl.getContext('2d');
    
    // percorre os polígonos, desenhando cada um com seus vértices
    ctx.clearRect(0, 0, imageSize.x, imageSize.y);
    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#000';
    
    
    polygons.forEach(vertices => {
        ctx.beginPath();
    
        // vertices = vertices.filter(v => !v.inside);
        for (let c = 0; c < vertices.length; c++) {
            const coordinate = dataToImageCoordinates(vertices[c], dataSize, imageSize);
            if (c === 0) {
                ctx.moveTo(coordinate.x, coordinate.y);
            } else {
                ctx.lineTo(coordinate.x, coordinate.y);
            }
        }
    
        ctx.closePath();
        // ctx.stroke();
        ctx.fill();
    });

    console.log('drew');
    
    
    function dataToImageCoordinates(position, dataSize, imageSize) {
        const dataToUnitProportion = vec2(1/dataSize.x, 1/dataSize.y);
        return position.mult(dataToUnitProportion).mult(imageSize);
    }
}

const playButtonEl = document.querySelector('#play-button');
playButtonEl.addEventListener('click', drawImage);