<template>
  <div id="app">
    <BoardVue :board="board"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BoardVue from './components/Board.vue';
import { Board } from './models/Board';

@Component({
  components: {
    BoardVue,
  },
})
export default class App extends Vue {
  private board!: Board;

  constructor() {
    super();
    this.board = new Board();
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
