import { vec2 } from '../math/vector.js';
import { vtx2 } from '../math/vertex.js';
//    msb
//   8 o------o 4
//     |      |
//     |      |
//   1 o------o 2
//    lsb
export const lookupTable = {
    0b0000: [[vtx2(0.00, 0.00, true), vtx2(0.00, 1.00, true), vtx2(1.00, 1.00, true), vtx2(1.00, 0.00, true)]],
    0b0001: [[vtx2(0.50, 0.00), vtx2(0.00, 0.50), vtx2(0.00, 1.00, true), vtx2(1.00, 1.00, true), vtx2(1.00, 0.00, true)]],
    0b0010: [[vtx2(1.00, 0.50), vtx2(0.50, 0.00), vtx2(0.00, 0.00, true), vtx2(0.00, 1.00, true), vtx2(1.00, 1.00, true)]],
    0b0011: [[vtx2(1.00, 0.50), vtx2(0.00, 0.50), vtx2(0.00, 1.00, true), vtx2(1.00, 1.00, true)]],
    0b0100: [[vtx2(0.50, 1.00), vtx2(1.00, 0.50), vtx2(1.00, 0.00, true), vtx2(0.00, 0.00, true), vtx2(0.00, 1.00, true)]],
    0b0101: [[vtx2(0.50, 1.00), vtx2(0.00, 0.50), vtx2(0.00, 1.00, true)], [vtx2(0.50, 0.00), vtx2(1.00, 0.50), vtx2(1.00, 0.00, true)]],
    0b0110: [[vtx2(0.50, 1.00), vtx2(0.50, 0.00), vtx2(0.00, 0.00, true), vtx2(0.00, 1.00, true)]],
    0b0111: [[vtx2(0.50, 1.00), vtx2(0.00, 0.50), vtx2(0.00, 1.00, true)]],
    0b1000: [[vtx2(0.00, 0.50), vtx2(0.50, 1.00), vtx2(1.00, 1.00, true), vtx2(1.00, 0.00, true), vtx2(0.00, 0.00, true)]],
    0b1001: [[vtx2(0.50, 0.00), vtx2(0.50, 1.00), vtx2(1.00, 1.00, true), vtx2(1.00, 0.00, true)]],
    0b1010: [[vtx2(1.00, 0.50), vtx2(0.50, 1.00), vtx2(1.00, 1.00, true)], [vtx2(0.00, 0.50), vtx2(0.50, 0.00), vtx2(0.00, 0.00, true)]],
    0b1011: [[vtx2(1.00, 0.50), vtx2(0.50, 1.00), vtx2(1.00, 1.00, true)]],
    0b1100: [[vtx2(0.00, 0.50), vtx2(1.00, 0.50), vtx2(1.00, 0.00, true), vtx2(0.00, 0.00, true)]],
    0b1101: [[vtx2(0.50, 0.00), vtx2(1.00, 0.50), vtx2(1.00, 0.00, true)]],
    0b1110: [[vtx2(0.00, 0.50), vtx2(0.50, 0.00), vtx2(0.00, 0.00, true)]],
    0b1111: [[]]
};
Object.seal(lookupTable);


function thresholdData(data, value) {
    // clona o vetor de dados
    let filteredData = data.map(x => x);

    // itera, transformando o vetor de dados em binário
    return filteredData.map(line => line.map(x => x < value ? 0 : 1));
}

/**
 * Visits the cell (i,j) and returns which polygons it contains.
 * @param {Array} thresholdedData 
 * @param {Number} i vertical index of the top of the cell
 * @param {Number} j horizontal index of the left of the cell
 * @param {Array} originalData [optional] if provided, linear interpolation will be used.
 */
function march(thresholdedData, i, j, originalData, threshold) {
    // verifica a vizinhança da célula (i,j)
    let cellIndexInLookupTable = 0;
    cellIndexInLookupTable += 8 * (1-thresholdedData[i+0][j+0]);    // cima-esquerda
    cellIndexInLookupTable += 4 * (1-thresholdedData[i+0][j+1]);    // cima-direita
    cellIndexInLookupTable += 2 * (1-thresholdedData[i+1][j+1]);    // baixo-direita
    cellIndexInLookupTable += 1 * (1-thresholdedData[i+1][j+0]);    // baixo esquerda

    // olha na tabela para ver quais vértices devem existir na célula
    let polygons = lookupTable[cellIndexInLookupTable];

    // se for para interpolar, acha as interseções das arestas
    if (originalData && Array.isArray(originalData)) {
        const topLeftOriginal = originalData[i+0][j+0];        
        const topRightOriginal = originalData[i+0][j+1];        
        const bottomRightOriginal = originalData[i+1][j+1];        
        const bottomLeftOriginal = originalData[i+1][j+0];
        
        const topRatio = (threshold - topLeftOriginal) / (topRightOriginal - topLeftOriginal);
        const rightRatio = (threshold - bottomRightOriginal) / (topRightOriginal - bottomRightOriginal);
        const bottomRatio = (threshold - bottomLeftOriginal) / (bottomRightOriginal - bottomLeftOriginal);
        const leftRatio = (threshold - bottomLeftOriginal) / (topLeftOriginal - bottomLeftOriginal);

        polygons = polygons.map(vertices => vertices.map(v => {
            let x = v.x;
            let y = v.y;

            if (y === 1 && x !== 0 && x !== 1) {
                x = topRatio;
            } else if (y === 0 && x !== 0 && x !== 1) {
                x = bottomRatio;
            } else if (x === 1 && y !== 0 && y !== 1) {
                y = rightRatio;
            } else if (x === 0 && y !== 0 && y !== 1) {
                y = leftRatio;
            }

            return vtx2(x, y, v.inside);
        }));
    } 

    // converte as coordenadas dos vértices do sistema da célula para da imagem
    let cellCenter = vec2(j*1.0, i*1.0);
    polygons = polygons.map(vertices => vertices.map(v => v.mult(vec2(1, -1)).add(vec2(0, 1)).add(cellCenter)));


    // retorna os polígonos dentro desta célula
    return polygons;
}


export function marchingSquares(data, threshold, interpolate = false) {
    const polygons = [];
    const thresholdedData = thresholdData(data, threshold);
    
    for (let i = 0, line = data[i]; i < data.length - 1; i++) {
        for (let j = 0, x = line[j]; j < line.length - 1; j++) {
            polygons.push(...march(thresholdedData, i, j, interpolate ? data : null, threshold));
        }
    }

    return polygons;
}
