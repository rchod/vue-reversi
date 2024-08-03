<template>
  <div class="container">
    <PlayerInfo :player="player1" :currentPlayer="currentPlayer" />
    <div class="board">
      <div class="row" v-for="(row, i) in board.state" :key="i">
        <div
          :class="{ white: cell === 1, black: cell === 2 }"
          class="cell"
          v-for="(cell, j) in row"
          :key="j"
        >
          <div
            @click="play(i, j)"
            :class="{ white: currentPlayer === 1, black: currentPlayer === 2 }"
            class="next-move"
            v-if="nextMoves.getCell(i, j) > 0"
          >
            {{ nextMoves.getCell(i, j) }}
          </div>
        </div>
      </div>
    </div>
    <PlayerInfo :player="player2" :currentPlayer="currentPlayer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import PlayerInfo from './PlayerInfo.vue';
import { Board, CELL_STATUS } from '@/models/Board';
import { Player } from '../models/Player';

export default defineComponent({
  name: 'BoardVue',
  components: {
    PlayerInfo,
  },
  props: {
    board: {
      type: Object as () => Board,
      required: true,
    },
  },
  setup(props) {
    const getNextMovesFor = (player: CELL_STATUS): Board => {
      const length = props.board.state.length;
      const opponent = getOpponentOf(player);
      const scoreBoard = new Board();
      scoreBoard.setToZero();

      // left ----> right
      for (let i = 0; i < length; i++) {
        const scores = getAllLegalMoves(props.board.state[i], player);
        scoreBoard.state[i] = sumArrays(scoreBoard.state[i], scores);
      }
      // top ----> down
      for (let i = 0; i < length; i++) {
        const scores = getAllLegalMoves(props.board.getColumn(i), player);
        scoreBoard.setColumn(sumArrays(scoreBoard.getColumn(i), scores), i);
      }

      // diagonals: top-left ----> down-right
      const boardDiags = props.board.getDiagonals();
      const scoreBoardDiags = scoreBoard.getDiagonals();
      for (let i = 0; i < boardDiags.length; i++) {
        const scores = getAllLegalMoves(boardDiags[i], player);
        scoreBoard.setDiagonal(sumArrays(scoreBoardDiags[i], scores), i + 1);
      }

      // diagonals: top-right ----> down-left
      const boardDiagsMirror = props.board.getMirrorDiagonals();
      const scoreBoardDiagsMirror = scoreBoard.getMirrorDiagonals();
      for (let i = 0; i < boardDiagsMirror.length; i++) {
        const scores = getAllLegalMoves(boardDiagsMirror[i], player);
        scoreBoard.setMirrorDiagonal(
          sumArrays(scoreBoardDiagsMirror[i], scores),
          i + 1,
        );
      }

      return scoreBoard;
    };

    const getOpponentOf = (player: CELL_STATUS) => {
      return player === CELL_STATUS.WHITE
        ? CELL_STATUS.BLACK
        : CELL_STATUS.WHITE;
    };

    const switchPlayer = () => {
      currentPlayer.value =
        currentPlayer.value === CELL_STATUS.BLACK
          ? CELL_STATUS.WHITE
          : CELL_STATUS.BLACK;
    };

    const getAllLegalMoves = (arr: CELL_STATUS[], player: CELL_STATUS) => {
      const leftMoves = getLegalmoves(arr, player);
      const rightMoves = getLegalmoves(arr.slice().reverse(), player)
        .slice()
        .reverse();
      return sumArrays(leftMoves, rightMoves);
    };

    const getLegalmoves = (
      arr: CELL_STATUS[],
      player: CELL_STATUS,
    ): number[] => {
      const res = Array(arr.length).fill(0);
      const row = arr.reduce((s, e) => s + e, '');
      const opponent = getOpponentOf(player);
      if (RegExp(`(0*)(${player}+)(${opponent}+)(0+)`).test(row)) {
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
    };

    const sumArrays = (arr1: number[], arr2: number[]): number[] => {
      return arr1.map((e, i) => e + arr2[i]);
    };

    const alertWhoWon = (): void => {
      const opponent = getOpponentOf(currentPlayer.value);
      if (nextMoves.value.getSum() === 0) {
        if (
          props.board.countOccurencesOf(currentPlayer.value) >
          props.board.countOccurencesOf(opponent)
        ) {
          alert(`Player ${currentPlayer.value} won!`);
        } else {
          alert(`Player ${opponent} won!`);
        }
      }
    };

    const currentPlayer = ref(CELL_STATUS.BLACK);
    const nextMoves = ref(getNextMovesFor(currentPlayer.value));

    const player1 = ref(new Player(CELL_STATUS.WHITE));
    const player2 = ref(new Player(CELL_STATUS.BLACK));

    const updateScores = () => {
      player1.value.score = props.board.countOccurencesOf(player1.value.id);
      player2.value.score = props.board.countOccurencesOf(player2.value.id);
    };

    const play = (i: number, j: number) => {
      props.board.flip(
        i,
        j,
        currentPlayer.value,
        getOpponentOf(currentPlayer.value),
      );
      switchPlayer();
      nextMoves.value = getNextMovesFor(currentPlayer.value);
      setTimeout(alertWhoWon, 500);
      updateScores();
    };

    onMounted(updateScores);

    return {
      currentPlayer,
      nextMoves,
      player1,
      player2,
      play,
    };
  },
});
</script>

<style>
:root {
  --size: 600px;
  --border-color: #9ecaed;
  --shadow-color: #9ecaed;
  --background-color: green;
  --white-color: #fff;
  --black-color: #000;
  --hover-shadow: #000000;
  --white-background-image: url(../assets/shuriken_w.png);
  --black-background-image: url(../assets/shuriken_b.png);
}

.container {
  border: 2px solid var(--black-color);
  width: var(--size);
  margin: auto;
  border-color: var(--border-color);
  box-shadow: 0 0 30px var(--shadow-color);
}

.board {
  width: var(--size);
  height: var(--size);
  margin: auto;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.row {
  display: flex;
  flex: 1;
}

.cell {
  border: 1px solid var(--black-color);
  background-size: contain;
  flex: 1;
}

.cell .next-move {
  font-size: 50px;
  font-weight: bold;
  border-radius: 73%;
  width: 80%;
  height: 80%;
  margin: auto;
  text-align: center;
  margin-top: 5px;
}

.cell .next-move:hover {
  box-shadow: inset 0 0 10px var(--hover-shadow);
  cursor: pointer;
}

.cell .next-move.white {
  color: var(--white-color);
  border: 2px solid var(--white-color);
}

.cell .next-move.black {
  color: var(--black-color);
  border: 2px solid var(--black-color);
}

.cell.white {
  background-image: var(--white-background-image);
}

.cell.black {
  background-image: var(--black-background-image);
}
</style>
