<template>
  <div class="container">
    <PlayerInfo :player="player1" :currentPlayer="currentPlayer"/>
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
            :class="{'white':currentPlayer=== 1,'black':currentPlayer===2}"
            class="next-move"
            v-if="nextMoves.getCell(i,j) > 0"
          >{{nextMoves.getCell(i,j)}}</div>
        </div>
      </div>
    </div>
    <PlayerInfo :player="player2" :currentPlayer="currentPlayer"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PlayerInfo from './PlayerInfo.vue';
import { Board, CELL_STATUS } from '@/models/Board';
import { Player } from '../models/Player';

@Component({
  components: {
    PlayerInfo,
  },
})
export default class BoardVue extends Vue {
  @Prop() private board!: Board;
  private nextMoves!: Board;
  private currentPlayer!: CELL_STATUS;
  private player1!: Player;
  private player2!: Player;

  constructor() {
    super();
    // black starts first
    this.currentPlayer = CELL_STATUS.BLACK;
    // a matrix where earch cell replresents points gain
    this.nextMoves = this.getNextMovesFor(this.currentPlayer);
    // these two will show each players info
    // like, time, points, name, score ...
    this.player1 = new Player(CELL_STATUS.WHITE);
    this.player2 = new Player(CELL_STATUS.BLACK);
  }

  public mounted() {
    this.updateScores();
  }

  public play(i: number, j: number) {
    this.board.flip(
      i,
      j,
      this.currentPlayer,
      this.getOpponentOf(this.currentPlayer),
    );
    this.switchPlayer();
    this.nextMoves = this.getNextMovesFor(this.currentPlayer);
    setTimeout(this.alertWhoWon, 500);
    this.updateScores();
  }

  public updateScores() {
    this.player1.score = this.board.countOccurencesOf(this.player1.id);
    this.player2.score = this.board.countOccurencesOf(this.player2.id);
  }

  public alertWhoWon(): void {
    const opponent = this.getOpponentOf(this.currentPlayer);
    if (this.nextMoves.getSum() === 0) {
      if (
        this.board.countOccurencesOf(this.currentPlayer) >
        this.board.countOccurencesOf(opponent)
      ) {
        alert(`player ${this.currentPlayer} won !`);
      } else {
        alert(`player ${opponent} won !`);
      }
    }
  }

  public switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === CELL_STATUS.BLACK
        ? CELL_STATUS.WHITE
        : CELL_STATUS.BLACK;
  }

  public getOpponentOf(player: CELL_STATUS) {
    return player === CELL_STATUS.WHITE ? CELL_STATUS.BLACK : CELL_STATUS.WHITE;
  }

  public getAllLegalMoves(arr: CELL_STATUS[], player: CELL_STATUS) {
    // get legal moves starting from left
    const leftMoves = this.getLegalmoves(arr, player);
    // get legal moves starting from right
    const rightMoves = this.getLegalmoves(arr.slice().reverse(), player)
      .slice()
      .reverse();
    // merge the two results
    return this.sumArrays(leftMoves, rightMoves);
  }

  public getLegalmoves(arr: CELL_STATUS[], player: CELL_STATUS): number[] {
    const res = Array(arr.length).fill(0);
    const str = arr.reduce((s, e) => s + e, '');
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
        if (score > 0 && arr[i] === CELL_STATUS.EMPTY) {
          res[i] = score;
          break;
        }
      }
    }
    return res;
  }

  public sumArrays(arr1: number[], arr2: number[]): number[] {
    return arr1.map((e, i) => e + arr2[i]);
  }

  public getNextMovesFor(player: CELL_STATUS): Board {
    const length = this.board.state.length;
    const opponent = this.getOpponentOf(player);
    const scoreBoard = new Board();
    scoreBoard.setToZero();

    // left ----> right
    for (let i = 0; i < length; i++) {
      const scores = this.getAllLegalMoves(this.board.state[i], player);
      scoreBoard.state[i] = this.sumArrays(scoreBoard.state[i], scores);
    }
    // top ----> down
    for (let i = 0; i < length; i++) {
      const scores = this.getAllLegalMoves(this.board.getColumn(i), player);
      scoreBoard.setColumn(this.sumArrays(scoreBoard.getColumn(i), scores), i);
    }

    {
      // diagonals: top-left ----> down-right
      const boardDiags = this.board.getDiagonals();
      const scoreBoardDiags = scoreBoard.getDiagonals();
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getAllLegalMoves(boardDiags[i], player);
        scoreBoard.setDiagonal(
          this.sumArrays(scoreBoardDiags[i], scores),
          i + 1,
        );
      }
    }
    {
      // diagonals: top-right ----> down-left
      const boardDiags = this.board.getMirrorDiagonals();
      const scoreBoardDiags = scoreBoard.getMirrorDiagonals();
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = this.getAllLegalMoves(boardDiags[i], player);
        scoreBoard.setMirrorDiagonal(
          this.sumArrays(scoreBoardDiags[i], scores),
          i + 1,
        );
      }
    }
    return scoreBoard;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$size: 600px;
.container {
  border: 2px solid #000;
  width: $size;
  margin: auto;
  border-color: #9ecaed;
  box-shadow: 0 0 30px #9ecaed;
}
.board {
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

  .next-move {
    font-size: 50px;
    font-weight: bold;
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

    &.white {
      color: #fff;
      border: 2px solid #fff;
    }

    &.black {
      color: #000;
      border: 2px solid #000;
    }
  }

  &.white {
    background-image: url(~/shuriken_w.png);
  }

  &.black {
    background-image: url(~/shuriken_b.png);
  }
}
</style>
