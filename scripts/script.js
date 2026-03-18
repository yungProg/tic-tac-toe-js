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

    const isValidMove = (row, column) => board[row][column].getValue() == "*"

    const placeToken = (row, column, token) => {
        if (isValidMove(row, column)) {
            board[row][column].setValue(token);
        } else {
            console.log("Invalid move! Please select and empty cell");
        }
    }

    const printBoard = () => {
        let index = 1;
        board.forEach(row => {
            let line = "| ";
            row.forEach(cell => {
                line += `${cell.getValue()} | `
            })
            console.log(`${index}. ${line}`);
            index++
        })
    }

    return {getBoard, placeToken, printBoard}
}

function Cell() {
    let value = "*";

    const getValue = () => value;
    const setValue = (token) => {
        value = token;
    }

    return {getValue, setValue}
}

function PlayerFactory(name, token) {
    const getPlayer = () => ({name, token})
    const createPlayer = (playerName, playerToken) => {
        name = playerName;
        token = playerToken;
    }

    return {getPlayer, createPlayer}
}

function GameController() {
    console.log("Welcome");
    
    const board = GameBoard();

    const player1 = PlayerFactory("Player 1", "X");
    const player2 = PlayerFactory("Player 2", "O");

    let activePlayer = player1;

    const getActivePlayer = () => activePlayer.getPlayer();
    const switchActivePlayer = () => activePlayer = activePlayer === player1 ? player2 : player1;

    const addToken = (row, column) => {
        [row, column] = [row - 1, column - 1]
        board.placeToken(row, column, getActivePlayer().token);
        switchActivePlayer();
    }

    const playRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn to make a move`);
    }

    return {playRound, addToken};
}
