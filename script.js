const gameBoard = document.querySelector(".container");
const newGameBtn = document.querySelector(".newgame-btn");
const scoreMsg = document.querySelector("#score-value")
const bestMsg = document.querySelector("#best-value")
let score = 0;

// newGameBtn.addEventListener("click", () => {
//   tile = [];

// })

function startGame() {
  function createTileElement(gameBoard) {
    const tiles = []
    for (let i = 0; i < 4 * 4; i++) {
      const tile = document.createElement("div");
      tile.classList.add('tile')
      tiles.push(tile)
      gameBoard.append(tile)
    }
    // console.log('tiles beginning => this is ok',tiles)
    return tiles;
  }

  // console.log('this is tile => ',tile)

  class Tile {
    #x
    #y
    #cell
    #mergeCell
    constructor(tileElement, x, y) {
      this.tileElement = tileElement;
      this.#x = x;
      this.#y = y;
    }

    get x() {
      return this.#x
    }

    get y() {
      return this.#y
    }

    get cell() {
      return this.#cell
    }

    set cell(value) {
      this.#cell = value;
      if (value == null) return
      this.#cell.x = this.#x
      this.#cell.y = this.#y  
    }

    get mergeCell() {
      return this.#mergeCell
    }

    set mergeCell(value) {
      this.#mergeCell = value
      if (value == null) return
      this.#mergeCell.x = this.#x
      this.#mergeCell.y = this.#y
    }

    canAccept(cell) {
      return (
        this.cell == null ||
        (this.mergeCell == null && this.cell.value === cell.value))
    }

    mergeCells() {
      if (this.cell == null || this.mergeCell == null) return
      this.cell.value = 2 * this.cell.value 
      score += this.cell.value
      console.log(score, scoreMsg.innerText)
      console.log(this.cell.value)
      scoreMsg.innerText = score
      if (bestMsg.innerText < score) bestMsg.innerText = score;
      this.mergeCell.remove()
      this.mergeCell = null
      if (this.cell.value === 2048) alert("You win")
      
    }
  }

  const tiles = createTileElement(gameBoard).map((tileElement, index) => {
    return new Tile (
      tileElement,
      index % 4,
      Math.floor(index / 4),
    )
  });


  console.log('tiles =>', tiles)

  function getEmptyCells() {
    return tiles.filter(tile => tile.cell == null)
  }

  function randomEmptyCell() {
    const emptyCells = getEmptyCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  class Cell {
    #cellElement
    #x
    #y
    #value
    constructor (cellContainer, value = Math.random() > .4 ? 2 : 4) {
      this.#cellElement = document.createElement('div');
      this.#cellElement.classList.add('cell');
      cellContainer.append(this.#cellElement);
      this.value = value;    
    }

    get value() {
      return this.#value
    }

    set value(v) {
      this.#value = v;
      this.#cellElement.textContent = v;
      const power = Math.log2(v);
      // const backgroundLightness = 100 - power * 8;
      for (let id in tileColors) {
        if (id == power) {
          this.#cellElement.style.backgroundColor = `${tileColors[id]}`;
        }
      }

      if (power >= 9) this.#cellElement.style.boxShadow = "#edc53f 0 0 25px"
      // this.#cellElement.style.setProperty("--background-lightness",
      //   `${backgroundLightness}%`
      // )
      this.#cellElement.style.setProperty("color", `${power <= 2 ? '#776e65' : '#f9f6f2'}`);
      // this.#cellElement.style.setProperty("--text-lightness",
      //   `${backgroundLightness <= 70 ? 95 : 10}%`
      // )
    }

    set x(value) {
      this.#x = value;
      this.#cellElement.style.setProperty("--x", value);
    }

    set y(value) {
      this.#y = value;
      this.#cellElement.style.setProperty("--y", value);
    }

    remove() {
      this.#cellElement.remove()
    }

    waitForTransition(animation = false) {
      return new Promise(resolve => {
        this.#cellElement.addEventListener(animation ? "animationend" : "transitionend", resolve, {once: true})
      })
    }
  }

  randomEmptyCell().cell = new Cell(gameBoard);
  randomEmptyCell().cell = new Cell(gameBoard);

  setupInput();

  function setupInput() {
    window.addEventListener("keydown", handleInput)
  }

  async function handleInput(e) {
    console.log(e.key)
    switch (e.key) {
      case "ArrowUp":
        if (!canMoveUp()) {
          setupInput()
          return
        }
        await moveUp()
        break
      case "ArrowDown":
        if (!canMoveDown()) {
          setupInput()
          return
        }
        await moveDown()
        break
      case "ArrowLeft":
        if (!canMoveLeft()) {
          setupInput()
          return
        }
        await moveLeft()
        break
      case "ArrowRight":
        if (!canMoveRight()) {
          setupInput()
          return
        }
        await moveRight()
        break
      default:
        setupInput()
        return
    }
    

    await Promise.all(tiles.map(tile => tile.mergeCells()));
    let newCell;
    if (randomEmptyCell()) {
      newCell = new Cell(gameBoard)
      randomEmptyCell().cell = newCell
    }
    console.log(newCell)

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
      newCell.waitForTransition(true).then(() => {
        alert("You lose")
      })
      return
    }

    setupInput()
  }


  function moveUp() {
    return slideTiles(tilesByColumn())
  }

  function moveDown() {
    return slideTiles(tilesByColumn().map(column => [...column].reverse()))
  }

  function moveLeft() {
    return slideTiles(tilesByRow())
  }

  function moveRight() {
    return slideTiles(tilesByRow().map(row => [...row].reverse()))
  }

  function tilesByColumn() {
    return tiles.reduce((tileGrid, tile) => {
      
      tileGrid[tile.x] = tileGrid[tile.x] || []
      tileGrid[tile.x][tile.y] = tile
      return tileGrid
    }, [])
  }

  function tilesByRow() {
    return tiles.reduce((tileGrid, tile) => {
      
      tileGrid[tile.y] = tileGrid[tile.y] || []
      tileGrid[tile.y][tile.x] = tile
      return tileGrid
    }, [])
  }

  console.log(tilesByColumn())
  console.log('Everything ok till here');

  function slideTiles(tiles) {
    return Promise.all(
      tiles.flatMap(group => {
        const promises = []
        for (let curr = 1; curr < group.length; curr++) {
          const tile = group[curr]
          if (tile.cell == null) continue
          let lastValidTile
          for (let top = curr - 1; top >= 0; top--) {
            const moveToTile = group[top] // tile above current tile
            if (!moveToTile.canAccept(tile.cell)) break
            lastValidTile = moveToTile
          }
          if (lastValidTile != null) {
            promises.push(tile.cell.waitForTransition())
            if (lastValidTile.cell != null) {
              lastValidTile.mergeCell = tile.cell
            } else {
              lastValidTile.cell = tile.cell
            }
            tile.cell = null
          }
        }
        return promises
      })
    )
  }

  function canMoveUp() {
    return canMove(tilesByColumn())
  }

  function canMoveDown() {
    return canMove(tilesByColumn().map(column => [...column].reverse()))
  }

  function canMoveLeft() {
    return canMove(tilesByRow())
  }

  function canMoveRight() {
    return canMove(tilesByRow().map(row => [...row].reverse()))
  }

  function canMove(tiles) {
    return tiles.some(group => {
      return group.some((tile, index) => {
        if (index === 0) return false
        if (tile.cell == null) return false
        const moveToTile = group[index - 1]
        return moveToTile.canAccept(tile.cell)
      })
    })
  }

}

startGame();

newGameBtn.addEventListener("click", () => {
  gameBoard.innerHTML = ``;
  score = 0;
  scoreMsg.innerText = 0;
  startGame();
})