import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Square(props) {
  const sqr = "square" + (props.highlightWinnerLine ? " highlight" : "");
  return (
    <button className={sqr} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlightWinnerLine={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    const board = [];
    for (let i = 0; i < 5; ++i) {
      const rows = [];
      for (let j = 0; j < 5; ++j) {
        rows.push(this.renderSquare(i * 5 + j));
      }
      board.push(<div className="board-row">{rows}</div>);
    }
    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(25).fill(null),
          lastSquare: 0,
        },
      ],
      isSorted: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastSquare: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  sort() {
    this.setState({
      isSorted: !this.state.isSorted,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;

    const moves = history.map((step, move) => {
      const lastSquare = step.lastSquare;
      const desc = move
        ? `Go to move #${move} (${1 + (lastSquare % 5)}, ${Math.floor(
            1 + lastSquare / 5
          )})`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className={move === this.state.stepNumber ? "bold" : "not-bold"}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winInfo.draw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    const isSorted = this.state.isSorted;
    if (!isSorted) {
      moves.reverse();
    }

    return (
      <>
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              winLine={winInfo.winLine}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
          <div>
            <button
              className="btn btn-primary sort-btn"
              onClick={() => this.sort()}
            >
              Sort moves list
            </button>
          </div>
        </div>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d] &&
      squares[a] === squares[e]
    ) {
      return { winner: squares[a], winLine: lines[i], draw: false };
    }
  }
  let draw = true;
  console.log(squares.length);
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      draw = false;
      break;
    }
  }
  return { winner: null, winLine: null, draw: draw };
}
