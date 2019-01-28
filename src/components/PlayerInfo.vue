<template>
  <div class="info">time: {{player.time}}, active: {{player.active}}</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Player from "@/models/Player";

@Component
export default class PlayerInfo extends Vue {
  @Prop() private player!: Player;

  constructor() {
    super();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.info{
  border: 1px solid #000;
  height: 80px;
  width: 100%;
}
</style>
