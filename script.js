let main = document.querySelector(".main");

const scoreElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const nextFigureElem = document.getElementById("next-figure");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");
const pauseOver = document.getElementById("pause-over");

// A two-dimensional array is created for the instruction to display cells on the screen
// 0 - empty cell
// 1 - filled cell of the moving element
// 2 - filled cell of a fixed element

let playfield = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0]
];

let score = 0;
let gameTimerID;
let currentLevel = 1;
let isPaused = true;
let possibleLevels = {
  1: {
    scorePerLine: 10,
    speed: 500,
    nextLevelScore: 200,
  },
  2: {
    scorePerLine: 15,
    speed: 400,
    nextLevelScore: 500,
  },
  3: {
    scorePerLine: 20,
    speed: 300,
    nextLevelScore: 1000,
  },
  4: {
    scorePerLine: 30,
    speed: 200,
    nextLevelScore: 2000,
  },
  5: {
    scorePerLine: 50,
    speed: 100,
    nextLevelScore: Infinity,
  },
};

let figures = {
  O: [
      [1, 1],
      [1, 1]
    ],
  I: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
  S: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ],
  Z: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
  L: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
  ],
  J: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ],
  T: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ]
};

let activeFigure = getNewFigure();
let nextFigure = getNewFigure();

function draw() {
  let mainInnerHTML = "";
  // To iterate over the elements of two-dimensional arrays, two for loops are usually used, the first loop iterates over the rows
  // And the other iterates over the elements within each row
  // lenght 
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      // If the element inside the array is 1 to then this cell must be filled
      // Otherwise, an empty cell will be displayed
      // length denotes the length of the array
      if (playfield[y][x] == 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] == 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  // write the received blocks in HTML
  main.innerHTML = mainInnerHTML;
}

function drawNextFigure() {
  let nextFigureInnerHTML = "";
  for (let y = 0; y < nextFigure.shape.length; y++) {
    for (let x = 0; x < nextFigure.shape[y].length; x++) {
      if (nextFigure.shape[y][x]) {
        nextFigureInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextFigureInnerHTML += '<div class="cell"></div>';
      }
    }
    nextFigureInnerHTML += "<br/>";
  }
  nextFigureElem.innerHTML = nextFigureInnerHTML;
}

function removePrevActiveFigure() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] == 1){
        playfield[y][x] = 0;
      }
    }
  }
}

//a function for creating a figure, inside the active Figure.shape array, from where the figure is then transferred to the field
function updateActiveFigure(){
  removePrevActiveFigure();
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (activeFigure.shape[y][x] == 1) {
        playfield[activeFigure.y + y][activeFigure.x + x] =
          activeFigure.shape[y][x];
      }
    }
  }
}

function rotateFigure() {

  const prevFigureState = activeFigure.shape;
  //the line of code is taken from the Internet, its task is to turn the rows of the array of the active figure into columns, that is, rotate the figure 90 degrees clockwise
  activeFigure.shape = activeFigure.shape[0].map((val, index) =>
    activeFigure.shape.map((row) => row[index]).reverse()
  );

  if (hasCollisions()) {
    activeFigure.shape = prevFigureState;
  }
}

// function to check for collisions of a shape with the borders of the field or with other shapes
function hasCollisions() {
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (activeFigure.shape[y][x] &&
        (playfield[activeFigure.y + y] == undefined ||
          playfield[activeFigure.y + y][activeFigure.x + x] == undefined ||
          playfield[activeFigure.y + y][activeFigure.x + x] == 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

// checks if there are filled lines on the field, if there are, it is deleted and a new, empty array line is added to the field
function checkLines() {
  let canRemoveLine = true,
    filledLines = 0;
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playfield.splice(y, 1);
      playfield.splice(0, 0, [0,0,0,0,0,0,0,0,0,0]);
      filledLines += 1;
    }
    canRemoveLine = true;
  }

  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 6;
      break;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 12;
      break;
  }

  scoreElem.innerHTML = score;

  if (score >= possibleLevels[currentLevel].nextLevelScore) {
    currentLevel++;
    levelElem.innerHTML = currentLevel;
  }
}

function getNewFigure() {
  const possibleFigures = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newFigure = figures[possibleFigures[rand]];

  return {
    x: Math.floor((10 - newFigure[0].length) / 2),
    y: 0,
    shape: newFigure,
  };
}

function fixFigure() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] == 1) {
        playfield[y][x] = 2;
      }
    }
  }
}

function moveFigureDown() {
  activeFigure.y += 1;
  if (hasCollisions()) {
    activeFigure.y -= 1;
    fixFigure();
    checkLines();
    activeFigure = nextFigure;
    if (hasCollisions()) {
      reset();
    }
    nextFigure = getNewFigure();
  }
}

function dropFigure() {
  for (let y = activeFigure.y; y < playfield.length; y++) {
    activeFigure.y += 1;
    if (hasCollisions()) {
      activeFigure.y -= 1;
      break;
    }
  }
}

function reset() {
  isPaused = true;
  clearTimeout(gameTimerID);
  playfield = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0]
];
  draw();
  gameOver.style.display = "block";
}


// at the moment, the movement of the figure is carried out by changing the coordinates on the field and not by alternately changing 1 and 0 in the array of the playing field
document.onkeydown = function (e) {
  if (!isPaused) {
    if (e.keyCode == 65) {
      activeFigure.x -= 1;
      if (hasCollisions()) {
        activeFigure.x += 1;
      }
    } else if (e.keyCode == 68) {
      activeFigure.x += 1;
      if (hasCollisions()) {
        activeFigure.x -= 1;
      }
    } else if (e.keyCode == 83) {
      moveFigureDown();
    } else if (e.keyCode == 87) {
      rotateFigure();
    } else if (e.keyCode == 40) {
      dropFigure();
    }

    updateGameState();
  }
};

function updateGameState() {
  if (!isPaused) {
    updateActiveFigure();
    draw();
    drawNextFigure();
  }
}

pauseBtn.addEventListener("click", (e) => {
  if (e.target.innerHTML == "Pause") {
    pauseOver.style.display = "block";
    e.target.innerHTML = "Play";
    clearTimeout(gameTimerID);
  } else {
    pauseOver.style.display = "none";
    e.target.innerHTML = "Pause";
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
  e.target.innerHTML = "Start";
  isPaused = false;
  gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  gameOver.style.display = "none";
  score = 0;
  currentLevel = 1
  scoreElem.innerHTML = score;
  levelElem.innerHTML = currentLevel;
});

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

//a function to constantly run the block movement function until it hits the bottom
function startGame() {
  moveFigureDown();
  if (!isPaused) {
    updateGameState();
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}
