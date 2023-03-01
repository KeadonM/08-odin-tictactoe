const Player = (name, symbol) => {
  let active = false;

  const toggleActive = () => {
    active = !active;
  };

  const isActive = () => active;

  return {
    name,
    symbol,
    isActive,
    toggleActive,
  };
};

const gameBoard = (() => {
  const fieldState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  const updateState = (x, y, symbol) => {
    fieldState[x][y] = symbol;
  };

  return { fieldState, updateState };
})();

const gameController = (() => {
  let isGameActive = false;
  let player1 = Player('PlaceHolder', 'X');
  let player2 = Player('PlaceHolder', 'O');

  const checkGameOver = (symbol) => {
    const checkHorizontal = () => {
      for (let row = 0; row < 3; row++) {
        let hasLine = true;
        for (let col = 0; col < 3; col++) {
          const currentSymbol = gameBoard.fieldState[row][col];
          if (currentSymbol !== symbol) {
            hasLine = false;
            break;
          }
        }
        if (hasLine) return true;
      }

      return false;
    };

    const checkVertical = () => {
      for (let col = 0; col < 3; col++) {
        let hasLine = true;
        for (let row = 0; row < 3; row++) {
          const currentSymbol = gameBoard.fieldState[row][col];
          if (currentSymbol !== symbol) {
            hasLine = false;
            break;
          }
        }
        if (hasLine) return true;
      }

      return false;
    };

    const checkDiagonals = () => {
      let leftToRightWin = true;
      let rightToLeftWin = true;

      for (let i = 0; i < 3; i++) {
        if (gameBoard.fieldState[i][i] !== symbol) {
          leftToRightWin = false;
        }
        if (gameBoard.fieldState[i][2 - i] !== symbol) {
          rightToLeftWin = false;
        }
      }

      return leftToRightWin || rightToLeftWin;
    };

    return checkHorizontal() || checkVertical() || checkDiagonals();
  };

  const takeTurn = (x, y) => {
    if (
      gameBoard.fieldState[x][y] === player1.symbol ||
      gameBoard.fieldState[x][y] === player2.symbol ||
      !isGameActive
    )
      return undefined;

    const symbol = player1.isActive() ? player1.symbol : player2.symbol;

    player1.toggleActive();
    player2.toggleActive();

    gameBoard.updateState(x, y, symbol);
    if (checkGameOver(symbol)) {
      console.log(`Winner: ${symbol}`);
      isGameActive = false;
    }
    return symbol;
  };

  const init = (playerOneName, playerTwoName) => {
    player1 = Player(playerOneName, 'X');
    player2 = Player(playerTwoName, 'O');

    player1.toggleActive();
    isGameActive = true;
  };

  return { takeTurn, init };
})();

const displayController = (() => {
  const gameContainer = document.querySelector('#game-container');
  const radioBtnSymbolP1 = document.querySelector('#symbol-p1');
  const radioBtnSymbolP2 = document.querySelector('#symbol-p2');

  radioBtnSymbolP1.addEventListener('change', () => {
    document.querySelector("[for='symbol-p1']").textContent = 'X';
    document.querySelector("[for='symbol-p2']").textContent = 'O';
  });

  radioBtnSymbolP2.addEventListener('change', () => {
    document.querySelector("[for='symbol-p2']").textContent = 'X';
    document.querySelector("[for='symbol-p1']").textContent = 'O';
  });

  const buildElement = (elementState) => {
    const element = document.createElement('button');
    element.className = 'board-element';
    element.textContent = elementState;
    element.type = 'button';

    return element;
  };

  const init = () => {
    gameBoard.fieldState.forEach((horizontalArray, x) => {
      horizontalArray.forEach((gameBoardSquare, y) => {
        const element = buildElement(gameBoardSquare);
        element.addEventListener('click', () => {
          const symbol = gameController.takeTurn(x, y);
          if (symbol !== undefined) {
            element.textContent = symbol;
            element.classList.add('fade-in');
          }
        });
        gameContainer.appendChild(element);
      });
    });
  };

  return { init };
})();

function startGame() {
  displayController.init();
  gameController.init('Fred', 'John');
}

startGame();
