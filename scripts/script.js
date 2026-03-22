// use little to no global code

function GameBoard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push(Cell());
        }
        board.push(row)
    }

    const getBoard = () => board;

    const isValidMove = (row, column) => getBoard()[row][column].getValue() === ""

    const placeToken = (row, column, token, cellColor, tokenColor) => {
        
        if (isValidMove(row, column)) {
            board[row][column].setValue(token);
            board[row][column].setStyle(cellColor, tokenColor)
            
            return true
        } else {
            return false
        }
    }

    // for console playing

    // const printBoard = () => {
    //     let index = 1;
    //     board.forEach(row => {
    //         let line = "| ";
    //         row.forEach(cell => {
    //             line += `${cell.getValue()} | `
    //         })
    //         console.log(`${index}. ${line}`);
    //         index++
    //     })
    // }

    return {getBoard, placeToken}
}

function Cell() {
    let value = "";
    let cellColor = "transparent";
    let tokenColor = "black";

    const getValue = () => value;
    const setValue = (token) => {
        value = token;
    }
    const getStyle = () => ({cellColor, tokenColor})
    const setStyle = (backgroundColor, color) => {
        cellColor = backgroundColor;
        tokenColor = color;
    }

    return {getValue, setValue, getStyle, setStyle}
}

function PlayerFactory(name, token, cellColor, tokenColor) {
    let score = 0;
    const getPlayer = () => ({name, token, cellColor, tokenColor, score})
    const updatePlayer = (playerName) => {
        if (!!playerName) {
            name = playerName;
        }
    }

    const updateScore = () => {
        score += 1
    }

    return {getPlayer, updatePlayer, updateScore}
}

function GameController() {    
    const board = GameBoard();
    

    const players = [PlayerFactory("Player 1", "X", "#ffe3e3", "#a31515"), PlayerFactory("Player 2", "O", "#e5e5ff", "#3a3acd")];

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer.getPlayer();
    const switchActivePlayer = () => activePlayer = activePlayer === players[0] ? players[1] : players[0];
    const customizePlayers = (player1NewName, player2NewName) => {
        players[0].updatePlayer(player1NewName)
        players[1].updatePlayer(player2NewName)
    }

    // for console playing

    // const printRound = () => {
    //     board.printBoard();
    //     console.log(`${getActivePlayer().name}'s turn to make a move`);
    // }

    const playRound = (row, column) => {
        const player = getActivePlayer()
        if (!board.placeToken(row, column, player.token, player.cellColor, player.tokenColor)) {
            return
        }
        if (isGameOver()) {
            return true
        }
        switchActivePlayer()
    }

    const isDraw = () => {
        const flattenedBoard = board.getBoard().flat().map(cell => cell.getValue())
        return !flattenedBoard.some(cell => cell === "")
    }
    
    const isWon = () => {
        const flattenedBoard = board.getBoard().flat().map(cell => cell.getValue())
        
        let pattern = [[0,1,2],[0,3,6],[0,4,8],[1,4,7],[2,5,8],[2,4,6],[3,4,5],[6,7,8]]

        for (let i = 0; i < pattern.length; i++) {
            let checkingPattern = [
                flattenedBoard[pattern[i][0]], flattenedBoard[pattern[i][1]], flattenedBoard[pattern[i][2]]
            ];
            
            let hasWon = checkingPattern.every(token => token == getActivePlayer().token)
            
            if (hasWon) {
                activePlayer.updateScore()
                return true
            }
        }
        return false
    }

    const isGameOver = () => {
        const resultsDiv = document.querySelector(".results");
        if (isWon()) {
            resultsDiv.textContent = `${getActivePlayer().name} won`
            return "won"
        } else if (isDraw()) {
            resultsDiv.textContent = "Draw"
            return "draw"
        }
    }

    return {playRound, customizePlayers, isGameOver, board: board.getBoard(), getActivePlayer};
}

function ScreenController() {
    let gameController = GameController();
    const gameBoardDiv = document.querySelector(".game-board");
    const replayBtn = document.querySelector(".replay-btn");
    let player1Score = 0;
    let player2Score = 0;

    const getGameBoard = () => gameController.board

    const updateScreen = () => {
        const gameBoard = getGameBoard();
        gameBoardDiv.textContent = "";
        gameBoard.forEach((row, row_id )=> {
            row.forEach((column, column_id) => {
                const cellBtn = document.createElement("button");
                cellBtn.textContent = column.getValue();
                cellBtn.dataset.row = row_id;
                cellBtn.dataset.column = column_id;
                cellBtn.style.backgroundColor = column.getStyle().cellColor;
                cellBtn.style.color = column.getStyle().tokenColor;
                cellBtn.addEventListener("click", clickHandler);
                gameBoardDiv.appendChild(cellBtn);
            })
        })
        if (gameController.isGameOver()) {
            updateScores()
            disableBtns()
            replayBtn.addEventListener("click", replay)
            replayBtn.style.display = "block";
            
        }
    }

    const clickHandler = (e) => {
        e.target.textContent = gameController.getActivePlayer().token;
        const row_id = e.target.dataset.row;
        const column_id = e.target.dataset.column;
        gameController.playRound(row_id, column_id);
        updateScreen()
    }

    const disableBtns = () => {
        gameBoardDiv.childNodes.forEach(child => child.setAttribute("disabled", true))
    }

    const start = (e) => {
        e.preventDefault();
        customPlayers()
        e.target.style.display = "none";
        gameBoardDiv.style.display = "grid";
        renderScores()
        updateScreen();
    }

    const customPlayers = () => {
        const player1 = document.getElementById("player1").value || "Player 1";
        const player2 = document.getElementById("player2").value || "Player 2";
        gameController.customizePlayers(player1, player2);
        return {player1, player2}
    }

    const replay = () => {
        gameController = GameController();
        customPlayers()
        updateScreen();
        document.querySelector(".results").textContent = "";
        replayBtn.style.display = "none";
    }

    const updateScores = () => {
        if (gameController.isGameOver() == "won") {
            if (gameController.getActivePlayer().token == "X") {
            player1Score += 1;
        } else {
            player2Score += 1;
            }
        } 
        renderScores()  
    }

    const renderScores = () => {
        const score1 = document.querySelector(".score1");
        const score2 = document.querySelector(".score2");
        score1.textContent = `${customPlayers().player1} (X): ${player1Score}`
        score2.textContent = `${customPlayers().player2} (O): ${player2Score}`
        document.querySelector(".scores").style.display = "block";
    }

    return {start}
}

document.querySelector("form").addEventListener("submit", ScreenController().start)