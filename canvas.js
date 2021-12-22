let canvas = document.getElementById('myCanvas');
canvas.height = 500;
canvas.width = 950;

let context = canvas.getContext("2d");
let para = document.getElementById("para");
let fromX = 0;
let fromY = 0;
let toX = 0;
let toY = 0;
let isDrawing = false;

let eraserSize = 5;
let pencilSize = 2;
let pencilColor = 'black';
let selectedTool = 'pencil';
let backgroundColor = 'white';
let prevSelectedTool = '';

let currentStackFrame = '';
let undoStack = [];
let redoStack = [];

const updateStatus = () => {
    document.getElementById("statusBar__pencilSize").innerText = pencilSize;
    document.getElementById("statusBar__eraserSize").innerText = eraserSize;
    document.getElementById("statusBar__pencilColor").innerText = pencilColor;
    document.getElementById("statusBar__selectedTool").innerText = selectedTool;
}

const reset = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.closePath();
    eraserSize = 5;
    pencilSize = 2;
    pencilColor = 'black';
    selectedTool = 'pencil';
    updateStatus();
    handlePencilClick();
    document.getElementById('eraser__button').classList.remove('selected');
    document.getElementById('pencil__button').classList.add("selected");
    canvas.style.backgroundColor = "white";

    currentStackFrame = '';
    undoStack = [];
    redoStack = [];
}

document.addEventListener('mouseup', () => { isDrawing = false; context.closePath(); })

window.onload = () => {

    canvas.addEventListener('mousedown', (e) => {

        isDrawing = true;
        fromX = e.offsetX;
        fromY = e.offsetY;
        context.beginPath();
        context.moveTo(fromX, fromY);

    });

    canvas.addEventListener('mouseup', (e) => {
        toX = e.offsetY;
        toY = e.offsetX;
        context.moveTo(toX, toY);
        context.lineTo(toX, toY);

        context.stroke();
        isDrawing = false;
        context.closePath();

        // storing current canvas data into stack
        if (currentStackFrame) {
            undoStack.push(currentStackFrame);
        }
        currentStackFrame = context.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mouseleave', (e) => {
        context.closePath();
    });

    canvas.addEventListener('mouseenter', (e) => {
        if (!isDrawing) return;
        context.beginPath();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        toX = e.offsetX;
        toY = e.offsetY;
        context.lineTo(toX, toY);
        context.stroke();
        fromX = toX;
        fromY = toY;
    });

}

// Onclick handlers for all the tools
const changeHighlighter = (clickedItem) => {
    if (prevSelectedTool) {
        let ps = document.getElementById(prevSelectedTool + '__button');
        if (!ps) return;
        ps.classList.remove("selected");
    }
    selectedTool = clickedItem;
    prevSelectedTool = selectedTool;
    updateStatus();

    let cs = document.getElementById(selectedTool + '__button');
    if (!cs) return;
    cs.classList.add("selected");
}

const increase = () => {
    if (selectedTool == 'eraser') {
        eraserSize += 2;
        context.lineWidth = eraserSize;
    }
    else {
        pencilSize += 2;
        context.lineWidth = pencilSize;
    }
    updateStatus();
}

const decrease = () => {
    if (selectedTool == 'eraser') {
        eraserSize -= 2;
        if (eraserSize <= 0) eraserSize = 2;
        context.lineWidth = eraserSize;
    }
    else {
        pencilSize -= 2;
        if (pencilSize <= 0) pencilSize = 2;
        context.lineWidth = pencilSize;
    }
    updateStatus();
};

const handlePencilClick = () => {
    clickedItem = "pencil";
    changeHighlighter(clickedItem);
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = pencilSize;

    document.getElementById("myCanvas").classList.remove('eraserCursor');
    document.getElementById("myCanvas").classList.add('pencilCursor');
    updateStatus();
}

const handleEraser = () => {
    clickedItem = "eraser";
    changeHighlighter(clickedItem);
    context.lineWidth = eraserSize;
    context.globalCompositeOperation = 'destination-out';

    document.getElementById("myCanvas").classList.remove('pencilCursor');
    document.getElementById("myCanvas").classList.add('eraserCursor');
    updateStatus();
}

const handleBackgroundColorPicker = () => {
    clickedItem = "backgroundColorPicker";
    console.log("handleBackgroundColoPicker called")
    changeHighlighter(clickedItem);

    document.getElementById("myCanvas").classList.remove('eraserCursor');
    document.getElementById("myCanvas").classList.remove('pencilCursor');
    updateStatus();
}

const handleUndo = () => {
    let ps;
    redoStack.push(currentStackFrame);

    if (!undoStack.length) {
        ps = new ImageData(canvas.width, canvas.height);
    }
    else {
        ps = undoStack.pop();
    }

    currentStackFrame = ps;
    context.putImageData(currentStackFrame, 0, 0);
    updateStatus();
}

const handleRedo = () => {

    if (!redoStack.length) return;

    let sf = redoStack.pop();
    undoStack.push(currentStackFrame);
    currentStackFrame = sf;
    context.putImageData(sf, 0, 0);
    updateStatus();
}

// Tools 

const tools = [
    { toolName: "pencil", symbol: '!', id: 'pencil', iconPath: './icons/pencil.svg', handler: "handlePencilClick" },
    { toolName: "eraser", symbol: '[]', id: 'eraser', iconPath: './icons/eraser.svg', handler: "handleEraser" },
    { toolName: "increaser", symbol: '+', id: 'increaser', iconPath: './icons/plus.svg', handler: "increase" },
    { toolName: "decreaser", symbol: '-', id: 'decreaser', iconPath: './icons/minus.svg', handler: "decrease" },
    { toolName: "undo", symbol: '<-', id: 'undo', iconPath: './icons/undo.svg', handler: "handleUndo" },
    { toolName: "redo", symbol: '->', id: 'redo', iconPath: './icons/redo.svg', handler: "handleRedo" },
    { toolName: "background color picker", id: 'backgroundColorPicker', symbol: '', handler: "handleBackgroundColorPicker" },

];
let basicTools = document.getElementById("basic");
let toolItems = '';

// creates basic buttons in the tool bar

tools.map((tool) => {

    if (tool.id == "backgroundColorPicker") {
        toolItems += `
        <button class="toolItem" id="${tool.id}__button">
            <div 
                onclick="${tool.handler}()"
                id = ${tool.id}
                style="
                    background-color: ${backgroundColor}; 
                    width: 20px; height: 20px;
                    
                    border: 2px solid black;
                    display: inline-block"
            ></div>
        </button>`;
    }
    else {
        toolItems += `<button class="toolItem" id="${tool.id}__button">`
        if (tool.iconPath) {
            toolItems += `<img id=${tool.id} src="${tool.iconPath}" onclick="${tool.handler}()"/>`;
        }
        else {
            toolItems += `<span id=${tool.id} onclick="${tool.handler}()">${tool.symbol}()</span>`;
        }
        toolItems += `</button>`;
    }
})
basicTools.innerHTML = toolItems;



updateStatus();
reset();

// color picker
const handleColorSelection = (color) => {
    if (selectedTool == "pencil") {
        return changeStrokeColor(color);
    }

    return changeBackgroundColor(color);
}

const changeStrokeColor = (color) => {

    context.strokeStyle = color.colorCode;
    pencilColor = color.colorName;
    updateStatus();
}

const changeBackgroundColor = (color) => {

    backgroundColor = color.colorCode;
    canvas.style.backgroundColor = color.colorCode;
    document.getElementById("backgroundColorPicker").style.backgroundColor = color.colorCode;
    updateStatus();
}

let colorPickerId = "colorPicker__row";

let colorRows = [
    [
        { colorName: "Violet", colorCode: "#9400D3" },
        { colorName: "Indigo", colorCode: "#4B0082" },
        { colorName: "Blue", colorCode: "#0000FF" },
        { colorName: "Green", colorCode: "#00FF00" },
        { colorName: "Yellow", colorCode: "#FFFF00" },
        { colorName: "Orange", colorCode: "#FF7F00" },
    ],
    [
        { colorName: "Red", colorCode: "#FF0000" },
        { colorName: "Blue Grey", colorCode: "#90ADC6" },
        { colorName: "Pewter", colorCode: "#E9EAEC" },
        { colorName: "Dark Blue", colorCode: "#333652" },
        { colorName: "Pink", colorCode: "#E151AF" },
        { colorName: "Burgundy", colorCode: "#870A30" },
    ]
];


colorRows.map((row, rowIndex) => {
    colorPalletes = '';
    row.map((column, columnIndex) => {
        colorPalletes += `
        <div
            onclick='handleColorSelection(${JSON.stringify(column)})'
            class="one column" 
            style="background-color: ${column.colorCode}; width: 20px; height: 20px" 
            id="${colorPickerId}${rowIndex + 1}${columnIndex + 2}"
        ></div>`
    })
    document.getElementById(`${colorPickerId}${rowIndex + 1}`).innerHTML = colorPalletes;
    colorPalletes = '';

})
