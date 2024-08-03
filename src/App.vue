<template>
  <div id="app">
    <BoardVue :board="board" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BoardVue from './components/Board.vue';
import { Board } from './models/Board';

export default defineComponent({
  name: 'App',
  components: {
    BoardVue,
  },
  setup() {
    // Create a reactive board instance
    const board = ref<Board>(new Board());

    // Return the reactive state to the template
    return {
      board,
    };
  },
});
</script>

<style lang="css">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
