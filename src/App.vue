<template>
  <div id="app">
    <PlayerInfo :player="player1"/>
    <BoardVue :board="board"/>
    <PlayerInfo :player="player2"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BoardVue from "./components/Board.vue";
import PlayerInfo from "./components/PlayerInfo.vue";
import Player from "./models/Player";
import Board from "./models/Board";

@Component({
  components: {
    BoardVue,
    PlayerInfo
  }
})
export default class App extends Vue {
  private board!: Board;
  private player1!: Player;
  private player2!: Player;

  constructor() {
    super();
    this.board = new Board();
    this.player1 = new Player(1);
    this.player2 = new Player(2);
  }
}
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
