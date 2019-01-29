<template>
  <div :class="{'active':this.player.id===this.currentPlayer}" class="player-info">
    <span class="time">
      <img v-if="this.player.id===2" src="/shuriken_b.png" class="icon">
      <img v-if="this.player.id===1" src="/shuriken_w.png" class="icon">
      TIME: {{formatTime(player.time)}}
    </span>
    <span>SCORE: {{player.score}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Player } from '@/models/Player';

@Component
export default class PlayerInfo extends Vue {
  public timer!: number;
  @Prop() private player!: Player;
  @Prop() private currentPlayer!: 1 | 2;

  constructor() {
    super();
    this.startTimer();
  }

  @Watch('currentPlayer')
  public onCurrentPlayerChanged(val: string, oldVal: string) {
    this.startTimer();
  }

  public startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.player.id === this.currentPlayer) {
      this.timer = setInterval(() => (this.player.time += 1), 1000);
    }
  }

  public formatTime(seconds: number): string {
    return [Math.floor((seconds % 3600) / 60), seconds % 60]
      .join(':')
      .replace(/\b(\d)\b/g, '0$1');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.player-info {
  height: 50px;
  width: 100%;
  background-color: #AAAAAA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 40px;
}
.active {
  box-shadow: inset 0 0 70px #001f3f;
}
.icon {
  height: 40px;
  width: 40px;
}
.time {
  img {
    vertical-align: top;
  }
}
</style>
