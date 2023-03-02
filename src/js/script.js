const Player = (name, symbol, card) => {
  let active = false;
  let score = 0;

  const toggleActive = () => {
    active = !active;
    console.log(card);
    card.classList.toggle('active');
  };

  const isActive = () => active;

  const updateScore = () => {
    score++;
  };

  const getScore = () => score;

  return {
    name,
    symbol,
    isActive,
    toggleActive,
    updateScore,
    getScore,
  };
};

const gameBoard = (() => {
  let fieldArray = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  const getState = () => fieldArray.map((row) => [...row]);

  const updateState = (x, y, symbol) => {
    fieldArray[x][y] = symbol;
  };

  const resetState = () => {
    fieldArray = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
  };

  return { getState, updateState, resetState };
})();

const gameController = (() => {
  let currentRound = 0;
  let totalRounds = 0;
  let player1;
  let player2;

  const onRoundOver = () => {
    displayController.toggleElements();
    displayController.updateScoreboard(
      player1.getScore(),
      player2.getScore(),
      `${currentRound} / ${totalRounds}`
    );
    displayController.toggleRndBtnDisabled();
  };

  const onGameOver = (player) => {
    if (player1 === player) {
      displayController.updateScoreboard(
        'Winner!',
        'Loser...',
        `${currentRound} / ${totalRounds}`
      );
    } else {
      displayController.updateScoreboard(
        'Loser...',
        'Winner!',
        `${currentRound} / ${totalRounds}`
      );
    }
  };

  const checkRoundOver = (player) => {
    const symbol = player.symbol;

    const checkHorizontal = () => {
      for (let row = 0; row < 3; row++) {
        let hasLine = true;
        for (let col = 0; col < 3; col++) {
          const currentSymbol = gameBoard.getState()[row][col];
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
          const currentSymbol = gameBoard.getState()[row][col];
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
        if (gameBoard.getState()[i][i] !== symbol) {
          leftToRightWin = false;
        }
        if (gameBoard.getState()[i][2 - i] !== symbol) {
          rightToLeftWin = false;
        }
      }

      return leftToRightWin || rightToLeftWin;
    };

    const checkTie = () => {
      let isTie = true;
      gameBoard.getState().forEach((horizontalField) => {
        horizontalField.forEach((gameSquare) => {
          if (gameSquare === '') {
            isTie = false;
          }
        });
      });

      return isTie;
    };

    if (checkHorizontal() || checkVertical() || checkDiagonals()) {
      player.updateScore();
      currentRound++;
      onRoundOver();
      console.log(`Round Winner: ${player.name}`);
      return true;
    }

    if (checkTie()) {
      onRoundOver();
      console.log(`Round Tie`);
      return true;
    }

    return false;
  };

  const checkGameOver = (player) => {
    if (player.getScore() > totalRounds / 2) {
      onGameOver(player);
    }
  };

  const takeTurn = (x, y) => {
    if (
      gameBoard.getState()[x][y] === player1.symbol ||
      gameBoard.getState()[x][y] === player2.symbol
    )
      return undefined;

    const activePlayer = player1.isActive() ? player1 : player2;
    gameBoard.updateState(x, y, activePlayer.symbol);

    player1.toggleActive();
    player2.toggleActive();

    if (checkRoundOver(activePlayer)) {
      checkGameOver(activePlayer);
    }

    return activePlayer;
  };

  const init = (nameP1, nameP2, isSymbolX, firstMove, rounds) => {
    totalRounds = rounds;
    player1 = Player(
      nameP1,
      isSymbolX === 'player1' ? 'X' : 'O',
      document.querySelector('.player-1.card')
    );
    player2 = Player(
      nameP2,
      isSymbolX === 'player2' ? 'X' : 'O',
      document.querySelector('.player-2.card')
    );

    if (firstMove === 'player1') player1.toggleActive();
    else player2.toggleActive();
  };

  return { takeTurn, init };
})();

const displayController = (() => {
  const gameContainer = document.querySelector('#game-container');
  const scoreBoard = document.querySelector('#scoreboard');
  const resetBtn = document.querySelector('#reset-btn');
  const startBtn = document.querySelector('#start-btn');
  const nextRndBtn = document.querySelector('#rnd-btn');

  const toggleResetBtnVisible = () => {
    resetBtn.classList.toggle('active');
  };

  const toggleStartBtnVisible = () => {
    startBtn.classList.toggle('active');
  };

  const toggleRndBtnVisible = () => {
    nextRndBtn.classList.toggle('active');
  };

  const toggleRndBtnDisabled = () => {
    nextRndBtn.toggleAttribute('disabled');
  };

  const toggleScoreboardVisible = () => {
    scoreBoard.classList.toggle('active');
  };

  const updateScoreboard = (scoreP1, scoreP2, rounds) => {
    scoreBoard.querySelector('.p1').textContent = scoreP1;
    scoreBoard.querySelector('.p2').textContent = scoreP2;
    scoreBoard.querySelector('#rounds-remaining').textContent = rounds;
  };

  const toggleElements = () => {
    gameContainer.childNodes.forEach((element) =>
      element.toggleAttribute('disabled')
    );
  };

  const buildElement = (elementState) => {
    const element = document.createElement('button');
    element.className = 'board-element';
    element.textContent = elementState;
    element.type = 'button';

    return element;
  };

  const initBoard = () => {
    gameBoard.getState().forEach((horizontalField, x) => {
      horizontalField.forEach((gameBoardSquare, y) => {
        const element = buildElement(gameBoardSquare);
        element.toggleAttribute('disabled');
        element.addEventListener('click', () => {
          const player = gameController.takeTurn(x, y);
          if (player !== undefined) {
            element.textContent = player.symbol;
            element.classList.add('fade-in');
          }
        });
        gameContainer.appendChild(element);
      });
    });
  };

  const resetDisplay = () => {
    gameContainer.innerHTML = '';
    initBoard();
  };

  const onNextRound = () => {
    toggleRndBtnDisabled();
    gameBoard.resetState();
    resetDisplay();
    toggleElements();
  };

  nextRndBtn.addEventListener('click', () => {
    onNextRound();
  });

  initBoard();

  return {
    resetDisplay,
    toggleResetBtnVisible,
    toggleStartBtnVisible,
    toggleRndBtnVisible,
    toggleRndBtnDisabled,
    toggleScoreboardVisible,
    updateScoreboard,
    toggleElements,
  };
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

    displayController.updateScoreboard(0, 0, `0 / ${rounds}`);
    displayController.toggleScoreboardVisible();
    displayController.toggleElements();
    displayController.toggleResetBtnVisible();
    displayController.toggleStartBtnVisible();
    if (rounds > 1) {
      displayController.toggleRndBtnVisible();
      displayController.toggleRndBtnDisabled();
    }

    document.querySelector('.player-1.card').toggleAttribute('disabled');
    document.querySelector('.player-2.card').toggleAttribute('disabled');
    document.querySelector('.card-title.p1').textContent = nameP1;
    document.querySelector('.card-title.p2').textContent = nameP2;

    gameController.init(nameP1, nameP2, isSymbolX, firstMove, rounds);
  };

  const onReset = () => {
    displayController.toggleScoreboardVisible();
    displayController.toggleResetBtnVisible();
    displayController.toggleStartBtnVisible();

    document.querySelector('.player-1.card').removeAttribute('disabled');
    document.querySelector('.player-2.card').removeAttribute('disabled');
    document.querySelector('.card-title.p1').textContent = 'Player One';
    document.querySelector('.card-title.p2').textContent = 'Player Two';

    gameBoard.resetState();
    displayController.resetDisplay();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit();
  });

  form.addEventListener('reset', (event) => {
    onReset();
  });
})();
