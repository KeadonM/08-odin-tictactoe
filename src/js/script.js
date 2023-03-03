const Player = (name, symbol, card) => {
  let active = false;
  let score = 0;

  const toggleActive = () => {
    active = !active;
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

const ComputerPlayer = (name, symbol, card, difficulty) => {
  const prototype = Player(name, symbol, card);

  let botValues = [];

  (() => {
    switch (difficulty) {
      case 'easy':
        botValues = [-1, 0, 2];
        break;
      case 'medium':
        botValues = [1, -100, -1];
        break;
      case 'hard':
        botValues = [1, 0, -1];
        break;
      default:
        botValues = [0, 0, 0];
    }
  })();

  const analyzeMoves = function analyzeMoves(altSymbol) {
    const checkMove = (state, compMove, depth = 0) => {
      const scores = [];

      for (let x = 0; x < state.length; x++) {
        scores[x] = [];
        for (let y = 0; y < state[x].length; y++) {
          if (state[x][y] !== '') continue;

          const newState = state.map((row) => [...row]);
          const currentSymbol = compMove ? this.symbol : altSymbol;
          const nextPlayer = !compMove;

          newState[x][y] = currentSymbol;

          if (gameController.checkRoundWin(currentSymbol, newState)) {
            if (depth === 0) {
              console.log({ compMove, newState });
              scores[x][y] = 999999;
            } else if (depth === 1) {
              console.log({ compMove, newState });
              scores[x][y] = -999999;
            } else {
              scores[x][y] = compMove
                ? botValues[0] + depth
                : botValues[2] - depth;
            }
          } else if (gameController.checkTie(newState)) {
            scores[x][y] = botValues[1];
          } else {
            const childScores = checkMove(newState, nextPlayer, depth + 1);
            const totalScore = childScores.reduce(
              (acc, row) => acc + row.reduce((acc2, val) => acc2 + val, 0),
              0
            );
            scores[x][y] = totalScore;
          }
        }
      }

      return scores;
    };

    return { checkMove };
  }.bind(prototype);

  const findBestMove = (scores) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let x = 0; x < scores.length; x++) {
      for (let y = 0; y < scores[x].length; y++) {
        const score = scores[x][y];
        if (score > bestScore) {
          bestScore = score;
          bestMove = [x, y];
        }
      }
    }

    return bestMove;
  };

  const makeMove = function makeMove(altPlayer) {
    const compMoves = analyzeMoves(altPlayer.symbol).checkMove(
      gameBoard.getState(),
      true
    );

    console.log(compMoves);
    const bestMove = findBestMove(compMoves);

    gameController.takeTurn(false, bestMove[0], bestMove[1]);
    displayController.updateElement(this, bestMove[0], bestMove[1]);
  }.bind(prototype);

  return Object.assign(prototype, { difficulty, makeMove });
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
  let gameActive = false;
  let player1;
  let player2;

  const checkRoundWin = (symbol, fieldState) => {
    const checkHorizontal = () => {
      for (let row = 0; row < 3; row++) {
        let hasLine = true;
        for (let col = 0; col < 3; col++) {
          const currentSymbol = fieldState[row][col];
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
          const currentSymbol = fieldState[row][col];
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
        if (fieldState[i][i] !== symbol) {
          leftToRightWin = false;
        }
        if (fieldState[i][2 - i] !== symbol) {
          rightToLeftWin = false;
        }
      }

      return leftToRightWin || rightToLeftWin;
    };

    if (checkHorizontal() || checkVertical() || checkDiagonals()) return true;

    return false;
  };

  const checkTie = (fieldState) => {
    let isTie = true;
    fieldState.forEach((horizontalField) => {
      horizontalField.forEach((gameSquare) => {
        if (gameSquare === '') {
          isTie = false;
        }
      });
    });

    return isTie;
  };

  const onRoundOver = (activePlayer) => {
    displayController.toggleElements();
    displayController.updateScoreboard(
      player1.getScore(),
      player2.getScore(),
      `${currentRound} / ${totalRounds}`
    );
    displayController.enableRoundBtn();

    checkGameOver(activePlayer);
  };

  const checkGameOver = (player) => {
    if (player.getScore() > totalRounds / 2) {
      onGameOver(player);
      return true;
    }
    return false;
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
    displayController.toggleRoundBtnVisible();
    currentRound = 0;
    totalRounds = 0;
    player.toggleActive();
    gameActive = false;
  };

  const takeTurn = (isHuman, x, y) => {
    if (
      gameBoard.getState()[x][y] === player1.symbol ||
      gameBoard.getState()[x][y] === player2.symbol ||
      (isHuman && player1.isActive() && player1.difficulty !== undefined) ||
      (isHuman && player2.isActive() && player2.difficulty !== undefined) ||
      (isHuman &&
        player1.difficulty !== undefined &&
        player2.difficulty !== undefined &&
        gameActive)
    )
      return undefined;

    const activePlayer = player1.isActive() ? player1 : player2;
    gameBoard.updateState(x, y, activePlayer.symbol);

    if (checkRoundWin(activePlayer.symbol, gameBoard.getState())) {
      activePlayer.updateScore();
      currentRound++;
      onRoundOver(activePlayer);
      console.log('win');
    } else if (checkTie(gameBoard.getState())) {
      console.log('tie');
      onRoundOver(activePlayer);
    } else {
      player1.toggleActive();
      player2.toggleActive();

      checkIfBotsTurn();
    }

    return activePlayer;
  };

  const checkIfBotsTurn = () => {
    if (player1.difficulty !== undefined && player1.isActive())
      setTimeout(() => {
        player1.makeMove(player2);
      }, 1000);
    else if (player2.difficulty !== undefined && player2.isActive())
      setTimeout(() => {
        player2.makeMove(player1);
      }, 1000);
  };

  const init = (
    nameP1,
    nameP2,
    isCompP1,
    isCompP2,
    compDiffP1,
    compDiffP2,
    isSymbolX,
    firstMove,
    rounds
  ) => {
    gameActive = true;
    totalRounds = parseInt(rounds);
    if (!isCompP1) {
      player1 = Player(
        nameP1,
        isSymbolX === 'player1' ? 'X' : 'O',
        document.querySelector('.player-1.card')
      );
    } else {
      player1 = ComputerPlayer(
        nameP1,
        isSymbolX === 'player1' ? 'X' : 'O',
        document.querySelector('.player-1.card'),
        compDiffP1
      );
    }

    if (!isCompP2) {
      player2 = Player(
        nameP2,
        isSymbolX === 'player2' ? 'X' : 'O',
        document.querySelector('.player-2.card')
      );
    } else {
      player2 = ComputerPlayer(
        nameP2,
        isSymbolX === 'player2' ? 'X' : 'O',
        document.querySelector('.player-2.card'),
        compDiffP2
      );
    }

    if (firstMove === 'player1') {
      player1.toggleActive();
    } else {
      player2.toggleActive();
    }

    checkIfBotsTurn();
  };

  return { init, takeTurn, checkRoundWin, checkTie, checkIfBotsTurn };
})();

const displayController = (() => {
  const gameContainer = document.querySelector('#game-container');
  const scoreBoard = document.querySelector('#scoreboard');
  const resetBtn = document.querySelector('#reset-btn');
  const startBtn = document.querySelector('#start-btn');
  const nextRndBtn = document.querySelector('#rnd-btn');
  const roundsDropdown = document.querySelector('.game-setting.rounds');

  const toggleResetBtnVisible = () => {
    resetBtn.classList.toggle('active');
  };

  const toggleStartBtnVisible = () => {
    startBtn.classList.toggle('active');
  };

  const toggleRoundBtnVisible = () => {
    nextRndBtn.classList.toggle('active');
  };
  const hideRoundButton = () => {
    nextRndBtn.classList.remove('active');
  };

  const enableRoundBtn = () => {
    nextRndBtn.disabled = false;
  };
  const disableRoundBtn = () => {
    nextRndBtn.disabled = true;
  };

  const toggleScoreboardVisible = () => {
    scoreBoard.classList.toggle('active');
  };

  const toggleRoundsDrowpdownVisible = () => {
    roundsDropdown.classList.toggle('active');
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

  const updateElement = (player, x, y) => {
    if (player !== undefined) {
      const element = gameContainer.querySelector(
        `:nth-child(${x * 3 + y + 1})`
      );
      element.textContent = player.symbol;
      element.classList.add('fade-in');
    }
  };

  const initBoard = () => {
    gameBoard.getState().forEach((horizontalField, x) => {
      horizontalField.forEach((gameBoardSquare, y) => {
        const element = buildElement(gameBoardSquare);
        element.toggleAttribute('disabled');
        element.addEventListener('click', () => {
          const player = gameController.takeTurn(true, x, y);
          updateElement(player, x, y);
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
    disableRoundBtn();
    gameBoard.resetState();
    resetDisplay();
    toggleElements();
    gameController.checkIfBotsTurn();
  };

  nextRndBtn.addEventListener('click', () => {
    onNextRound();
  });

  initBoard();

  return {
    resetDisplay,
    updateElement,
    toggleResetBtnVisible,
    toggleStartBtnVisible,
    toggleRoundBtnVisible,
    hideRoundButton,
    enableRoundBtn,
    disableRoundBtn,
    toggleScoreboardVisible,
    toggleRoundsDrowpdownVisible,
    updateScoreboard,
    toggleElements,
  };
})();

(function formController() {
  const form = document.querySelector('#game-form');
  const radioBtnSymbolP1 = document.querySelector('#symbol-p1');
  const radioBtnSymbolP2 = document.querySelector('#symbol-p2');
  const compCheckBoxP1 = document.querySelector('#check-comp-p1');
  const compCheckBoxP2 = document.querySelector('#check-comp-p2');

  radioBtnSymbolP1.addEventListener('change', () => {
    document.querySelector("[for='symbol-p1']").textContent = 'X';
    document.querySelector("[for='symbol-p2']").textContent = 'O';
  });

  radioBtnSymbolP2.addEventListener('change', () => {
    document.querySelector("[for='symbol-p2']").textContent = 'X';
    document.querySelector("[for='symbol-p1']").textContent = 'O';
  });

  compCheckBoxP1.addEventListener('change', () => {
    document.querySelector('.radio-comp-diff.p1').toggleAttribute('disabled');
  });

  compCheckBoxP2.addEventListener('change', () => {
    document.querySelector('.radio-comp-diff.p2').toggleAttribute('disabled');
  });

  const onSubmit = () => {
    const nameP1 = form.elements.nameP1.value;
    const nameP2 = form.elements.nameP2.value;
    const isCompP1 = form.elements.isCompP1.checked;
    const isCompP2 = form.elements.isCompP2.checked;
    const compDiffP1 = form.elements.compDiffP1.value;
    const compDiffP2 = form.elements.compDiffP2.value;
    const isSymbolX = form.elements.isSymbolX.value;
    const firstMove = form.elements.firstMove.value;
    const rounds = form.elements.rounds.value;

    displayController.updateScoreboard(0, 0, `0 / ${rounds}`);
    displayController.toggleScoreboardVisible();
    displayController.toggleElements();
    displayController.toggleResetBtnVisible();
    displayController.toggleStartBtnVisible();
    displayController.toggleRoundBtnVisible();
    displayController.toggleRoundsDrowpdownVisible();

    document.querySelector('.player-1.card').toggleAttribute('disabled');
    document.querySelector('.player-2.card').toggleAttribute('disabled');
    document.querySelector('.card-title.p1').textContent = nameP1;
    document.querySelector('.card-title.p2').textContent = nameP2;

    gameController.init(
      nameP1,
      nameP2,
      isCompP1,
      isCompP2,
      compDiffP1,
      compDiffP2,
      isSymbolX,
      firstMove,
      rounds
    );
  };

  const onReset = () => {
    displayController.toggleScoreboardVisible();
    displayController.toggleResetBtnVisible();
    displayController.toggleStartBtnVisible();
    displayController.toggleRoundsDrowpdownVisible();
    displayController.hideRoundButton();

    document.querySelector('.player-1.card').removeAttribute('disabled');
    document.querySelector('.player-2.card').removeAttribute('disabled');
    document.querySelector('.player-1.card').classList.remove('active');
    document.querySelector('.player-2.card').classList.remove('active');
    document.querySelector('.card-title.p1').textContent = 'Player One';
    document.querySelector('.card-title.p2').textContent = 'Player Two';
    document.querySelector('.radio-comp-diff.p1').disabled = true;
    document.querySelector('.radio-comp-diff.p2').disabled = true;

    gameBoard.resetState();
    displayController.resetDisplay();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit();
  });

  form.addEventListener('reset', () => {
    onReset();
  });
})();
