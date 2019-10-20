const spreadsheetEl = document.querySelector('.spreadsheet');
const spreadsheetWidthEl = document.querySelector('#input-width');
const spreadsheetHeightEl = document.querySelector('#input-height');
const dataDimension = {
    width: 1,
    height: 1
};

function prepareSpreadsheetInputEvents(el) {    
    // colocar evento de teclado para parecer uma planilha mesmo
    el.removeEventListener('keydown', inputKeyPressed);
    el.addEventListener('keydown', inputKeyPressed);
    el.removeEventListener('focus', selectContent);
    el.addEventListener('focus', selectContent);
    
    function inputKeyPressed(e) {
        const width = +spreadsheetWidthEl.value;
        const height = +spreadsheetHeightEl.value;
        const el = e.currentTarget;
        const allInputs = Array.from(spreadsheetEl.children);
        const elementIndex = allInputs.indexOf(el);
        const elementRow = Math.floor(elementIndex / width);
        const elementColumn = elementIndex % width;
        
        switch (e.key) {
            // selecionar o próximo da direita
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (elementColumn !== width-1) {
                    allInputs[elementIndex+1].focus();
                }
                break;
            // anterior (esquerda)
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (elementColumn !== 0) {
                    allInputs[elementIndex-1].focus();
                }
                break;
            // cima
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (elementRow !== 0) {
                    allInputs[elementIndex-width].focus();
                }
                break;
            // baixo
            case 'ArrowDown':
            case 's':
            case 'S':
            case 'Enter':
                if (elementRow !== height-1) {
                    allInputs[elementIndex+width].focus();
                }
                break;
        }

        if (['ArrowUp', 'ArrowDown'].indexOf(e.key) !== -1) {
            e.preventDefault();
        }
    }

    function selectContent(e) {
        e.currentTarget.select();
    }
}

function prepareSpreadsheet(e) {
    // olha qual é a largura x altura dos dados, para saber a quantidade de inputs
    let width = +spreadsheetWidthEl.value;
    let height = +spreadsheetHeightEl.value;

    // adiciona novas inputs, se precisar
    for (let j = width-dataDimension.width; j > 0; j--) {
        addInputColumn();
    }
    for (let i = height-dataDimension.height; i > 0; i--) {
        addInputRow();
    }
    
    // remove alguns inputs, se precisar
    for (let j = dataDimension.width - width; j > 0; j--) {
        removeInputColumn();
    }
    for (let i = dataDimension.height - height; i > 0; i--) {
        removeInputRow();
    }

    // coloca os eventos no input que já estava lá
    prepareSpreadsheetInputEvents(spreadsheetEl.children[0]);

    // define o estilo do container (.spreadsheet) para mostrar os inputs nas
    // linhas e colunas certas
    spreadsheetEl.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    spreadsheetEl.style.gridTemplateColumns = `repeat(${width}, var(--item-width))`;
    spreadsheetEl.style.setProperty('--item-width', `${100 / width}%`);

    dataDimension.width = width;
    dataDimension.height = height;


    function addInputColumn() {
        // insere uma quantidade de inputs igual ao número de linhas e ao final de cada uma
        for (let i = dataDimension.height; i > 0; i--) {
            const beginOfNextRow = i * dataDimension.width;
            insertNewInputAt(spreadsheetEl.children[beginOfNextRow]);
        }
    }

    function addInputRow() {
        // insere uma quantidade de inputs igual ao número de colunas e ao final de cada uma
        for (let j = 0; j < width; j++) {
            const index = width*dataDimension.height + j;
            insertNewInputAt(spreadsheetEl.children[index]);
        }
    }

    function removeInputColumn() {
        // remove os inputs com índices w-1, w*2-1, w*3-1...
        for (let i = dataDimension.height; i > 0; i--) {
            const index = dataDimension.width *i - 1;
            removeInputAt(index);
        }
    }
    
    function removeInputRow() {
        // remove os inputs com índices h+w-1, h+w-2, h+w-3...
        for (let j = width-1; j >= 0; j--) {
            const index = (dataDimension.height-1)*width + j;
            removeInputAt(index);
        }
    }

    function insertNewInputAt(beforeIndex) {
        const newInputEl = document.createElement('input');
        newInputEl.type = 'number';
        newInputEl.min = 0;
        newInputEl.max = 255;
        newInputEl.maxLength = 3;
        newInputEl.value = 0;
        spreadsheetEl.insertBefore(newInputEl, beforeIndex);
        prepareSpreadsheetInputEvents(newInputEl);
    }

    function removeInputAt(index) {
        const toRemoveEl = spreadsheetEl.children[index];
        spreadsheetEl.removeChild(toRemoveEl);
    }
}

function loadSpreadsheetData(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[0].length; j++) {
            spreadsheetEl.children[i*data[0].length+j].value = data[i][j];
        }
    }
}



// configura botões de largura/altura dos dados de input
[spreadsheetWidthEl, spreadsheetHeightEl].forEach(el => el.addEventListener('input', prepareSpreadsheet));
prepareSpreadsheet();
loadSpreadsheetData([
    [0, 1, 1, 3, 2],
    [1, 3, 6, 6, 3],
    [3, 7, 9, 7, 3],
    [2, 7, 8, 6, 2],
    [1, 2, 3, 4, 3]
]);




const dataProviders = {
    spreadsheet: {
        getData() {
            const width = +spreadsheetWidthEl.value;
            const height = +spreadsheetHeightEl.value;
            const spreadsheetInputElements = spreadsheetEl.querySelectorAll('input');
            const data = [];
            for (let i = 0; i < height; i++) {
                data.push([]);
                for (let j = 0; j < width; j++) {
                    const inputIndex = j + i*width;
                    data[i].push(+spreadsheetInputElements[inputIndex].value || 0);
                }
            }

            return data;
        }
    },
    dropImage: {
        getData() {

        }
    }
};


export const input = {
    getData() {
        // pega qual tipo de input está ativado
        const activeTabbedButton = document.querySelector('.tabbed-button.tab-active').dataset.inputType;

        // pega os dados do tipo de input ativado
        const inputProvider = dataProviders[activeTabbedButton];

        return inputProvider.getData();
    }
};

