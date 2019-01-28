<template>
  <div>
    <span>currentPlayer: {{currentPlayer}}</span>
    <div class="board">
      <div class="row" v-for="(row, i) in board.state" :key="i">
        <div
          :class="{'white':cell===1,'black':cell===2}"
          class="cell"
          v-for="(cell, j) in row"
          :key="j"
        >
          <div
            v-on:click="play(i,j)"
            class="next-move"
            v-if="nextMoves[i][j] > 0"
          >{{nextMoves[i][j]}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Board from "@/models/Board";

enum SQUARE {
  EMPTY = 0,
  WHITE = 1,
  BLACK = 2
}

@Component
export default class BoardVue extends Vue {
  @Prop() private board!: Board;
  private nextMoves!: number[][];
  private currentPlayer!: SQUARE;

  constructor() {
    super();
    this.currentPlayer = SQUARE.BLACK;
    this.nextMoves = this.getNextMovesFor(this.currentPlayer);
  }

  play(i: number, j: number) {
    console.log("play", i, j);
    this.board.flip(
      i,
      j,
      this.currentPlayer,
      this.getOpponentOf(this.currentPlayer)
    );
    this.switchPlayer();
    this.nextMoves = this.getNextMovesFor(this.currentPlayer);
  }

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === SQUARE.BLACK ? SQUARE.WHITE : SQUARE.BLACK;
  }

  getOpponentOf(player: SQUARE) {
    return player === SQUARE.WHITE ? SQUARE.BLACK : SQUARE.WHITE;
  }

  getLegalmoves(arr: SQUARE[], player: SQUARE): number[] {
    const res = Array(arr.length).fill(0);
    const str = arr.reduce((s, e) => s + e, "");
    const opponent = this.getOpponentOf(player);
    if (RegExp(`(0*)(${player}+)(${opponent}+)(0+)`).test(str)) {
      let score = 0;
      let startCount = false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === player) {
          startCount = true;
        }
        if (startCount && arr[i] === opponent) {
          score++;
        }
        if (score > 0 && arr[i] === SQUARE.EMPTY) {
          res[i] = score;
          break;
        }
      }
    }
    return res;
  }

  mergeArray(arr1: number[], arr2: number[]): number[] {
    return arr1.map((e, i) => e + arr2[i]);
  }

  getColumn(arr: number[][], i: number): number[] {
    const column = [];
    for (let j = 0; j < arr.length; j++) {
      column.push(arr[j][i]);
    }
    return column;
  }

  setColumn(arr: number[][], arr2: number[], i: number): void {
    for (let j = 0; j < arr.length; j++) {
      arr[j][i] = arr2[j];
    }
  }

  setDiagonal(arr: number[][], arr2: number[], i: number): void {
    const l = arr.length;
    // NOTE: there may be a better way to set everything in one loop
    if (i < l) {
      for (let j = 0; j < i; j++) {
        arr[j][l - i + j] = arr2[j];
      }
    }
    if (i === l) {
      for (let i = 0; i < l; i++) {
        arr[i][i] = arr2[i];
      }
    }
    if (i > l) {
      for (let j = 0; i - l + j < l; j++) {
        arr[i - l + j][j] = arr2[j];
      }
    }
  }

  // get top-left ---> down-right diagonals
  getDiagonals(arr: number[][]): number[][] {
    const res = [];
    const l = arr.length;
    // get the upper right diagonals
    for (let i = 1; i < l; i++) {
      let diag = [];
      for (let j = 0; j < i; j++) {
        diag.push(arr[j][l - i + j]);
      }
      res.push(diag);
    }
    // get the middle diagonal
    let diag = [];
    for (let i = 0; i < l; i++) {
      diag.push(arr[i][i]);
    }
    res.push(diag);
    // get the lower left diagonals
    for (let i = l - 1; i >= 1; i--) {
      let diag = [];
      for (let j = i - 1; j >= 0; j--) {
        diag.push(arr[l - i + j][j]);
      }
      res.push(diag.reverse());
    }
    return res;
  }

  getNextMovesFor(player1: SQUARE): number[][] {
    const length = this.board.state.length;
    const board = this.board.state;
    const opponent = this.getOpponentOf(player1);
    let scoreBoard = Array(8)
      .fill(0)
      .map(a => Array(8).fill(0));

    // left ----> right
    for (let i = 0; i < length; i++) {
      const scores = this.getLegalmoves(board[i], player1);
      scoreBoard[i] = this.mergeArray(scoreBoard[i], scores);
    }
    // right ----> left
    for (let i = 0; i < length; i++) {
      const scores = this.getLegalmoves(board[i].slice().reverse(), player1);
      scoreBoard[i] = this.mergeArray(scoreBoard[i], scores.slice().reverse());
    }
    // top ----> down
    for (let i = 0; i < length; i++) {
      const scores = this.getLegalmoves(this.getColumn(board, i), player1);
      this.setColumn(
        scoreBoard,
        this.mergeArray(this.getColumn(scoreBoard, i), scores),
        i
      );
    }
    console.log("scoreBoard 1", JSON.parse(JSON.stringify(scoreBoard)));
    // down ----> top
    for (let i = 0; i < length; i++) {
      const scores = this.getLegalmoves(
        this.getColumn(board, i)
          .slice()
          .reverse(),
        player1
      );
      this.setColumn(
        scoreBoard,
        this.mergeArray(
          this.getColumn(scoreBoard, i),
          scores.slice().reverse()
        ),
        i
      );
    }
    console.log("scoreBoard 2", JSON.parse(JSON.stringify(scoreBoard)));

    {
      // diagonals: up-left ----> down-right
      const boardDiags = this.getDiagonals(board);
      const scoreBoardDiags = this.getDiagonals(scoreBoard);
      console.log("boardDiags", boardDiags);
      console.log("scoreBoardDiags", scoreBoardDiags);
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getLegalmoves(boardDiags[i], player1);
        // if (scores.reduce((s,e) => s+e, 0)>0) {}
        this.setDiagonal(
          scoreBoard,
          this.mergeArray(scoreBoardDiags[i], scores),
          i + 1
        );
      }
    }

    {
      // diagonals: down-right ----> up-left
      const boardDiags = this.getDiagonals(board);
      const scoreBoardDiags = this.getDiagonals(scoreBoard);
      console.log("boardDiags ++++", boardDiags);
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getLegalmoves(
          boardDiags[i].slice().reverse(),
          player1
        );
        this.setDiagonal(
          scoreBoard,
          this.mergeArray(scoreBoardDiags[i], scores.slice().reverse()),
          i + 1
        );
      }
    }
    {
      // diagonals: top-right ----> down-left
      const boardDiags = this.getDiagonals(board.map(a => a.slice().reverse()));
      const scoreBoardDiags = this.getDiagonals(
        scoreBoard.map(a => a.slice().reverse())
      );
      console.log("boardDiags", boardDiags);
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getLegalmoves(boardDiags[i], player1);
        scoreBoard = scoreBoard.map(a => a.slice().reverse());
        this.setDiagonal(
          scoreBoard,
          this.mergeArray(scoreBoardDiags[i], scores),
          i + 1
        );
        scoreBoard = scoreBoard.map(a => a.slice().reverse());
      }
    }
    {
      // diagonals: top-right ----> down-left
      const boardDiags = this.getDiagonals(board.map(a => a.slice().reverse()));
      const scoreBoardDiags = this.getDiagonals(
        scoreBoard.map(a => a.slice().reverse())
      );
      console.log("boardDiags", boardDiags);
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getLegalmoves(
          boardDiags[i].slice().reverse(),
          player1
        );
        scoreBoard = scoreBoard.map(a => a.slice().reverse());
        this.setDiagonal(
          scoreBoard,
          this.mergeArray(scoreBoardDiags[i], scores.slice().reverse()),
          i + 1
        );
        scoreBoard = scoreBoard.map(a => a.slice().reverse());
      }
    }

    console.log("scoreBoard", JSON.parse(JSON.stringify(scoreBoard)));
    return scoreBoard;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.board {
  $size: 600px;
  border: 2px solid #000;
  width: $size;
  height: $size;
  margin: auto;
  display: flex;
  flex-direction: column;
  background: green;
}
.row {
  display: flex;
  flex: 1;
}
.cell {
  border: 1px solid #000;
  background-size: contain;
  flex: 1;

  &.white {
    background-image: url(~/shuriken_w.png);
  }

  &.black {
    background-image: url(~/shuriken_b.png);
  }

  .next-move {
    color: #000;
    font-size: 50px;
    font-weight: bold;
    border: 2px solid #000;
    border-radius: 73%;
    width: 80%;
    height: 80%;
    margin: auto;
    text-align: center;
    margin-top: 5px;

    &:hover {
      box-shadow: inset 0 0 10px #000000;
      cursor: pointer;
    }
  }
}
</style>
