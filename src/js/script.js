const gameContainer = document.querySelector('#game-container');

const Player = (name, symbol) => {
  const active = false;

  return {
    name,
    symbol,
    active,
  };
};

const gameBoard = (() => {
  const gameState = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];

  const updateState = (index, symbol) => {
    gameState[index] = symbol;
  };

  return { gameState, updateState };
})();

const gameController = (() => {
  let player1 = Player('PlaceHolder', 'X');
  let player2 = Player('PlaceHolder', 'O');

  const takeTurn = (index) => {
    let symbol;

    if (player1.active) {
      symbol = player1.symbol;
      player1.active = false;
      player2.active = true;
    } else {
      symbol = player2.symbol;
      player2.active = false;
      player1.active = true;
    }

    gameBoard.updateState(index, symbol);
    return symbol;
  };

  const init = (playerOneName, playerTwoName) => {
    player1 = Player(playerOneName, 'X');
    player2 = Player(playerTwoName, 'O');

    player1.active = true;
  };

  return { takeTurn, init };
})();

const displayController = (() => {
  const buildElement = (elementState) => {
    const element = document.createElement('div');
    element.className = 'board-element';

    const p = document.createElement('p');
    p.textContent = elementState;

    element.appendChild(p);
    return element;
  };

  const init = () => {
    gameBoard.gameState.forEach((elementState, i) => {
      const element = buildElement(elementState);
      element.addEventListener('click', () => {
        const symbol = gameController.takeTurn(i);
        element.querySelector('p').textContent = symbol;
      });

      gameContainer.appendChild(element);
    });
  };

  return { init };
})();

function startGame() {
  displayController.init();
  gameController.init('Fred', 'John');
}

startGame();
