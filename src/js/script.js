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

  const init = (nameP1, nameP2, isSymbolX, firstMove, rounds) => {
    player1 = Player(nameP1, isSymbolX === 'player1' ? 'X' : 'O');
    player2 = Player(nameP2, isSymbolX === 'player2' ? 'X' : 'O');

    if (firstMove === 'player1') player1.toggleActive();
    else player2.toggleActive();

    isGameActive = true;
  };

  return { takeTurn, init };
})();

(function displayController() {
  const gameContainer = document.querySelector('#game-container');

  const buildElement = (elementState) => {
    const element = document.createElement('button');
    element.className = 'board-element';
    element.textContent = elementState;
    element.type = 'button';

    return element;
  };

  const init = (() => {
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
  })();

  return { init };
})();

(function formController() {
  const form = document.querySelector('#game-form');
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

  const onSubmit = () => {
    const nameP1 = form.elements.nameP1.value;
    const nameP2 = form.elements.nameP2.value;
    const isSymbolX = form.elements.isSymbolX.value;
    const firstMove = form.elements.firstMove.value;
    const rounds = form.elements.rounds.value;

    gameController.init(nameP1, nameP2, isSymbolX, firstMove, rounds);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit();
  });
})();
