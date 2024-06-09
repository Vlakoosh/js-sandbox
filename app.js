const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const buttonSand = document.getElementById("buttonSand");
const buttonWater = document.getElementById("buttonWater");
const buttonGround = document.getElementById("buttonGround");
const buttonEmpty = document.getElementById("buttonEmpty");
const buttonRedSand = document.getElementById("buttonRedSand");
const buttonSteam = document.getElementById("buttonSteam");

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 200;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.style.backgroundColor = "whitesmoke";

let bufferData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
let buffer = bufferData.data;

class Cell {
    constructor(name, state, color) {
        this.updatable = true;
        this.colorOffset = Math.random();
        this.name = name;
        this.state = state;
        this.color = color;
    }

    setUpdatable(update) {
        this.updatable = update;
    }

    isCellUpdatable() {
        return this.updatable;
    }

    getColor(c, x, y) {
        if (c === "r") {
            return parseInt(this.color.substring(1, 3), 16) / (1 + (this.colorOffset * 0.15));
        }
        if (c === "g") {
            return parseInt(this.color.substring(3, 5), 16) / (1 + (this.colorOffset * 0.15));
        }
        if (c === "b") {
            return parseInt(this.color.substring(5, 7), 16) / (1 + (this.colorOffset * 0.15));
        }
    }
}

class CellEmpty extends Cell {
    constructor() {
        super("Empty", "none", "#000000");
    }

    getClassName() {
        return this.constructor.name;
    }
}

class CellGround extends Cell {
    constructor() {
        super("Ground", "solid", "#6b3e18");
    }

    getClassName() {
        return this.constructor.name;
    }
}

class CellSand extends Cell {
    constructor() {
        super("Sand", "sand", "#C2B280");
    }

    getClassName() {
        return this.constructor.name;
    }
}

class CellRedSand extends Cell {
    constructor() {
        super("Red Sand", "sand", "#a66228");
    }

    getClassName() {
        return this.constructor.name;
    }
}

class CellWater extends Cell {
    constructor() {
        super("Water", "liquid", "#7777FF");
    }

    getGas() {
        return new CellSteam();
    }
    getClassName() {
        return this.constructor.name;
    }
}

class CellSteam extends Cell {
    constructor() {
        super("Steam", "steam", "#afafff");
        this.liquid = new CellWater();
    }

    getClassName() {
        return this.constructor.name;
    }
}

let selectedMaterial = "ground";
let globalBrushSize = 5;

buttonWater.addEventListener("click", () => {
    selectedMaterial = "water";
});
buttonGround.addEventListener("click", () => {
    selectedMaterial = "ground";
});
buttonSand.addEventListener("click", () => {
    selectedMaterial = "sand";
});
buttonRedSand.addEventListener("click", () => {
    selectedMaterial = "redSand";
});
buttonEmpty.addEventListener("click", () => {
    selectedMaterial = "empty";
});
buttonSteam.addEventListener("click", () => {
    selectedMaterial = "steam";
});


let isPainting = false;

function startDrawing(e) {
    isPainting = true;
    ctx.beginPath();
    console.log(selectedMaterial);
    draw(e);
}

function finishDrawing() {
    isPainting = false;
    ctx.closePath();
}

function drawMaterial(x, y, material, brushSize) {

    for (let cx = -(brushSize-1); cx <= (brushSize-1); cx++){
        for (let cy = -(brushSize-1); cy <= (brushSize-1); cy++){
            try {
                let cell;
                switch (material){
                    case "empty":
                        cell = new CellEmpty();
                        break;
                    case "ground":
                        cell = new CellGround();
                        break;
                    case "water":
                        cell = new CellWater();
                        break;
                    case "sand":
                        cell = new CellSand();
                        break;
                    case "redSand":
                        cell = new CellRedSand();
                        break;
                    case "steam":
                        cell = new CellSteam();
                        break;
                }
                cellGrid[y+cy][x+cx] = cell;
            }
            catch (ignored){}
        }
    }

}

function draw(e) {
    if (!isPainting) return;
    let canvasRect = canvas.getBoundingClientRect();
    drawMaterial(Math.floor((e.clientX - canvasRect.left) / 3), Math.floor((e.clientY - canvasRect.top) / 3), selectedMaterial, globalBrushSize);
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", finishDrawing);
canvas.addEventListener("mousemove", draw);

let cellGrid = new Array(CANVAS_HEIGHT);
let bufferGrid = new Array(CANVAS_HEIGHT);

function initCellGrid(grid) {
    for (let i = 0; i < cellGrid.length; i++) {
        grid[i] = new Array(CANVAS_WIDTH);
    }
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            grid[row][col] = new CellEmpty();
        }
    }
}

function resetUpdatableCells() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            cellGrid[row][col].setUpdatable(true);
        }
    }
}

function copyBuffer() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            bufferGrid[row][col] = cellGrid[row][col];
        }
    }
}

function pasteBuffer() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            cellGrid[row][col] = bufferGrid[row][col];
        }
    }
}

function setSandRandomly() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            cellGrid[row][col] = (Math.random() > 0.9) ? new CellSand() : new CellEmpty();
        }
    }
}

function countSand() {
    let count = 0;
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            if (cellGrid[row][col].getClassName() === "CellSand") count++;
        }
    }
    return count;
}

function copyGridElements(copyToGrid, copyFromGrid) {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            copyToGrid[row][col] = copyFromGrid[row][col];
        }
    }
}

function loopThroughGrid() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {

        }
    }
}

function drawCellsOnCanvas() {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        for (let col = 0; col < CANVAS_WIDTH; col++) {
            buffer[(col + row * CANVAS_WIDTH) * 4] = cellGrid[row][col].getColor("r");
            buffer[(col + row * CANVAS_WIDTH) * 4 + 1] = cellGrid[row][col].getColor("g");
            buffer[(col + row * CANVAS_WIDTH) * 4 + 2] = cellGrid[row][col].getColor("b");
            buffer[(col + row * CANVAS_WIDTH) * 4 + 3] = 255;
        }
    }
    ctx.putImageData(bufferData, 0, 0);
}

function updateCellGrid() {

    resetUpdatableCells();

    for (let row = CANVAS_HEIGHT - 1; row >= 0; row--) {
        for (let col = CANVAS_WIDTH - 1; col >= 0; col--) {
            if (cellGrid[row][col].isCellUpdatable()) {
                if (cellGrid[row][col].state === "sand") {
                    if (row < CANVAS_HEIGHT - 1 && cellGrid[row + 1][col].getClassName() === "CellEmpty") {
                        cellGrid[row][col].setUpdatable(false);
                        cellGrid[row + 1][col] = cellGrid[row][col];
                        cellGrid[row][col] = new CellEmpty();
                    } else if (row < CANVAS_HEIGHT - 1 && cellGrid[row + 1][col].state === "liquid") {
                        cellGrid[row][col].setUpdatable(false);
                        let cellHold = cellGrid[row + 1][col]
                        cellGrid[row + 1][col] = cellGrid[row][col];
                        cellGrid[row][col] = cellHold;
                    } else if (row < CANVAS_HEIGHT - 1 && col < CANVAS_WIDTH - 1 && col > 0 && cellGrid[row + 1][col + 1].getClassName() === "CellEmpty" && cellGrid[row + 1][col - 1].getClassName() === "CellEmpty") {
                        switch (Math.sign(Math.random() - 0.5)) {
                            case 1:
                                cellGrid[row][col].setUpdatable(false);
                                cellGrid[row + 1][col + 1] = cellGrid[row][col];
                                cellGrid[row][col] = new CellEmpty();
                                break;
                            case -1:
                                cellGrid[row][col].setUpdatable(false);
                                cellGrid[row + 1][col - 1] = cellGrid[row][col];
                                cellGrid[row][col] = new CellEmpty();
                        }
                    } else if (row < CANVAS_HEIGHT - 1 && col < CANVAS_WIDTH - 1 && col > 0 && cellGrid[row + 1][col + 1].state === "liquid" && cellGrid[row + 1][col - 1].state === "liquid") {
                        let cellHold;
                        switch (Math.sign(Math.random() - 0.5)) {
                            case 1:
                                cellGrid[row][col].setUpdatable(false);
                                cellHold = cellGrid[row + 1][col + 1];
                                cellGrid[row + 1][col + 1] = cellGrid[row][col];
                                cellGrid[row][col] = cellHold;
                                break;
                            case -1:
                                cellGrid[row][col].setUpdatable(false);
                                cellHold = cellGrid[row + 1][col - 1];
                                cellGrid[row + 1][col - 1] = cellGrid[row][col];
                                cellGrid[row][col] = cellHold;
                        }
                    }
                    if (row < CANVAS_HEIGHT - 1 && col < CANVAS_WIDTH - 1 && cellGrid[row + 1][col + 1].getClassName() === "CellEmpty") {
                        cellGrid[row][col].setUpdatable(false);
                        cellGrid[row + 1][col + 1] = cellGrid[row][col];
                        cellGrid[row][col] = new CellEmpty();
                    } else if (row < CANVAS_HEIGHT - 1 && col < CANVAS_WIDTH - 1 && cellGrid[row + 1][col + 1].state === "liquid") {
                        cellGrid[row][col].setUpdatable(false);
                        let cellHold = cellGrid[row + 1][col + 1]
                        cellGrid[row + 1][col + 1] = cellGrid[row][col];
                        cellGrid[row][col] = cellHold;
                    }
                    if (row < CANVAS_HEIGHT - 1 && col > 0 && cellGrid[row + 1][col - 1].getClassName() === "CellEmpty") {
                        cellGrid[row][col].setUpdatable(false);
                        cellGrid[row + 1][col - 1] = cellGrid[row][col];
                        cellGrid[row][col] = new CellEmpty();
                    } else if (row < CANVAS_HEIGHT - 1 && col > 0 && cellGrid[row + 1][col - 1].state === "liquid") {
                        cellGrid[row][col].setUpdatable(false);
                        let cellHold = cellGrid[row + 1][col - 1]
                        cellGrid[row + 1][col - 1] = cellGrid[row][col];
                        cellGrid[row][col] = cellHold;
                    }
                }

                if (cellGrid[row][col].state === "liquid") {
                    if (row < CANVAS_HEIGHT - 1 && cellGrid[row + 1][col].getClassName() === "CellEmpty" && Math.sign(Math.random() - 0.1) > 0) {
                        cellGrid[row][col].setUpdatable(false);
                        cellGrid[row + 1][col] = cellGrid[row][col];
                        cellGrid[row][col] = new CellEmpty();
                    } else {
                        if (col > 0 && cellGrid[row][col - 1].getClassName() === "CellEmpty" && col < CANVAS_WIDTH - 1 && cellGrid[row][col + 1].getClassName() === "CellEmpty") {
                            switch (Math.sign(Math.random() - 0.5)) {
                                case 1:
                                    cellGrid[row][col].setUpdatable(false);
                                    cellGrid[row][col + 1] = cellGrid[row][col];
                                    cellGrid[row][col] = new CellEmpty();
                                    break;
                                case -1:
                                    cellGrid[row][col].setUpdatable(false);
                                    cellGrid[row][col - 1] = cellGrid[row][col];
                                    cellGrid[row][col] = new CellEmpty();
                            }
                        } else if (col < CANVAS_WIDTH - 1 && cellGrid[row][col + 1].getClassName() === "CellEmpty") {
                            cellGrid[row][col].setUpdatable(false);
                            cellGrid[row][col + 1] = cellGrid[row][col];
                            cellGrid[row][col] = new CellEmpty();
                        } else if (col > 0 && cellGrid[row][col - 1].getClassName() === "CellEmpty") {
                            cellGrid[row][col].setUpdatable(false);
                            cellGrid[row][col - 1] = cellGrid[row][col];
                            cellGrid[row][col] = new CellEmpty();
                        }

                    }


                }

                if (cellGrid[row][col].state === "steam") {
                    if ((row > 0 && cellGrid[row - 1][col].name !== "Empty" && cellGrid[row - 1][col].state !== "steam")) {
                        if (cellGrid[row - 1][col].state === "liquid"){
                            cellGrid[row][col].setUpdatable(false);
                            let cellHold = cellGrid[row - 1][col];
                            cellGrid[row - 1][col] = cellGrid[row][col];
                            cellGrid[row][col] = cellHold;
                        }
                        else{
                            cellGrid[row][col] = cellGrid[row][col].liquid;
                        }
                    }else if(row === 0){
                        cellGrid[row][col] = cellGrid[row][col].liquid;
                    }
                    else {
                        if(Math.sign(Math.random() - 0.5) > 0){
                            cellGrid[row - 1][col] = cellGrid[row][col];
                            cellGrid[row][col] = new CellEmpty();
                        }
                        else {
                            if (col > 0 && cellGrid[row][col - 1].getClassName() === "CellEmpty" && col < CANVAS_WIDTH - 1 && cellGrid[row][col + 1].getClassName() === "CellEmpty") {
                                switch (Math.sign(Math.random() - 0.5)) {
                                    case 1:
                                        cellGrid[row][col].setUpdatable(false);
                                        cellGrid[row][col + 1] = cellGrid[row][col];
                                        cellGrid[row][col] = new CellEmpty();
                                        break;
                                    case -1:
                                        cellGrid[row][col].setUpdatable(false);
                                        cellGrid[row][col - 1] = cellGrid[row][col];
                                        cellGrid[row][col] = new CellEmpty();
                                }
                            } else if (col < CANVAS_WIDTH - 1 && cellGrid[row][col + 1].getClassName() === "CellEmpty") {
                                cellGrid[row][col].setUpdatable(false);
                                cellGrid[row][col + 1] = cellGrid[row][col];
                                cellGrid[row][col] = new CellEmpty();
                            } else if (col > 0 && cellGrid[row][col - 1].getClassName() === "CellEmpty") {
                                cellGrid[row][col].setUpdatable(false);
                                cellGrid[row][col - 1] = cellGrid[row][col];
                                cellGrid[row][col] = new CellEmpty();
                            }
                        }

                    }
                }
            } // if cell is updatable

        }
    }


}


initCellGrid(cellGrid);
initCellGrid(bufferGrid);
console.log(countSand());
drawCellsOnCanvas();
updateCellGrid();

setInterval(() => {

    // cellGrid[0][50] = new CellSand();
    // cellGrid[0][51] = new CellSand();
    //
    // cellGrid[0][125] = new CellWater();
    // cellGrid[0][150] = new CellWater();
    // cellGrid[0][175] = new CellWater();
    //
    // cellGrid[0][250] = new CellRedSand();
    // cellGrid[0][251] = new CellRedSand();

    updateCellGrid();
    drawCellsOnCanvas();
}, 10)