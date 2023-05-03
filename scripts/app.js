function init() {
  // scoring
  const lineScore = { 0: 0, 1: 40, 2: 100, 3: 300, 4: 1200 };
  const levelBoard = document.querySelector(".levelBoard");
  const lineBoard = document.querySelector(".lineBoard");
  const scoreBoard = document.querySelector(".scoreBoard");
  let score = 0;
  let numOfLine = 0;
  let level = 1;
  // create grid
  const height = 20;
  const width = 10;
  const grid = [];
  //   ???why can't i use Array(arraySize).fill(value) ? result in error
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(0);
    }
    grid.push(row);
  }
  // create boxes
  const boxes = [];
  const createGrid = () => {
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        const box = document.createElement("div");
        document.querySelector(".grid").appendChild(box);
        row.push(box);
      }
      boxes.push(row);
    }
  };
  createGrid();
  //define a function to clear the game board
  const clearBoard = () => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        boxes[i][j].style.backgroundColor = "rgb(255, 255, 255)";
      }
    }
    for (let i = 0; i < nextBoardHeight; i++) {
      for (let j = 0; j < nextBoardWidth; j++) {
        boxesNext[i][j].style.backgroundColor = "rgb(255, 255, 255)";
      }
    }
  };

  const clearGrid = () => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        grid[i][j] = 0;
      }
    }
  };
  // define a function to draw the board according to the numbers in the grid
  const drawToBoard = () => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (grid[i][j] > 0) {
          boxes[i][j].style.backgroundColor = listOfColors[grid[i][j] - 1];
        }
      }
    }
  };
  // 7.clear any line that is filled up with blocks
  const clearLines = () => {
    let lineThisRound = 0;
    for (let i = 0; i < height; i++) {
      if (grid[i].every((element) => element > 0)) {
        // delete this row
        grid.splice(i, 1);
        // insert a new row at the beginning
        grid.unshift(Array(width).fill(0));
        lineThisRound++;
        numOfLine++;
      }
    }
    score += lineScore[lineThisRound] * lineThisRound;
    level = 1 + Math.floor(numOfLine / 5);
    levelBoard.innerHTML = level;
    lineBoard.innerHTML = numOfLine;
    scoreBoard.innerHTML = score;
  };
  // game over
  const gameOver = () => {
    if (grid[0].some((element) => element > 0)) {
      return true;
    } else {
      return false;
    }
  };
  //   1.firstly need to randomly generate a tetromino(7 of them)
  //   1)randomly generate a tetromino
  const listOfShapes = [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 2],
      [2, 2, 2],
      [0, 0, 0],
    ],
    [
      [3, 0, 0],
      [3, 3, 3],
      [0, 0, 0],
    ],
    [
      [4, 4],
      [4, 4],
    ],
    [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
  ];

  const listOfColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "aqua",
    "blue",
    "purple",
  ];

  // 3)create a class for tetromino
  const getRandomNum = () => {
    return Math.floor(Math.random() * listOfShapes.length);
  };
  let randomNumNext = getRandomNum();

  const generateNewTetris = () => {
    const randomNumCurr = randomNumNext;
    randomNumNext = getRandomNum();
    return [randomNumCurr, randomNumNext];
  };

  class Tetromino {
    constructor(randomNum) {
      const randomShape = listOfShapes[randomNum];
      const randomColor = listOfColors[randomNum];
      this.randomNum = randomNum;
      this.color = randomColor;
      this.shape = randomShape;

      // this part is to define the initial position;
      // if the grid width is 10, take I shape for example, the largest index the shape can start from is 6(index of the blocks are 6, 7, 8, 9)
      // so the random number should be between [0,7), and after taking the floor of the value,
      //   the range will be what we want - whole numbers in [0,6].
      this.x = Math.floor(Math.random() * (width - this.shape.length + 1));
      this.y = 0;
      this.floor = true;
    }

    drawCurr() {
      for (let i = 0; i < this.shape.length; i++) {
        for (let j = 0; j < this.shape.length; j++) {
          if (this.shape[i][j] > 0) {
            boxes[this.y + i][this.x + j].style.backgroundColor = this.color;
          }
        }
      }
    }
    drawNext() {
      for (let i = 0; i < this.shape.length; i++) {
        for (let j = 0; j < this.shape.length; j++) {
          if (this.shape[i][j] > 0) {
            boxesNext[1 + i][
              Math.floor((nextBoardWidth - this.shape.length) / 2) + j
            ].style.backgroundColor = this.color;
          }
        }
      }
    }
    // 5.check if all blocks of the shape are still within the limits after the next move;
    // if yes, the check function will return true and the shape will move; if not, the function returns false and the shape will not move
    checkLimit(keyNum) {
      switch (keyNum) {
        case 39:
          for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape.length; j++) {
              if (this.shape[i][j] > 0) {
                if (
                  this.x + j + 1 >= width ||
                  grid[this.y + i][this.x + j + 1] > 0
                ) {
                  return false;
                }
              }
            }
          }
          return true;

        case 37:
          for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape.length; j++) {
              if (this.shape[i][j] > 0) {
                if (
                  this.x + j - 1 < 0 ||
                  grid[this.y + i][this.x + j - 1] > 0
                ) {
                  return false;
                }
              }
            }
          }
          return true;

        case 40:
          // can this part be dried as well? in the variable situationToCheck, the variable i of the for loop is involved!
          for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape.length; j++) {
              if (this.shape[i][j] > 0) {
                if (
                  this.y + i + 1 >= height ||
                  grid[this.y + i + 1][this.x + j] > 0
                ) {
                  this.floor = false;
                  this.markToBoard();
                  return false;
                }
              }
            }
          }
          return true;
        case 38:
          return true;

        default:
          break;
      }
    }
    checkDropLimit() {
      for (let i = 0; i < this.shape.length; i++) {
        for (let j = 0; j < this.shape.length; j++) {
          if (this.shape[i][j] > 0) {
            if (
              this.y + i + 1 >= height ||
              grid[this.y + i + 1][this.x + j] > 0
            ) {
              this.floor = false;
              this.markToBoard();
              return false;
            }
          }
        }
      }
      return true;
    }

    checkRotationLimit() {
      // deep clone this.shape
      const shapeCopy = JSON.parse(JSON.stringify(this.shape));
      //   rotate the copied array

      this.rotateExecution(shapeCopy);

      for (let i = 0; i < this.shape.length; i++) {
        for (let j = 0; j < this.shape.length; j++) {
          if (shapeCopy[i][j] > 0) {
            if (
              this.y + i + 1 >= height ||
              grid[this.y + i + 1][this.x + j] > 0
            ) {
              return false;
            }
          }
        }
      }
      return true;
    }
    // move tetromino based on keydown
    moveTetromino(e) {
      if (gamePlay !== false && this.checkLimit(e.keyCode)) {
        switch (e.keyCode) {
          case 37:
            this.x -= 1;
            break;
          case 39:
            this.x += 1;
            break;
          case 40:
            this.y += 1;
            break;
          case 38:
            this.rotate();
            break;
          default:
            break;
        }
      }
    }
    // drop tetromino
    dropTetromino() {
      if (this.checkDropLimit()) {
        this.y += 1;
      }
    }
    // 3.control them to rotate if a keyup activity is detected(which block is drawn is decided then by two factors:
    // (if a second has passed when the user clicked on keyup? if yes, then the shape should be one line lower; and coupling with
    // the effect of the rotation to calculate the final position of the 4 blocks of the shape)
    // example to swap array elements can be found here: https://stackoverflow.com/questions/872310/javascript-swap-array-elements
    rotateExecution(shape) {
      // first transpose the array
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < i; j++) {
          [shape[i][j], shape[j][i]] = [shape[j][i], shape[i][j]];
        }
      }
      //   then reverse the array
      for (let i = 0; i < shape.length; i++) {
        shape[i].reverse();
      }
    }
    rotate() {
      //  check if the coordinate is negative. If yes, adjust them to be 0
      if (this.x < 0) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y = 0;
      }
      if (this.checkRotationLimit()) {
        this.rotateExecution(this.shape);
      }
    }
    //  6.draw the current tetromino to game board
    markToBoard() {
      for (let i = 0; i < this.shape.length; i++) {
        for (let j = 0; j < this.shape.length; j++) {
          if (this.shape[i][j] > 0) {
            grid[this.y + i][this.x + j] = this.randomNum + 1;
          }
        }
      }
    }
  }
  let currentTetromino, nextTetromino;

  const newTetromino = () => {
    const [randomNumCurr, randomNumNext] = generateNewTetris();
    currentTetromino = new Tetromino(randomNumCurr);
    nextTetromino = new Tetromino(randomNumNext);
  };

  //   2.control them to move as a keyboard "down"/"left"/"right" activity is detected.
  //   event keycodes:  down arrow: 40, left arrow: 37, right arrow: 39, up arrow: 38;
  // reason to use arrow function for the callback function: arrow functions do not have "this" context in them, they will look for "this" in scope
  //   more explanations https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback

  //   4.control tetrominoes to fall down 1 block per level time

  let time = { start: Date.now(), elapse: 0, level: 1000 };
  let gameOverFlag = false;
  const gameOverPopup = document.querySelector("#gameover-popup");
  const overlay = document.getElementById("overlay");
  const dropdownAnimation = () => {
    // before drawing, the board needs to be cleared

    clearBoard();
    // ===============draw, clear line, and check game over: this part needs to be checked each animation cycle============
    currentTetromino.drawCurr();
    nextTetromino.drawNext();
    // color the marked blocks
    drawToBoard();
    // clear lines
    clearLines();
    if (Date.now() - time.start >= time.level) {
      currentTetromino.dropTetromino();
      time.start = Date.now();
    }

    if (!currentTetromino.floor) {
      newTetromino();
    }

    requestId = requestAnimationFrame(dropdownAnimation);

    //if game over, cancel animation using the latest requestId (the cancellation uses the last requestId)
    if (gameOver()) {
      cancelAnimationFrame(requestId);
      gameOverFlag = true;
      playIcon.classList.remove("icon-disappear");
      pauseIcon.classList.remove("icon-display");
      gameOverPopup.classList.add("active");
      overlay.classList.add("active");
    }
  };

  // =====================buttons=======================
  // toggle between play and paused
  let enterGame; //this is for controlling music
  let gamePlay; //this is for not allowing the shape to move when the game is paused
  const playPauseButton = document.querySelector(".playPause");
  const playIcon = document.querySelector(".uil-play");
  const pauseIcon = document.querySelector(".uil-pause");
  const playPause = () => {
    if (gameOverFlag) {
      reset();
    }
    gameOverFlag = false;
    if (playPauseButton.value === "play") {
      enterGame = true;
      gamePlay = true;

      // create a new tetromino only when there is currently no tetromino
      // if there is already a currentTetromino, keep using the old one
      if (!currentTetromino) {
        newTetromino();
      }
      time.start = Date.now();
      dropdownAnimation();
      playPauseButton.value = "pause";
      playIcon.classList.add("icon-disappear");
      pauseIcon.classList.add("icon-display");
    } else if (playPauseButton.value === "pause") {
      gamePlay = false;

      cancelAnimationFrame(requestId);
      playPauseButton.value = "play";
      playIcon.classList.remove("icon-disappear");
      pauseIcon.classList.remove("icon-display");
    }
    background.play();
    document.addEventListener("keydown", (e) =>
      currentTetromino.moveTetromino(e)
    );
  };

  playPauseButton.addEventListener("click", playPause);

  // reset button
  const reset = () => {
    // reset grid to be all 0
    if (typeof requestId !== "undefined") {
      cancelAnimationFrame(requestId);
    }
    currentTetromino = null;
    randomNumNextCopy = null;
    clearGrid();
    clearBoard();
    playPauseButton.value = "play";
    playIcon.classList.remove("icon-disappear");
    pauseIcon.classList.remove("icon-display");
    time = { start: Date.now(), elapse: 0, level: 1000 };
  };

  const resetButton = document.querySelector(".reset");
  resetButton.addEventListener("click", reset);
  // background music
  const background = document.querySelector("#background");
  const muteButton = document.querySelector(".mute");
  const musicOn = document.querySelector(".uil-music-note");
  const musicOff = document.querySelector(".uil-music-tune-slash");
  const toggleMusic = () => {
    if (enterGame && background.paused) {
      background.play();
      musicOn.classList.remove("icon-disappear");
      musicOff.classList.remove("icon-display");
    } else {
      background.pause();
      musicOn.classList.add("icon-disappear");
      musicOff.classList.add("icon-display");
    }
  };
  muteButton.addEventListener("click", toggleMusic);
  // next up board
  let boxesNext = [];
  const nextBoardHeight = 4;
  const nextBoardWidth = 6;
  const createNextBoard = () => {
    for (let i = 0; i < nextBoardHeight; i++) {
      const row = [];
      for (let j = 0; j < nextBoardWidth; j++) {
        const box = document.createElement("div");
        document.querySelector(".nextBoard").appendChild(box);
        row.push(box);
      }
      boxesNext.push(row);
    }
  };
  createNextBoard();

  // ==================================modal==================================
  const openModalButtons = document.querySelectorAll("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll("[data-close-button]");

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    });
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      closeModal(modal);
    });
  });

  function openModal(modal) {
    if (modal == null) return;
    modal.classList.add("active");
    overlay.classList.add("active");
  }

  function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove("active");
    overlay.classList.remove("active");
  }

  // ================================gameover popup===================================
}
window.addEventListener("DOMContentLoaded", init);
