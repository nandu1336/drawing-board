let canvas = document.getElementById('myCanvas');
let canvasWrapper = document.getElementById("canvasWrapper");
canvas.height = 500;
canvas.width = canvasWrapper.clientWidth;

let context = canvas.getContext("2d");
context.font = "22px Ubuntu Mono normal";

let fromX = 0;
let fromY = 0;
let toX = 0;
let toY = 0;
let isDrawing = false;

let eraserSize = 5;
let pencilSize = 2;
let stepSize = 2;
let pencilColor = 'black';
let selectedTool = 'square';
let backgroundColor = 'white';
let prevSelectedTool = '';

let currentStackFrame = '';
let undoStack = [];
let redoStack = [];

let SPECIAL_KEYS = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];    //, "Alt", "Tab"];
let textBuffer = '';
let colorPickerId = "colorPicker__row";
let textX = 0;
let textY = 0;
let fontSize = 22;
let fontFamily = "Ubuntu Mono normal";
let fontColor = "black";

let shapeWidth = 0;
let shapeHeight = 0;
let prevWidth = null;
let prevHeight = null;
let shapesOnCanvas = new ShapesOnCanvas();
let fillerColor = "black";
let prevRadius = null;
let tempShape = null;

const updateStatus = () => {
    document.getElementById("statusBar__pencilSize").innerText = pencilSize;
    document.getElementById("statusBar__eraserSize").innerText = eraserSize;
    document.getElementById("statusBar__pencilColor").innerText = pencilColor;
    document.getElementById("statusBar__selectedTool").innerText = selectedTool;
    document.getElementById("statusBar__fontColor").innerText = fontColor;
    document.getElementById("statusBar__fontSize").innerText = fontSize;
}

const reset = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.closePath();
    eraserSize = 5;
    pencilSize = 2;
    pencilColor = 'black';
    selectedTool = 'square';
    updateStatus();
    handlePencilSelection();
    canvas.style.backgroundColor = "white";
    document.getElementById("backgroundColorPicker").style.backgroundColor = "white";
    currentStackFrame = '';
    undoStack = [];
    redoStack = [];
    fromX = 0;
    fromY = 0;
    toX = 0;
    toY = 0;
    fontSize = 22;
    fontFamily = "Ubuntu Mono normal";
    document.getElementById('eraser__button').classList.remove('selected');
    document.getElementById('pencil__button').classList.add("selected");
}


document.addEventListener('mouseup', () => {
    isDrawing = false; context.closePath();
})

const clearCurrentText = () => {
    let fontStyles = context.font;
    let fontSize = 0;

    let s = fontStyles.split(" ")[0];
    let pxIndex = s.indexOf("px");

    if (pxIndex > -1) {
        fontSize = s.substring(0, pxIndex);
    }


    fontSize = parseFloat(fontSize);
    context.clearRect(textX - 1, textY - fontSize, fontSize * (textBuffer.length + 1), fontSize + 5);

}

window.onload = () => {

    document.addEventListener('keydown', (e) => {
        if (selectedTool == 'text') {
            isDrawing = false;
            let key = e.key;


            if (SPECIAL_KEYS.includes(key)) {
                if (key == "Backspace") {
                    textBuffer = textBuffer.substring(0, (textBuffer.length - 1));
                }
            }
            else {
                textBuffer += key;
            }

            clearCurrentText();
            context.fillText(textBuffer, textX, textY);
        }

    });

    canvas.addEventListener('mousedown', (e) => {

        if (selectedTool === 'text') {
            textX = e.offsetX;
            textY = e.offsetY;
            textBuffer = '';
        }

        else if (Object.keys(shapes).includes(selectedTool)) {
            isDrawing = true;
            originX = e.offsetX;
            originY = e.offsetY;
            tempShape = createShape(originX, originY, context, selectedTool);
        }

        else if (selectedTool == 'pencil') {
            isDrawing = true;
            fromX = e.offsetX;
            fromY = e.offsetY;
            context.beginPath();
            context.moveTo(fromX, fromY);

        }

        else if (selectedTool == 'colorFiller') {
            let selectedShape = shapesOnCanvas.shapes.filter(shape => shape.isInside(e.offsetX, e.offsetY));
            selectedShape = selectedShape.length ? selectedShape[0] : null;
            if (!selectedShape) {
                return alert("Color filler works on shapes. Add a shape and try again.");
            }
            selectedShape.fillColor(context);
        }

    });

    canvas.addEventListener('mouseup', (e) => {
        toX = e.offsetX;
        toY = e.offsetY;

        if (Object.keys(shapes).includes(selectedTool)) {
            tempShape.draw(toX, toY);
            shapesOnCanvas.push(tempShape);
        }

        else if (selectedTool == "pencil") {
            context.moveTo(toX, toY);
            context.lineTo(toX, toY);
            context.stroke();
            isDrawing = false;
            context.closePath();
            originX = 0;
            originY = 0;
        }
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

        if (Object.keys(shapes).includes(selectedTool)) {
            tempShape.drawOutline(toX, toY);
        }

        else if (selectedTool == 'pencil') {
            context.setLineDash([]);
            context.lineTo(toX, toY);
            context.stroke();
            fromX = toX;
            fromY = toY;
        }
        shapesOnCanvas.resortShapes();
    });

}


const changeCursor = (tool) => {
    if (tool.cursorType === "custom") {
        canvas.style.cursor = `url('${tool.cursor}'), auto`;
        return;
    };
    canvas.style.cursor = tool.cursor;
}


// Onclick handlers for all the tools
const changeHighlighter = (clickedItem) => {
    if (prevSelectedTool) {
        let ps = document.getElementById(prevSelectedTool + '__button');
        if (!ps) return;
        ps.classList.remove("selected");
    }
    selectedTool = clickedItem.id;
    prevSelectedTool = selectedTool;
    updateStatus();

    let cs = document.getElementById(selectedTool + '__button');
    if (!cs) return;
    cs.classList.add("selected");
    changeCursor(clickedItem);
}

const increase = (tool) => {

    if (selectedTool == 'eraser') {
        eraserSize += stepSize;
        context.lineWidth = eraserSize;
    }
    else if (selectedTool == 'text') {
        fontSize += stepSize;
        context.font = fontSize + "px " + fontFamily;
    }
    else {
        pencilSize += stepSize;
        context.lineWidth = pencilSize;
    }
    updateStatus();
}

const decrease = (tool) => {
    if (selectedTool == 'eraser') {
        eraserSize -= stepSize;
        if (eraserSize <= 0) eraserSize = stepSize;
        context.lineWidth = eraserSize;
    }
    else if (selectedTool == 'text') {
        fontSize -= stepSize;
        if (fontSize <= 0) fontSize = stepSize;
        context.font = fontSize + "px " + fontFamily;
    }
    else {
        pencilSize -= stepSize;
        if (pencilSize <= 0) pencilSize = stepSize;
        context.lineWidth = pencilSize;
    }
    updateStatus();
};

const handlePencilSelection = (tool = undefined) => {
    if (!tool) {
        tool = { toolName: "pencil", symbol: '!', id: 'pencil', iconPath: './icons/pencil.svg', handler: "handlePencilSelection", cursorType: "custom", cursor: './icons/pencil.svg' };
    }

    changeHighlighter(tool);
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = pencilSize;
    updateStatus();
}

const handleEraserSelection = (tool) => {
    changeHighlighter(tool);
    context.lineWidth = eraserSize;
    context.globalCompositeOperation = 'destination-out';
    updateStatus();
}

const handleBackgroundColorPicker = (tool) => {
    changeHighlighter(tool);
    updateStatus();
}

const handleUndo = (tool) => {
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

const handleRedo = (tool) => {
    if (!redoStack.length) return;

    let sf = redoStack.pop();
    undoStack.push(currentStackFrame);
    currentStackFrame = sf;
    context.putImageData(sf, 0, 0);
    updateStatus();
}

const handleTextSelection = (tool) => {
    console.log("handleTextSelection");
    changeHighlighter(tool);
}

const handleColorFillerSelection = (tool) => {
    console.log("tool in handleColorFillerSelection:", tool);
    changeHighlighter(tool);
}

// const handleListShapesSelection = (tool) => {
//     changeHighlighter(tool);
// }

const changeFontFamily = () => {
    fontFamily = document.getElementById('fontFamilySelector').value;
    context.font = fontSize + "px " + fontFamily;
}
// Tools 


const tools = [
    { toolName: "pencil", id: 'pencil', iconPath: './icons/pencil.svg', handler: "handlePencilSelection", cursorType: "custom", cursor: './icons/pencil.svg', hasChildern: false, classes: [] },
    { toolName: "eraser", id: 'eraser', iconPath: './icons/eraser.svg', handler: "handleEraserSelection", cursorType: "custom", cursor: './icons/eraser.svg', hasChildern: false, classes: [] },
    { toolName: "increaser", id: 'increaser', iconPath: './icons/plus.svg', handler: "increase", cursorType: "builtIn", cursor: 'default', hasChildern: false, classes: [] },
    { toolName: "decreaser", id: 'decreaser', iconPath: './icons/minus.svg', handler: "decrease", cursorType: "builtIn", cursor: 'default', hasChildern: false, classes: [] },
    { toolName: "undo", id: 'undo', iconPath: './icons/undo.svg', handler: "handleUndo", cursorType: "builtIn", cursor: 'default', hasChildern: false, classes: [] },
    { toolName: "redo", id: 'redo', iconPath: './icons/redo.svg', handler: "handleRedo", cursorType: "builtIn", cursor: 'default', hasChildern: false, classes: [] },
    { toolName: "background color picker", id: 'backgroundColorPicker', symbol: '', handler: "handleBackgroundColorPicker", cursorType: "builtIn", cursor: 'default', hasChildern: false, classes: [] },
    { toolName: "text", id: 'text', iconPath: './icons/text.svg', handler: "handleTextSelection", cursorType: "builtIn", cursor: 'text', hasChildern: false, classes: [] },
    { toolName: "listShapes", id: 'listShapes', iconPath: './icons/listShapes.svg', handler: "", cursorType: "builtIn", cursor: 'default', hasChildern: true, classes: ['tooltip'] },
    { toolName: "filler", id: 'colorFiller', iconPath: './icons/color-fill.svg', handler: "handleColorFillerSelection", cursorType: "custom", cursor: 'icons/color-fill.svg', hasChildern: false, classes: [] }
];
let basicTools = document.getElementById("basic");
let toolItems = '';

// creates basic buttons in the tool bar

tools.map((tool) => {

    if (tool.id == "backgroundColorPicker") {
        toolItems += `
        <button class="toolItem" id="${tool.id}__button">
            <div 
                onclick='${tool.handler}(${JSON.stringify(tool)})'
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
        toolItems += `
            <button 
                class="toolItem ${tool.classes ? tool.classes.join(' ') : ''}"
                id="${tool.id}__button"
            >`
        toolItems += `
            <img 
                id=${tool.id} 
                src="${tool.iconPath}" 
                onclick=' ${tool.handler}(${JSON.stringify(tool)})' 
            />`;

        if (tool.hasChildern)
            toolItems += `<div class="tooltiptext" id="${tool.id}__children"></div>`

        toolItems += `</button>`;
    }
})
basicTools.innerHTML = toolItems;

reset();

// onclick handlers for color picker

const handleColorSelection = (color) => {
    if (selectedTool == "pencil")
        changeStrokeColor(color);

    else if (selectedTool == "backgroundColorPicker")
        changeBackgroundColor(color);

    else if (selectedTool == "text") {
        fontColor = color.colorName;
        context.fillStyle = color.colorCode;
    }

    else if (selectedTool == "colorFiller") {
        fillerColor = color.colorName;
        context.fillStyle = color.colorCode;
    }

    updateStatus();
}

const changeStrokeColor = (color) => {

    context.strokeStyle = color.colorCode;
    pencilColor = color.colorName;
}

const changeBackgroundColor = (color) => {

    backgroundColor = color.colorCode;
    canvas.style.backgroundColor = color.colorCode;
    document.getElementById("backgroundColorPicker").style.backgroundColor = color.colorCode;
}

// color picker boxes

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

const generateColors = () => {
    console.log("generateColors called.");

}


// code to add color picker to the toolbar

colorRows.map((row, rowIndex) => {
    colorPalletes = '';
    row.map((column, columnIndex) => {
        colorPalletes += `
        <div
            onclick='handleColorSelection(${JSON.stringify(column)})'
            class="one column" 
            style="background-color: ${column.colorCode}; width: 20px; height: 20px; margin: 2px" 
            id="${colorPickerId}${rowIndex + 1}${columnIndex + 2}"
        ></div>`
    })
    document.getElementById(`${colorPickerId}${rowIndex + 1}`).innerHTML = colorPalletes;
    colorPalletes = '';

})


// Font Family

let availabelFonts = ['Ubuntu Mono', 'Share Tech Mono',];
let fontFamilyOptions = '';

availabelFonts.map(eachFont => {
    fontFamilyOptions += `<option value="${eachFont}">${eachFont}</option>`;
});

document.getElementById("fontFamilySelector").innerHTML = fontFamilyOptions;


// shapes

const shapes = {
    square: { shapeName: 'square', iconPath: './icons/square.svg', cursorType: 'builtIn', cursor: 'crosshair' },
    triangle: { shapeName: 'triangle', iconPath: './icons/triangle.svg', cursorType: 'builtIn', cursor: 'crosshair' },
    circle: { shapeName: 'circle', iconPath: './icons/circle.svg', cursorType: 'builtIn', cursor: 'crosshair' },
}
let toolTipChildren = '';

Object.keys(shapes).map(shape => {
    toolTipChildren += `<img src="${shapes[shape].iconPath}" onClick='shapeChanged(${JSON.stringify(shapes[shape])})'></img>`;
});

document.getElementById('listShapes__children').innerHTML = toolTipChildren;

// onclick handlers for shapes

const shapeChanged = (shape) => {
    let tool = { toolName: "listShapes", id: 'listShapes', iconPath: './icons/listShapes.svg', handler: "handleListShapesSelection", cursorType: "builtIn", cursor: 'crosshair', hasChildern: true, classes: ['tooltip'] }
    changeHighlighter(tool);
    selectedTool = shape.shapeName;
    context.globalCompositeOperation = "source-over";
}