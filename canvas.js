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

let updateStatus = () => {
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
}

document.addEventListener('mouseup', (e) => { isDrawing = false; context.closePath(); })

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

// Tool handlers

const erase = () => context.globalCompositeOperation = 'destination-out';
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
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = pencilSize;
    updateStatus();
    prevSelectedTool = selectedTool;
    document.getElementById("myCanvas").classList.remove('eraserCursor');
    document.getElementById("myCanvas").classList.add('pencilCursor');
}

// Tools 

const tools = [
    { toolName: "pencil", symbol: '!', id: 'pencil', iconPath: './icons/pencil.svg' },
    { toolName: "eraser", symbol: '[]', id: 'eraser', iconPath: './icons/eraser.svg' },
    { toolName: "increaser", symbol: '+', id: 'increaser', iconPath: './icons/plus.svg' },
    { toolName: "decreaser", symbol: '-', id: 'decreaser', iconPath: './icons/minus.svg' },
    { toolName: "undo", symbol: '<-', id: 'undo', iconPath: './icons/undo.svg' },
    { toolName: "redo", symbol: '->', id: 'redo', iconPath: './icons/redo.svg' },
    { toolName: "background color picker", id: 'backgroundColorPicker', symbol: '' }

];
let basicTools = document.getElementById("basic");
let toolItems = '';

// creates basic buttons in the tool bar

tools.map((tool) => {

    if (tool.id == "backgroundColorPicker") {
        toolItems += `
        <button class="toolItem" id="${tool.id}__button">
            <div 
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
            toolItems += `<img id=${tool.id} src="${tool.iconPath}" />`;
        }
        else {
            toolItems += `<span id=${tool.id}>${tool.symbol}</span>`;
        }
        toolItems += `</button>`;
    }
})
basicTools.innerHTML = toolItems;

// adds onclick handlers for the above created buttons.

const pencil = document.getElementById("pencil");
const eraser = document.getElementById("eraser");
const increaser = document.getElementById("increaser");
const decreaser = document.getElementById("decreaser");
const undo = document.getElementById("undo");
const redo = document.getElementById("redo");
const backgroundColorPicker = document.getElementById("backgroundColorPicker");

const toolsArray = [pencil, eraser, increaser, decreaser, undo, redo, backgroundColorPicker];
let prevSelectedTool = '';

toolsArray.map(tool => {
    if (!tool) return;

    tool.addEventListener('click', (e) => {
        let clickedItem = e.target.id;

        if (["pencil", "eraser", "backgroundColorPicker"].includes(clickedItem)) {
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

        if (clickedItem == "pencil") {
            handlePencilClick();
        }

        else if (clickedItem == 'increaser') {
            increase();
        }
        else if (clickedItem == 'decreaser') {
            decrease();
        }
        else if (clickedItem == 'eraser') {
            document.getElementById("myCanvas").classList.remove('pencilCursor');
            document.getElementById("myCanvas").classList.add('eraserCursor');

            context.lineWidth = eraserSize;
            erase();
            updateStatus();
        }
        else if (clickedItem == "backgroundColorPicker") {
            document.getElementById("myCanvas").classList.remove('eraserCursor');
            document.getElementById("myCanvas").classList.remove('pencilCursor');
        }

    });

});


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
