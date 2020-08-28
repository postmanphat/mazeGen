let canvas = document.getElementById("html-canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let context = canvas.getContext("2d");
let cells = [];
let grid = {width : 40, height: 40};
let cellWidth = canvas.width/grid.width;
let currentCell = 0;
let route = [];

setup();

function drawCell(cell) {
    //temporary implementation
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 1;
    context.beginPath()
    for (let direction in cell.walls) {
        if (cell.walls[direction]) {
            switch (direction) {
                case 'top':
                    context.moveTo(cell.x, cell.y);
                    context.lineTo(cell.x + cell.width, cell.y);
                    context.stroke();
                    break;
                case 'right':
                    context.moveTo(cell.x + cell.width, cell.y);
                    context.lineTo(cell.x + cell.width, cell.y + cell.width);
                    context.stroke();
                    break;
                case 'bottom':
                    context.moveTo(cell.x + cell.width, cell.y + cell.width);
                    context.lineTo(cell.x, cell.y + cell.width);
                    context.stroke();
                    break;
                case 'left':
                    context.moveTo(cell.x, cell.y + cell.width);
                    context.lineTo(cell.x, cell.y);
                    context.stroke();
                    break;
            }
        }
    };
}

function drawCurrentCell() {
    context.fillStyle = "#7f00ff";
    context.beginPath();
    context.fillRect(cells[currentCell].x, cells[currentCell].y, canvas.width/grid.width, canvas.height/grid.height);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkUnvisited(cell) {
    return !cell.visited;
}

function getIndices(cell) {
    let pos = {x: 0, y: 0};
    pos.x = cell.id % grid.width;
    pos.y = Math.floor(cell.id/grid.width);
    return pos;
}

function getNeighbours(cell) {
    let neighbours = []
    let cellPos = getIndices(cell);
    for (let otherCell in cells) {
        otherCell = cells[otherCell];
        let otherCellPos = getIndices(otherCell);
        let deltaPos = JSON.stringify([cellPos.x - otherCellPos.x, cellPos.y - otherCellPos.y]);
        // console.log(deltaPos);
        if (deltaPos == JSON.stringify([-1, 0]) ||
            deltaPos == JSON.stringify([1, 0]) ||
            deltaPos == JSON.stringify([0, 1]) ||
            deltaPos == JSON.stringify([0, -1])) {
                // console.log("Pushing to neighbours!");
                neighbours.push(otherCell);
        }
    }
    shuffleArray(neighbours);
    return neighbours;
}

function removeWall(cell, otherCell) {
    switch(cell.id-otherCell.id) {
        case -grid.width:
            //otherCell is directly below
            cell.walls.bottom = false;
            otherCell.walls.top = false;
            break;
        case -1:
            //otherCell is directly right
            cell.walls.right = false;
            otherCell.walls.left = false;
            break;
        case 1:
            //otherCell is directly left
            cell.walls.left = false;
            otherCell.walls.right = false;
            break;
        case grid.width:
            //otherCell is directly above
            cell.walls.top = false;
            otherCell.walls.bottom = false;
            break;
    }
}
//given a cell, first mark cell as visited
function dfs(cell) {
    cell.visited = true;
    // console.log("cell id: " + cell.id);
    //if i see weird patterns of generation, check how i'm implementing the stack here
    let unvisited = getNeighbours(cell).filter(checkUnvisited);
    // console.log("unvisited.length: " + unvisited.length);
    for (i = 0; i< unvisited.length;) {
        let selectedNeighbour = unvisited.pop();
        if (!selectedNeighbour.visited) {
            // removeWall(cell, selectedNeighbour);
            route.push([cell, selectedNeighbour]);
            currentCell = selectedNeighbour.id;
            // draw()
            // console.log("neighbour visited");
            i += main(cells);
        }
    }
    // console.log("out of neighbours!");
}

function setup() {
    for (i = 0; i < grid.width*grid.height; i++) {
        cells.push({
            id: i,
            x: cellWidth*(i % grid.width),
            y: cellWidth*Math.floor(i/grid.width),
            width: cellWidth,
            walls: {top: true, right: true, bottom: true, left: true},
            visited: false
        });
    }
    main(cells);
    draw();
}

function draw() {
    // console.log("Current cell: " + currentCell);
    context.style = '#000000';
    context.fillStyle = '#000000';
    context.beginPath()
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    let step = route.shift();
    removeWall(step[0], step[1]);
    currentCell = step[1].id;
    drawCurrentCell();
    cells.forEach((function (cell) {
        drawCell(cell);
    }));
    if (route.length > 0) {
        requestAnimationFrame(draw);
    }
}

function main(cells) {
    // console.log(currentCell);
    dfs(cells[currentCell]);
    // console.log("time to draw!");
    // draw();
    return(1);
}